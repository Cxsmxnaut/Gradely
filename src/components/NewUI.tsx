import { useState, useEffect } from 'react';
import type { AdaptedCourse, AdaptedStudent, AdaptedAttendance } from '../lib/adapters';

export default function NewUI() {
  const [courses, setCourses] = useState<AdaptedCourse[]>([]);
  const [student, setStudent] = useState<AdaptedStudent | null>(null);
  const [attendance, setAttendance] = useState<AdaptedAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data loading - in real app, this would call backend API
    const loadData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual backend calls
        // For now, showing UI structure
        setCourses([]);
        setStudent(null);
        setAttendance([]);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Custom Grade UI</h1>
      
      {student && (
        <section style={{ marginBottom: '30px' }}>
          <h2>Student Information</h2>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Grade:</strong> {student.gradeLevel}</p>
          <p><strong>ID:</strong> {student.studentId}</p>
        </section>
      )}

      <section style={{ marginBottom: '30px' }}>
        <h2>Courses & Grades</h2>
        {courses.length === 0 ? (
          <p>No courses data available</p>
        ) : (
          courses.map(course => (
            <div key={course.name} style={{ 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '15px' 
            }}>
              <h3>{course.name}</h3>
              <p><strong>Teacher:</strong> {course.teacher}</p>
              <p><strong>Period:</strong> {course.period}</p>
              <p><strong>Grade:</strong> {course.percent.toFixed(1)}% ({course.letterGrade})</p>
              
              {course.assignments.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h4>Recent Assignments:</h4>
                  {course.assignments.slice(0, 3).map(assignment => (
                    <div key={assignment.name} style={{ 
                      padding: '5px 0', 
                      borderBottom: '1px solid #eee' 
                    }}>
                      <p>{assignment.name}</p>
                      <p><small>
                        Score: {assignment.score}/{assignment.maxScore} 
                        ({assignment.percent.toFixed(1)}%) - {assignment.category}
                      </small></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {attendance.length > 0 && (
        <section>
          <h2>Recent Attendance</h2>
          {attendance.slice(0, 5).map((record, index) => (
            <div key={index} style={{ padding: '5px 0' }}>
              <p>{record.date} - {record.status} ({record.course})</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
