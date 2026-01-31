import { Course } from '../types';

export type WeightingType = 'none' | 'honors' | 'ap';
export type GradingType = 'standard' | 'pass_fail' | 'no_grade';

export interface CourseWeightingInfo {
  id: string;
  name: string;
  gradingType: GradingType;
  detectedWeighting: WeightingType;
  userOverride: WeightingType | null;
  isExcluded: boolean;
  exclusionReason?: string;
  isElective: boolean;
}

export interface GPACalculationResult {
  unweightedGPA: number;
  weightedGPA: number;
  useWeighted: boolean;
  totalCourses: number;
  includedCourses: number;
  excludedCourses: number;
  courseDetails: CourseWeightingInfo[];
  breakdown: {
    totalUnweightedPoints: number;
    totalWeightedPoints: number;
  };
}

// User preferences storage
const GPA_SETTINGS_KEY = 'gpa_settings_v3';

export interface GPASettings {
  useWeightedGPA: boolean;
  courseOverrides: Record<string, WeightingType>;
  excludedCourses: Record<string, boolean>;
}

export function getGPASettings(): GPASettings {
  try {
    const stored = localStorage.getItem(GPA_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load GPA settings:', error);
  }
  
  return {
    useWeightedGPA: false,
    courseOverrides: {},
    excludedCourses: {}
  };
}

export function saveGPASettings(settings: GPASettings): void {
  try {
    localStorage.setItem(GPA_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save GPA settings:', error);
  }
}

/**
 * Detects if a course should be excluded from GPA calculation
 */
export function detectCourseEligibility(course: Course): {
  isEligible: boolean;
  gradingType: GradingType;
  exclusionReason?: string;
  isElective: boolean;
} {
  const name = course.name.toLowerCase();
  const letterGrade = (course.letterGrade || '').toLowerCase();
  
  // Detect Pass/Fail courses
  if (letterGrade === 'p' || letterGrade === 'pass' || letterGrade === 'f' || letterGrade === 'fail') {
    return {
      isEligible: false,
      gradingType: 'pass_fail',
      exclusionReason: 'Pass/Fail grading',
      isElective: false
    };
  }
  
  // Detect no grade courses
  if (!letterGrade || letterGrade === 'n/a' || letterGrade === 'incomplete') {
    return {
      isEligible: false,
      gradingType: 'no_grade',
      exclusionReason: 'No numeric grade',
      isElective: false
    };
  }
  
  // Detect PE courses (always excluded)
  if (name.includes('pe') || name.includes('physical education') || name.includes('gym')) {
    return {
      isEligible: false,
      gradingType: 'standard',
      exclusionReason: 'Physical Education',
      isElective: false
    };
  }
  
  // Detect electives (music, art, etc.)
  const electiveKeywords = [
    'orchestra', 'band', 'choir', 'music', 'art', 'drama', 'theater',
    'photography', 'ceramics', 'drawing', 'painting', 'sculpture',
    'journalism', 'yearbook', 'debate', 'speech', 'computer science'
  ];
  
  const isElective = electiveKeywords.some(keyword => name.includes(keyword));
  
  return {
    isEligible: true,
    gradingType: 'standard',
    isElective
  };
}

/**
 * Auto-detects course weighting (Honors/AP)
 */
export function detectCourseWeighting(course: Course): WeightingType {
  const name = course.name.toLowerCase();
  
  // Detect AP courses
  if (name.includes('ap ') || name.startsWith('ap ') || name.includes('advanced placement')) {
    return 'ap';
  }
  
  // Detect Honors courses
  if (name.includes('honors') || name.includes('honour') || name.includes('honor')) {
    return 'honors';
  }
  
  // Check for other indicators (could be extended based on data structure)
  // This would need to be adapted based on actual StudentVUE data fields
  if ((course as any).courseLevel?.toLowerCase().includes('ap')) return 'ap';
  if ((course as any).courseLevel?.toLowerCase().includes('honors')) return 'honors';
  if ((course as any).honorsIndicator) return 'honors';
  
  return 'none';
}

/**
 * Converts letter grade to GPA points
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
 * Applies weighting to GPA points
 */
export function applyWeighting(basePoints: number, weighting: WeightingType): number {
  switch (weighting) {
    case 'ap':
      return Math.min(basePoints + 1.0, 5.0); // Cap at 5.0
    case 'honors':
      return Math.min(basePoints + 0.5, 4.5); // Cap at 4.5
    case 'none':
    default:
      return basePoints;
  }
}

/**
 * Main GPA calculation function
 */
export function calculateGPAV3(courses: Course[]): GPACalculationResult {
  console.log('🔍 V3 GPA Calculation starting...');
  
  const settings = getGPASettings();
  const courseDetails: CourseWeightingInfo[] = [];
  let totalUnweightedPoints = 0;
  let totalWeightedPoints = 0;
  let includedCourses = 0;
  let excludedCourses = 0;
  
  courses.forEach(course => {
    // Detect eligibility
    const eligibility = detectCourseEligibility(course);
    
    // Detect weighting
    const detectedWeighting = detectCourseWeighting(course);
    
    // Apply user override if exists
    const userOverride = settings.courseOverrides[course.id] || null;
    const finalWeighting = userOverride || detectedWeighting;
    
    // Check if user has manually excluded this course
    const userExcluded = settings.excludedCourses[course.id] || false;
    const isExcluded = !eligibility.isEligible || userExcluded;
    
    const courseInfo: CourseWeightingInfo = {
      id: course.id,
      name: course.name,
      gradingType: eligibility.gradingType,
      detectedWeighting,
      userOverride,
      isExcluded,
      exclusionReason: eligibility.exclusionReason,
      isElective: eligibility.isElective
    };
    
    if (isExcluded) {
      excludedCourses++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ Excluded: ${course.name} - ${courseInfo.exclusionReason || 'User excluded'}`);
      }
    } else {
      // Calculate GPA points
      const basePoints = letterGradeToGPAPoints(course.letterGrade);
      const weightedPoints = applyWeighting(basePoints, finalWeighting);
      
      totalUnweightedPoints += basePoints;
      totalWeightedPoints += weightedPoints;
      includedCourses++;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Included: ${course.name}`, {
          letterGrade: course.letterGrade,
          basePoints: basePoints.toFixed(2),
          weighting: finalWeighting,
          weightedPoints: weightedPoints.toFixed(2),
          isElective: eligibility.isElective
        });
      }
    }
    
    courseDetails.push(courseInfo);
  });
  
  // Calculate final GPAs
  const unweightedGPA = includedCourses > 0 ? totalUnweightedPoints / includedCourses : 0;
  const weightedGPA = includedCourses > 0 ? totalWeightedPoints / includedCourses : 0;
  const useWeighted = settings.useWeightedGPA;
  const finalGPA = useWeighted ? weightedGPA : unweightedGPA;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 V3 GPA Result:`, {
      unweightedGPA: unweightedGPA.toFixed(2),
      weightedGPA: weightedGPA.toFixed(2),
      useWeighted,
      finalGPA: finalGPA.toFixed(2),
      totalCourses: courses.length,
      includedCourses,
      excludedCourses
    });
  }
  
  return {
    unweightedGPA,
    weightedGPA,
    useWeighted,
    totalCourses: courses.length,
    includedCourses,
    excludedCourses,
    courseDetails,
    breakdown: {
      totalUnweightedPoints,
      totalWeightedPoints
    }
  };
}

/**
 * Updates course weighting override
 */
export function updateCourseWeighting(courseId: string, weighting: WeightingType): void {
  const settings = getGPASettings();
  settings.courseOverrides[courseId] = weighting;
  saveGPASettings(settings);
}

/**
 * Updates course exclusion
 */
export function updateCourseExclusion(courseId: string, excluded: boolean): void {
  const settings = getGPASettings();
  settings.excludedCourses[courseId] = excluded;
  saveGPASettings(settings);
}

/**
 * Toggles weighted/unweighted GPA
 */
export function toggleWeightedGPA(): void {
  const settings = getGPASettings();
  settings.useWeightedGPA = !settings.useWeightedGPA;
  saveGPASettings(settings);
}
