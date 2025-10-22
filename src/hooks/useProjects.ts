import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import { ProjectsResponse, Discipline } from '@/types';

interface UseProjectsParams {
  search: string;
  discipline: Discipline | 'Todos';
  sort: string;
  page: number;
}

export function useProjects(params: UseProjectsParams) {
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.discipline !== 'Todos') queryParams.set('discipline', params.discipline);
      queryParams.set('sort', params.sort);
      queryParams.set('page', params.page.toString());

      const response = await apiGet<ProjectsResponse>(
        `/projects?${queryParams.toString()}`,
        signal
      );
      setData(response);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [params.search, params.discipline, params.sort, params.page]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal);
    return () => controller.abort();
  }, [fetchProjects]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal);
  }, [fetchProjects]);

  return { data, loading, error, refetch };
}
