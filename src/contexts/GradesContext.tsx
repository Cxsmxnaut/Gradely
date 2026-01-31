import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Assignment } from '@/types';
import { fetchGrades } from '@/adapters/dataService';
import { setAuthCredentials } from '@/adapters/dataService';
import { useAuth } from './AuthContext';
import { calculateCourseGradeFromAssignments } from '@/lib/courseMapper';
import { calculateGPAV3, GPACalculationResult, toggleWeightedGPA, updateCourseWeighting, updateCourseExclusion } from '@/lib/gpaCalculatorV3';

// Cache keys
const GRADES_CACHE_KEY = 'gradely_grades_cache';
const GRADES_CACHE_TIMESTAMP_KEY = 'gradely_grades_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface GradesContextType {
  courses: Course[];
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
}

const GradesContext = createContext<GradesContextType | undefined>(undefined);

export function GradesProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isHypotheticalMode, setIsHypotheticalMode] = useState(false);
  const [targetGrade, setTargetGrade] = useState(90);
  const [, setLoading] = useState(true);
  const [gpaResult, setGpaResult] = useState<GPACalculationResult | null>(null);
  const { credentials } = useAuth();

  // Set credentials for data service when they change
  useEffect(() => {
    setAuthCredentials(credentials);
  }, [credentials]);

  // Load courses on mount or when credentials change
  useEffect(() => {
    const loadCourses = async () => {
      try {
        console.log('🔍 Loading courses...');
        
        // Check cache first (session storage for immediate access, localStorage for persistence)
        const sessionData = sessionStorage.getItem('current_courses');
        const cachedData = localStorage.getItem(GRADES_CACHE_KEY);
        const cacheTimestamp = localStorage.getItem(GRADES_CACHE_TIMESTAMP_KEY);
        
        // Try session storage first for immediate loading
        if (sessionData) {
          try {
            const parsedCourses = JSON.parse(sessionData);
            setCourses(parsedCourses);
            
            // Calculate GPA using session data
            const gpaCalculation = calculateGPAV3(parsedCourses);
            setGpaResult(gpaCalculation);
            console.log('📦 Courses loaded from session storage:', parsedCourses.length, 'courses');
            setLoading(false);
            return;
          } catch (parseError) {
            console.warn('Failed to parse session data, trying localStorage:', parseError);
          }
        }
        
        // Fall back to localStorage cache
        if (cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          if (cacheAge < CACHE_DURATION) {
            console.log('📦 Loading courses from cache (', Math.round(cacheAge / 1000), 'seconds old)');
            try {
              const parsedCourses = JSON.parse(cachedData);
              setCourses(parsedCourses);
              
              // Update session storage with fresh cache data
              sessionStorage.setItem('current_courses', JSON.stringify(parsedCourses));
              
              // Calculate GPA using cached data
              const gpaCalculation = calculateGPAV3(parsedCourses);
              setGpaResult(gpaCalculation);
              console.log('✅ Courses loaded from cache:', parsedCourses.length, 'courses');
              setLoading(false);
              return;
            } catch (parseError) {
              console.warn('Failed to parse cached data, fetching fresh:', parseError);
            }
          } else {
            console.log('⏰ Cache expired (', Math.round(cacheAge / 1000), 'seconds old), fetching fresh');
          }
        } else {
          console.log('📭 No cache found, fetching fresh');
        }
        
        // Fetch fresh data
        console.log('🌐 Fetching fresh courses data...');
        const coursesData = await fetchGrades();
        console.log('🔍 Courses data received:', coursesData);
        
        // Only recalculate grades if they seem incorrect (0 or undefined)
        const verifiedCourses = coursesData.map(course => {
          // If the course has a reasonable percentage from the backend, use it
          // Otherwise calculate from assignments
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
        console.log('✅ Courses loaded and verified:', verifiedCourses.length, 'courses');
        
        // Cache the fresh data with session persistence
        try {
          localStorage.setItem(GRADES_CACHE_KEY, JSON.stringify(verifiedCourses));
          localStorage.setItem(GRADES_CACHE_TIMESTAMP_KEY, Date.now().toString());
          // Also store in session storage for immediate access
          sessionStorage.setItem('current_courses', JSON.stringify(verifiedCourses));
          console.log('💾 Courses cached for future use with session persistence');
        } catch (cacheError) {
          console.warn('Failed to cache courses data:', cacheError);
        }
        
        // Calculate GPA using V3 system
        const gpaCalculation = calculateGPAV3(verifiedCourses);
        setGpaResult(gpaCalculation);
        console.log('✅ GPA calculated:', gpaCalculation);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (credentials) {
      loadCourses();
    } else {
      setLoading(false);
    }
  }, [credentials]);

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
      
      // Update cache with fresh data
      try {
        localStorage.setItem(GRADES_CACHE_KEY, JSON.stringify(verifiedCourses));
        localStorage.setItem(GRADES_CACHE_TIMESTAMP_KEY, Date.now().toString());
        // Also update session storage
        sessionStorage.setItem('current_courses', JSON.stringify(verifiedCourses));
        console.log('💾 Cache updated with fresh data');
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
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
