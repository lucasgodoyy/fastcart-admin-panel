'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import emailService, {
  StoreEmailCampaign,
  StoreEmailCampaignUpsert,
} from '@/services/emailService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Plus,
  Send,
  Clock,
  Pause,
  Play,
  Trash2,
  Users,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Loader2,
  CalendarClock,
  FileEdit,
  Rocket,
  Repeat,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ── Constants ── */

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  SENDING: 'Enviando',
  SENT: 'Enviada',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SENDING: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  SENT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const frequencyLabels: Record<string, string> = {
  ONCE: 'Única vez',
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
};

const targetLabels: Record<string, string> = {
  ALL_CUSTOMERS: 'Todos os clientes',
  NEW_CUSTOMERS: 'Novos clientes',
  RETURNING_CUSTOMERS: 'Clientes recorrentes',
  CUSTOM: 'Lista personalizada',
};

const EMPTY_FORM: StoreEmailCampaignUpsert = {
  name: '',
  subject: '',
  bodyHtml: '',
  status: 'DRAFT',
  targetAudience: 'ALL_CUSTOMERS',
  frequency: 'ONCE',
  timezone: 'America/Sao_Paulo',
};

/* ── Page Component ── */

export function EmailCampaignsClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<StoreEmailCampaign | null>(null);
  const [selected, setSelected] = useState<StoreEmailCampaign | null>(null);
  const [form, setForm] = useState<StoreEmailCampaignUpsert>({ ...EMPTY_FORM });

  // ── Queries ──
  const { data: stats } = useQuery({
    queryKey: ['email-campaign-stats'],
    queryFn: emailService.getCampaignStats,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['email-campaigns', statusFilter, page],
    queryFn: () =>
      emailService.listCampaigns({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: 15,
      }),
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (body: StoreEmailCampaignUpsert) => emailService.createCampaign(body),
    onSuccess: () => {
      toast.success('Campanha criada com sucesso!');
      invalidate();
      closeDialog();
    },
    onError: () => toast.error('Erro ao criar campanha'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: StoreEmailCampaignUpsert }) =>
      emailService.updateCampaign(id, body),
    onSuccess: () => {
      toast.success('Campanha atualizada!');
      invalidate();
      closeDialog();
    },
    onError: () => toast.error('Erro ao atualizar campanha'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      emailService.updateCampaignStatus(id, status),
    onSuccess: () => {
      toast.success('Status atualizado!');
      invalidate();
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  const sendNowMutation = useMutation({
    mutationFn: (id: number) => emailService.sendCampaignNow(id),
    onSuccess: () => {
      toast.success('Campanha enviada!');
      invalidate();
    },
    onError: () => toast.error('Erro ao enviar campanha'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => emailService.deleteCampaign(id),
    onSuccess: () => {
      toast.success('Campanha excluída!');
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error('Erro ao excluir campanha'),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['email-campaign-stats'] });
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(c: StoreEmailCampaign) {
    setEditing(c);
    setForm({
      name: c.name,
      subject: c.subject,
      bodyHtml: c.bodyHtml,
      status: c.status,
      targetAudience: c.targetAudience ?? 'ALL_CUSTOMERS',
      segmentFilter: c.segmentFilter ?? undefined,
      sendAt: c.sendAt,
      frequency: c.frequency ?? 'ONCE',
      recurrenceEnd: c.recurrenceEnd,
      timezone: c.timezone ?? 'America/Sao_Paulo',
      fromName: c.fromName ?? undefined,
      fromEmail: c.fromEmail ?? undefined,
      replyToEmail: c.replyToEmail ?? undefined,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleSubmit() {
    if (!form.name || !form.subject || !form.bodyHtml) {
      toast.error('Preencha nome, assunto e conteúdo HTML');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const campaigns = data?.content ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanhas de E-mail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie, agende e envie campanhas de e-mail para seus clientes
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCampaigns ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.scheduledCampaigns ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? `${stats.avgOpenRate.toFixed(1)}%` : '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? `${stats.avgClickRate.toFixed(1)}%` : '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="SCHEDULED">Agendada</SelectItem>
            <SelectItem value="SENDING">Enviando</SelectItem>
            <SelectItem value="SENT">Enviada</SelectItem>
            <SelectItem value="PAUSED">Pausada</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isLoading ? 'Carregando...' : `${data?.totalElements ?? 0} campanha(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Nenhuma campanha encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">Crie sua primeira campanha de e-mail</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Público</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Enviados</TableHead>
                    <TableHead>Abertura</TableHead>
                    <TableHead>Agendado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(campaign => (
                    <TableRow
                      key={campaign.id}
                      className="cursor-pointer"
                      onClick={() => { setSelected(campaign); setDetailOpen(true); }}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-48">{campaign.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status] ?? ''} variant="secondary">
                          {statusLabels[campaign.status] ?? campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {targetLabels[campaign.targetAudience ?? ''] ?? campaign.targetAudience ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {frequencyLabels[campaign.frequency ?? 'ONCE'] ?? campaign.frequency}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {campaign.sentCount}/{campaign.totalRecipients}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-green-600">
                        {campaign.openRate > 0 ? `${campaign.openRate.toFixed(1)}%` : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {campaign.sendAt
                          ? format(new Date(campaign.sendAt), 'dd/MM/yy HH:mm', { locale: ptBR })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                          {campaign.status === 'DRAFT' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(campaign)} title="Editar">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => sendNowMutation.mutate(campaign.id)} title="Enviar agora">
                                <Rocket className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => statusMutation.mutate({ id: campaign.id, status: 'SCHEDULED' })} disabled={!campaign.sendAt} title="Agendar">
                                <Clock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {campaign.status === 'SCHEDULED' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600" onClick={() => statusMutation.mutate({ id: campaign.id, status: 'PAUSED' })} title="Pausar">
                                <Pause className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => sendNowMutation.mutate(campaign.id)} title="Enviar agora">
                                <Rocket className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {campaign.status === 'PAUSED' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => statusMutation.mutate({ id: campaign.id, status: 'SCHEDULED' })} title="Retomar">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {(campaign.status === 'DRAFT' || campaign.status === 'CANCELLED') && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(campaign.id)} title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    Página {data.page + 1} de {Math.max(data.totalPages, 1)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={data.first}>
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={data.last}>
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ──── Create / Edit Dialog ──── */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {editing ? 'Editar Campanha' : 'Nova Campanha'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Edite os detalhes da campanha'
                : 'Configure uma nova campanha de e-mail para enviar aos seus clientes'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome da Campanha *</Label>
                <Input
                  placeholder="Ex: Promoção de Verão"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Assunto do E-mail *</Label>
                <Input
                  placeholder="Ex: 🔥 Até 50% de desconto!"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Público-alvo
                </Label>
                <Select
                  value={form.targetAudience ?? 'ALL_CUSTOMERS'}
                  onValueChange={v => setForm(p => ({ ...p, targetAudience: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_CUSTOMERS">Todos os clientes</SelectItem>
                    <SelectItem value="NEW_CUSTOMERS">Novos clientes</SelectItem>
                    <SelectItem value="RETURNING_CUSTOMERS">Clientes recorrentes</SelectItem>
                    <SelectItem value="CUSTOM">Lista personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5" /> Frequência
                </Label>
                <Select
                  value={form.frequency ?? 'ONCE'}
                  onValueChange={v => setForm(p => ({ ...p, frequency: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONCE">Única vez</SelectItem>
                    <SelectItem value="DAILY">Diária</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="BIWEEKLY">Quinzenal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" /> Data/Hora de Envio
                </Label>
                <Input
                  type="datetime-local"
                  value={form.sendAt ? format(new Date(form.sendAt), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={e => setForm(p => ({ ...p, sendAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                />
              </div>
              {form.frequency && form.frequency !== 'ONCE' && (
                <div className="space-y-1.5">
                  <Label>Encerrar recorrência em</Label>
                  <Input
                    type="datetime-local"
                    value={form.recurrenceEnd ? format(new Date(form.recurrenceEnd), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={e => setForm(p => ({ ...p, recurrenceEnd: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Nome do Remetente</Label>
                <Input
                  placeholder="Minha Loja"
                  value={form.fromName ?? ''}
                  onChange={e => setForm(p => ({ ...p, fromName: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail do Remetente</Label>
                <Input
                  placeholder="contato@minhaloja.com"
                  value={form.fromEmail ?? ''}
                  onChange={e => setForm(p => ({ ...p, fromEmail: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reply-To</Label>
                <Input
                  placeholder="suporte@minhaloja.com"
                  value={form.replyToEmail ?? ''}
                  onChange={e => setForm(p => ({ ...p, replyToEmail: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Conteúdo HTML *</Label>
              <Textarea
                className="min-h-40 font-mono text-xs"
                placeholder="<h1>Olá!</h1><p>Confira nossas novidades...</p>"
                value={form.bodyHtml}
                onChange={e => setForm(p => ({ ...p, bodyHtml: e.target.value }))}
              />
            </div>

            {form.bodyHtml && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Label>
                <div
                  className="border rounded-lg p-4 bg-white text-black text-sm min-h-16 max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: form.bodyHtml }}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</span>
              ) : editing ? (
                'Salvar Alterações'
              ) : (
                <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Criar Campanha</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──── Detail Dialog ──── */}
      <Dialog open={detailOpen} onOpenChange={v => { if (!v) { setDetailOpen(false); setSelected(null); } }}>
        {selected && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> {selected.name}
              </DialogTitle>
              <DialogDescription>{selected.subject}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-3">
                <Badge className={statusColors[selected.status] ?? ''} variant="secondary">
                  {statusLabels[selected.status] ?? selected.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Criada {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: 'Destinatários', value: selected.totalRecipients },
                  { icon: Send, label: 'Enviados', value: selected.sentCount },
                  { icon: CheckCircle, label: 'Entregues', value: selected.deliveredCount },
                  { icon: Eye, label: 'Abertos', value: selected.openedCount },
                  { icon: MousePointerClick, label: 'Clicados', value: selected.clickedCount },
                  { icon: AlertTriangle, label: 'Bounced', value: selected.bouncedCount },
                  { icon: XCircle, label: 'Falhas', value: selected.failedCount },
                  { icon: Mail, label: 'Unsubscribed', value: selected.unsubscribedCount },
                ].map(metric => (
                  <Card key={metric.label}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{metric.label}</span>
                      </div>
                      <p className="text-lg font-bold">{metric.value.toLocaleString('pt-BR')}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Abertura</p>
                    <p className="text-xl font-bold text-green-600">{selected.openRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Clique</p>
                    <p className="text-xl font-bold text-blue-600">{selected.clickRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Bounce</p>
                    <p className="text-xl font-bold text-red-600">{selected.bounceRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Público</span>
                    <span className="font-medium">{targetLabels[selected.targetAudience ?? ''] ?? selected.targetAudience ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequência</span>
                    <span className="font-medium">{frequencyLabels[selected.frequency ?? 'ONCE'] ?? selected.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envio em</span>
                    <span className="font-medium">
                      {selected.sendAt ? format(new Date(selected.sendAt), 'dd/MM/yy HH:mm', { locale: ptBR }) : 'Não agendado'}
                    </span>
                  </div>
                  {selected.nextSendAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próximo envio</span>
                      <span className="font-medium">{format(new Date(selected.nextSendAt), 'dd/MM/yy HH:mm', { locale: ptBR })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selected.bodyHtml && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview do E-mail
                  </Label>
                  <div
                    className="border rounded-lg p-4 bg-white text-black text-sm max-h-64 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selected.bodyHtml }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ──── Delete Confirmation ──── */}
      <AlertDialog open={deleteId !== null} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A campanha e todos os registros de destinatários serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
