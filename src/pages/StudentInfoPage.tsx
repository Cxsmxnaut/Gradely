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
  Link,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useGradelyAuth } from '@/contexts/GradelyAuthContext';
import { useGrades } from '@/contexts/GradesContext';
import { calculateGPAV3 } from '@/lib/gpaCalculatorV3';
import { formatGPA } from '@/lib/gpaCalculator';
import { toast } from 'sonner';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function StudentInfoPage() {
  const { user, login: studentVueLogin } = useAuth();
  const { user: gradelyUser } = useGradelyAuth();
  const { courses } = useGrades();

  // Use Gradely user if available, fallback to old auth
  const currentUser = gradelyUser || user;
  
  if (!currentUser) return null;

  // For Gradely users, get info from user_metadata, for old auth use studentInfo
  const studentInfo = gradelyUser ? {
    email: gradelyUser.email || '',
    name: gradelyUser.user_metadata?.display_name || gradelyUser.email || '',
    gradeLevel: 'Not specified',
    schoolName: 'Not specified',
    counselor: 'Not specified',
    parentName: 'Not specified',
    parentEmail: 'Not specified',
    parentPhone: 'Not specified',
    phone: gradelyUser.user_metadata?.phone_number || '',
    photo: null,
    studentId: gradelyUser.id || '',
  } : user?.studentInfo || {};

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkStudentVue, setShowLinkStudentVue] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: studentInfo.name || '',
    email: studentInfo.email || '',
    phone: studentInfo.phone || '',
    schoolName: studentInfo.schoolName || '',
    counselor: studentInfo.counselor || '',
    parentName: studentInfo.parentName || '',
    parentEmail: studentInfo.parentEmail || '',
    parentPhone: studentInfo.parentPhone || '',
  });

  // StudentVUE linking form state
  const [studentVueForm, setStudentVueForm] = useState({
    districtUrl: '',
    username: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDomainHelper, setShowDomainHelper] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Debug: Log photo data
  console.log('🔍 StudentInfoPage - Photo data:', {
    hasPhoto: !!studentInfo.photo,
    photoLength: studentInfo.photo?.length || 0,
    photoPreview: studentInfo.photo ? studentInfo.photo.substring(0, 50) + '...' : 'No photo',
    studentName: studentInfo.name
  });

  const handleSave = async () => {
    try {
      if (gradelyUser && editedInfo.name !== studentInfo.name) {
        // Update user metadata in Supabase
        const { error } = await supabase.auth.updateUser({
          data: {
            display_name: editedInfo.name,
          },
        });

        if (error) {
          toast.error('Failed to update name');
          console.error('Update error:', error);
          return;
        }

        toast.success('Name updated successfully!');
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    }
  };

  const handleEdit = () => {
    setEditedInfo({
      name: studentInfo.name || '',
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

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // StudentVUE linking functions
  const handleStudentVueInputChange = (field: string, value: string | boolean) => {
    setStudentVueForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const shortenDomainUrl = (url: string): string => {
    try {
      let cleanUrl = url.replace(/^https?:\/\//, '');
      const domainMatch = cleanUrl.match(/^([^\/]+)/);
      if (domainMatch) {
        cleanUrl = domainMatch[1];
      }
      
      const pathsToRemove = [
        '/PXP2_Login_Student.aspx',
        '/PXP_Login_Student.aspx',
        '/Home/Portal',
        '/StudentPortal',
        '/Portal',
        '/Home',
      ];
      
      pathsToRemove.forEach(path => {
        cleanUrl = cleanUrl.replace(path, '');
      });
      
      cleanUrl = cleanUrl.replace(/\/+$/, '');
      return cleanUrl;
    } catch (error) {
      console.error('Error shortening URL:', error);
      return url;
    }
  };

  const handleStudentVueUrlChange = (value: string) => {
    if (value.includes('http') && value.includes('/')) {
      const shortened = shortenDomainUrl(value);
      setStudentVueForm(prev => ({ ...prev, districtUrl: shortened }));
    } else {
      setStudentVueForm(prev => ({ ...prev, districtUrl: value }));
    }
  };

  const handleLinkStudentVue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentVueForm.districtUrl || !studentVueForm.username || !studentVueForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!studentVueForm.districtUrl.includes('.edupoint.com') && !studentVueForm.districtUrl.includes('.edupoint.org')) {
      toast.error('Please enter a valid Edupoint district URL');
      return;
    }

    setIsLinking(true);
    
    try {
      const success = await studentVueLogin(
        studentVueForm.districtUrl,
        studentVueForm.username,
        studentVueForm.password,
        studentVueForm.remember
      );
      
      if (success) {
        toast.success('StudentVUE account linked successfully!');
        setShowLinkStudentVue(false);
        // Refresh the page to show updated student data
        window.location.reload();
      } else {
        toast.error('Failed to link StudentVUE account. Please check your credentials.');
      }
    } catch (error) {
      toast.error('Failed to link StudentVUE account. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  // Calculate proper GPA using the V3 calculator
  const gpaResult = calculateGPAV3(courses);
  const currentGPA = gpaResult.useWeighted ? gpaResult.weightedGPA : gpaResult.unweightedGPA;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Student Information</h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Your personal and academic information
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <ProfilePictureUpload
                currentPicture={gradelyUser?.user_metadata?.profile_picture_url || null}
                onPictureUpdate={() => {
                  // Refresh user data to show updated picture
                  window.location.reload();
                }}
                userId={gradelyUser?.id || ''}
              />
            </div>

            {/* Basic Info */}
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                {isEditing ? (
                  <Input
                    value={editedInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-xl sm:text-2xl font-bold"
                    placeholder="Full Name"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold truncate">{studentInfo.name}</h2>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-2 w-full sm:w-fit"
                      >
                        <X className="size-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="flex items-center gap-2 w-full sm:w-fit"
                      >
                        <Save className="size-4" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLinkStudentVue(true)}
                        className="flex items-center gap-2 w-full sm:w-fit"
                      >
                        <Link className="size-4" />
                        Link StudentVUE
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="flex items-center gap-2 w-full sm:w-fit"
                      >
                        <Edit className="size-4" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                <Badge variant="secondary" className="text-sm">
                  {studentInfo.gradeLevel}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Student ID: {studentInfo.studentId}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="size-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Email
                    </p>
                    <p className="font-medium text-sm truncate">{studentInfo.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="size-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Phone
                    </p>
                    <p className="font-medium text-sm truncate">{studentInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center flex-shrink-0">
                    <School className="size-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      School
                    </p>
                    <p className="font-medium text-sm truncate">{studentInfo.schoolName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center flex-shrink-0">
                    <Users className="size-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Counselor
                    </p>
                    <p className="font-medium text-sm truncate">{studentInfo.counselor}</p>
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

      {/* Link StudentVUE Modal */}
      {showLinkStudentVue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link className="size-5" />
                Link StudentVUE Account
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowLinkStudentVue(false)}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Connect your StudentVUE account to automatically import your grades and attendance data.
              </p>
              
              <form onSubmit={handleLinkStudentVue} className="space-y-4">
                {/* District URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="districtUrl">District URL</Label>
                    <button
                      type="button"
                      onClick={() => setShowDomainHelper(!showDomainHelper)}
                      className="text-xs text-[#60a6fa] hover:text-[#4d8ce8] underline flex items-center gap-1"
                    >
                      <Info className="size-3" />
                      Help
                    </button>
                  </div>
                  
                  {showDomainHelper && (
                    <div className="p-3 bg-[#60a6fa]/10 dark:bg-[#60a6fa]/10 rounded-lg border border-[#60a6fa]/30 dark:border-[#60a6fa]/30 mb-3">
                      <p className="text-sm text-[#60a6fa] dark:text-[#60a6fa]">
                        Paste any link from your StudentVUE website below, and it will automatically shorten it.
                      </p>
                    </div>
                  )}
                  
                  <Input
                    id="districtUrl"
                    type="text"
                    placeholder="[your-district]-psv.edupoint.com"
                    value={studentVueForm.districtUrl}
                    onChange={(e) => handleStudentVueUrlChange(e.target.value)}
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your StudentVUE username"
                    value={studentVueForm.username}
                    onChange={(e) => handleStudentVueInputChange('username', e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your StudentVUE password"
                      value={studentVueForm.password}
                      onChange={(e) => handleStudentVueInputChange('password', e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={studentVueForm.remember}
                    onCheckedChange={(checked) => handleStudentVueInputChange('remember', checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Remember credentials
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowLinkStudentVue(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLinking}>
                    {isLinking ? 'Linking...' : 'Link Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
