// Types for Takeoff AI Project

export type ProjectStatus = 'Idle' | 'Processing' | 'Completed' | 'Failed';
export type FileStatus = 'Queued' | 'Uploading' | 'Uploaded' | 'Processing' | 'Done' | 'Failed';
export type Discipline = 'Civil' | 'Elétrica' | 'Mecânica';

export interface OverviewStats {
  total_processed: number;
  success_rate: number;
  avg_duration_sec: number;
  by_discipline: DisciplineCount[];
}

export interface DisciplineCount {
  name: Discipline;
  count: number;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  client?: string;
  disciplines: Discipline[];
  last_run_at: string;
  status: ProjectStatus;
  progress: number;
}

export interface ProjectsResponse {
  items: Project[];
  page: number;
  pageSize: number;
  total: number;
}

export interface BatchUploadResponse {
  batch_id: string;
  files: {
    name: string;
    file_id: string;
  }[];
}

export interface BatchFile {
  file_id: string;
  name: string;
  status: FileStatus;
  duration_sec?: number;
  error?: string;
}

export interface BatchStatus {
  status: ProjectStatus;
  progress: number;
  files: BatchFile[];
  counters: {
    ok: number;
    failed: number;
    total: number;
  };
  elapsed_sec: number;
}

export interface UploadFile {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}
