import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { fetchAttendance } from '@/adapters/dataService';
import { AttendanceRecord } from '@/types';

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

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

  // Calculate statistics
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === 'Present').length;
  const absentDays = attendance.filter((a) => a.status === 'Absent').length;
  const tardyDays = attendance.filter((a) => a.status === 'Tardy').length;
  const excusedDays = attendance.filter((a) => a.status === 'Excused').length;
  const attendanceRate = ((presentDays / totalDays) * 100).toFixed(1);

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return <CheckCircle2 className="size-5 text-green-600" />;
      case 'Absent':
        return <XCircle className="size-5 text-red-600" />;
      case 'Tardy':
        return <Clock className="size-5 text-yellow-600" />;
      case 'Excused':
        return <AlertCircle className="size-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
      case 'Absent':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      case 'Tardy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'Excused':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
    }
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateString = date.toISOString().split('T')[0];
    return attendance.find((a) => a.date === dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Attendance</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          View your attendance history and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-primary">{attendanceRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 sm:size-5 text-green-600" />
              <span className="text-xl sm:text-2xl font-bold">{presentDays}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="size-4 sm:size-5 text-red-600" />
              <span className="text-xl sm:text-2xl font-bold">{absentDays}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Tardy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="size-4 sm:size-5 text-yellow-600" />
              <span className="text-xl sm:text-2xl font-bold">{tardyDays}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Excused
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 sm:size-5 text-blue-600" />
              <span className="text-xl sm:text-2xl font-bold">{excusedDays}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {monthName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[280px]">
              {/* Day headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div
                  key={day + index}
                  className="text-center text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 py-1 sm:py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const attendance = getAttendanceForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const dateString = day.toISOString().split('T')[0];

                return (
                  <button
                    key={dateString}
                    onClick={() => setSelectedDate(dateString)}
                    className={`aspect-square p-1 sm:p-2 rounded-lg border transition-all ${
                      isToday
                        ? 'border-primary border-2'
                        : 'border-neutral-200 dark:border-neutral-800'
                    } ${
                      attendance
                        ? attendance.status === 'Present'
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : attendance.status === 'Absent'
                          ? 'bg-red-50 dark:bg-red-950/20'
                          : attendance.status === 'Tardy'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20'
                          : 'bg-blue-50 dark:bg-blue-950/20'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    } ${selectedDate === dateString ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="text-xs sm:text-sm font-medium">{day.getDate()}</div>
                    {attendance && (
                      <div className="mt-1 flex justify-center">
                        <div className="size-3 sm:size-4">
                          {getStatusIcon(attendance.status)}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendance
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <div
                  key={record.id}
                  className={`p-3 sm:p-4 rounded-lg border ${
                    selectedDate === record.date
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-semibold text-sm">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <Badge className={getStatusColor(record.status)} w-fit>
                            {record.status}
                          </Badge>
                        </div>
                        {record.courseName && (
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                            Period {record.period}: {record.courseName}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
