import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Assignment, AttendanceRecord } from '@/types';
import { fetchGrades } from '@/adapters/dataService';
import { setAuthCredentials } from '@/adapters/dataService';
import { useAuth } from './AuthContext';
import { useGradelyAuth } from './GradelyAuthContext';
import { calculateCourseGradeFromAssignments } from '@/lib/courseMapper';
import { calculateGPAV3, GPACalculationResult, toggleWeightedGPA, updateCourseWeighting, updateCourseExclusion } from '@/lib/gpaCalculatorV3';
import { 
  getValidCachedGrades, 
  cacheGradesForUser,
  shouldRefreshCache
} from '@/lib/gradeCache';

interface GradesContextType {
  courses: Course[];
  attendance: AttendanceRecord[];
  isHypotheticalMode: boolean;
  targetGrade: number;
  setTargetGrade: (grade: number) => void;
  toggleHypotheticalMode: () => void;
  addHypotheticalAssignment: (courseId: string, assignment: Assignment) => void;
  removeHypotheticalAssignment: (courseId: string, assignmentId: string) => void;
  resetHypotheticalMode: () => void;
  calculateCourseGrade: (course: Course) => number;
  // V3 GPA features
  gpaResult: GPACalculationResult | null;
  toggleWeightedGPA: () => void;
  updateCourseWeighting: (courseId: string, weighting: 'none' | 'honors' | 'ap') => void;
  updateCourseExclusion: (courseId: string, excluded: boolean) => void;
  // Cache features
  loading: boolean;
  usingCachedData: boolean;
}

const GradesContext = createContext<GradesContextType | undefined>(undefined);

export function GradesProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isHypotheticalMode, setIsHypotheticalMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState(90);
  const [loading, setLoading] = useState(true);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [gpaResult, setGpaResult] = useState<GPACalculationResult | null>(null);
  const { credentials } = useAuth();
  const { user: gradelyUser } = useGradelyAuth();

  // Set credentials for data service when they change
  useEffect(() => {
    setAuthCredentials(credentials);
  }, [credentials]);

  // Background sync function
  const syncGradesInBackground = async (userId: string) => {
    try {
      console.log('🔄 Background sync: Fetching fresh grades...');
      const coursesData = await fetchGrades();
      
      if (coursesData && coursesData.length > 0) {
        // Process and verify courses
        const verifiedCourses = coursesData.map(course => {
          let finalGrade = course.currentGrade;
          
          if (!course.currentGrade || course.currentGrade === 0 || course.currentGrade < 0) {
            console.log(`🔍 Course ${course.name} has invalid backend grade (${course.currentGrade}), calculating from assignments`);
            finalGrade = calculateCourseGradeFromAssignments(course);
            console.log(`🔍 Course ${course.name}: recalculated=${finalGrade.toFixed(2)}%`);
          } else {
            console.log(`🔍 Course ${course.name}: using backend grade=${course.currentGrade.toFixed(2)}%`);
          }
          
          return {
            ...course,
            currentGrade: finalGrade
          };
        });
        
        // Cache the fresh data
        await cacheGradesForUser({
          gradely_user_id: userId,
          cached_grades: verifiedCourses,
          linked_account_id: credentials?.districtUrl || undefined
        });
        
        // Update state with fresh data
        setCourses(verifiedCourses);
        setUsingCachedData(false);
        
        // Calculate GPA using fresh data
        const gpaCalculation = calculateGPAV3(verifiedCourses);
        setGpaResult(gpaCalculation);
        
        console.log('✅ Background sync completed:', verifiedCourses.length, 'courses');
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  };

  // Load courses on mount or when credentials change
  useEffect(() => {
    const loadCourses = async () => {
      if (!gradelyUser) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading courses for user:', gradelyUser.id);
        setLoading(true);
        
        // Try to get cached grades first (login-based, no time expiry)
        const cachedGrades = await getValidCachedGrades(gradelyUser.id);
        
        if (cachedGrades && cachedGrades.length > 0) {
          console.log('📦 Using cached grades from server:', cachedGrades.length, 'courses');
          setCourses(cachedGrades);
          setUsingCachedData(true);
          
          // Calculate GPA using cached data
          const gpaCalculation = calculateGPAV3(cachedGrades);
          setGpaResult(gpaCalculation);
          
          setLoading(false);
          
          // Check if we should refresh cache (only if user has credentials)
          if (credentials && shouldRefreshCache(true)) {
            // Add a small delay to ensure UI renders first
            setTimeout(() => {
              syncGradesInBackground(gradelyUser.id);
            }, 100);
          }
        } else {
          console.log('📭 No cached grades found, fetching fresh data');
          
          if (!credentials) {
            // No credentials and no cache - show empty state
            setCourses([]);
            setUsingCachedData(false);
            setLoading(false);
            return;
          }
          
          // Fetch fresh data immediately
          await syncGradesInBackground(gradelyUser.id);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
        setCourses([]);
        setUsingCachedData(false);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [credentials, gradelyUser]);

  const getLetterGrade = (grade: number): string => {
    if (grade >= 97) return 'A+';
    if (grade >= 93) return 'A';
    if (grade >= 90) return 'A-';
    if (grade >= 87) return 'B+';
    if (grade >= 83) return 'B';
    if (grade >= 80) return 'B-';
    if (grade >= 77) return 'C+';
    if (grade >= 73) return 'C';
    if (grade >= 70) return 'C-';
    if (grade >= 67) return 'D+';
    if (grade >= 63) return 'D';
    if (grade >= 60) return 'D-';
    return 'F';
  };

  const calculateCourseGrade = (course: Course): number => {
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
    } else {
      console.warn(`Category ${category} has no possible points, skipping`);
    }
  });

    return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0;
  };

  const toggleHypotheticalMode = () => {
    if (isHypotheticalMode) {
      // Reset when turning off
      resetHypotheticalMode();
    }
    setIsHypotheticalMode(!isHypotheticalMode);
  };

  const addHypotheticalAssignment = (courseId: string, assignment: Assignment) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id === courseId) {
          const newAssignment = { ...assignment, isHypothetical: true };
          const updatedAssignments = [...course.assignments, newAssignment];
          const updatedCourse = { ...course, assignments: updatedAssignments };
          const newGrade = calculateCourseGrade(updatedCourse);
          
          return {
            ...updatedCourse,
            currentGrade: newGrade,
            letterGrade: getLetterGrade(newGrade),
          };
        }
        return course;
      })
    );
  };

  const removeHypotheticalAssignment = (courseId: string, assignmentId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id === courseId) {
          const updatedAssignments = course.assignments.filter(
            (a) => a.id !== assignmentId
          );
          const updatedCourse = { ...course, assignments: updatedAssignments };
          const newGrade = calculateCourseGrade(updatedCourse);
          
          return {
            ...updatedCourse,
            currentGrade: newGrade,
            letterGrade: getLetterGrade(newGrade),
          };
        }
        return course;
      })
    );
  };

  const resetHypotheticalMode = async () => {
    setIsHypotheticalMode(false);
    // Reload fresh data
    try {
      console.log('🔄 Resetting hypothetical mode, fetching fresh data...');
      const coursesData = await fetchGrades();
      
      // Only recalculate grades if they seem incorrect (0 or undefined)
      const verifiedCourses = coursesData.map(course => {
        let finalGrade = course.currentGrade;
        
        if (!course.currentGrade || course.currentGrade === 0 || course.currentGrade < 0) {
          console.log(`🔍 Course ${course.name} has invalid backend grade (${course.currentGrade}), calculating from assignments`);
          finalGrade = calculateCourseGradeFromAssignments(course);
          console.log(`🔍 Course ${course.name}: recalculated=${finalGrade.toFixed(2)}%`);
        } else {
          console.log(`🔍 Course ${course.name}: using backend grade=${course.currentGrade.toFixed(2)}%`);
        }
        
        return {
          ...course,
          currentGrade: finalGrade
        };
      });
      
      setCourses(verifiedCourses);
      
      // Update server cache with fresh data
      if (gradelyUser) {
        try {
          await cacheGradesForUser({
            gradely_user_id: gradelyUser.id,
            cached_grades: verifiedCourses,
            linked_account_id: credentials?.districtUrl || undefined
          });
          console.log('💾 Server cache updated with fresh data');
        } catch (cacheError) {
          console.warn('Failed to update server cache:', cacheError);
        }
      }
    } catch (error) {
      console.error('Failed to reload courses:', error);
    }
  };

  // GPA control functions
  const handleToggleWeightedGPA = () => {
    toggleWeightedGPA();
    // Recalculate GPA with new setting
    if (courses.length > 0) {
      const newGpaResult = calculateGPAV3(courses);
      setGpaResult(newGpaResult);
    }
  };

  const handleUpdateCourseWeighting = (courseId: string, weighting: 'none' | 'honors' | 'ap') => {
    updateCourseWeighting(courseId, weighting);
    // Recalculate GPA
    if (courses.length > 0) {
      const newGpaResult = calculateGPAV3(courses);
      setGpaResult(newGpaResult);
    }
  };

  const handleUpdateCourseExclusion = (courseId: string, excluded: boolean) => {
    updateCourseExclusion(courseId, excluded);
    // Recalculate GPA
    if (courses.length > 0) {
      const newGpaResult = calculateGPAV3(courses);
      setGpaResult(newGpaResult);
    }
  };

  return (
    <GradesContext.Provider
      value={{
        courses,
        attendance,
        isHypotheticalMode,
        targetGrade,
        setTargetGrade,
        toggleHypotheticalMode,
        addHypotheticalAssignment,
        removeHypotheticalAssignment,
        resetHypotheticalMode,
        calculateCourseGrade,
        // V3 GPA features
        gpaResult,
        toggleWeightedGPA: handleToggleWeightedGPA,
        updateCourseWeighting: handleUpdateCourseWeighting,
        updateCourseExclusion: handleUpdateCourseExclusion,
        // Cache features
        loading,
        usingCachedData,
      }}
    >
      {children}
    </GradesContext.Provider>
  );
}

export function useGrades() {
  const context = useContext(GradesContext);
  if (context === undefined) {
    throw new Error('useGrades must be used within a GradesProvider');
  }
  return context;
}
