import type { GradebookResult, Course as BackendCourse } from '../lib/types/Gradebook';
import type { StudentInfoResult } from '../lib/types/StudentInfo';
import type { AttendanceResult } from '../lib/types/Attendance';

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
}

export interface AdaptedStudent {
  name: string;
  gradeLevel: string;
  studentId: string;
  schoolName: string;
  counselor: string;
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
    mark.Assignments?.Assignment?.map(assignment => ({
      name: assignment._Measure || '',
      score: parseFloat(assignment._Point || '0'),
      maxScore: parseFloat(assignment._PointPossible || '0'),
      percent: assignment._Point && assignment._PointPossible ? 
        (parseFloat(assignment._Point) / parseFloat(assignment._PointPossible)) * 100 : 0,
      category: assignment._Type || '',
      dueDate: assignment._DueDate || '',
      isMissing: !assignment._Point && assignment._PointPossible !== undefined
    })) || []
  );

  const primaryMark = marks[0];
  
  return {
    name: backendCourse._Title || '',
    percent: primaryMark ? parseFloat(primaryMark._CalculatedScoreRaw || '0') : 0,
    letterGrade: primaryMark?._CalculatedScoreString || '',
    teacher: backendCourse._Staff || '',
    period: parseInt(backendCourse._Period || '0'),
    assignments
  };
}

export function adaptStudent(apiData: StudentInfoResult): AdaptedStudent {
  const student = apiData.StudentInfo;
  return {
    name: student.FormattedName || '',
    gradeLevel: student.Grade?.toString() || '',
    studentId: student.PermID?.toString() || '',
    schoolName: '', // Not available in this structure
    counselor: '' // Not available in this structure
  };
}

export function adaptAttendance(apiData: AttendanceResult): AdaptedAttendance[] {
  return apiData.Attendance.Absences?.Absence?.map(absence => ({
    date: absence._AbsenceDate || '',
    status: absence._DailyIconName as 'Present' | 'Absent' | 'Tardy' | 'Excused',
    course: absence.Periods?.Period?.[0]?._Course || ''
  })) || [];
}
