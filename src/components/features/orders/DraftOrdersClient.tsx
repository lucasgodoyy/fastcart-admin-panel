'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Eye, RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import orderService from '@/services/sales/orderService';
import { AdminOrder } from '@/types/order';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatCurrency(amount: number, currency?: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(amount);
}

export function DraftOrdersClient() {
  const queryClient = useQueryClient();

  const [showNewDraftDialog, setShowNewDraftDialog] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [discardTarget, setDiscardTarget] = useState<AdminOrder | null>(null);

  const { data: drafts = [], isLoading } = useQuery<AdminOrder[]>({
    queryKey: ['draft-orders'],
    queryFn: () => orderService.listDrafts(),
  });

  const createDraftMutation = useMutation({
    mutationFn: (name: string) => orderService.createDraft(name || undefined),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['draft-orders'] });
      setShowNewDraftDialog(false);
      setNewDraftName('');
      toast.success(t('Rascunho criado!', 'Draft created!'));
    },
    onError: () => toast.error(t('Erro ao criar rascunho.', 'Failed to create draft.')),
  });

  const convertMutation = useMutation({
    mutationFn: (orderId: number) => orderService.convertDraft(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
      toast.success(t('Pedido convertido com sucesso!', 'Order converted successfully!'));
    },
    onError: () => toast.error(t('Erro ao converter rascunho.', 'Failed to convert draft.')),
  });

  const discardMutation = useMutation({
    mutationFn: (orderId: number) => orderService.discardDraft(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-orders'] });
      setDiscardTarget(null);
      toast.success(t('Rascunho descartado.', 'Draft discarded.'));
    },
    onError: () => toast.error(t('Erro ao descartar rascunho.', 'Failed to discard draft.')),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('Rascunhos de Pedidos', 'Draft Orders')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t(
              'Pedidos em rascunho não movimentam estoque nem geram cobrança até serem convertidos.',
              'Draft orders do not affect stock or billing until converted.'
            )}
          </p>
        </div>
        <Button onClick={() => setShowNewDraftDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('Novo Rascunho', 'New Draft')}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t('Carregando rascunhos...', 'Loading drafts...')}
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t('Nenhum rascunho encontrado.', 'No drafts found.')}
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => setShowNewDraftDialog(true)}
          >
            <Plus className="h-4 w-4" />
            {t('Criar primeiro rascunho', 'Create first draft')}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">{t('Nº', 'ID')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('Nome do rascunho', 'Draft name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('Criado em', 'Created at')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('Total', 'Total')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('Status', 'Status')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('Ações', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{draft.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {draft.draftName || <span className="italic text-muted-foreground">{t('Sem nome', 'Unnamed')}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(draft.createdAt)}</td>
                  <td className="px-4 py-3">{formatCurrency(draft.totalAmount, draft.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                      {t('Rascunho', 'Draft')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                        <Link href={`/admin/sales/${draft.id}`}>
                          <Eye className="h-3 w-3" />
                          {t('Ver', 'View')}
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                        disabled={convertMutation.isPending}
                        onClick={() => convertMutation.mutate(draft.id)}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t('Converter', 'Convert')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDiscardTarget(draft)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('Descartar', 'Discard')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Draft Dialog */}
      <AlertDialog open={showNewDraftDialog} onOpenChange={setShowNewDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Novo Rascunho de Pedido', 'New Draft Order')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'Crie um rascunho para montar um pedido sem gerar cobrança imediata.',
                'Create a draft to build an order without triggering immediate billing.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="draft-name">{t('Nome do rascunho (opcional)', 'Draft name (optional)')}</Label>
            <Input
              id="draft-name"
              placeholder={t('Ex: Pedido especial cliente X', 'E.g. Special order for customer X')}
              value={newDraftName}
              onChange={(e) => setNewDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createDraftMutation.mutate(newDraftName);
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewDraftName('')}>
              {t('Cancelar', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={createDraftMutation.isPending}
              onClick={() => createDraftMutation.mutate(newDraftName)}
            >
              {createDraftMutation.isPending ? t('Criando...', 'Creating...') : t('Criar Rascunho', 'Create Draft')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation */}
      <AlertDialog open={!!discardTarget} onOpenChange={(open) => { if (!open) setDiscardTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Descartar rascunho?', 'Discard draft?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'O rascunho será excluído permanentemente. Esta ação não pode ser desfeita.',
                'The draft will be permanently deleted. This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancelar', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={discardMutation.isPending}
              onClick={() => discardTarget && discardMutation.mutate(discardTarget.id)}
            >
              {discardMutation.isPending ? t('Descartando...', 'Discarding...') : t('Sim, descartar', 'Yes, discard')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
