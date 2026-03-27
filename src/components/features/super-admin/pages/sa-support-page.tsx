"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Headphones,
  Building2,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldAlert,
  User,
  Calendar,
  ChevronRight,
  Send,
  ArrowLeft,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { superAdminService } from "@/services/super-admin";
import type { SupportTicketSummary, SupportTicketDetail } from "@/types/super-admin";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Aberto", color: "warning" },
  IN_PROGRESS: { label: "Em Andamento", color: "info" },
  RESOLVED: { label: "Resolvido", color: "success" },
  CLOSED: { label: "Fechado", color: "accent" },
};

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function SaSupportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  const { data: overview } = useQuery({
    queryKey: ["sa-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: ticketsData } = useQuery({
    queryKey: ["sa-tickets", statusFilter],
    queryFn: () =>
      superAdminService.listSupportTickets({
        status: statusFilter !== "all" ? statusFilter : undefined,
        size: 50,
      }),
  });

  const { data: ticketDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["sa-ticket-detail", selectedTicketId],
    queryFn: () => superAdminService.getSupportTicketDetail(selectedTicketId!),
    enabled: selectedTicketId !== null,
  });

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: number; message: string }) =>
      superAdminService.replyToSupportTicket(ticketId, message),
    onSuccess: () => {
      toast.success("Resposta enviada!");
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["sa-ticket-detail", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["sa-tickets"] });
    },
    onError: () => toast.error("Erro ao enviar resposta"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: number; status: string }) =>
      superAdminService.updateSupportTicketStatus(ticketId, status),
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["sa-ticket-detail", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["sa-tickets"] });
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const allTickets = ticketsData?.content ?? [];
  const now = Date.now();
  const filtered = search
    ? allTickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          (t.storeName || "").toLowerCase().includes(search.toLowerCase()) ||
          t.customerEmail.toLowerCase().includes(search.toLowerCase())
      )
    : allTickets;
  const statusAndSourceFiltered = filtered.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSource = sourceFilter === "all" || ticket.source === sourceFilter;
    return matchesStatus && matchesSource;
  });
  const agingRiskCount = allTickets.filter((ticket) => {
    if (!["OPEN", "IN_PROGRESS"].includes(ticket.status)) {
      return false;
    }
    return now - new Date(ticket.updatedAt || ticket.createdAt).getTime() > 1000 * 60 * 60 * 48;
  }).length;
  const sourceCounts = allTickets.reduce<Record<string, number>>((acc, ticket) => {
    const key = ticket.source || "UNKNOWN";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topStores = Object.entries(
    allTickets.reduce<Record<string, number>>((acc, ticket) => {
      const key = ticket.storeName || "Sem loja";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const sourceOptions = ["FORM", "ADMIN_PANEL", "SUPER_ADMIN_PANEL", "EMAIL"].filter(
    (source) => sourceCounts[source] || source === sourceFilter
  );

  // -- Detail view ---------------------------------------------
  if (selectedTicketId !== null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTicketId(null)}
            className="rounded-lg text-[12px] text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          {ticketDetail && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-mono text-[hsl(var(--sa-text-muted))]">
                #{ticketDetail.id}
              </span>
              <SaStatusBadge status={ticketDetail.status} map={statusMap} />
            </div>
          )}
        </div>

        {loadingDetail ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-[hsl(var(--sa-accent))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ticketDetail ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages thread */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 p-5 backdrop-blur-sm">
                <h3 className="text-[15px] font-semibold text-[hsl(var(--sa-text))] mb-4">
                  {ticketDetail.subject}
                </h3>

                <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
                  {ticketDetail.messages.map((msg) => {
                    const isAdmin = msg.senderType === "SUPER_ADMIN" || msg.senderType === "STORE" || msg.senderType === "ADMIN";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            isAdmin
                              ? "bg-[hsl(var(--sa-accent))]/10 border border-[hsl(var(--sa-accent))]/20"
                              : "bg-[hsl(var(--sa-surface-hover))] border border-[hsl(var(--sa-border-subtle))]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-[11px] font-medium text-[hsl(var(--sa-text-secondary))]">
                              {msg.senderName || msg.senderEmail}
                            </span>
                            <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">
                              {new Date(msg.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-[12px] text-[hsl(var(--sa-text))] whitespace-pre-wrap leading-relaxed">
                            {msg.messageBody}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply box */}
                <div className="mt-4 pt-4 border-t border-[hsl(var(--sa-border-subtle))]">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={3}
                    className="w-full rounded-lg bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] text-[12px] p-3 resize-none focus:outline-none focus:ring-1 focus:ring-[hsl(var(--sa-accent))]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      disabled={!replyText.trim() || replyMutation.isPending}
                      onClick={() =>
                        replyMutation.mutate({
                          ticketId: ticketDetail.id,
                          message: replyText.trim(),
                        })
                      }
                      className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {replyMutation.isPending ? "Enviando..." : "Enviar Resposta"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 p-5 backdrop-blur-sm space-y-4">
                <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">Detalhes</h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Cliente</span>
                    <p className="text-[12px] text-[hsl(var(--sa-text))] mt-0.5">{ticketDetail.customerName || "�"}</p>
                    <p className="text-[11px] text-[hsl(var(--sa-text-secondary))]">{ticketDetail.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Loja</span>
                    <p className="text-[12px] text-[hsl(var(--sa-text))] mt-0.5">{ticketDetail.storeName || "�"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Origem</span>
                    <p className="text-[12px] text-[hsl(var(--sa-text))] mt-0.5">{ticketDetail.source}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Criado em</span>
                    <p className="text-[12px] text-[hsl(var(--sa-text))] mt-0.5">
                      {new Date(ticketDetail.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div className="rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 p-5 backdrop-blur-sm space-y-3">
                <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">Alterar Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((s) => (
                    <Button
                      key={s}
                      variant="ghost"
                      size="sm"
                      disabled={ticketDetail.status === s || statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ ticketId: ticketDetail.id, status: s })}
                      className={`rounded-lg text-[11px] h-8 px-2 transition-all ${
                        ticketDetail.status === s
                          ? "bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30"
                          : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))] border border-[hsl(var(--sa-border-subtle))]"
                      }`}
                    >
                      {statusMap[s]?.label || s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // -- List view -----------------------------------------------
  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Suporte"
        description="Central de atendimento e gestao de tickets"
      />

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <SaStatCard title="Total de Tickets" value={String(overview?.totalSupportTickets ?? 0)} icon={AlertCircle} color="warning" />
        <SaStatCard title="Tickets Abertos" value={String(overview?.openSupportTickets ?? 0)} icon={Clock} color="info" />
        <SaStatCard title="Tickets (listados)" value={String(ticketsData?.totalElements ?? 0)} icon={CheckCircle2} color="success" />
        <SaStatCard title="Risco SLA" value={String(agingRiskCount)} icon={ShieldAlert} color="warning" subtitle="48h sem resposta util" />
        <SaStatCard title="Canais ativos" value={String(Object.keys(sourceCounts).length)} icon={Headphones} color="accent" subtitle="origens em operacao" />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] rounded-lg h-10 text-[12px]"
          />
        </div>
        {[
          { key: "all", label: "Todos" },
          { key: "OPEN", label: "Abertos" },
          { key: "IN_PROGRESS", label: "Em Andamento" },
          { key: "RESOLVED", label: "Resolvidos" },
        ].map((f) => (
          <Button
            key={f.key}
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
              statusFilter === f.key
                ? "bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30"
                : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]"
            }`}
          >
            {f.label}
          </Button>
        ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">Origem</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSourceFilter('all')}
            className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
              sourceFilter === 'all'
                ? 'bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30'
                : 'text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]'
            }`}
          >
            Todos
          </Button>
          {sourceOptions.map((source) => (
            <Button
              key={source}
              variant="ghost"
              size="sm"
              onClick={() => setSourceFilter(source)}
              className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
                sourceFilter === source
                  ? 'bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30'
                  : 'text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]'
              }`}
            >
              {source}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <motion.div variants={fadeInUp} className="rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">Fila operacional</p>
              <h3 className="mt-1 text-[16px] font-semibold text-[hsl(var(--sa-text))]">O que mostrar no super admin</h3>
            </div>
            <Badge variant="outline" className="border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
              {statusAndSourceFiltered.length} tickets filtrados
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface-hover))]/50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">Risco</p>
              <p className="mt-2 text-[24px] font-semibold text-[hsl(var(--sa-text))]">{agingRiskCount}</p>
              <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-secondary))]">tickets abertos ha mais de 48h</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface-hover))]/50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">Origens</p>
              <p className="mt-2 text-[24px] font-semibold text-[hsl(var(--sa-text))]">{Object.keys(sourceCounts).length}</p>
              <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-secondary))]">canais alimentando a fila</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface-hover))]/50 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--sa-text-muted))]">Abertos agora</p>
              <p className="mt-2 text-[24px] font-semibold text-[hsl(var(--sa-text))]">{allTickets.filter((ticket) => ticket.status === 'OPEN').length}</p>
              <p className="mt-1 text-[12px] text-[hsl(var(--sa-text-secondary))]">pedidos esperando primeira tratativa</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-[12px] text-[hsl(var(--sa-text-secondary))]">
            <p>1. Destacar tickets em risco de SLA e filas sem resposta.</p>
            <p>2. Mostrar distribuicao por origem para entender se o FAQ esta falhando ou se o suporte manual esta crescendo.</p>
            <p>3. Mostrar lojas mais afetadas para acionar onboarding, qualidade ou operacao.</p>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/60 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Distribuicao por origem</h3>
            </div>
            <div className="mt-4 space-y-3">
              {Object.entries(sourceCounts).length === 0 && (
                <p className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Sem dados de origem.</p>
              )}
              {Object.entries(sourceCounts).map(([source, count]) => (
                <div key={source}>
                  <div className="mb-1 flex items-center justify-between text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    <span>{source}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--sa-surface-hover))]">
                    <div
                      className="h-2 rounded-full bg-[hsl(var(--sa-accent))]"
                      style={{ width: `${Math.max((count / Math.max(allTickets.length, 1)) * 100, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/60 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[hsl(var(--sa-info))]" />
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Lojas sob pressao</h3>
            </div>
            <div className="mt-4 space-y-3">
              {topStores.length === 0 && (
                <p className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Sem lojas com carga relevante.</p>
              )}
              {topStores.map(([storeName, count]) => (
                <div key={storeName} className="flex items-center justify-between rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface-hover))]/50 px-3 py-3">
                  <div>
                    <p className="text-[12px] font-medium text-[hsl(var(--sa-text))]">{storeName}</p>
                    <p className="text-[11px] text-[hsl(var(--sa-text-secondary))]">tickets no recorte atual</p>
                  </div>
                  <span className="text-[18px] font-semibold text-[hsl(var(--sa-text))]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tickets */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
        {statusAndSourceFiltered.length === 0 && (
          <div className="text-center py-16 text-[hsl(var(--sa-text-muted))] text-[13px]">
            Nenhum ticket encontrado.
          </div>
        )}
        {statusAndSourceFiltered.map((ticket) => (
          <motion.div
            key={ticket.id}
            variants={fadeInUp}
            onClick={() => setSelectedTicketId(ticket.id)}
            className="group flex items-start gap-4 p-5 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 hover:bg-[hsl(var(--sa-surface-hover))] transition-all backdrop-blur-sm cursor-pointer"
          >
            <div
              className={`w-1 h-14 rounded-full self-center shrink-0 bg-[hsl(var(--sa-${statusMap[ticket.status]?.color || "accent"}))]`}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))]">
                  #{ticket.id}
                </span>
                <SaStatusBadge status={ticket.status} map={statusMap} />
                {ticket.source && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-muted))]">
                    {ticket.source}
                  </span>
                )}
              </div>
              <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-1 group-hover:text-[hsl(var(--sa-accent))] transition-colors">
                {ticket.subject}
              </h4>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                  <User className="h-3 w-3" /> {ticket.storeName || ticket.customerName || ticket.customerEmail}
                </span>
                <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-[hsl(var(--sa-text-muted))] group-hover:text-[hsl(var(--sa-accent))] transition-colors shrink-0 self-center" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
