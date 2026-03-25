'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, TrendingUp, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import upsellService from '@/services/admin/upsellService';
import { UpsellOffer, UpsellType, UpsellTriggerType } from '@/types/upsell';
import { t } from '@/lib/admin-language';

const TYPE_LABELS: Record<UpsellType, string> = {
  UPSELL: 'Upsell',
  CROSS_SELL: 'Cross-sell',
  BUNDLE: 'Bundle',
  POST_PURCHASE: 'Pós-compra',
};

const TRIGGER_LABELS: Record<UpsellTriggerType, string> = {
  PRODUCT: 'Produto',
  CATEGORY: 'Categoria',
  CART_VALUE: 'Valor do carrinho',
  ALL: 'Todos',
};

const defaultForm = {
  name: '',
  message: '',
  type: 'UPSELL' as UpsellType,
  triggerType: 'PRODUCT' as UpsellTriggerType,
  triggerIds: '',
  offerProductIds: '',
  discountPercent: 0,
  priority: 0,
  maxImpressions: 0,
};

export function UpsellClient() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UpsellOffer | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: offers, isLoading } = useQuery<UpsellOffer[]>({
    queryKey: ['upsell-offers'],
    queryFn: upsellService.list,
  });

  const createMutation = useMutation({
    mutationFn: () => upsellService.create({
      ...form,
      triggerIds: form.triggerIds ? form.triggerIds.split(',').map(Number) : [],
      offerProductIds: form.offerProductIds ? form.offerProductIds.split(',').map(Number) : [],
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['upsell-offers'] }); close(); toast.success(t('Criado!', 'Created!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const updateMutation = useMutation({
    mutationFn: () => upsellService.update(editing!.id, {
      ...form,
      triggerIds: form.triggerIds ? form.triggerIds.split(',').map(Number) : [],
      offerProductIds: form.offerProductIds ? form.offerProductIds.split(',').map(Number) : [],
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['upsell-offers'] }); close(); toast.success(t('Atualizado!', 'Updated!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => upsellService.toggle(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['upsell-offers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => upsellService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['upsell-offers'] }); toast.success(t('Removido!', 'Removed!')); },
  });

  function open(offer?: UpsellOffer) {
    if (offer) {
      setEditing(offer);
      setForm({
        name: offer.name,
        message: offer.message || '',
        type: offer.type,
        triggerType: offer.triggerType,
        triggerIds: offer.triggerIds?.join(',') || '',
        offerProductIds: offer.offerProductIds?.join(',') || '',
        discountPercent: offer.discountPercent ?? 0,
        priority: offer.priority ?? 0,
        maxImpressions: offer.maxImpressions ?? 0,
      });
    } else {
      setEditing(null);
      setForm(defaultForm);
    }
    setDialogOpen(true);
  }

  function close() {
    setDialogOpen(false);
    setEditing(null);
  }

  function convRate(o: UpsellOffer) {
    if (!o.impressionCount || o.impressionCount === 0) return '—';
    return ((o.conversionCount / o.impressionCount) * 100).toFixed(1) + '%';
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Upsell & Cross-sell', 'Upsell & Cross-sell')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Crie ofertas para aumentar o ticket médio.', 'Create offers to increase average order value.')}
          </p>
        </div>
        <Button size="sm" onClick={() => open()}>
          <Plus className="mr-1.5 h-4 w-4" />{t('Nova Oferta', 'New Offer')}
        </Button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Título', 'Title')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Tipo', 'Type')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Gatilho', 'Trigger')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Desconto', 'Discount')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Impressões', 'Impressions')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Conv.', 'Conv.')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && (!offers || offers.length === 0) && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('Nenhuma oferta.', 'No offers.')}</td></tr>
            )}
            {offers?.map((o) => (
              <tr key={o.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{o.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{TYPE_LABELS[o.type]}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{TRIGGER_LABELS[o.triggerType]}</td>
                <td className="px-4 py-3 text-sm">{o.discountPercent ? `${o.discountPercent}%` : '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{o.impressionCount?.toLocaleString() ?? 0}</td>
                <td className="px-4 py-3 text-sm font-medium">{convRate(o)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleMutation.mutate({ id: o.id, active: !o.active })} className="text-muted-foreground hover:text-foreground">
                    {o.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <Button size="icon-xs" variant="ghost" onClick={() => open(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(t('Excluir?', 'Delete?'))) deleteMutation.mutate(o.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('Editar Oferta', 'Edit Offer') : t('Nova Oferta', 'New Offer')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div><Label>{t('Nome', 'Name')}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>{t('Mensagem', 'Message')}</Label><Textarea rows={2} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('Tipo', 'Type')}</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as UpsellType })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <Label>{t('Gatilho', 'Trigger')}</Label>
                <select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value as UpsellTriggerType })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div><Label>{t('IDs Gatilho (vírgula)', 'Trigger IDs (comma)')}</Label><Input value={form.triggerIds} onChange={(e) => setForm({ ...form, triggerIds: e.target.value })} placeholder="1,2,3" /></div>
            <div><Label>{t('IDs Produtos Ofertados (vírgula)', 'Offer Product IDs (comma)')}</Label><Input value={form.offerProductIds} onChange={(e) => setForm({ ...form, offerProductIds: e.target.value })} placeholder="4,5,6" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>{t('Desconto %', 'Discount %')}</Label><Input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></div>
              <div><Label>{t('Prioridade', 'Priority')}</Label><Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></div>
              <div><Label>{t('Max Impressões', 'Max Impressions')}</Label><Input type="number" value={form.maxImpressions} onChange={(e) => setForm({ ...form, maxImpressions: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>{t('Cancelar', 'Cancel')}</Button>
            <Button onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()} disabled={createMutation.isPending || updateMutation.isPending || !form.name}>
              {t('Salvar', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
