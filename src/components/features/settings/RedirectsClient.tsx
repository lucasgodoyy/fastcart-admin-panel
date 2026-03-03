'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import redirectService, { UrlRedirect } from '@/services/redirectService';
import { toast } from 'sonner';

export function RedirectsClient() {
  const queryClient = useQueryClient();
  const [oldUrl, setOldUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const { data: redirects = [], isLoading } = useQuery<UrlRedirect[]>({
    queryKey: ['url-redirects'],
    queryFn: redirectService.list,
  });

  const createMutation = useMutation({
    mutationFn: () => redirectService.create({ oldPath: oldUrl, newPath: newUrl }),
    onSuccess: () => {
      toast.success('Redirecionamento criado!');
      queryClient.invalidateQueries({ queryKey: ['url-redirects'] });
      setOldUrl('');
      setNewUrl('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erro ao criar redirecionamento.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => redirectService.remove(id),
    onSuccess: () => {
      toast.success('Redirecionamento removido.');
      queryClient.invalidateQueries({ queryKey: ['url-redirects'] });
    },
    onError: () => toast.error('Erro ao remover redirecionamento.'),
  });

  const handleAdd = () => {
    if (!oldUrl.trim() || !newUrl.trim()) {
      toast.error('Preencha ambas as URLs.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <SettingsPageLayout title="Redirecionamentos 301" helpText="Mais sobre redirecionamentos 301" helpHref="#">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Alterar estas configurações pode afetar o funcionamento da sua loja. Redirecionamentos 301
          indicam ao Google que a URL mudou permanentemente.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Novo redirecionamento</p>
        <p className="text-xs text-muted-foreground">
          Insira as URLs que deseja redirecionar. A URL antiga será redirecionada permanentemente (301) para a nova.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="oldUrl" className="text-sm font-medium text-foreground">URL antiga</Label>
            <Input
              id="oldUrl"
              value={oldUrl}
              onChange={(e) => setOldUrl(e.target.value)}
              placeholder="/antiga-categoria/antigo-produto"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newUrl" className="text-sm font-medium text-foreground">URL nova</Label>
            <Input
              id="newUrl"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="/nova-categoria/novo-produto"
            />
          </div>
        </div>

        <Button onClick={handleAdd} className="gap-1.5" disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="text-sm font-medium text-foreground mb-3">
          Redirecionamentos ativos ({redirects.length})
        </p>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : redirects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum redirecionamento configurado.
          </p>
        ) : (
          redirects.map((redirect) => (
            <div
              key={redirect.id}
              className="flex items-center gap-3 text-xs rounded-md border border-border p-2.5 group"
            >
              <span className="text-muted-foreground truncate flex-1 font-mono">{redirect.oldPath}</span>
              <span className="text-muted-foreground shrink-0">→</span>
              <span className="text-foreground truncate flex-1 font-mono">{redirect.newPath}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => deleteMutation.mutate(redirect.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </SettingsPageLayout>
  );
}
