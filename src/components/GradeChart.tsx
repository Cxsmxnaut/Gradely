import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  calculateCourseGradePercentageFromCategories,
  calculateCourseGradePercentageFromTotals,
  getCalculableAssignments,
  getCalculableAssignmentsWithCategories,
  getPointsByCategory,
  type Assignment,
  type Category
} from '@/lib/grades/assignments';

interface DataPointMetadata {
  assignmentsOnDate: Assignment[];
}

interface GradeChartProps {
  assignments: Assignment[];
  gradeCategories?: Category[];
  animate?: boolean;
  error?: boolean;
  className?: string;
}

export function GradeChart({ 
  assignments, 
  gradeCategories, 
  animate = true, 
  error = false,
  className 
}: GradeChartProps) {
  console.log('🔍 GradeChart Debug - assignments:', assignments);
  console.log('🔍 GradeChart Debug - gradeCategories:', gradeCategories);

  // Generate chart data exactly like the Svelte example
  const chartData = React.useMemo(() => {
    if (gradeCategories) {
      console.log('🔍 Using category-based calculation');
      const assignmentsByDate = new Map<number, any[]>();

      const calculableAssignments = getCalculableAssignmentsWithCategories(assignments);
      console.log('🔍 Calculable assignments with categories:', calculableAssignments);

      calculableAssignments.forEach((assignment) => {
        const ms = assignment.date.getTime();
        const existingAssignments = assignmentsByDate.get(ms) ?? [];
        assignmentsByDate.set(ms, [...existingAssignments, assignment]);
      });

      const entries = Array.from(assignmentsByDate.entries()).sort(([ms_a], [ms_b]) => ms_a - ms_b);
      console.log('🔍 Sorted entries:', entries);

      return entries
        .map(([ms, assignments], i) => {
          const assignmentsUntil = entries
            .map((entry) => entry[1])
            .slice(0, i + 1)
            .flat();

          const grade = calculateCourseGradePercentageFromCategories(
            getPointsByCategory(assignmentsUntil),
            gradeCategories
          );

          const metadata: DataPointMetadata = {
            assignmentsOnDate: assignments
          };

          return { date: new Date(ms), grade, metadata };
        })
        .filter((x) => x !== null);
    } else {
      console.log('🔍 Using total-based calculation');
      const assignmentsByDate = new Map<number, any[]>();

      const calculableAssignments = getCalculableAssignments(assignments);
      console.log('🔍 Calculable assignments:', calculableAssignments);

      calculableAssignments.forEach((assignment) => {
        const ms = assignment.date.getTime();
        const existingAssignments = assignmentsByDate.get(ms) ?? [];
        assignmentsByDate.set(ms, [...existingAssignments, assignment]);
      });

      const entries = Array.from(assignmentsByDate.entries()).sort(([ms_a], [ms_b]) => ms_a - ms_b);
      console.log('🔍 Sorted entries:', entries);

      return entries
        .map(([ms, assignments], i) => {
          const assignmentsUntil = entries
            .map((entry) => entry[1])
            .slice(0, i + 1)
            .flat();

          const grade = calculateCourseGradePercentageFromTotals(assignmentsUntil);

          const metadata: DataPointMetadata = {
            assignmentsOnDate: assignments
          };

          return { date: new Date(ms), grade, metadata };
        })
        .filter((x) => x !== null);
    }
  }, [assignments, gradeCategories]);

  // Calculate dynamic Y-axis range based on median grade
  const yAxisRange = React.useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100 };
    
    const grades = chartData.map(d => d.grade);
    grades.sort((a, b) => a - b);
    
    // Calculate median
    const median = grades.length % 2 === 0
      ? (grades[grades.length / 2 - 1] + grades[grades.length / 2]) / 2
      : grades[Math.floor(grades.length / 2)];
    
    // Create 15-point range centered on median
    const range = 15;
    let min = median - range / 2;
    let max = median + range / 2;
    
    // Ensure we stay within 0-100 bounds
    if (min < 0) {
      max = Math.min(100, max - min);
      min = 0;
    }
    if (max > 100) {
      min = Math.max(0, min - (max - 100));
      max = 100;
    }
    
    console.log(`🔍 Chart range: ${min.toFixed(1)} - ${max.toFixed(1)} (median: ${median.toFixed(1)})`);
    
    return { min, max };
  }, [chartData]);

  // Formatters exactly like the Svelte example
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 3
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const metadata = data.payload.metadata as DataPointMetadata;
      
      return (
        <div className="border-border/50 bg-background grid min-w-[9rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
          <div className="font-medium">
            {dayFormatter.format(new Date(label))}
          </div>
          <div className="grid gap-1.5">
            <div className="flex w-full flex-wrap items-stretch gap-2">
              <div className="flex flex-1 shrink-0 justify-between leading-none items-center">
                <span className="text-muted-foreground">
                  Grade
                </span>
                <span className="text-foreground font-mono font-medium tabular-nums">
                  {`${Math.round(Number(data.value))}%`}
                </span>
              </div>
            </div>
            {metadata.assignmentsOnDate.map((assignment) => (
              <div key={assignment.id} className="text-muted-foreground text-xs">
                {assignment.name}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("m-4 aspect-auto h-64", className)}>
      {chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              No grade data available to display chart.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient 
                id="colorGrade" 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="1"
              >
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => dayFormatter.format(new Date(value))}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[yAxisRange.min, yAxisRange.max]} 
              tickFormatter={(value) => `${Math.round(value)}%`}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="grade"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorGrade)"
              animationDuration={animate ? 1000 : 0}
            />
            {/* Fallback Line to ensure visibility */}
            <Line
              type="monotone"
              dataKey="grade"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              animationDuration={animate ? 1000 : 0}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
