import { AdaptedCourse } from '../adapters/gradeAdapter';
import { Course, Assignment } from '../types';

// Helper function to convert percentage to letter grade
function getLetterGradeFromPercent(percent: number): string {
  if (percent >= 97) return 'A+';
  if (percent >= 93) return 'A';
  if (percent >= 90) return 'A-';
  if (percent >= 87) return 'B+';
  if (percent >= 83) return 'B';
  if (percent >= 80) return 'B-';
  if (percent >= 77) return 'C+';
  if (percent >= 73) return 'C';
  if (percent >= 70) return 'C-';
  if (percent >= 67) return 'D+';
  if (percent >= 63) return 'D';
  if (percent >= 60) return 'D-';
  return 'F';
}

/**
 * Maps AdaptedCourse data structure to Course data structure
 * This bridges the gap between backend adapter and UI expectations
 */
export function mapAdaptedCourseToCourse(adaptedCourse: AdaptedCourse): Course {
  // Generate a unique ID for the course
  const courseId = adaptedCourse.name.toLowerCase().replace(/\s+/g, '-') + '-' + adaptedCourse.period;
  
  // Map assignments and add required fields
  const assignments: Assignment[] = adaptedCourse.assignments.map((adaptedAssignment, index) => ({
    id: `${courseId}-assignment-${index}`,
    name: adaptedAssignment.name || 'Untitled Assignment',
    category: adaptedAssignment.category || 'Uncategorized',
    score: adaptedAssignment.score || 0,
    maxScore: adaptedAssignment.maxScore || 0,
    weight: 1, // Default weight, can be enhanced later
    dueDate: adaptedAssignment.dueDate || '',
    isHypothetical: false,
    isNotGraded: adaptedAssignment.isNotGraded || false,
  }));

  // Generate category weights from assignment categories
  // Try to extract actual weights from the backend data structure
  const categoryWeights: Record<string, number> = {};
  const categories = [...new Set(assignments.map(a => a.category))];
  
  // For now, distribute weights evenly among categories
  // TODO: Extract actual category weights from backend API when available
  const weightPerCategory = categories.length > 0 ? 100 / categories.length : 100;
  categories.forEach(category => {
    categoryWeights[category] = weightPerCategory;
  });

  // Use the backend percentage if available, otherwise calculate from assignments
  let currentGrade = adaptedCourse.percent;
  
  // If backend percent is 0 or undefined, calculate from assignments
  if (!currentGrade || currentGrade === 0) {
    console.log(`🔍 Backend percent missing for ${adaptedCourse.name}, calculating from assignments`);
    currentGrade = calculateCourseGradeFromAssignments({
      id: courseId,
      name: adaptedCourse.name,
      teacher: adaptedCourse.teacher,
      period: adaptedCourse.period,
      room: 'TBD',
      currentGrade: 0,
      letterGrade: adaptedCourse.letterGrade,
      assignments,
      categoryWeights,
    });
  }

  // Ensure we have a valid letter grade, calculate from percentage if needed
  let finalLetterGrade = adaptedCourse.letterGrade;
  if (!finalLetterGrade && currentGrade > 0) {
    finalLetterGrade = getLetterGradeFromPercent(currentGrade);
  }

  console.log(`🔍 Mapped course ${adaptedCourse.name}:`, {
    backendPercent: adaptedCourse.percent,
    finalCurrentGrade: currentGrade,
    finalLetterGrade,
    assignmentsCount: assignments.length,
    categories: categories,
    categoryWeights
  });

  return {
    id: courseId,
    name: adaptedCourse.name,
    teacher: adaptedCourse.teacher,
    period: adaptedCourse.period,
    room: 'TBD', // Not available in AdaptedCourse
    currentGrade,
    letterGrade: finalLetterGrade,
    assignments,
    categoryWeights,
  };
}

/**
 * Maps an array of AdaptedCourse to Course array
 */
export function mapAdaptedCoursesToCourses(adaptedCourses: AdaptedCourse[]): Course[] {
  console.log('🔍 Mapping AdaptedCourses to Courses:', adaptedCourses.length, 'courses');
  
  const mappedCourses = adaptedCourses.map(adaptedCourse => {
    const course = mapAdaptedCourseToCourse(adaptedCourse);
    console.log(`🔍 Mapped course: ${course.name}`, {
      currentGrade: course.currentGrade,
      letterGrade: course.letterGrade,
      assignmentsCount: course.assignments.length,
      categoryWeights: course.categoryWeights
    });
    return course;
  });

  console.log('✅ Course mapping complete');
  return mappedCourses;
}

/**
 * Calculates course grade from assignments (recalculation for verification)
 */
export function calculateCourseGradeFromAssignments(course: Course): number {
  console.log(`🔍 Recalculating grade for ${course.name}`);
  
  const categoryTotals: Record<string, { earned: number; possible: number }> = {};

  // Initialize category totals
  Object.keys(course.categoryWeights).forEach((category) => {
    categoryTotals[category] = { earned: 0, possible: 0 };
  });

  // Sum up scores by category
  course.assignments.forEach((assignment) => {
    if (categoryTotals[assignment.category]) {
      categoryTotals[assignment.category].earned += assignment.score;
      categoryTotals[assignment.category].possible += assignment.maxScore;
    }
  });

  // Calculate weighted grade
  let totalWeightedGrade = 0;
  let totalWeight = 0;

  Object.entries(categoryTotals).forEach(([category, totals]) => {
    if (totals.possible > 0) {
      const categoryPercentage = (totals.earned / totals.possible) * 100;
      const weight = course.categoryWeights[category] / 100;
      totalWeightedGrade += categoryPercentage * weight;
      totalWeight += weight;
      
      console.log(`🔍 Category ${category}:`, {
        percentage: categoryPercentage.toFixed(2),
        weight: (weight * 100).toFixed(1) + '%',
        contribution: (categoryPercentage * weight).toFixed(2)
      });
    } else {
      console.warn(`⚠️ Category ${category} has no possible points, skipping`);
    }
  });

  const finalGrade = totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
  console.log(`🔍 Final calculated grade for ${course.name}: ${finalGrade.toFixed(2)}%`);
  
  return finalGrade;
}
