import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/types';
import { MoreVertical, Eye, Copy, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
}

const statusVariants = {
  Idle: 'secondary',
  Processing: 'default',
  Completed: 'default',
  Failed: 'destructive',
} as const;

const statusColors = {
  Idle: 'bg-muted',
  Processing: 'bg-primary',
  Completed: 'bg-green-500',
  Failed: 'bg-destructive',
};

export function ProjectCard({ project, onView }: ProjectCardProps) {
  const lastRun = formatDistanceToNow(new Date(project.last_run_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{project.code}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Ver detalhes brutos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.client && (
          <p className="text-sm text-muted-foreground">Cliente: {project.client}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.disciplines.map((disc) => (
            <Badge key={disc} variant="outline" className="text-xs">
              {disc}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Último processamento</span>
            <span className="font-medium">{lastRun}</span>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={statusVariants[project.status]}>{project.status}</Badge>
            {project.status === 'Processing' && (
              <span className="text-xs text-muted-foreground">{project.progress}%</span>
            )}
          </div>

          {project.status === 'Processing' && (
            <Progress value={project.progress} className="h-1.5" />
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onView(project)}
          data-testid={`view-project-${project.id}`}
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      </CardFooter>
    </Card>
  );
}
