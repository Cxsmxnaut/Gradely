import React from 'react';
import {
  User,
  Mail,
  Phone,
  School,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useGrades } from '@/contexts/GradesContext';

export function StudentInfoPage() {
  const { user } = useAuth();
  const { courses } = useGrades();

  if (!user) return null;

  const { studentInfo } = user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Student Information</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Your personal and academic information
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="size-32 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                {studentInfo.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{studentInfo.name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {studentInfo.gradeLevel}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Student ID: {studentInfo.studentId}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                    <Mail className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Email
                    </p>
                    <p className="font-medium">{studentInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                    <Phone className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Phone
                    </p>
                    <p className="font-medium">{studentInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                    <School className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      School
                    </p>
                    <p className="font-medium">{studentInfo.schoolName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                    <Users className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Counselor
                    </p>
                    <p className="font-medium">{studentInfo.counselor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent/Guardian Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Name
              </p>
              <p className="font-semibold">{studentInfo.parentName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Email
              </p>
              <p className="font-medium">{studentInfo.parentEmail}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Phone
              </p>
              <p className="font-medium">{studentInfo.parentPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Academic Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Current GPA
                </p>
                <p className="text-2xl font-bold text-primary">
                  {(
                    courses.reduce((sum, c) => sum + c.currentGrade, 0) /
                    courses.length
                  ).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Total Credits
                </p>
                <p className="text-2xl font-bold">{courses.length * 0.5}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Enrolled Courses
              </p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Course Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses
              .sort((a, b) => a.period - b.period)
              .map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                      {course.period}
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {course.teacher}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          Room {course.room}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {course.letterGrade}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {course.currentGrade.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Expected Graduation
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <p className="font-semibold">June 2027</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                School Year
              </p>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <p className="font-semibold">2025-2026</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Semester
              </p>
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <p className="font-semibold">Spring 2026</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
