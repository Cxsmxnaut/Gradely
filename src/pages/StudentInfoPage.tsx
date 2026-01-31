import {
  User,
  Mail,
  Phone,
  School,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useGrades } from '@/contexts/GradesContext';
import { calculateGPAV3 } from '@/lib/gpaCalculatorV3';
import { formatGPA } from '@/lib/gpaCalculator';
import { useState } from 'react';

export function StudentInfoPage() {
  const { user } = useAuth();
  const { courses } = useGrades();

  if (!user) return null;

  const { studentInfo } = user;

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    email: studentInfo.email || '',
    phone: studentInfo.phone || '',
    schoolName: studentInfo.schoolName || '',
    counselor: studentInfo.counselor || '',
    parentName: studentInfo.parentName || '',
    parentEmail: studentInfo.parentEmail || '',
    parentPhone: studentInfo.parentPhone || '',
  });

  // Debug: Log photo data
  console.log('🔍 StudentInfoPage - Photo data:', {
    hasPhoto: !!studentInfo.photo,
    photoLength: studentInfo.photo?.length || 0,
    photoPreview: studentInfo.photo ? studentInfo.photo.substring(0, 50) + '...' : 'No photo',
    studentName: studentInfo.name
  });

  const handleEdit = () => {
    setEditedInfo({
      email: studentInfo.email || '',
      phone: studentInfo.phone || '',
      schoolName: studentInfo.schoolName || '',
      counselor: studentInfo.counselor || '',
      parentName: studentInfo.parentName || '',
      parentEmail: studentInfo.parentEmail || '',
      parentPhone: studentInfo.parentPhone || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    // Save to localStorage
    const updatedStudentInfo = {
      ...studentInfo,
      ...editedInfo
    };
    
    // Update localStorage
    localStorage.setItem('manual_student_info', JSON.stringify(updatedStudentInfo));
    
    // Update user state (this would ideally update the context)
    console.log('💾 Saved student info:', updatedStudentInfo);
    
    setIsEditing(false);
    
    // Force a page refresh to see the changes
    window.location.reload();
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate proper GPA using the V3 calculator
  const gpaResult = calculateGPAV3(courses);
  const currentGPA = gpaResult.useWeighted ? gpaResult.weightedGPA : gpaResult.unweightedGPA;

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
              {studentInfo.photo ? (
                <img 
                  src={studentInfo.photo} 
                  alt={`${studentInfo.name}'s profile`}
                  className="size-32 rounded-full object-cover border-4 border-white shadow-lg w-full h-full"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to default avatar if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`size-32 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-4xl font-bold ${studentInfo.photo ? 'hidden' : ''}`}>
                {studentInfo.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{studentInfo.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="size-4" />
                  Edit Profile
                </Button>
              </div>
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
                  {formatGPA(currentGPA)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {gpaResult.includedCourses} of {gpaResult.totalCourses} courses
                  {gpaResult.excludedCourses > 0 && ` (${gpaResult.excludedCourses} excluded)`}
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
                      {course.letterGrade || 'N/A'}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {course.currentGrade && course.currentGrade > 0 
                        ? `${course.currentGrade.toFixed(1)}%` 
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Profile Information</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editedInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={editedInfo.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  placeholder="Your School Name"
                />
              </div>
              <div>
                <Label htmlFor="counselor">Counselor</Label>
                <Input
                  id="counselor"
                  value={editedInfo.counselor}
                  onChange={(e) => handleInputChange('counselor', e.target.value)}
                  placeholder="Counselor Name"
                />
              </div>
              <div>
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input
                  id="parentName"
                  value={editedInfo.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  placeholder="Parent/Guardian Name"
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={editedInfo.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  placeholder="parent@example.com"
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Parent Phone</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={editedInfo.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="(555) 987-6543"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="size-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
