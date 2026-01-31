import { adaptGradebook } from './gradeAdapter';
import { getGradebookRecord } from '../lib/grades/catalog';
import { parseResult } from '../lib/synergy';
import type { GradebookResult } from '../lib/types/Gradebook';
import { mapAdaptedCoursesToCourses } from '../lib/courseMapper';

// Get credentials from auth context (this will be injected by the calling component)
export function setAuthCredentials(_credentials: {
  districtUrl: string;
  username: string;
  password: string;
} | null) {
  // Store credentials for use in API calls
  // Note: In a real implementation, you might store these securely or use them directly
}

// Unified data service - always use real data
export async function fetchGrades() {
  try {
    console.log('🔹 Fetching real grades data');
    const record = await getGradebookRecord();
    const apiData = parseResult(record.xml) as GradebookResult;
    const adaptedCourses = adaptGradebook(apiData); // Returns AdaptedCourse[]
    
    // Map AdaptedCourse[] to Course[] for consistency
    const courses = mapAdaptedCoursesToCourses(adaptedCourses);
    console.log('🔹 Mapped real grades data to Course[] format');
    return courses;
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    throw error; // Don't fallback to mock, let the error propagate
  }
}

export async function fetchStudent() {
  try {
    console.log('🔹 Fetching real student data');
    const { acc } = await import('../lib/account.svelte');
    
    if (!acc.studentAccount) {
      throw new Error('Student account not loaded');
    }
    
    const studentData = await acc.studentAccount.studentInfo();
    console.log('🔹 Raw student data:', studentData);
    console.log('📸 Raw photo data:', {
      hasPhoto: !!studentData.Photo,
      photoType: typeof studentData.Photo,
      photoLength: studentData.Photo?.length || 0,
      photoPreview: studentData.Photo ? studentData.Photo.substring(0, 100) + '...' : 'No photo',
      startsWithData: studentData.Photo ? studentData.Photo.substring(0, 20) : 'N/A'
    });
    
    // Adapt the student data using the existing adapter
    const { adaptStudent } = await import('./gradeAdapter');
    const adaptedStudent = adaptStudent({ StudentInfo: studentData });
    
    console.log('✅ Student data fetched and adapted:', adaptedStudent);
    console.log('📸 Student photo available:', !!adaptedStudent.photo, adaptedStudent.photo ? 'Photo data length: ' + adaptedStudent.photo.length : 'No photo');
    
    return adaptedStudent;
  } catch (error) {
    console.error('Failed to fetch student:', error);
    throw error;
  }
}

export async function fetchAttendance() {
  try {
    console.log('🔹 Fetching real attendance data...');
    const { getAttendanceRecord } = await import('../lib/grades/catalog');
    const { adaptAttendance } = await import('./gradeAdapter');
    
    console.log('🔹 Calling getAttendanceRecord...');
    const attendanceRecord = await getAttendanceRecord();
    
    // Parse the JSON data back to object
    const attendanceData = JSON.parse(attendanceRecord.xml);
    console.log('🔹 Raw attendance data structure:', attendanceData);
    console.log('🔹 Adapting attendance data...');
    const adaptedAttendance = adaptAttendance(attendanceData);
    
    console.log('🔹 Real attendance data received:', adaptedAttendance.length, 'records');
    
    // Convert AdaptedAttendance to AttendanceRecord format
    const result = adaptedAttendance.map((attendance, index) => ({
      id: `attendance-${index}`,
      date: attendance.date,
      status: attendance.status,
      courseName: attendance.course,
    }));
    
    console.log('🔹 Final attendance result:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to fetch attendance:', error);
    throw error;
  }
}

export async function fetchDocuments() {
  try {
    console.log('🔹 Fetching real documents data');
    // TODO: Implement documents fetching from backend
    throw new Error('Documents fetching not implemented yet');
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
}
