import { TrendingUp, BookOpen, Target, Award, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useGradelyAuth } from '@/contexts/GradelyAuthContext';
import { useGrades } from '@/contexts/GradesContext';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import { formatGPA, getGPAClassification } from '@/lib/gpaCalculator';
import { fetchAttendance } from '@/adapters/dataService';
import { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types';

export function DashboardPage() {
  const { user } = useGradelyAuth();
  const { courses, gpaResult, toggleWeightedGPA } = useGrades();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Fetch attendance data
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const attendanceData = await fetchAttendance();
        setAttendance(attendanceData);
      } catch (error) {
        console.error('Failed to load attendance:', error);
      }
    };

    loadAttendance();
  }, []);

  // Use V3 GPA calculation from context
  const gpa = gpaResult ? formatGPA(gpaResult.useWeighted ? gpaResult.weightedGPA : gpaResult.unweightedGPA) : '0.00';
  const gpaClassification = gpaResult ? getGPAClassification(parseFloat(gpa)) : { level: 'No Data', color: 'text-gray-600' };
  const totalCourses = courses.length;
  
  // Get recent assignments (last 5 across all courses)
  const recentAssignments = courses
    .flatMap((course) =>
      course.assignments.map((assignment) => ({
        ...assignment,
        courseName: course.name,
      }))
    )
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  // Calculate attendance rate from real data
  // Group by unique dates and count attendance status per day
  const uniqueDates = [...new Set(attendance.map(a => a.date))];
  const totalDays = uniqueDates.length;
  
  // For each unique date, calculate the attendance rate for all periods that day
  // Count each period individually for more accurate attendance calculation
  const totalPeriods = attendance.length;
  const presentPeriods = attendance.filter(record => 
    record.status === 'Present' || 
    record.status === 'Excused' || 
    record.status === 'Tardy'
  ).length;
  
  const attendanceRate = totalPeriods > 0 ? Math.round((presentPeriods / totalPeriods) * 100) : 0;
  
  console.log('🔍 Dashboard Attendance Debug:', {
    totalDays,
    totalPeriods,
    presentPeriods,
    attendanceRate,
    attendanceData: attendance.slice(0, 3) // Show first 3 records
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
          Welcome back, {user?.user_metadata?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}!
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Here's your academic overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall GPA */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Overall GPA
              <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1" title="Estimated GPA (School rules may vary)">
                *
              </span>
            </CardTitle>
            <Award className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{gpa}</div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
              <p className={`text-xs ${gpaClassification.color}`}>
                <TrendingUp className="size-3 inline mr-1" />
                {gpaClassification.level}
              </p>
              {gpaResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleWeightedGPA}
                  className="text-xs h-6 px-2"
                >
                  <Settings className="size-3 mr-1" />
                  {gpaResult.useWeighted ? 'Weighted' : 'Unweighted'}
                </Button>
              )}
            </div>
            {gpaResult && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {gpaResult.includedCourses} of {gpaResult.totalCourses} courses
                {gpaResult.excludedCourses > 0 && ` (${gpaResult.excludedCourses} excluded)`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Total Courses
            </CardTitle>
            <BookOpen className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalCourses}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Active this semester
            </p>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Attendance Rate
            </CardTitle>
            <Target className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{attendanceRate}%</div>
            <Progress value={attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Target Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Target Progress
            </CardTitle>
            <TrendingUp className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">On Track</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Meeting your goals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course, index) => (
                <div
                  key={course.id || `course-${index}`}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{course.name}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      {course.teacher} • Period {course.period}
                    </p>
                  </div>
                  <div className="text-right ml-2 sm:ml-4">
                    <div className="text-lg sm:text-2xl font-bold text-primary">
                      {course.letterGrade}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {course.currentGrade !== undefined ? course.currentGrade.toFixed(1) : 'N/A'}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.map((assignment, index) => (
                <div
                  key={`${assignment.id || 'assignment'}-${assignment.courseName}-${index}`}
                  className="flex items-start justify-between p-3 sm:p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{assignment.name}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      {assignment.courseName} • {assignment.category}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                    <div
                      className={`text-base sm:text-lg font-bold ${
                        assignment.isNotGraded 
                          ? 'text-neutral-500'
                          : (assignment.score / assignment.maxScore) * 100 >= 90
                            ? 'text-green-600'
                            : (assignment.score / assignment.maxScore) * 100 >= 80
                            ? 'text-blue-600'
                            : (assignment.score / assignment.maxScore) * 100 >= 70
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {assignment.isNotGraded ? '—' : `${assignment.score}/${assignment.maxScore}`}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {assignment.isNotGraded 
                        ? 'Not Graded' 
                        : ((assignment.score / assignment.maxScore) * 100).toFixed(0) + '%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
