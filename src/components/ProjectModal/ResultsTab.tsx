import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { useBatchStatus } from '@/hooks/useBatchStatus';
import { BatchProgress } from '../BatchProgress';
import { apiGet, API_BASE_URL } from '@/lib/api';
import { FileStatus } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResultsTabProps {
  projectId: string;
  batchId: string | null;
}

const statusVariants: Record<FileStatus, 'default' | 'secondary' | 'destructive'> = {
  Queued: 'secondary',
  Uploading: 'default',
  Uploaded: 'secondary',
  Processing: 'default',
  Done: 'default',
  Failed: 'destructive',
};

export function ResultsTab({ projectId, batchId }: ResultsTabProps) {
  const { data: status, loading, error, refetch } = useBatchStatus(projectId, batchId, !!batchId);
  const [logDialog, setLogDialog] = useState<{ open: boolean; fileId: string; fileName: string } | null>(null);
  const [log, setLog] = useState<string>('');
  const [loadingLog, setLoadingLog] = useState(false);

  const handleViewLog = async (fileId: string, fileName: string) => {
    setLogDialog({ open: true, fileId, fileName });
    setLoadingLog(true);
    try {
      const logText = await apiGet<string>(
        `/projects/${projectId}/batches/${batchId}/files/${fileId}/log`
      );
      setLog(logText);
    } catch (err) {
      setLog('Erro ao carregar log: ' + (err instanceof Error ? err.message : 'Desconhecido'));
    } finally {
      setLoadingLog(false);
    }
  };

  const handleDownloadReport = () => {
    window.open(`${API_BASE_URL}/projects/${projectId}/batches/${batchId}/report`, '_blank');
  };

  if (!batchId) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Nenhum lote selecionado</AlertTitle>
        <AlertDescription>
          Vá para a aba "Processar" para enviar arquivos e iniciar o processamento.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar status</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const avgDuration = status?.files.reduce((sum, f) => sum + (f.duration_sec || 0), 0) / (status?.counters.total || 1);

  return (
    <div className="space-y-6">
      <BatchProgress status={status} loading={loading} onRefresh={refetch} />

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resumo & Logs</CardTitle>
            <CardDescription className="mt-2">
              Total: {status?.counters.total || 0} • Sucesso: {status?.counters.ok || 0} • Falhas:{' '}
              {status?.counters.failed || 0} • Média: {avgDuration.toFixed(1)}s por arquivo
            </CardDescription>
          </div>
          <Button onClick={handleDownloadReport} data-testid="download-report">
            <Download className="h-4 w-4 mr-2" />
            Baixar Relatório
          </Button>
        </CardHeader>
        <CardContent>
          {loading && !status ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {status?.files.map((file) => (
                    <TableRow key={file.file_id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[file.status]}>{file.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {file.duration_sec ? `${file.duration_sec}s` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLog(file.file_id, file.name)}
                        >
                          Ver log
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={logDialog?.open || false} onOpenChange={(open) => !open && setLogDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Log: {logDialog?.fileName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96 w-full rounded-lg border p-4 bg-muted/50">
            {loadingLog ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap">{log}</pre>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
