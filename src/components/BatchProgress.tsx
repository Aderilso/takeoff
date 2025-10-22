import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BatchStatus } from '@/types';
import { RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BatchProgressProps {
  status: BatchStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BatchProgress({ status, loading, onRefresh }: BatchProgressProps) {
  if (loading && !status) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="rounded-2xl" data-testid="batch-progress">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Progresso do Lote</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold">{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{status.counters.ok}</p>
              <p className="text-xs text-muted-foreground">Sucesso</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{status.counters.failed}</p>
              <p className="text-xs text-muted-foreground">Falhas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatTime(status.elapsed_sec)}</p>
              <p className="text-xs text-muted-foreground">Tempo Decorrido</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
