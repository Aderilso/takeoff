import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onCreateProject: () => void;
  onCreateDemo?: () => void;
  showDemoButton?: boolean;
}

export function EmptyState({ onCreateProject, onCreateDemo, showDemoButton }: EmptyStateProps) {
  return (
    <Card className="rounded-2xl border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="text-2xl font-bold mb-2">Nenhum projeto ainda</h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          Crie um projeto para começar a processar plantas e gerar listas de materiais
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onCreateProject} size="lg" data-testid="empty-create-project">
            <Plus className="h-5 w-5 mr-2" />
            Novo Projeto
          </Button>

          {showDemoButton && onCreateDemo && (
            <Button
              onClick={onCreateDemo}
              variant="outline"
              size="lg"
              data-testid="empty-create-demo"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Criar Projeto de Demonstração
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
