import { BookOpen, Link, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface NoGradesFallbackProps {
  onLinkStudentVUE?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function NoGradesFallback({ 
  onLinkStudentVUE, 
  onRefresh, 
  loading = false 
}: NoGradesFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <BookOpen className="size-8 text-neutral-400" />
          </div>
          <CardTitle className="text-xl">No Grades Available</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {onLinkStudentVUE 
              ? "Link your StudentVUE account to view your grades and track your academic progress."
              : "No grade data is available at this time. Please check back later or contact your school administrator."
            }
          </p>
          
          <div className="flex flex-col gap-2">
            {onLinkStudentVUE && (
              <Button 
                onClick={onLinkStudentVUE}
                className="w-full"
              >
                <Link className="size-4 mr-2" />
                Link StudentVUE Account
              </Button>
            )}
            
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
          </div>
          
          <div className="text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <p>Grades are automatically updated every 5 seconds when linked to StudentVUE</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
