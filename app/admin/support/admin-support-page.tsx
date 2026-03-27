"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Headphones,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Calendar,
  ChevronRight,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import adminSupportService from "@/services/adminSupportService";
import type { AdminTicketSummary } from "@/services/adminSupportService";
import type { SupportTicketDetail } from "@/types/super-admin";
import { toast } from "sonner";
import { t } from "@/lib/admin-language";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  OPEN: { label: "Aberto", variant: "destructive", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  IN_PROGRESS: { label: "Em Andamento", variant: "default", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  RESOLVED: { label: "Resolvido", variant: "secondary", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
  CLOSED: { label: "Fechado", variant: "outline", color: "bg-muted text-muted-foreground border-border" },
};

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function AdminSupportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["admin-tickets", statusFilter],
    queryFn: () =>
      adminSupportService.listTickets({
        status: statusFilter !== "all" ? statusFilter : undefined,
        size: 50,
      }),
  });

  const { data: ticketDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin-ticket-detail", selectedTicketId],
    queryFn: () => adminSupportService.getTicketDetail(selectedTicketId!),
    enabled: selectedTicketId !== null,
  });

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: number; message: string }) =>
      adminSupportService.replyToTicket(ticketId, message),
    onSuccess: () => {
      toast.success("Resposta enviada!");
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-detail", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => toast.error("Erro ao enviar resposta"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: number; status: string }) =>
      adminSupportService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-detail", selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const allTickets = ticketsData?.content ?? [];
  const filtered = search
    ? allTickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
          (t.customerName || "").toLowerCase().includes(search.toLowerCase())
      )
    : allTickets;

  // ── Detail view ─────────────────────────────────────────────
  if (selectedTicketId !== null && ticketDetail) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTicketId(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("Voltar", "Back")}
          </Button>
          <Badge variant={statusMap[ticketDetail.status]?.variant || "outline"}>
            {statusMap[ticketDetail.status]?.label || ticketDetail.status}
          </Badge>
          <span className="text-sm text-muted-foreground font-mono">#{ticketDetail.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-5">
              <h3 className="text-base font-semibold mb-4">{ticketDetail.subject}</h3>

              <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
                {ticketDetail.messages.map((msg) => {
                  const isStore = msg.senderType === "STORE" || msg.senderType === "ADMIN" || msg.senderType === "SUPER_ADMIN";
                  return (
                    <div key={msg.id} className={`flex ${isStore ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          isStore
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {msg.senderName || msg.senderEmail}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.messageBody}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply */}
              <div className="mt-4 pt-4 border-t">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("Digite sua resposta...", "Type your reply...")}
                  rows={3}
                  className="w-full rounded-lg border bg-background text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    disabled={!replyText.trim() || replyMutation.isPending}
                    onClick={() =>
                      replyMutation.mutate({ ticketId: ticketDetail.id, message: replyText.trim() })
                    }
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    {replyMutation.isPending ? t("Enviando...", "Sending...") : t("Enviar Resposta", "Send Reply")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-5 space-y-4">
              <h4 className="text-sm font-semibold">{t("Detalhes", "Details")}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("Assunto", "Subject")}</span>
                  <div className="mt-0.5">
                    <Badge variant="secondary" className="text-xs">{ticketDetail.subject}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("Cliente", "Customer")}</span>
                  <p className="mt-0.5">{ticketDetail.customerName || "—"}</p>
                  <p className="text-xs text-muted-foreground">{ticketDetail.customerEmail}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("Origem", "Source")}</span>
                  <p className="mt-0.5">{ticketDetail.source}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("Criado em", "Created")}</span>
                  <p className="mt-0.5">{new Date(ticketDetail.createdAt).toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5 space-y-3">
              <h4 className="text-sm font-semibold">{t("Alterar Status", "Change Status")}</h4>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((s) => (
                  <Button
                    key={s}
                    variant={ticketDetail.status === s ? "default" : "outline"}
                    size="sm"
                    disabled={ticketDetail.status === s || statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ ticketId: ticketDetail.id, status: s })}
                    className="text-xs"
                  >
                    {statusMap[s]?.label || s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openCount = allTickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = allTickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = allTickets.filter((t) => t.status === "RESOLVED").length;

  // ── List view ───────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t("Suporte ao Cliente", "Customer Support")}</h1>
          <p className="text-sm text-muted-foreground">{t("Gerencie e responda os tickets de suporte da sua loja", "Manage and reply to your store's support tickets")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t("Total", "Total")}</span>
          </div>
          <p className="text-2xl font-bold">{ticketsData?.totalElements ?? 0}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t("Abertos", "Open")}</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{openCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10 p-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t("Em andamento", "In progress")}</span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10 p-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t("Resolvidos", "Resolved")}</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{resolvedCount}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Operacao SaaS", "SaaS operations")}</p>
          <h2 className="mt-2 text-base font-semibold text-foreground">
            {t("Como FAQ e tickets devem trabalhar juntos", "How FAQ and tickets should work together")}
          </h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>{t("1. Tudo que for pergunta recorrente deve virar item de FAQ publico.", "1. Any recurring question should become a public FAQ entry.")}</p>
            <p>{t("2. Tickets devem ficar para casos com contexto do pedido, excecao ou erro operacional.", "2. Tickets should be reserved for order context, exceptions, or operational failures.")}</p>
            <p>{t("3. Use esta fila para identificar gargalos e depois ajustar a base publica.", "3. Use this queue to identify friction points, then improve the public knowledge base.")}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Atalhos", "Shortcuts")}</p>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/faq">{t("Gerenciar FAQ", "Manage FAQ")}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/tutorials">{t("Ver tutoriais internos", "View internal tutorials")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Buscar tickets...", "Search tickets...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
        {[
          { key: "all", label: t("Todos", "All"), count: allTickets.length },
          { key: "OPEN", label: t("Abertos", "Open"), count: openCount },
          { key: "IN_PROGRESS", label: t("Em Andamento", "In Progress"), count: inProgressCount },
          { key: "RESOLVED", label: t("Resolvidos", "Resolved"), count: resolvedCount },
        ].map((f) => (
          <Button
            key={f.key}
            variant={statusFilter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(f.key)}
            className="text-xs h-8 gap-1.5"
          >
            {f.label}
            {f.count > 0 && (
              <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                statusFilter === f.key ? "bg-background/20 text-inherit" : "bg-muted text-muted-foreground"
              }`}>{f.count}</span>
            )}
          </Button>
        ))}
      </div>

      {/* Ticket list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {t("Carregando...", "Loading...")}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <Headphones className="mx-auto mb-3 h-9 w-9 text-muted-foreground/40" />
            <p className="font-medium text-foreground">{t("Nenhum ticket encontrado.", "No tickets found.")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Ajuste os filtros ou aguarde novas solicitações dos clientes.", "Adjust the filters or wait for new customer requests.")}
            </p>
          </div>
        )}
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicketId(ticket.id)}
            className="group flex items-start gap-4 p-5 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusMap[ticket.status]?.color ?? "bg-muted text-muted-foreground border-border"}`}>
                  {statusMap[ticket.status]?.label || ticket.status}
                </span>
                {ticket.source && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {ticket.source}
                  </span>
                )}
                {ticket.messageCount > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {ticket.messageCount}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
                {ticket.subject}
              </h4>
              <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {ticket.customerName || ticket.customerEmail}
                </span>
                {ticket.customerName && (
                  <span className="text-xs text-muted-foreground">{ticket.customerEmail}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
