import { AdaptedCourse } from '../adapters/gradeAdapter';
import { Course, Assignment } from '../types';

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
  }));

  // Generate category weights from assignment categories
  // In a real implementation, this would come from the backend
  const categoryWeights: Record<string, number> = {};
  const categories = [...new Set(assignments.map(a => a.category))];
  
  // Distribute weights evenly among categories (fallback logic)
  const weightPerCategory = categories.length > 0 ? 100 / categories.length : 100;
  categories.forEach(category => {
    categoryWeights[category] = weightPerCategory;
  });

  return {
    id: courseId,
    name: adaptedCourse.name,
    teacher: adaptedCourse.teacher,
    period: adaptedCourse.period,
    room: 'TBD', // Not available in AdaptedCourse
    currentGrade: adaptedCourse.percent,
    letterGrade: adaptedCourse.letterGrade,
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
