import { Course } from '../types';

/**
 * Converts percentage grade to GPA points using standard 4.0 scale
 */
export function percentageToGPAPoints(percentage: number): number {
  if (percentage >= 97) return 4.0; // A+
  if (percentage >= 93) return 4.0; // A
  if (percentage >= 90) return 3.7; // A-
  if (percentage >= 87) return 3.3; // B+
  if (percentage >= 83) return 3.0; // B
  if (percentage >= 80) return 2.7; // B-
  if (percentage >= 77) return 2.3; // C+
  if (percentage >= 73) return 2.0; // C
  if (percentage >= 70) return 1.7; // C-
  if (percentage >= 67) return 1.3; // D+
  if (percentage >= 65) return 1.0; // D
  if (percentage >= 60) return 0.7; // D-
  return 0.0; // F
}

/**
 * Converts letter grade to GPA points using standard 4.0 scale
 */
export function letterGradeToGPAPoints(letterGrade: string): number {
  const grade = letterGrade.toUpperCase().trim();
  
  switch (grade) {
    case 'A+':
    case 'A':
      return 4.0;
    case 'A-':
      return 3.7;
    case 'B+':
      return 3.3;
    case 'B':
      return 3.0;
    case 'B-':
      return 2.7;
    case 'C+':
      return 2.3;
    case 'C':
      return 2.0;
    case 'C-':
      return 1.7;
    case 'D+':
      return 1.3;
    case 'D':
      return 1.0;
    case 'D-':
      return 0.7;
    case 'F':
      return 0.0;
    default:
      console.warn(`Unknown letter grade: ${letterGrade}`);
      return 0.0;
  }
}

/**
 * Calculates overall GPA from courses using 4.0 scale
 */
export function calculateOverallGPA(courses: Course[]): {
  gpa: number;
  totalPoints: number;
  courseCount: number;
  courseDetails: Array<{
    name: string;
    percentage: number;
    letterGrade: string;
    gpaPoints: number;
  }>;
} {
  console.log('🔍 Calculating GPA from courses:', courses.length);
  
  // Filter out courses without valid grades - THIS IS THE KEY FIX
  const validCourses = courses.filter(course => {
    const hasValidGrade = course.letterGrade &&
      course.letterGrade !== 'N/A' &&
      course.letterGrade !== 'P' &&
      course.letterGrade !== 'Pass' &&
      course.letterGrade !== 'Incomplete' &&
      course.currentGrade !== null &&
      course.currentGrade !== undefined;
    
    if (!hasValidGrade) {
      console.log(`⚠️ Excluding course from GPA: ${course.name} (${course.letterGrade})`);
    }
    
    return hasValidGrade;
  });
  
  if (validCourses.length === 0) {
    console.log('❌ No valid courses found for GPA calculation');
    return {
      gpa: 0,
      totalPoints: 0,
      courseCount: 0,
      courseDetails: []
    };
  }
  
  const courseDetails = validCourses.map(course => {
    // 🔥 KEY FIX: Use LETTER GRADE for GPA, not percentage
    const gpaPoints = letterGradeToGPAPoints(course.letterGrade);
    const percentage = course.currentGrade || 0;
    
    console.log(`🔍 Course ${course.name}:`, {
      percentage: percentage.toFixed(2),
      letterGrade: course.letterGrade,
      gpaPoints: gpaPoints.toFixed(2) // This will now match StudentVUE
    });
    
    return {
      name: course.name,
      percentage,
      letterGrade: course.letterGrade,
      gpaPoints
    };
  });
  
  const totalPoints = courseDetails.reduce((sum, course) => sum + course.gpaPoints, 0);
  const gpa = totalPoints / courseDetails.length;
  
  console.log(`🔍 GPA Calculation:`, {
    totalPoints: totalPoints.toFixed(2),
    courseCount: courseDetails.length,
    finalGPA: gpa.toFixed(2)
  });
  
  return {
    gpa,
    totalPoints,
    courseCount: courseDetails.length,
    courseDetails
  };
}

/**
 * Formats GPA for display with proper rounding
 */
export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

/**
 * Gets GPA classification (e.g., Dean's List, Honor Roll)
 */
export function getGPAClassification(gpa: number): {
  level: string;
  color: string;
} {
  if (gpa >= 3.8) {
    return { level: 'Dean\'s List', color: 'text-green-600' };
  } else if (gpa >= 3.5) {
    return { level: 'Honor Roll', color: 'text-blue-600' };
  } else if (gpa >= 3.0) {
    return { level: 'Good Standing', color: 'text-yellow-600' };
  } else if (gpa >= 2.0) {
    return { level: 'Academic Warning', color: 'text-orange-600' };
  } else {
    return { level: 'Academic Probation', color: 'text-red-600' };
  }
}
