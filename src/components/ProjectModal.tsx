import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project, Discipline, UploadFile } from '@/types';
import { Copy } from 'lucide-react';
import { ProcessTab } from './ProjectModal/ProcessTab';
import { ResultsTab } from './ProjectModal/ResultsTab';
import { toast } from '@/hooks/use-toast';

interface ProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectModal({ project, open, onOpenChange }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState('process');
  const [discipline, setDiscipline] = useState<Discipline | ''>('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);

  if (!project) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(project.id);
    toast({ title: 'ID copiado!', description: 'O ID do projeto foi copiado.' });
  };

  const handleProcessingStarted = (newBatchId: string) => {
    setBatchId(newBatchId);
    setActiveTab('results');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {project.name} ({project.code})
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleCopyId}
              >
                <Badge variant="outline" className="cursor-pointer">
                  <Copy className="h-3 w-3 mr-1" />
                  {project.id}
                </Badge>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="process">Processar</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          <TabsContent value="process" className="mt-6">
            <ProcessTab
              projectId={project.id}
              discipline={discipline}
              setDiscipline={setDiscipline}
              files={files}
              setFiles={setFiles}
              onProcessingStarted={handleProcessingStarted}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <ResultsTab projectId={project.id} batchId={batchId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
