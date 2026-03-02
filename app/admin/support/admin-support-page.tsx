"use client";

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

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  OPEN: { label: "Aberto", variant: "destructive" },
  IN_PROGRESS: { label: "Em Andamento", variant: "default" },
  RESOLVED: { label: "Resolvido", variant: "secondary" },
  CLOSED: { label: "Fechado", variant: "outline" },
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

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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

  // ── List view ───────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">{t("Suporte", "Support")}</h1>
        <p className="text-sm text-muted-foreground">{t("Gerencie os tickets de suporte da sua loja", "Manage your store's support tickets")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Total", "Total")}</span>
          </div>
          <p className="text-2xl font-bold">{ticketsData?.totalElements ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Abertos", "Open")}</span>
          </div>
          <p className="text-2xl font-bold">
            {allTickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Resolvidos", "Resolved")}</span>
          </div>
          <p className="text-2xl font-bold">
            {allTickets.filter((t) => t.status === "RESOLVED").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Buscar tickets...", "Search tickets...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
        {[
          { key: "all", label: t("Todos", "All") },
          { key: "OPEN", label: t("Abertos", "Open") },
          { key: "IN_PROGRESS", label: t("Em Andamento", "In Progress") },
          { key: "RESOLVED", label: t("Resolvidos", "Resolved") },
        ].map((f) => (
          <Button
            key={f.key}
            variant={statusFilter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(f.key)}
            className="text-xs h-8"
          >
            {f.label}
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
          <div className="text-center py-16 text-muted-foreground text-sm">
            {t("Nenhum ticket encontrado.", "No tickets found.")}
          </div>
        )}
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedTicketId(ticket.id)}
            className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                <Badge variant={statusMap[ticket.status]?.variant || "outline"} className="text-[10px]">
                  {statusMap[ticket.status]?.label || ticket.status}
                </Badge>
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
