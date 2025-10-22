import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Discipline, UploadFile } from '@/types';
import { Uploader } from '../Uploader';
import { apiUpload, apiPost } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Info, Play } from 'lucide-react';

interface ProcessTabProps {
  projectId: string;
  discipline: Discipline | '';
  setDiscipline: (d: Discipline | '') => void;
  files: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  onProcessingStarted: (batchId: string) => void;
}

export function ProcessTab({
  projectId,
  discipline,
  setDiscipline,
  files,
  setFiles,
  onProcessingStarted,
}: ProcessTabProps) {
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploadedBatchId, setUploadedBatchId] = useState<string | null>(null);

  const handleFilesAdd = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'Queued',
      progress: 0,
    }));
    setFiles([...files, ...uploadFiles]);
  };

  const handleFileRemove = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f.file));

      const response = await apiUpload<{ batch_id: string; files: Array<{ name: string; file_id: string }> }>(
        `/projects/${projectId}/batches/uploads`,
        formData
      );

      setUploadedBatchId(response.batch_id);
      toast({ title: 'Upload concluído!', description: `${files.length} arquivo(s) enviado(s).` });
    } catch (error) {
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Falha ao enviar arquivos.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (!discipline || !uploadedBatchId) return;

    try {
      setStarting(true);
      await apiPost(`/projects/${projectId}/batches/${uploadedBatchId}/start`, {
        discipline,
        engine: 'azure_document_intelligence',
      });

      toast({ title: 'Processamento iniciado!', description: 'Acompanhe o progresso na aba Resultados.' });
      onProcessingStarted(uploadedBatchId);
    } catch (error) {
      toast({
        title: 'Erro ao iniciar',
        description: error instanceof Error ? error.message : 'Falha ao iniciar processamento.',
        variant: 'destructive',
      });
    } finally {
      setStarting(false);
    }
  };

  const canUpload = files.length > 0 && !uploading;
  const canStart = discipline && uploadedBatchId && !starting;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>1. Seleção de Disciplina</CardTitle>
          <CardDescription>Escolha a disciplina para este lote de processamento</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={discipline} onValueChange={(v) => setDiscipline(v as Discipline)}>
            <SelectTrigger data-testid="discipline-select">
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="Civil">Civil</SelectItem>
              <SelectItem value="Elétrica">Elétrica</SelectItem>
              <SelectItem value="Mecânica">Mecânica</SelectItem>
            </SelectContent>
          </Select>
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Você pode executar múltiplos lotes por disciplina diferente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>2. Upload de Arquivos</CardTitle>
          <CardDescription>Adicione os PDFs das plantas para processamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Uploader
            files={files}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
          />
          {files.length > 0 && !uploadedBatchId && (
            <Button onClick={handleUpload} disabled={!canUpload} className="w-full">
              {uploading ? 'Enviando...' : 'Enviar Arquivos'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>3. Iniciar Processamento</CardTitle>
          <CardDescription>
            Envie os arquivos para extração de lista de materiais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full"
            size="lg"
            data-testid="start-processing"
          >
            <Play className="h-5 w-5 mr-2" />
            {starting ? 'Iniciando...' : 'Iniciar Processamento'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
