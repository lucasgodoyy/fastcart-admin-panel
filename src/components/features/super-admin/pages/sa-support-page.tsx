"use client";

import { motion } from "framer-motion";
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
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const mockTickets = [
  { id: "SUP-001", subject: "Problema com pagamento no checkout", store: "Fashion Store", priority: "HIGH", status: "OPEN", created: "28/02/2026 14:30", lastReply: "Há 15 min", messages: 4 },
  { id: "SUP-002", subject: "CSS quebrado na versão mobile", store: "TechGadgets", priority: "MEDIUM", status: "IN_PROGRESS", created: "28/02/2026 10:20", lastReply: "Há 1 hora", messages: 7 },
  { id: "SUP-003", subject: "Como configurar domínio próprio?", store: "Casa Decor", priority: "LOW", status: "OPEN", created: "27/02/2026 18:45", lastReply: "Há 4 horas", messages: 2 },
  { id: "SUP-004", subject: "Erro ao importar produtos via CSV", store: "SportLife", priority: "HIGH", status: "IN_PROGRESS", created: "27/02/2026 09:10", lastReply: "Há 6 horas", messages: 9 },
  { id: "SUP-005", subject: "Solicitar upgrade de plano", store: "Beleza Natural", priority: "LOW", status: "RESOLVED", created: "26/02/2026 15:00", lastReply: "Há 1 dia", messages: 3 },
  { id: "SUP-006", subject: "Duplicidade de pedidos no relatório", store: "PetShop Elite", priority: "MEDIUM", status: "RESOLVED", created: "26/02/2026 11:30", lastReply: "Há 1 dia", messages: 5 },
];

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

  const filtered = mockTickets.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.store.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
        <SaStatCard title="Tickets Abertos" value="8" icon={AlertCircle} color="warning" />
        <SaStatCard title="Em Andamento" value="5" icon={Clock} color="info" />
        <SaStatCard title="Resolvidos (mês)" value="47" icon={CheckCircle2} color="success" />
        <SaStatCard title="Tempo Médio" value="2.4h" icon={Headphones} color="accent" subtitle="Primeira resposta" />
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
            {/* Priority indicator */}
            <div className={`w-1 h-14 rounded-full self-center shrink-0 bg-[hsl(var(--sa-${priorityMap[ticket.priority]?.color || "accent"}))]`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))]">{ticket.id}</span>
                <SaStatusBadge status={ticket.status} map={statusMap} />
                <SaStatusBadge status={ticket.priority} map={priorityMap} />
              </div>
              <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-1 group-hover:text-[hsl(var(--sa-accent))] transition-colors">
                {ticket.subject}
              </h4>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                  <User className="h-3 w-3" /> {ticket.store}
                </span>
                <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {ticket.created}
                </span>
                <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {ticket.messages} mensagens
                </span>
                <span className="text-[11px] text-[hsl(var(--sa-text-secondary))]">
                  Última resposta: {ticket.lastReply}
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
