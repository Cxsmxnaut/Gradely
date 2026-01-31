export interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  email: string;
  phone: string;
  studentId: string;
  schoolName: string;
  counselor: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  photo: string;
}

export interface Assignment {
  id: string;
  name: string;
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  dueDate: string;
  submittedDate?: string;
  isHypothetical?: boolean;
  isNotGraded?: boolean;
}

export interface Course {
  id: string;
  name: string;
  teacher: string;
  period: number;
  room: string;
  currentGrade: number;
  letterGrade: string;
  assignments: Assignment[];
  categoryWeights: Record<string, number>;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Tardy' | 'Excused';
  period?: number;
  courseName?: string;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url: string;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  attachments?: Document[];
}

export interface GradeHistory {
  date: string;
  grade: number;
}

export interface User {
  username: string;
  password: string;
  studentInfo: Student;
}
