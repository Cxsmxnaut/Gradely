import { useState } from 'react';
import { Plus, Trash2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useGrades } from '@/contexts/GradesContext';
import { Course, Assignment } from '@/types';
import { toast } from 'sonner';
import { NoGradesFallback } from '@/components/NoGradesFallback';
import { GradeChart } from '@/components/GradeChart';
import type { Category } from '@/lib/grades/assignments';

export function GradesPage() {
  const {
    courses,
    isHypotheticalMode,
    toggleHypotheticalMode,
    addHypotheticalAssignment,
    removeHypotheticalAssignment,
    resetHypotheticalMode,
    loading,
    usingCachedData,
  } = useGrades();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback if no courses
  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
        <div className="max-w-4xl mx-auto">
          <NoGradesFallback 
            onLinkStudentVUE={() => window.location.href = '/student-info'}
            onRefresh={() => window.location.reload()}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New assignment form state
  const [newAssignment, setNewAssignment] = useState({
    name: '',
    category: '',
    score: '',
    maxScore: '100',
  });

  // Convert assignments to match Svelte structure
  const convertAssignments = (assignments: Assignment[]) => {
    return assignments.map(assignment => ({
      ...assignment,
      date: assignment.dueDate ? new Date(assignment.dueDate) : new Date(),
      extraCredit: assignment.weight === 0 || false,
      notForGrade: assignment.isNotGraded || false,
      hidden: false,
      newHypothetical: assignment.isHypothetical || false,
      pointsEarned: assignment.score,
      pointsPossible: assignment.maxScore,
      gradePercentageChange: undefined,
      unscaledPoints: undefined,
    }));
  };

  // Convert categories to match Svelte structure
  const convertCategories = (course: Course): Category[] | undefined => {
    if (!course.categoryWeights) return undefined;
    
    return Object.entries(course.categoryWeights).map(([name, weight]) => ({
      name,
      weightPercentage: weight * 100, // Convert decimal to percentage
      pointsEarned: 0, // Would need to calculate from assignments
      pointsPossible: 0, // Would need to calculate from assignments
      weightedPercentage: 0, // Would need to calculate from assignments
      gradeLetter: '', // Would need to calculate from assignments
    }));
  };

  const convertedAssignments = convertAssignments(selectedCourse.assignments || []);
  const gradeCategories = convertCategories(selectedCourse);

  console.log('🔍 GradesPage Debug - selectedCourse.assignments:', selectedCourse.assignments);
  console.log('🔍 GradesPage Debug - convertedAssignments:', convertedAssignments);
  console.log('🔍 GradesPage Debug - gradeCategories:', gradeCategories);

  const handleAddHypotheticalAssignment = () => {
    if (!newAssignment.name || !newAssignment.category || !newAssignment.score) {
      toast.error('Please fill in all fields');
      return;
    }

    const assignment: Assignment = {
      id: `HYP-${Date.now()}`,
      name: newAssignment.name,
      category: newAssignment.category,
      score: parseFloat(newAssignment.score),
      maxScore: parseFloat(newAssignment.maxScore),
      weight: selectedCourse.categoryWeights[newAssignment.category],
      dueDate: new Date().toISOString().split('T')[0],
      isHypothetical: true,
    };

    addHypotheticalAssignment(selectedCourse.id, assignment);
    
    // Update selected course
    const updatedCourse = courses.find((c) => c.id === selectedCourse.id);
    if (updatedCourse) {
      setSelectedCourse(updatedCourse);
    }

    setNewAssignment({ name: '', category: '', score: '', maxScore: '100' });
    setDialogOpen(false);
    toast.success('Hypothetical assignment added!');
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    removeHypotheticalAssignment(selectedCourse.id, assignmentId);
    
    // Update selected course
    const updatedCourse = courses.find((c) => c.id === selectedCourse.id);
    if (updatedCourse) {
      setSelectedCourse(updatedCourse);
    }
    
    toast.success('Assignment removed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Grades</h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
              Track and predict your academic performance
            </p>
          </div>
          
          {/* Cache Status Indicator */}
          {usingCachedData && (
            <Badge variant="secondary" className="w-fit">
              <Clock className="size-3 mr-1" />
              Cached data
            </Badge>
          )}
        </div>

        {/* Hypothetical Mode Toggle */}
        <Card className={`p-4 ${isHypotheticalMode ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : ''}`}>
          <div className="flex items-center gap-3">
            <Switch
              id="hypothetical-mode"
              checked={isHypotheticalMode}
              onCheckedChange={toggleHypotheticalMode}
            />
            <div>
              <Label htmlFor="hypothetical-mode" className="cursor-pointer font-semibold">
                Hypothetical Mode
              </Label>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {isHypotheticalMode ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Hypothetical Mode Alert */}
      {isHypotheticalMode && (
        <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  Hypothetical Mode Active
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  You can now add hypothetical assignments to see how they would affect your grade.
                  Changes are not saved and will reset when you turn off this mode.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetHypotheticalMode}
                  className="mt-3"
                >
                  Reset Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCourse.id === course.id
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <h3 className="font-semibold text-sm truncate">{course.name}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {course.teacher}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {course.letterGrade}
                  </span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {course.currentGrade !== undefined ? course.currentGrade.toFixed(1) : 'N/A'}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grade Chart - Exact Svelte Implementation */}
      <GradeChart 
        assignments={convertedAssignments}
        gradeCategories={gradeCategories}
        animate={true}
        error={false}
      />

      {/* Assignments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assignments - {selectedCourse.name}</CardTitle>
          {isHypotheticalMode && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-2" />
                  Add Hypothetical
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Hypothetical Assignment</DialogTitle>
                  <DialogDescription>
                    Add a hypothetical assignment to see how it would affect your grade.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Assignment Name</Label>
                    <Input
                      placeholder="e.g., Final Exam"
                      value={newAssignment.name}
                      onChange={(e) =>
                        setNewAssignment({ ...newAssignment, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newAssignment.category}
                      onValueChange={(value) =>
                        setNewAssignment({ ...newAssignment, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(selectedCourse.categoryWeights).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category} ({selectedCourse.categoryWeights[category]}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Score</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 95"
                        value={newAssignment.score}
                        onChange={(e) =>
                          setNewAssignment({ ...newAssignment, score: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Max Score</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        value={newAssignment.maxScore}
                        onChange={(e) =>
                          setNewAssignment({ ...newAssignment, maxScore: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddHypotheticalAssignment} className="w-full">
                    Add Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {!selectedCourse.assignments || selectedCourse.assignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600 dark:text-neutral-400">
                No assignments available for this course yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCourse.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border ${
                  assignment.isHypothetical
                    ? 'border-purple-300 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-700'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{assignment.name}</h3>
                    {assignment.isHypothetical && (
                      <Badge variant="secondary" className="text-xs">
                        Hypothetical
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {assignment.category} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold">
                      {assignment.isNotGraded ? '—' : `${assignment.score}/${assignment.maxScore}`}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {assignment.isNotGraded 
                        ? 'Not Graded' 
                        : assignment.score !== undefined && assignment.maxScore !== undefined && assignment.maxScore > 0 
                          ? ((assignment.score / assignment.maxScore) * 100).toFixed(1) + '%'
                          : 'N/A'}
                    </div>
                  </div>
                  {assignment.isHypothetical && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
