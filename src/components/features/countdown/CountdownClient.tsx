'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Timer, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import countdownService from '@/services/admin/countdownService';
import { CountdownTimer, CountdownType, CountdownPosition } from '@/types/countdown';
import { t } from '@/lib/admin-language';

const TYPE_LABELS: Record<CountdownType, string> = {
  FIXED_DATE: 'Data Fixa',
  EVERGREEN: 'Evergreen',
  DAILY_RECURRING: 'Diário Recorrente',
};

const POSITION_LABELS: Record<CountdownPosition, string> = {
  TOP: 'Topo da página',
  BOTTOM: 'Rodapé',
  PRODUCT_PAGE: 'Página do produto',
  CART_PAGE: 'Página do carrinho',
};

const defaultForm = {
  name: '',
  type: 'FIXED_DATE' as CountdownType,
  position: 'TOP' as CountdownPosition,
  endDate: '',
  durationMinutes: 60,
  dailyStartTime: '00:00',
  dailyEndTime: '23:59',
  bgColor: '#ef4444',
  textColor: '#ffffff',
  message: '',
};

export function CountdownClient() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CountdownTimer | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: timers, isLoading } = useQuery<CountdownTimer[]>({
    queryKey: ['countdown-timers'],
    queryFn: countdownService.list,
  });

  const createMutation = useMutation({
    mutationFn: () => countdownService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['countdown-timers'] }); close(); toast.success(t('Criado!', 'Created!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const updateMutation = useMutation({
    mutationFn: () => countdownService.update(editing!.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['countdown-timers'] }); close(); toast.success(t('Atualizado!', 'Updated!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => countdownService.toggle(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['countdown-timers'] }),
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => countdownService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['countdown-timers'] }); toast.success(t('Removido!', 'Removed!')); },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  function open(timer?: CountdownTimer) {
    if (timer) {
      setEditing(timer);
      setForm({
        name: timer.name,
        type: timer.type,
        position: timer.position,
        endDate: timer.endDate || '',
        durationMinutes: timer.durationMinutes ?? 60,
        dailyStartTime: timer.dailyStartTime || '00:00',
        dailyEndTime: timer.dailyEndTime || '23:59',
        bgColor: timer.bgColor || '#ef4444',
        textColor: timer.textColor || '#ffffff',
        message: timer.message || '',
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('Contadores Regressivos', 'Countdown Timers')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('Crie urgência com cronômetros na loja.', 'Create urgency with countdown timers in your store.')}
          </p>
        </div>
        <Button size="sm" onClick={() => open()}>
          <Plus className="mr-1.5 h-4 w-4" />{t('Novo Timer', 'New Timer')}
        </Button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {timers?.map((timer) => (
          <div key={timer.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="p-4" style={{ borderLeft: `4px solid ${timer.bgColor || '#ef4444'}` }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">{timer.name}</h3>
                <button onClick={() => toggleMutation.mutate({ id: timer.id, active: !timer.active })} className="text-muted-foreground hover:text-foreground">
                  {timer.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{t('Tipo:', 'Type:')} {TYPE_LABELS[timer.type]}</p>
                <p>{t('Posição:', 'Position:')} {POSITION_LABELS[timer.position]}</p>
                {timer.type === 'FIXED_DATE' && timer.endDate && <p>{t('Termina:', 'Ends:')} {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(timer.endDate))}</p>}
                {timer.type === 'EVERGREEN' && <p>{t('Duração:', 'Duration:')} {timer.durationMinutes} min</p>}
                {timer.message && <p className="italic">"{timer.message}"</p>}
              </div>
              <div className="mt-3 flex items-center gap-1">
                <Button size="icon-xs" variant="ghost" onClick={() => open(timer)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(t('Excluir?', 'Delete?'))) deleteMutation.mutate(timer.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && (!timers || timers.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Timer className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t('Nenhum timer criado.', 'No timers created.')}</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('Editar Timer', 'Edit Timer') : t('Novo Timer', 'New Timer')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div><Label>{t('Nome', 'Name')}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>{t('Tipo', 'Type')}</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CountdownType })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <Label>{t('Posição', 'Position')}</Label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as CountdownPosition })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Object.entries(POSITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {form.type === 'FIXED_DATE' && (
              <div><Label>{t('Data/Hora Final', 'End Date/Time')}</Label><Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            )}
            {form.type === 'EVERGREEN' && (
              <div><Label>{t('Minutos', 'Minutes')}</Label><Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></div>
            )}
            {form.type === 'DAILY_RECURRING' && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t('Início', 'Start')}</Label><Input type="time" value={form.dailyStartTime} onChange={(e) => setForm({ ...form, dailyStartTime: e.target.value })} /></div>
                <div><Label>{t('Fim', 'End')}</Label><Input type="time" value={form.dailyEndTime} onChange={(e) => setForm({ ...form, dailyEndTime: e.target.value })} /></div>
              </div>
            )}
            <div><Label>{t('Mensagem', 'Message')}</Label><Input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t('Ex: Oferta termina em...', 'Ex: Offer ends in...')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('Cor de fundo', 'Background')}</Label><Input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} /></div>
              <div><Label>{t('Cor do texto', 'Text color')}</Label><Input type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} /></div>
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
