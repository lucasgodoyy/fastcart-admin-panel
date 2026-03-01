"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Headphones,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  ChevronRight,
  ExternalLink,
  Tag,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { superAdminService } from "@/services/super-admin";
import type { SupportTicketSummary } from "@/types/super-admin";

const statusMap: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Aberto", color: "warning" },
  IN_PROGRESS: { label: "Em Andamento", color: "info" },
  RESOLVED: { label: "Resolvido", color: "success" },
  CLOSED: { label: "Fechado", color: "accent" },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  HIGH: { label: "Alta", color: "danger" },
  MEDIUM: { label: "Média", color: "warning" },
  LOW: { label: "Baixa", color: "success" },
};

export function SaSupportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: overview } = useQuery({
    queryKey: ["sa-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: ticketsData } = useQuery({
    queryKey: ["sa-tickets", statusFilter],
    queryFn: () => superAdminService.listSupportTickets({
      status: statusFilter !== "all" ? statusFilter : undefined,
      size: 50,
    }),
  });

  const allTickets = ticketsData?.content ?? [];
  const filtered = search
    ? allTickets.filter(t =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        (t.storeName || "").toLowerCase().includes(search.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(search.toLowerCase())
      )
    : allTickets;

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Suporte"
        description="Central de atendimento e gestão de tickets"
        actions={
          <Button className="bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-xl gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo Ticket
          </Button>
        }
      />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Tickets" value={String(overview?.totalSupportTickets ?? 0)} icon={AlertCircle} color="warning" />
        <SaStatCard title="Tickets Abertos" value={String(overview?.openSupportTickets ?? 0)} icon={Clock} color="info" />
        <SaStatCard title="Tickets (listados)" value={String(ticketsData?.totalElements ?? 0)} icon={CheckCircle2} color="success" />
        <SaStatCard title="Tempo Médio" value="—" icon={Headphones} color="accent" subtitle="Primeira resposta" />
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
      </motion.div>

      {/* Tickets */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
        {filtered.map(ticket => (
          <motion.div
            key={ticket.id}
            variants={fadeInUp}
            className="group flex items-start gap-4 p-5 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 hover:bg-[hsl(var(--sa-surface-hover))] transition-all backdrop-blur-sm cursor-pointer"
          >
            {/* Status indicator */}
            <div className={`w-1 h-14 rounded-full self-center shrink-0 bg-[hsl(var(--sa-${statusMap[ticket.status]?.color || "accent"}))]`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))]">#{ticket.id}</span>
                <SaStatusBadge status={ticket.status} map={statusMap} />
                {ticket.source && <span className="text-[10px] px-2 py-0.5 rounded bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-muted))]">{ticket.source}</span>}
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
                <span className="text-[11px] text-[hsl(var(--sa-text-secondary))]">
                  Atualizado: {new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
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
