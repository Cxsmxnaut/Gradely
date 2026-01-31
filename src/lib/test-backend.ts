// Test file to verify backend logic is working
import { adaptCourse } from './adapters';
import type { Course } from './types/Gradebook';

// Mock backend data for testing
const mockBackendCourse: Course = {
  _Period: "1",
  _Title: "Test Course",
  _CourseName: "Test Course",
  _CourseID: "123",
  _Room: "101",
  _Staff: "Test Teacher",
  _StaffEMail: "teacher@school.edu",
  _StaffGU: "uuid",
  _ImageType: "math",
  _HighlightPercentageCutOffForProgressBar: "90",
  _UsesRichContent: false,
  Marks: {
    Mark: [{
      _MarkName: "Semester 1",
      _ShortMarkName: "S1",
      _CalculatedScoreString: "A",
      _CalculatedScoreRaw: "92.5",
      GradeCalculationSummary: null,
      Assignments: {
        Assignment: [{
          _GradebookID: "123",
          _Measure: "Test Assignment",
          _Type: "Test",
          _Date: "2026-01-15",
          _DueDate: "2026-01-15",
          _Score: "85",
          _DisplayScore: "85 out of 100",
          _ScoreCalValue: "85",
          _ScoreMaxValue: "100",
          _TimeSincePost: "4d",
          _TotalSecondsSincePost: "345600",
          _ScoreType: "Raw Score",
          _Points: "85 / 100",
          _Point: "85",
          _PointPossible: "100",
          _Notes: "",
          _TeacherID: "1",
          _StudentID: "1",
          _MeasureDescription: "Test assignment",
          _HasDropBox: false,
          _DropStartDate: "",
          _DropEndDate: "",
          Resources: null,
          Standards: null
        }]
      },
      AssignmentsSinceLastAccess: null,
      StandardViews: null
    }]
  }
};

// Test the adapter
export function testBackendAdapter() {
  try {
    const adapted = adaptCourse(mockBackendCourse);
    console.log('Backend adapter test successful:', adapted);
    return adapted;
  } catch (error) {
    console.error('Backend adapter test failed:', error);
    return null;
  }
}
