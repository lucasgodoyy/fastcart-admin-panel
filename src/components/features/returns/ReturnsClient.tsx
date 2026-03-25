'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RotateCcw, Eye, Loader2, Package, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import returnService from '@/services/admin/returnService';
import { ReturnRequest, ReturnStats, ReturnStatus } from '@/types/returns';
import { t } from '@/lib/admin-language';

const STATUS_CONFIG: Record<ReturnStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  REQUESTED: { label: 'Solicitado', variant: 'outline' },
  APPROVED: { label: 'Aprovado', variant: 'secondary' },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
  RECEIVED: { label: 'Recebido', variant: 'secondary' },
  REFUNDED: { label: 'Reembolsado', variant: 'default' },
  EXCHANGED: { label: 'Trocado', variant: 'default' },
  COMPLETED: { label: 'Concluído', variant: 'default' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function ReturnsClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useQuery<{ content: ReturnRequest[]; totalElements: number }>({
    queryKey: ['returns', statusFilter],
    queryFn: () => returnService.list(statusFilter || undefined),
  });

  const { data: stats } = useQuery<ReturnStats>({
    queryKey: ['return-stats'],
    queryFn: returnService.getStats,
  });

  const updateMutation = useMutation({
    mutationFn: () => returnService.updateStatus(selected!.id, newStatus, adminNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['return-stats'] });
      setSelected(null);
      toast.success(t('Status atualizado!', 'Status updated!'));
    },
    onError: () => toast.error(t('Erro ao atualizar', 'Error updating')),
  });

  const returns = data?.content ?? [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Devoluções & Trocas', 'Returns & Exchanges')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Gerencie solicitações de devolução e troca.', 'Manage return and exchange requests.')}
        </p>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard icon={<Package className="h-5 w-5 text-blue-600" />} label={t('Total', 'Total')} value={stats.total} />
          <StatCard icon={<Clock className="h-5 w-5 text-yellow-600" />} label={t('Solicitados', 'Requested')} value={stats.requested} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} label={t('Aprovados', 'Approved')} value={stats.approved} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label={t('Completos', 'Completed')} value={stats.completed} />
          <StatCard icon={<XCircle className="h-5 w-5 text-red-600" />} label={t('Rejeitados', 'Rejected')} value={stats.rejected} />
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t('Todos', 'All')}</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">#</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Pedido', 'Order')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Cliente', 'Customer')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Tipo', 'Type')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Motivo', 'Reason')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
            )}
            {!isLoading && returns.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('Nenhuma solicitação encontrada.', 'No requests found.')}</td></tr>
            )}
            {returns.map((r) => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.REQUESTED;
              return (
                <tr key={r.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{r.id}</td>
                  <td className="px-4 py-3 text-sm">#{r.orderId}</td>
                  <td className="px-4 py-3 text-sm">{r.customerName || r.customerEmail || '—'}</td>
                  <td className="px-4 py-3 text-sm">{r.type === 'RETURN' ? t('Devolução', 'Return') : t('Troca', 'Exchange')}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.reason.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button size="icon-xs" variant="ghost" onClick={() => { setSelected(r); setNewStatus(r.status); setAdminNotes(r.adminNotes || ''); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Detalhes da Devolução', 'Return Details')} #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">{t('Pedido:', 'Order:')}</span> #{selected.orderId}</div>
                <div><span className="text-muted-foreground">{t('Tipo:', 'Type:')}</span> {selected.type}</div>
                <div><span className="text-muted-foreground">{t('Motivo:', 'Reason:')}</span> {selected.reason.replace(/_/g, ' ')}</div>
                <div><span className="text-muted-foreground">{t('Itens:', 'Items:')}</span> {selected.items?.length || 0}</div>
              </div>
              {selected.reasonDetails && (
                <div className="text-sm"><span className="text-muted-foreground">{t('Detalhes:', 'Details:')}</span> {selected.reasonDetails}</div>
              )}
              <div className="space-y-2">
                <Label>{t('Novo Status', 'New Status')}</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t('Notas Internas', 'Admin Notes')}</Label>
                <Input value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>{t('Fechar', 'Close')}</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {t('Atualizar', 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
