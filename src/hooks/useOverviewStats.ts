import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { OverviewStats } from '@/types';

export function useOverviewStats() {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const stats = await apiGet<OverviewStats>('/stats/overview', controller.signal);
        setData(stats);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    return () => controller.abort();
  }, []);

  return { data, loading, error };
}
