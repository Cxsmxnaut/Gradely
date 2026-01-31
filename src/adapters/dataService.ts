import { USE_MOCK } from '../config/dataConfig';
import { adaptGradebook } from './gradeAdapter';
import { mockUser, mockCourses, mockAttendance, mockDocuments } from '../data/mockData';
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

// Unified data service with mock/real switch
export async function fetchGrades() {
  if (USE_MOCK) {
    console.log('🔸 Using mock grades data');
    return mockCourses; // Already Course[] type
  }
  
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
    // Fallback to mock on error
    return mockCourses;
  }
}

export async function fetchStudent() {
  if (USE_MOCK) {
    console.log('🔸 Using mock student data');
    return mockUser.studentInfo;
  }
  
  try {
    console.log('🔹 Fetching real student data');
    // TODO: Implement student info fetching from backend
    // For now, return mock
    return mockUser.studentInfo;
  } catch (error) {
    console.error('Failed to fetch student:', error);
    return mockUser.studentInfo;
  }
}

export async function fetchAttendance() {
  if (USE_MOCK) {
    console.log('🔸 Using mock attendance data');
    return mockAttendance;
  }
  
  try {
    console.log('🔹 Fetching real attendance data');
    // TODO: Implement attendance fetching from backend
    // For now, return mock
    return mockAttendance;
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    return mockAttendance;
  }
}

export async function fetchDocuments() {
  if (USE_MOCK) {
    console.log('🔸 Using mock documents data');
    return mockDocuments;
  }
  
  try {
    console.log('🔹 Fetching real documents data');
    // TODO: Implement documents fetching from backend
    // For now, return mock
    return mockDocuments;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return mockDocuments;
  }
}
