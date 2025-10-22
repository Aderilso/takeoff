import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPost } from '@/lib/api';
import { Project } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e código são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const project = await apiPost<Project>('/projects', {
        name: name.trim(),
        code: code.trim(),
        client: client.trim() || undefined,
      });

      toast({
        title: 'Projeto criado!',
        description: `${project.name} foi criado com sucesso.`,
      });

      onProjectCreated(project);
      onOpenChange(false);
      
      // Reset form
      setName('');
      setCode('');
      setClient('');
    } catch (error) {
      toast({
        title: 'Erro ao criar projeto',
        description: error instanceof Error ? error.message : 'Falha na criação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
            <DialogDescription>
              Preencha as informações básicas do projeto
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome do Projeto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pátio Industrial"
                maxLength={100}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: PI-2025"
                maxLength={50}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Cliente (opcional)</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ex: Cliente X"
                maxLength={100}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} data-testid="create-project-submit">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar e Abrir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
