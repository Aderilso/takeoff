import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectTableProps {
  projects: Project[];
  onView: (project: Project) => void;
}

const statusVariants = {
  Idle: 'secondary',
  Processing: 'default',
  Completed: 'default',
  Failed: 'destructive',
} as const;

export function ProjectTable({ projects, onView }: ProjectTableProps) {
  return (
    <div className="rounded-2xl border shadow-sm bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Disciplinas</TableHead>
            <TableHead>Último Processamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const lastRun = formatDistanceToNow(new Date(project.last_run_at), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.code}</TableCell>
                <TableCell>{project.client || '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.disciplines.map((disc) => (
                      <Badge key={disc} variant="outline" className="text-xs">
                        {disc}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{lastRun}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[project.status]}>{project.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(project)}
                    data-testid={`view-project-${project.id}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
