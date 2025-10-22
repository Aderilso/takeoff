// Mock service using localStorage for demo/development
import { 
  Project, 
  ProjectsResponse, 
  OverviewStats, 
  BatchUploadResponse, 
  BatchStatus,
  Discipline 
} from '@/types';

const STORAGE_KEYS = {
  projects: 'takeoff.projects',
  batches: 'takeoff.batches',
  stats: 'takeoff.stats',
};

interface MockBatch {
  batch_id: string;
  project_id: string;
  discipline: Discipline;
  status: 'Processing' | 'Completed' | 'Failed';
  progress: number;
  files: Array<{
    file_id: string;
    name: string;
    status: 'Queued' | 'Processing' | 'Done' | 'Failed';
    duration_sec?: number;
    error?: string;
  }>;
  counters: { ok: number; failed: number; total: number };
  elapsed_sec: number;
  started_at: number;
}

class MockService {
  private progressIntervals: Map<string, NodeJS.Timeout> = new Map();

  seedIfEmpty() {
    const projects = this.getProjects();
    if (projects.length > 0) return;

    const seedProjects: Project[] = [
      {
        id: 'prj_001',
        name: 'Pátio Industrial',
        code: 'PI-2025',
        client: 'Cliente X',
        disciplines: ['Civil', 'Elétrica'],
        last_run_at: '2025-10-20T13:45:00Z',
        status: 'Completed',
        progress: 100,
      },
      {
        id: 'prj_002',
        name: 'Subestação Norte',
        code: 'SN-11KV',
        client: 'Energix',
        disciplines: ['Elétrica'],
        last_run_at: '2025-10-22T10:20:00Z',
        status: 'Processing',
        progress: 42,
      },
      {
        id: 'prj_003',
        name: 'Prédio Administrativo',
        code: 'PA-01',
        client: 'Construsul',
        disciplines: ['Civil', 'Mecânica'],
        last_run_at: '2025-10-18T09:10:00Z',
        status: 'Idle',
        progress: 0,
      },
    ];

    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(seedProjects));

    // Seed batch for prj_002
    const seedBatch: MockBatch = {
      batch_id: 'bat_seed_001',
      project_id: 'prj_002',
      discipline: 'Elétrica',
      status: 'Processing',
      progress: 42,
      files: [
        {
          file_id: 'f_001',
          name: 'Planta_Eletrica_A1.pdf',
          status: 'Done',
          duration_sec: 28,
        },
        {
          file_id: 'f_002',
          name: 'Planta_Eletrica_A2.pdf',
          status: 'Processing',
          duration_sec: 12,
        },
        {
          file_id: 'f_003',
          name: 'Planta_Eletrica_A3.pdf',
          status: 'Queued',
        },
      ],
      counters: { ok: 1, failed: 0, total: 3 },
      elapsed_sec: 40,
      started_at: Date.now() - 40000,
    };

    const batches = { [seedBatch.batch_id]: seedBatch };
    localStorage.setItem(STORAGE_KEYS.batches, JSON.stringify(batches));

    this.updateStats();
  }

  private getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.projects);
    return data ? JSON.parse(data) : [];
  }

  private saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }

  private getBatches(): Record<string, MockBatch> {
    const data = localStorage.getItem(STORAGE_KEYS.batches);
    return data ? JSON.parse(data) : {};
  }

  private saveBatches(batches: Record<string, MockBatch>) {
    localStorage.setItem(STORAGE_KEYS.batches, JSON.stringify(batches));
  }

  private updateStats() {
    const projects = this.getProjects();
    const batches = Object.values(this.getBatches());

    const totalProcessed = batches.reduce((sum, b) => sum + b.counters.total, 0);
    const totalSuccess = batches.reduce((sum, b) => sum + b.counters.ok, 0);
    const successRate = totalProcessed > 0 ? totalSuccess / totalProcessed : 0;

    const durations = batches.flatMap(b => 
      b.files.filter(f => f.duration_sec).map(f => f.duration_sec!)
    );
    const avgDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const disciplineCounts: Record<Discipline, number> = {
      Civil: 0,
      Elétrica: 0,
      Mecânica: 0,
    };

    projects.forEach(p => {
      p.disciplines.forEach(d => {
        disciplineCounts[d as Discipline]++;
      });
    });

    const stats: OverviewStats = {
      total_processed: totalProcessed,
      success_rate: successRate,
      avg_duration_sec: Math.round(avgDuration),
      by_discipline: [
        { name: 'Civil', count: disciplineCounts.Civil },
        { name: 'Elétrica', count: disciplineCounts.Elétrica },
        { name: 'Mecânica', count: disciplineCounts.Mecânica },
      ],
    };

    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
  }

  getOverviewStats(): OverviewStats {
    const data = localStorage.getItem(STORAGE_KEYS.stats);
    if (!data) {
      this.updateStats();
      return this.getOverviewStats();
    }
    return JSON.parse(data);
  }

  listProjects(params: {
    search?: string;
    discipline?: string;
    sort?: string;
    page?: number;
  }): ProjectsResponse {
    let projects = this.getProjects();

    // Filter by search
    if (params.search) {
      const search = params.search.toLowerCase();
      projects = projects.filter(
        p =>
          p.name.toLowerCase().includes(search) ||
          p.code.toLowerCase().includes(search) ||
          p.client?.toLowerCase().includes(search)
      );
    }

    // Filter by discipline
    if (params.discipline && params.discipline !== 'Todos') {
      projects = projects.filter(p => p.disciplines.includes(params.discipline as Discipline));
    }

    // Sort
    if (params.sort === 'Nome (A–Z)') {
      projects.sort((a, b) => a.name.localeCompare(b.name));
    } else if (params.sort === 'Status') {
      projects.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      // Recentes
      projects.sort((a, b) => 
        new Date(b.last_run_at || 0).getTime() - new Date(a.last_run_at || 0).getTime()
      );
    }

    // Paginate
    const page = params.page || 1;
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const items = projects.slice(start, start + pageSize);

    return {
      items,
      page,
      pageSize,
      total: projects.length,
    };
  }

  createProject(dto: { name: string; code: string; client?: string }): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: `prj_${Date.now()}`,
      name: dto.name,
      code: dto.code,
      client: dto.client || undefined,
      disciplines: [],
      last_run_at: new Date().toISOString(),
      status: 'Idle',
      progress: 0,
    };

    projects.push(newProject);
    this.saveProjects(projects);
    this.updateStats();

    return newProject;
  }

  uploadBatch(projectId: string, files: File[]): BatchUploadResponse {
    const batchId = `bat_${Date.now()}`;
    const fileList = files.map((f, i) => ({
      name: f.name,
      file_id: `f_${Date.now()}_${i}`,
    }));

    const batch: MockBatch = {
      batch_id: batchId,
      project_id: projectId,
      discipline: 'Civil',
      status: 'Processing',
      progress: 0,
      files: fileList.map(f => ({
        file_id: f.file_id,
        name: f.name,
        status: 'Queued',
      })),
      counters: { ok: 0, failed: 0, total: fileList.length },
      elapsed_sec: 0,
      started_at: 0,
    };

    const batches = this.getBatches();
    batches[batchId] = batch;
    this.saveBatches(batches);

    return {
      batch_id: batchId,
      files: fileList,
    };
  }

  startBatch(
    projectId: string,
    batchId: string,
    payload: { discipline: Discipline; engine: string }
  ) {
    const batches = this.getBatches();
    const batch = batches[batchId];
    if (!batch) throw new Error('Batch not found');

    batch.discipline = payload.discipline;
    batch.started_at = Date.now();
    batch.status = 'Processing';
    this.saveBatches(batches);

    // Update project
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.status = 'Processing';
      project.last_run_at = new Date().toISOString();
      if (!project.disciplines.includes(payload.discipline)) {
        project.disciplines.push(payload.discipline);
      }
      this.saveProjects(projects);
    }

    // Simulate progress
    this.simulateProgress(batchId, projectId);
  }

  private simulateProgress(batchId: string, projectId: string) {
    if (this.progressIntervals.has(batchId)) return;

    const interval = setInterval(() => {
      const batches = this.getBatches();
      const batch = batches[batchId];
      if (!batch) {
        clearInterval(interval);
        this.progressIntervals.delete(batchId);
        return;
      }

      batch.elapsed_sec = Math.floor((Date.now() - batch.started_at) / 1000);
      batch.progress = Math.min(100, batch.progress + Math.random() * 15);

      // Update file statuses
      batch.files.forEach(file => {
        if (file.status === 'Queued' && Math.random() > 0.7) {
          file.status = 'Processing';
        } else if (file.status === 'Processing' && Math.random() > 0.6) {
          file.status = Math.random() > 0.1 ? 'Done' : 'Failed';
          file.duration_sec = Math.floor(Math.random() * 60 + 20);
          if (file.status === 'Done') {
            batch.counters.ok++;
          } else {
            batch.counters.failed++;
            file.error = 'Falha na extração de dados';
          }
        }
      });

      // Check completion
      if (batch.progress >= 100 || batch.files.every(f => f.status === 'Done' || f.status === 'Failed')) {
        batch.progress = 100;
        batch.status = batch.counters.failed === 0 ? 'Completed' : 'Completed';
        clearInterval(interval);
        this.progressIntervals.delete(batchId);

        // Update project
        const projects = this.getProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          project.status = batch.status;
          project.progress = 100;
          this.saveProjects(projects);
        }
      }

      this.saveBatches(batches);
      this.updateStats();
    }, 2000);

    this.progressIntervals.set(batchId, interval);
  }

  getBatchStatus(projectId: string, batchId: string): BatchStatus {
    const batches = this.getBatches();
    const batch = batches[batchId];
    if (!batch) throw new Error('Batch not found');

    return {
      status: batch.status,
      progress: batch.progress,
      files: batch.files,
      counters: batch.counters,
      elapsed_sec: batch.elapsed_sec,
    };
  }

  getFileLog(projectId: string, batchId: string, fileId: string): string {
    const batches = this.getBatches();
    const batch = batches[batchId];
    const file = batch?.files.find(f => f.file_id === fileId);

    if (!file) return 'Log não encontrado';

    return `[MOCK LOG] Arquivo: ${file.name}
Status: ${file.status}
Duração: ${file.duration_sec || 0}s

[INFO] Iniciando processamento com Azure Document Intelligence
[INFO] Upload concluído
[INFO] Análise de layout iniciada
${file.status === 'Done' ? '[SUCCESS] Extração concluída com sucesso' : ''}
${file.status === 'Failed' ? '[ERROR] ' + file.error : ''}
[INFO] Total de itens extraídos: ${Math.floor(Math.random() * 150 + 50)}`;
  }

  getBatchReport(projectId: string, batchId: string): Blob {
    const batches = this.getBatches();
    const batch = batches[batchId];

    let csvContent = 'ITEM;DESCRIÇÃO;UNIDADE;QUANTIDADE;SEÇÃO\n';
    
    batch?.files
      .filter(f => f.status === 'Done')
      .forEach((file, idx) => {
        const items = Math.floor(Math.random() * 30 + 20);
        for (let i = 0; i < items; i++) {
          csvContent += `${idx + 1}.${i + 1};Material ${i + 1};UN;${Math.floor(Math.random() * 100)};${file.name}\n`;
        }
      });

    return new Blob([csvContent], { type: 'text/csv' });
  }
}

export const mockService = new MockService();
