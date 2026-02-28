"use client";

import { motion } from "framer-motion";
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
  Loader2,
  ChevronLeft,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import supportTicketService from "@/services/supportTicketService";
import type { SupportTicketSummary, PaginatedResult } from "@/types/super-admin";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Aberto", color: "warning" },
  IN_PROGRESS: { label: "Em Andamento", color: "info" },
  RESOLVED: { label: "Resolvido", color: "success" },
  CLOSED: { label: "Fechado", color: "accent" },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "";
  }
}

export function SaSupportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Stats counters (derived from data or extra calls in future)
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const inProgressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length;

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, size: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      const result = await supportTicketService.list(params);
      setTickets(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Client-side search filter over the loaded page
  const filtered = tickets.filter(t => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      t.subject.toLowerCase().includes(term) ||
      (t.storeName ?? "").toLowerCase().includes(term) ||
      (t.customerName ?? "").toLowerCase().includes(term) ||
      t.customerEmail.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Suporte"
        description="Central de atendimento e gestão de tickets"
      />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total" value={String(totalElements)} icon={Headphones} color="accent" />
        <SaStatCard title="Abertos" value={String(openCount)} icon={AlertCircle} color="warning" />
        <SaStatCard title="Em Andamento" value={String(inProgressCount)} icon={Clock} color="info" />
        <SaStatCard title="Resolvidos" value={String(resolvedCount)} icon={CheckCircle2} color="success" />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] rounded-xl h-10 text-[12px]"
          />
        </div>
        {[
          { key: "all", label: "Todos" },
          { key: "OPEN", label: "Abertos" },
          { key: "IN_PROGRESS", label: "Em Andamento" },
          { key: "RESOLVED", label: "Resolvidos" },
        ].map(f => (
          <Button
            key={f.key}
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter(f.key); setPage(0); }}
            className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
              statusFilter === f.key
                ? "bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30"
                : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]"
            }`}
          >
            {f.label}
          </Button>
        ))}
      </motion.div>

      {/* Tickets */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--sa-text-muted))]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Headphones className="h-10 w-10 text-[hsl(var(--sa-text-muted))]/40 mb-3" />
          <p className="text-sm text-[hsl(var(--sa-text-muted))]">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {filtered.map(ticket => (
            <motion.div
              key={ticket.id}
              variants={fadeInUp}
              className="group flex items-start gap-4 p-5 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 hover:bg-[hsl(var(--sa-surface-hover))] transition-all backdrop-blur-sm cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))]">#{ticket.id}</span>
                  <SaStatusBadge status={ticket.status} map={statusMap} />
                  {ticket.source && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--sa-surface))] text-[hsl(var(--sa-text-muted))] border border-[hsl(var(--sa-border-subtle))]">
                      {ticket.source}
                    </span>
                  )}
                </div>
                <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-1 group-hover:text-[hsl(var(--sa-accent))] transition-colors">
                  {ticket.subject}
                </h4>
                <div className="flex items-center gap-4 flex-wrap">
                  {ticket.storeName && (
                    <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                      <User className="h-3 w-3" /> {ticket.storeName}
                    </span>
                  )}
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {ticket.customerName || ticket.customerEmail}
                  </span>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(ticket.createdAt)}
                  </span>
                  <span className="text-[11px] text-[hsl(var(--sa-text-secondary))]">
                    Atualizado {timeAgo(ticket.updatedAt)}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-[hsl(var(--sa-text-muted))] group-hover:text-[hsl(var(--sa-accent))] transition-colors shrink-0 self-center" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="text-[11px] h-8 text-[hsl(var(--sa-text-muted))]"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
          </Button>
          <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="text-[11px] h-8 text-[hsl(var(--sa-text-muted))]"
          >
            Próxima <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
