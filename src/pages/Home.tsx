import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/KpiCard';
import { DisciplineChips } from '@/components/DisciplineChips';
import { ViewSwitch } from '@/components/ViewSwitch';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectTable } from '@/components/ProjectTable';
import { ProjectModal } from '@/components/ProjectModal';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { EmptyState } from '@/components/EmptyState';
import { useOverviewStats } from '@/hooks/useOverviewStats';
import { useProjects } from '@/hooks/useProjects';
import { Project, Discipline } from '@/types';
import { Search, FileCheck, TrendingUp, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { mockService } from '@/lib/mock';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [view, setView] = useState<'cards' | 'list'>(() => {
    return (localStorage.getItem('projectView') as 'cards' | 'list') || 'cards';
  });
  const [search, setSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<Discipline | 'Todos'>('Todos');
  const [selectedDisciplineChip, setSelectedDisciplineChip] = useState<Discipline | null>(null);
  const [sort, setSort] = useState('Recentes');
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: stats, loading: statsLoading } = useOverviewStats();
  const { data: projectsData, loading: projectsLoading, refetch } = useProjects({
    search: debouncedSearch,
    discipline: disciplineFilter,
    sort,
    page,
  });

  useEffect(() => {
    localStorage.setItem('projectView', view);
  }, [view]);

  useEffect(() => {
    if (selectedDisciplineChip) {
      setDisciplineFilter(selectedDisciplineChip);
    } else {
      setDisciplineFilter('Todos');
    }
  }, [selectedDisciplineChip]);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleProjectCreated = (project: Project) => {
    refetch();
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleCreateDemo = () => {
    const useMock = import.meta.env.VITE_USE_MOCK === 'true';
    if (!useMock) return;

    mockService.seedIfEmpty();
    refetch();

    toast({
      title: 'Projetos de demonstração criados!',
      description: 'Abrindo projeto com processamento em andamento...',
    });

    // Open prj_002 which is Processing
    setTimeout(() => {
      const projects = mockService.listProjects({});
      const processingProject = projects.items.find(p => p.id === 'prj_002');
      if (processingProject) {
        setSelectedProject(processingProject);
        setModalOpen(true);
      }
    }, 500);
  };

  const totalPages = projectsData ? Math.ceil(projectsData.total / projectsData.pageSize) : 1;
  const showDemoButton = import.meta.env.VITE_USE_MOCK === 'true';
  const isEmpty = projectsData && projectsData.items.length === 0 && !search && disciplineFilter === 'Todos';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Takeoff – Projetos e Processamento</h1>
          <p className="text-lg text-muted-foreground">
            Carregue as plantas (PDF) e gere a lista de materiais por disciplina
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title="Arquivos Processados"
            value={stats?.total_processed || 0}
            subtitle="Total de PDFs processados"
            icon={FileCheck}
            loading={statsLoading}
          />
          <KpiCard
            title="Taxa de Sucesso"
            value={stats ? `${(stats.success_rate * 100).toFixed(1)}%` : '0%'}
            subtitle="Dos lotes processados"
            icon={TrendingUp}
            loading={statsLoading}
          />
          <KpiCard
            title="Tempo Médio"
            value={
              stats
                ? `${Math.floor(stats.avg_duration_sec / 60)}:${(stats.avg_duration_sec % 60)
                    .toString()
                    .padStart(2, '0')}`
                : '0:00'
            }
            subtitle="Por arquivo (mm:ss)"
            icon={Clock}
            loading={statsLoading}
          />
        </div>

        {/* Discipline Chips */}
        {stats && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Últimos 30 dias</p>
            <DisciplineChips
              disciplines={stats.by_discipline}
              selected={selectedDisciplineChip}
              onSelect={setSelectedDisciplineChip}
            />
          </div>
        )}

        {/* Filters & Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="sm:w-auto"
              data-testid="new-project-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código, cliente…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="search-input"
              />
            </div>
            <Select value={disciplineFilter} onValueChange={(v) => setDisciplineFilter(v as Discipline | 'Todos')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="Todos">Todas Disciplinas</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Elétrica">Elétrica</SelectItem>
                <SelectItem value="Mecânica">Mecânica</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="Recentes">Recentes</SelectItem>
                <SelectItem value="Nome (A–Z)">Nome (A–Z)</SelectItem>
                <SelectItem value="Status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ViewSwitch view={view} onViewChange={setView} />
        </div>

        {/* Projects */}
        {projectsLoading && !projectsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            onCreateProject={() => setCreateDialogOpen(true)}
            onCreateDemo={handleCreateDemo}
            showDemoButton={showDemoButton}
          />
        ) : projectsData && projectsData.items.length > 0 ? (
          <>
            {view === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projectsData.items.map((project) => (
                  <ProjectCard key={project.id} project={project} onView={handleViewProject} />
                ))}
              </div>
            ) : (
              <ProjectTable projects={projectsData.items} onView={handleViewProject} />
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * projectsData.pageSize + 1}–
                {Math.min(page * projectsData.pageSize, projectsData.total)} de {projectsData.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum projeto encontrado</p>
          </div>
        )}
      </div>

      <ProjectModal project={selectedProject} open={modalOpen} onOpenChange={setModalOpen} />
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
