"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Mail,
  Plus,
  Send,
  Clock,
  Pause,
  Play,
  Trash2,
  BarChart3,
  Users,
  CalendarClock,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle,
  FileEdit,
  Rocket,
  XCircle,
  RefreshCw,
  Target,
  Repeat,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { superAdminService } from "@/services/super-admin";
import { toast } from "sonner";
import type { EmailCampaign, EmailCampaignUpsertRequest } from "@/types/super-admin";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const campaignStatusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Rascunho", color: "secondary" },
  SCHEDULED: { label: "Agendada", color: "warning" },
  SENDING: { label: "Enviando", color: "info" },
  SENT: { label: "Enviada", color: "success" },
  PAUSED: { label: "Pausada", color: "secondary" },
  CANCELLED: { label: "Cancelada", color: "danger" },
};

const frequencyLabels: Record<string, string> = {
  ONCE: "Única vez",
  DAILY: "Diária",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
};

const targetLabels: Record<string, string> = {
  ALL_CUSTOMERS: "Todos os clientes",
  NEW_CUSTOMERS: "Novos clientes",
  RETURNING_CUSTOMERS: "Clientes recorrentes",
  ALL_STORE_OWNERS: "Todos os lojistas",
  ACTIVE_STORE_OWNERS: "Lojistas ativos",
  CUSTOM: "Lista personalizada",
};

const EMPTY_FORM: EmailCampaignUpsertRequest = {
  name: "",
  subject: "",
  bodyHtml: "",
  status: "DRAFT",
  targetAudience: "ALL_STORE_OWNERS",
  frequency: "ONCE",
  timezone: "America/Sao_Paulo",
  isPlatform: true,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function SaEmailCampaignsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [form, setForm] = useState<EmailCampaignUpsertRequest>({ ...EMPTY_FORM });

  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["sa-email-campaign-stats"],
    queryFn: superAdminService.getEmailCampaignStats,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["sa-email-campaigns", statusFilter, page],
    queryFn: () =>
      superAdminService.listEmailCampaigns({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 15,
      }),
  });

  // ── Mutations ────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: EmailCampaignUpsertRequest) => superAdminService.createEmailCampaign(body),
    onSuccess: () => {
      toast.success("Campanha criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaign-stats"] });
      closeDialog();
    },
    onError: () => toast.error("Erro ao criar campanha"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: EmailCampaignUpsertRequest }) =>
      superAdminService.updateEmailCampaign(id, body),
    onSuccess: () => {
      toast.success("Campanha atualizada!");
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaign-stats"] });
      closeDialog();
    },
    onError: () => toast.error("Erro ao atualizar campanha"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      superAdminService.updateEmailCampaignStatus(id, status),
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaign-stats"] });
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const sendNowMutation = useMutation({
    mutationFn: (id: number) => superAdminService.sendEmailCampaignNow(id),
    onSuccess: () => {
      toast.success("Campanha enviada!");
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaign-stats"] });
    },
    onError: () => toast.error("Erro ao enviar campanha"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => superAdminService.deleteEmailCampaign(id),
    onSuccess: () => {
      toast.success("Campanha excluída!");
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-email-campaign-stats"] });
      setDeleteId(null);
    },
    onError: () => toast.error("Erro ao excluir campanha"),
  });

  // ── Helpers ──────────────────────────────────────────────────
  function openCreate() {
    setEditingCampaign(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(c: EmailCampaign) {
    setEditingCampaign(c);
    setForm({
      name: c.name,
      subject: c.subject,
      bodyHtml: c.bodyHtml,
      status: c.status,
      targetAudience: c.targetAudience ?? "ALL_STORE_OWNERS",
      segmentFilter: c.segmentFilter ?? undefined,
      sendAt: c.sendAt,
      frequency: c.frequency ?? "ONCE",
      recurrenceEnd: c.recurrenceEnd,
      timezone: c.timezone ?? "America/Sao_Paulo",
      fromName: c.fromName ?? undefined,
      fromEmail: c.fromEmail ?? undefined,
      replyToEmail: c.replyToEmail ?? undefined,
      isPlatform: true,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingCampaign(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleSubmit() {
    if (!form.name || !form.subject || !form.bodyHtml) {
      toast.error("Preencha nome, assunto e conteúdo HTML");
      return;
    }
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Campanhas de E-mail"
        description="Crie, agende e acompanhe campanhas de e-mail da plataforma para lojistas"
        actions={
          <Button
            size="sm"
            onClick={openCreate}
            className="bg-[hsl(var(--sa-accent))] text-white hover:bg-[hsl(var(--sa-accent))]/90 rounded-lg gap-1.5 text-[12px]"
          >
            <Plus className="h-3.5 w-3.5" /> Nova Campanha
          </Button>
        }
      />

      {/* ── Stats ────────────────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Campanhas" value={String(stats?.totalCampaigns ?? 0)} icon={Mail} color="info" />
        <SaStatCard title="Agendadas" value={String(stats?.scheduledCampaigns ?? 0)} icon={CalendarClock} color="warning" />
        <SaStatCard title="Taxa de Abertura" value={stats ? `${stats.avgOpenRate.toFixed(1)}%` : "—"} icon={Eye} color="success" />
        <SaStatCard title="Taxa de Clique" value={stats ? `${stats.avgClickRate.toFixed(1)}%` : "—"} icon={MousePointerClick} color="accent" />
      </motion.div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <SaCard className="p-4!">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full sm:w-44 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
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
      </SaCard>

      {/* ── Table ────────────────────────────────────────────── */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaTableCard
          title="Campanhas"
          subtitle={isLoading ? "Carregando..." : `${data?.totalElements ?? 0} campanha(s)`}
        >
          {isLoading ? (
            <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando...</div>
          ) : data && data.content.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Campanha</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Público</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Frequência</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Enviados</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Abertura</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Agendado</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((campaign, i) => (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors cursor-pointer"
                      onClick={() => { setSelectedCampaign(campaign); setDetailOpen(true); }}
                    >
                      <TableCell>
                        <div>
                          <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{campaign.name}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] truncate max-w-50">{campaign.subject}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SaStatusBadge status={campaign.status} map={campaignStatusMap} />
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {targetLabels[campaign.targetAudience ?? ""] ?? campaign.targetAudience ?? "—"}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {frequencyLabels[campaign.frequency ?? "ONCE"] ?? campaign.frequency}
                      </TableCell>
                      <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-text))]">
                        {campaign.sentCount}/{campaign.totalRecipients}
                      </TableCell>
                      <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-success))]">
                        {campaign.openRate > 0 ? `${campaign.openRate.toFixed(1)}%` : "—"}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                        {campaign.sendAt
                          ? format(new Date(campaign.sendAt), "dd/MM/yy HH:mm", { locale: ptBR })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          {campaign.status === "DRAFT" && (
                            <>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => openEdit(campaign)}
                                className="h-7 px-2 text-[11px] text-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))]/10 rounded-lg"
                                title="Editar"
                              >
                                <FileEdit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => sendNowMutation.mutate(campaign.id)}
                                disabled={sendNowMutation.isPending}
                                className="h-7 px-2 text-[11px] text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/10 rounded-lg"
                                title="Enviar agora"
                              >
                                <Rocket className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => statusMutation.mutate({ id: campaign.id, status: "SCHEDULED" })}
                                disabled={!campaign.sendAt || statusMutation.isPending}
                                className="h-7 px-2 text-[11px] text-[hsl(var(--sa-warning))] hover:bg-[hsl(var(--sa-warning))]/10 rounded-lg"
                                title="Agendar"
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {campaign.status === "SCHEDULED" && (
                            <>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => statusMutation.mutate({ id: campaign.id, status: "PAUSED" })}
                                className="h-7 px-2 text-[11px] text-[hsl(var(--sa-warning))] hover:bg-[hsl(var(--sa-warning))]/10 rounded-lg"
                                title="Pausar"
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => sendNowMutation.mutate(campaign.id)}
                                disabled={sendNowMutation.isPending}
                                className="h-7 px-2 text-[11px] text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/10 rounded-lg"
                                title="Enviar agora"
                              >
                                <Rocket className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {campaign.status === "PAUSED" && (
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => statusMutation.mutate({ id: campaign.id, status: "SCHEDULED" })}
                              className="h-7 px-2 text-[11px] text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/10 rounded-lg"
                              title="Retomar"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {(campaign.status === "DRAFT" || campaign.status === "CANCELLED") && (
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => setDeleteId(campaign.id)}
                              className="h-7 px-2 text-[11px] text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger))]/10 rounded-lg"
                              title="Excluir"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--sa-border-subtle))]">
                <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                  Página {data.page + 1} de {Math.max(data.totalPages, 1)}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={data.first}
                    className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={data.last}
                    className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <SaEmptyState
              icon={Mail}
              title="Nenhuma campanha encontrada"
              description="Crie sua primeira campanha de e-mail para lojistas"
            />
          )}
        </SaTableCard>
      </motion.div>

      {/* ══════ Create / Edit Dialog ══════ */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {editingCampaign ? "Editar Campanha" : "Nova Campanha"}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? "Edite os detalhes da campanha de e-mail"
                : "Configure uma nova campanha de e-mail para enviar aos lojistas da plataforma"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Name & Subject */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Nome da Campanha *</Label>
                <Input
                  placeholder="Ex: Black Friday 2025"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Assunto do E-mail *</Label>
                <Input
                  placeholder="Ex: 🔥 Promoção especial para sua loja!"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                />
              </div>
            </div>

            {/* Target & Frequency */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Público-alvo
                </Label>
                <Select
                  value={form.targetAudience ?? "ALL_STORE_OWNERS"}
                  onValueChange={v => setForm(p => ({ ...p, targetAudience: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_STORE_OWNERS">Todos os lojistas</SelectItem>
                    <SelectItem value="ACTIVE_STORE_OWNERS">Lojistas ativos</SelectItem>
                    <SelectItem value="CUSTOM">Lista personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5" /> Frequência
                </Label>
                <Select
                  value={form.frequency ?? "ONCE"}
                  onValueChange={v => setForm(p => ({ ...p, frequency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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

            {/* Schedule */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" /> Data/Hora de Envio
                </Label>
                <Input
                  type="datetime-local"
                  value={form.sendAt ? format(new Date(form.sendAt), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={e => setForm(p => ({ ...p, sendAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                />
              </div>
              {form.frequency && form.frequency !== "ONCE" && (
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Encerrar recorrência em</Label>
                  <Input
                    type="datetime-local"
                    value={form.recurrenceEnd ? format(new Date(form.recurrenceEnd), "yyyy-MM-dd'T'HH:mm") : ""}
                    onChange={e => setForm(p => ({ ...p, recurrenceEnd: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  />
                </div>
              )}
            </div>

            {/* Sender overrides */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Nome do Remetente</Label>
                <Input
                  placeholder="Lojaki"
                  value={form.fromName ?? ""}
                  onChange={e => setForm(p => ({ ...p, fromName: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">E-mail do Remetente</Label>
                <Input
                  placeholder="noreply@lojaki.store"
                  value={form.fromEmail ?? ""}
                  onChange={e => setForm(p => ({ ...p, fromEmail: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Reply-To</Label>
                <Input
                  placeholder="suporte@lojaki.store"
                  value={form.replyToEmail ?? ""}
                  onChange={e => setForm(p => ({ ...p, replyToEmail: e.target.value || undefined }))}
                />
              </div>
            </div>

            {/* HTML body */}
            <div className="space-y-1.5">
              <Label className="text-[12px]">Conteúdo HTML *</Label>
              <Textarea
                className="min-h-40 font-mono text-[12px]"
                placeholder="<h1>Olá {{nome}}</h1><p>Temos uma novidade incrível para sua loja!</p>"
                value={form.bodyHtml}
                onChange={e => setForm(p => ({ ...p, bodyHtml: e.target.value }))}
              />
            </div>

            {/* Preview */}
            {form.bodyHtml && (
              <div className="space-y-1.5">
                <Label className="text-[12px] flex items-center gap-1.5">
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
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[hsl(var(--sa-accent))] text-white hover:bg-[hsl(var(--sa-accent))]/90"
            >
              {isPending ? (
                <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Salvando...</span>
              ) : editingCampaign ? (
                "Salvar Alterações"
              ) : (
                <span className="flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> Criar Campanha</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════ Campaign Detail Dialog ══════ */}
      <Dialog open={detailOpen} onOpenChange={v => { if (!v) { setDetailOpen(false); setSelectedCampaign(null); } }}>
        {selectedCampaign && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {selectedCampaign.name}
              </DialogTitle>
              <DialogDescription>{selectedCampaign.subject}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <SaStatusBadge status={selectedCampaign.status} map={campaignStatusMap} />
                <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                  Criada {formatDistanceToNow(new Date(selectedCampaign.createdAt), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard icon={Users} label="Destinatários" value={selectedCampaign.totalRecipients} />
                <MetricCard icon={Send} label="Enviados" value={selectedCampaign.sentCount} />
                <MetricCard icon={CheckCircle} label="Entregues" value={selectedCampaign.deliveredCount} color="success" />
                <MetricCard icon={Eye} label="Abertos" value={selectedCampaign.openedCount} color="info" />
                <MetricCard icon={MousePointerClick} label="Clicados" value={selectedCampaign.clickedCount} color="accent" />
                <MetricCard icon={AlertTriangle} label="Bounced" value={selectedCampaign.bouncedCount} color="danger" />
                <MetricCard icon={XCircle} label="Falhas" value={selectedCampaign.failedCount} color="danger" />
                <MetricCard icon={Mail} label="Unsubscribed" value={selectedCampaign.unsubscribedCount} color="warning" />
              </div>

              {/* Rates */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-[hsl(var(--sa-text-muted))] tracking-wider">Abertura</p>
                  <p className="text-[20px] font-bold text-[hsl(var(--sa-success))]">{selectedCampaign.openRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-[hsl(var(--sa-text-muted))] tracking-wider">Clique</p>
                  <p className="text-[20px] font-bold text-[hsl(var(--sa-accent))]">{selectedCampaign.clickRate.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-3 text-center">
                  <p className="text-[10px] uppercase font-bold text-[hsl(var(--sa-text-muted))] tracking-wider">Bounce</p>
                  <p className="text-[20px] font-bold text-[hsl(var(--sa-danger))]">{selectedCampaign.bounceRate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Schedule info */}
              <SaCard>
                <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                  Agendamento
                </h4>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--sa-text-muted))]">Público-alvo</span>
                    <span className="text-[hsl(var(--sa-text))] font-medium">
                      {targetLabels[selectedCampaign.targetAudience ?? ""] ?? selectedCampaign.targetAudience ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--sa-text-muted))]">Frequência</span>
                    <span className="text-[hsl(var(--sa-text))] font-medium">
                      {frequencyLabels[selectedCampaign.frequency ?? "ONCE"] ?? selectedCampaign.frequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--sa-text-muted))]">Envio em</span>
                    <span className="text-[hsl(var(--sa-text))] font-medium">
                      {selectedCampaign.sendAt
                        ? format(new Date(selectedCampaign.sendAt), "dd/MM/yy HH:mm", { locale: ptBR })
                        : "Não agendado"}
                    </span>
                  </div>
                  {selectedCampaign.nextSendAt && (
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--sa-text-muted))]">Próximo envio</span>
                      <span className="text-[hsl(var(--sa-text))] font-medium">
                        {format(new Date(selectedCampaign.nextSendAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {selectedCampaign.lastSentAt && (
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--sa-text-muted))]">Último envio</span>
                      <span className="text-[hsl(var(--sa-text))] font-medium">
                        {format(new Date(selectedCampaign.lastSentAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--sa-text-muted))]">Fuso</span>
                    <span className="text-[hsl(var(--sa-text))] font-medium">
                      {selectedCampaign.timezone ?? "America/Sao_Paulo"}
                    </span>
                  </div>
                </div>
              </SaCard>

              {/* HTML Preview */}
              {selectedCampaign.bodyHtml && (
                <div className="space-y-1.5">
                  <Label className="text-[12px] flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview do E-mail
                  </Label>
                  <div
                    className="border rounded-lg p-4 bg-white text-black text-sm max-h-64 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedCampaign.bodyHtml }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* ══════ Delete Confirmation ══════ */}
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
              className="bg-[hsl(var(--sa-danger))] text-white hover:bg-[hsl(var(--sa-danger))]/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MetricCard — small stat card for detail view                       */
/* ------------------------------------------------------------------ */

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: string;
}) {
  const colorCls = color
    ? `text-[hsl(var(--sa-${color}))]`
    : "text-[hsl(var(--sa-text))]";

  return (
    <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${colorCls}`} />
        <span className="text-[10px] uppercase font-bold text-[hsl(var(--sa-text-muted))] tracking-wider">{label}</span>
      </div>
      <p className={`text-[18px] font-bold ${colorCls}`}>{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}
