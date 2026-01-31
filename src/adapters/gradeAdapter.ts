import type { GradebookResult, Course as BackendCourse } from '../lib/types/Gradebook';
import type { StudentInfoResult } from '../lib/types/StudentInfo';

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

// UI-friendly types (clean, UI-agnostic)
export interface AdaptedCourse {
  name: string;
  percent: number;
  letterGrade: string;
  teacher: string;
  period: number;
  assignments: AdaptedAssignment[];
}

export interface AdaptedAssignment {
  name: string;
  score: number;
  maxScore: number;
  percent: number;
  category: string;
  dueDate: string;
  isMissing: boolean;
  isNotGraded?: boolean;
}

export interface AdaptedStudent {
  name: string;
  gradeLevel: string;
  studentId: string;
  schoolName: string;
  counselor: string;
  photo: string;
}

export interface AdaptedAttendance {
  date: string;
  status: 'Present' | 'Absent' | 'Tardy' | 'Excused';
  course: string;
}

// Adapter functions
export function adaptGradebook(apiData: GradebookResult): AdaptedCourse[] {
  const courses = apiData.Gradebook.Courses?.Course || [];
  return courses.map(adaptCourse);
}

export function adaptCourse(backendCourse: BackendCourse): AdaptedCourse {
  const marks = backendCourse.Marks?.Mark || [];
  const assignments = marks.flatMap(mark => 
    mark.Assignments?.Assignment?.map(assignment => {
      // Check if assignment is actually ungraded
      const isNotGraded = assignment._DisplayScore === 'Not Graded';
      const hasNoScore = !assignment._Point && !assignment._ScoreCalValue;
      
      let score = 0;
      let maxScore = 0;
      let percent = 0;
      
      if (!isNotGraded) {
        // Only process scores if it's not marked as "Not Graded"
        score = parseFloat(assignment._Point || assignment._ScoreCalValue || '0');
        maxScore = parseFloat(assignment._PointPossible || assignment._ScoreMaxValue || '0');
        
        if (maxScore > 0) {
          percent = (score / maxScore) * 100;
        }
      } else {
        // For ungraded assignments, try to get max points if available
        maxScore = parseFloat(assignment._PointPossible || assignment._ScoreMaxValue || '0');
        console.log(`🔍 Assignment "${assignment._Measure}" is marked as Not Graded`);
      }
      
      return {
        name: assignment._Measure || '',
        score,
        maxScore,
        percent,
        category: assignment._Type || '',
        dueDate: assignment._DueDate || '',
        isMissing: Boolean(!isNotGraded && hasNoScore && (assignment._PointPossible || assignment._ScoreMaxValue)),
        isNotGraded
      };
    }) || []
  );

  const primaryMark = marks[0];
  
  // Extract percentage with better error handling using only available fields
  let percent = 0;
  let letterGrade = '';
  
  if (primaryMark) {
    // Use the available fields from Mark interface
    const rawScore = primaryMark._CalculatedScoreRaw;
    
    // Try to extract percentage from available fields
    if (rawScore && !isNaN(parseFloat(rawScore))) {
      percent = parseFloat(rawScore);
    }
    
    // Get letter grade from available field
    letterGrade = primaryMark._CalculatedScoreString || '';
    
    // If we have a percentage but no letter grade, calculate it
    if (percent > 0 && !letterGrade) {
      letterGrade = getLetterGradeFromPercent(percent);
    }
  }
  
  console.log(`🔍 Adapting course ${backendCourse._Title}:`, {
    rawPercent: primaryMark?._CalculatedScoreRaw,
    finalPercent: percent,
    letterGrade,
    assignmentsCount: assignments.length,
    hasAssignments: assignments.length > 0
  });
  
  return {
    name: backendCourse._Title || '',
    percent,
    letterGrade,
    teacher: backendCourse._Staff || '',
    period: parseInt(backendCourse._Period || '0'),
    assignments
  };
}

export function adaptStudent(apiData: StudentInfoResult): AdaptedStudent {
  const student = apiData.StudentInfo;
  
  // Handle photo data - it might be base64 encoded or a URL
  let photo = student.Photo || '';
  
  // If photo looks like base64 data, ensure it has the proper data URL prefix
  if (photo && !photo.startsWith('http') && !photo.startsWith('data:')) {
    // Check if it looks like base64 (common pattern for StudentVUE photos)
    if (photo.length > 100 && /^[A-Za-z0-9+/=]+$/.test(photo)) {
      photo = `data:image/jpeg;base64,${photo}`;
      console.log('📸 Converted base64 photo to data URL');
    } else {
      console.log('📸 Photo data format unclear, using as-is');
    }
  }
  
  console.log('📸 Final photo data:', {
    hasPhoto: !!photo,
    photoLength: photo.length,
    isDataURL: photo.startsWith('data:'),
    isHTTP: photo.startsWith('http')
  });
  
  return {
    name: student.FormattedName || '',
    gradeLevel: student.Grade?.toString() || '',
    studentId: student.PermID?.toString() || '',
    schoolName: '', // Not available in this structure
    counselor: '', // Not available in this structure
    photo: photo
  };
}

export function adaptAttendance(apiData: any): AdaptedAttendance[] {
  // The real API data has Absences.Absence directly, not wrapped in Attendance
  const absences = apiData.Absences?.Absence || [];
  const adaptedAttendance: AdaptedAttendance[] = [];
  
  absences.forEach((absence: any) => {
    const date = absence._AbsenceDate || '';
    const periods = absence.Periods?.Period || [];
    
    // Process each period for this day
    periods.forEach((period: any) => {
      // Skip lunch and non-included periods
      if (period._Name === 'Not Included' || period._Course === 'Lunch') {
        return;
      }
      
      // Convert period attendance to proper status values
      let status: 'Present' | 'Absent' | 'Tardy' | 'Excused' = 'Present';
      
      // Check individual period status first
      if (period._IconName) {
        if (period._IconName.includes('excused')) {
          status = 'Excused';
        } else if (period._IconName.includes('unexcused')) {
          status = 'Absent';
        } else if (period._IconName.includes('tardy') || period._IconName.includes('unxtardy')) {
          status = 'Tardy';
        } else if (period._IconName.includes('activity')) {
          status = 'Present'; // School pass/activity counts as present
        }
      }
      
      // If no individual period status, check daily status
      if (status === 'Present' && absence._DailyIconName) {
        if (absence._DailyIconName.includes('excused')) {
          status = 'Excused';
        } else if (absence._DailyIconName.includes('unexcused')) {
          status = 'Absent';
        }
      }
      
      adaptedAttendance.push({
        date,
        status,
        course: period._Course || ''
      });
    });
  });
  
  return adaptedAttendance;
}
