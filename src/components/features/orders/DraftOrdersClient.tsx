'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Eye, RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageContainer, PageHeader, EmptyState } from '@/components/admin/page-header';
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
    <PageContainer>
      <PageHeader
        title={t('Rascunhos de Pedidos', 'Draft Orders')}
        description={t(
          'Pedidos em rascunho não movimentam estoque nem geram cobrança até serem convertidos.',
          'Draft orders do not affect stock or billing until converted.'
        )}
        actions={
          <Button onClick={() => setShowNewDraftDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('Novo Rascunho', 'New Draft')}
          </Button>
        }
      />

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="h-4 w-12 rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title={t('Nenhum rascunho encontrado.', 'No drafts found.')}
          description={t('Crie um rascunho para montar pedidos sem cobrança imediata.', 'Create a draft to build orders without immediate billing.')}
          action={
            <Button variant="outline" className="gap-2" onClick={() => setShowNewDraftDialog(true)}>
              <Plus className="h-4 w-4" />
              {t('Criar primeiro rascunho', 'Create first draft')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="group rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:border-border/80"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {/* ID */}
                <span className="shrink-0 font-mono text-xs text-muted-foreground sm:w-16">#{draft.id}</span>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {draft.draftName || <span className="italic text-muted-foreground">{t('Sem nome', 'Unnamed')}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(draft.createdAt)}</p>
                </div>

                {/* Amount + badge */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(draft.totalAmount, draft.currency)}</span>
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    {t('Rascunho', 'Draft')}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
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
              </div>
            </div>
          ))}
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
    </PageContainer>
  );
}
