import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { 
  RotateCcw, 
  Plus, 
  Calculator, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useGrades } from '@/contexts/GradesContext';
import { GradeChart } from '@/components/GradeChart';
import { toast } from 'sonner';

export function GradesPage() {
  const { courses } = useGrades();
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [pinChart, setPinChart] = useState(false);
  const [hypotheticalMode, setHypotheticalMode] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [showTargetCalculator, setShowTargetCalculator] = useState(false);

  const selectedCourse = courses[selectedCourseIndex];

  // Get categories from assignments
  const assignmentCategories = useMemo(() => {
    if (!selectedCourse?.assignments) return [];
    const categories = selectedCourse.assignments
      .map(a => a.category || 'Uncategorized')
      .filter(Boolean);
    return [...new Set(categories)];
  }, [selectedCourse]);

  // Category colors for badges
  const categoryColors = useMemo(() => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'yellow', 'indigo'];
    return new Map(assignmentCategories.map((cat, i) => [cat, colors[i % colors.length]]));
  }, [assignmentCategories]);

  // Calculate current grade
  const currentGrade = useMemo(() => {
    if (!selectedCourse) return 0;
    return selectedCourse.percentage || 0;
  }, [selectedCourse]);

  const handleResetHypothetical = () => {
    toast.success('Reset to original grades');
  };

  const handleAddHypothetical = () => {
    toast.success('Added hypothetical assignment');
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const AssignmentCard = ({ assignment }: { assignment: any }) => {
    const percentage = assignment.percentage || 0;
    const category = assignment.category || 'Uncategorized';

    return (
      <Card className="max-w-4xl mx-auto transition-all duration-300 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Assignment Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{assignment.name}</h3>
                
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {category}
                </Badge>
                
                {assignment.grade === '' && (
                  <Badge variant="outline">Not Graded</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {assignment.category || 'Assignment'} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>

            {/* Grade Info */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {assignment.score || assignment.grade || '--'}
                </span>
                
                {assignment.percentage !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    ({assignment.percentage.toFixed(1)}%)
                  </span>
                )}
              </div>

              {assignment.percentage !== undefined && (
                <Progress 
                  value={Math.min(assignment.percentage, 100)} 
                  className="w-32 sm:w-48"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!selectedCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a course to view grades.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header with Course Name and Grade */}
      <div className={`sticky top-0 z-10 bg-background transition-all ${
        pinChart ? 'shadow-md' : ''
      }`}>
        <div className="flex justify-between items-center rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {selectedCourse.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {hypotheticalMode && (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <span className={`text-xl sm:text-2xl font-bold ${getGradeColor(currentGrade)}`}>
              {currentGrade.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {pinChart && (
          <div className="mt-4">
            <GradeChart 
              assignments={selectedCourse.assignments || []}
              gradeCategories={[]}
            />
          </div>
        )}
      </div>

      {/* Grade Chart */}
      {!pinChart && (
        <div className="w-full">
          <GradeChart 
            assignments={selectedCourse.assignments || []}
            gradeCategories={[]}
          />
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="hypothetical-mode"
                checked={hypotheticalMode}
                onCheckedChange={(checked) => setHypotheticalMode(checked === true)}
              />
              <Label htmlFor="hypothetical-mode">Hypothetical Mode</Label>
            </div>

            {assignmentCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="category-breakdown"
                  checked={showCategoryBreakdown}
                  onCheckedChange={(checked) => setShowCategoryBreakdown(checked === true)}
                />
                <Label htmlFor="category-breakdown">Show Category Breakdown</Label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox 
                id="pin-chart"
                checked={pinChart}
                onCheckedChange={(checked) => setPinChart(checked === true)}
              />
              <Label htmlFor="pin-chart">Pin Chart to Top</Label>
            </div>

            {hypotheticalMode && (
              <div className="flex flex-wrap gap-2 ml-auto">
                <Button variant="outline" onClick={handleResetHypothetical}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                
                {!showTargetCalculator && (
                  <Button variant="outline" onClick={() => setShowTargetCalculator(true)}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Target Grade Calculator
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleAddHypothetical}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hypothetical
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Grade Calculator */}
      {hypotheticalMode && showTargetCalculator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Target Grade Calculator
              <Button variant="ghost" onClick={() => setShowTargetCalculator(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Calculate what you need on future assignments to reach your target grade.
            </p>
            {/* Target calculator implementation would go here */}
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
            {courses.map((course, index) => (
              <Button
                key={course.id}
                variant={selectedCourseIndex === index ? "default" : "outline"}
                onClick={() => setSelectedCourseIndex(index)}
                className="p-3 sm:p-4 h-auto flex flex-col items-start"
              >
                <h3 className="font-semibold text-sm truncate">{course.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {course.teacher || 'Teacher'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl sm:text-2xl font-bold">
                    {course.grade || course.letterGrade || 'A'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {course.percentage?.toFixed(1) || '0'}%
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      {selectedCourse.assignments && selectedCourse.assignments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Assignments - {selectedCourse.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentCategories.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
                  <TabsTrigger value="all">All ({selectedCourse.assignments.length})</TabsTrigger>
                  {assignmentCategories.map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {selectedCourse.assignments.map((assignment: any) => (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment}
                    />
                  ))}
                </TabsContent>

                {assignmentCategories.map(category => (
                  <TabsContent key={category} value={category} className="space-y-4 mt-6">
                    {selectedCourse.assignments
                      .filter((a: any) => (a.category || 'Uncategorized') === category)
                      .map((assignment: any) => (
                        <AssignmentCard 
                          key={assignment.id} 
                          assignment={assignment}
                        />
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-4">
                {selectedCourse.assignments.map((assignment: any) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            No assignments found for this course yet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
