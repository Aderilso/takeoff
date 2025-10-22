import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import { BatchStatus } from '@/types';

const POLL_INTERVAL = 2000;

export function useBatchStatus(projectId: string, batchId: string | null, enabled: boolean) {
  const [data, setData] = useState<BatchStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async (signal: AbortSignal) => {
    if (!batchId) return;
    
    try {
      setError(null);
      const status = await apiGet<BatchStatus>(
        `/projects/${projectId}/batches/${batchId}/status`,
        signal
      );
      setData(status);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, batchId]);

  useEffect(() => {
    if (!enabled || !batchId) return;

    const controller = new AbortController();
    setLoading(true);
    fetchStatus(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchStatus(controller.signal);
      }
    }, POLL_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [enabled, batchId, fetchStatus]);

  const refetch = useCallback(() => {
    if (!batchId) return;
    const controller = new AbortController();
    fetchStatus(controller.signal);
  }, [batchId, fetchStatus]);

  return { data, loading, error, refetch };
}
