"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  User,
  Shield,
  Settings,
  Store,
  CreditCard,
  Trash2,
  Edit,
  LogIn,
  LogOut,
  AlertTriangle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  SaPageHeader,
  SaCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const activityIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  create: Edit,
  update: Settings,
  delete: Trash2,
  security: Shield,
  billing: CreditCard,
  store: Store,
};

const activityColors: Record<string, string> = {
  login: "sa-success",
  logout: "sa-text-muted",
  create: "sa-info",
  update: "sa-accent",
  delete: "sa-danger",
  security: "sa-warning",
  billing: "sa-success",
  store: "sa-info",
};

const mockActivities = [
  { id: 1, type: "login", user: "Lucas Mendes", email: "lucas@fastcart.com", role: "SUPER_ADMIN", action: "Fez login no painel", ip: "189.23.45.67", time: "Há 2 min" },
  { id: 2, type: "update", user: "Lucas Mendes", email: "lucas@fastcart.com", role: "SUPER_ADMIN", action: "Atualizou plano da loja Fashion Store para Pro", ip: "189.23.45.67", time: "Há 15 min" },
  { id: 3, type: "create", user: "Ana Silva", email: "ana@fastcart.com", role: "ADMIN", action: "Criou novo template de e-mail 'Boas-vindas V2'", ip: "177.84.12.33", time: "Há 32 min" },
  { id: 4, type: "security", user: "Sistema", email: "—", role: "SYSTEM", action: "Bloqueou IP 45.33.32.156 por tentativas excessivas de login", ip: "—", time: "Há 1 hora" },
  { id: 5, type: "billing", user: "Lucas Mendes", email: "lucas@fastcart.com", role: "SUPER_ADMIN", action: "Processou reembolso de R$ 89,90 para Casa Decor", ip: "189.23.45.67", time: "Há 1.5 horas" },
  { id: 6, type: "store", user: "Sistema", email: "—", role: "SYSTEM", action: "Nova loja registrada: Beleza Natural", ip: "—", time: "Há 2 horas" },
  { id: 7, type: "delete", user: "Ana Silva", email: "ana@fastcart.com", role: "ADMIN", action: "Removeu afiliado desativado: João Antigo", ip: "177.84.12.33", time: "Há 3 horas" },
  { id: 8, type: "login", user: "Carlos Oliveira", email: "carlos@store.com", role: "STAFF", action: "Tentativa de login falhou (senha incorreta)", ip: "201.12.45.89", time: "Há 4 horas" },
  { id: 9, type: "update", user: "Lucas Mendes", email: "lucas@fastcart.com", role: "SUPER_ADMIN", action: "Alterou configurações de SMTP", ip: "189.23.45.67", time: "Há 5 horas" },
  { id: 10, type: "security", user: "Sistema", email: "—", role: "SYSTEM", action: "Renovação automática de certificado SSL concluída", ip: "—", time: "Há 6 horas" },
  { id: 11, type: "logout", user: "Ana Silva", email: "ana@fastcart.com", role: "ADMIN", action: "Sessão encerrada por inatividade", ip: "177.84.12.33", time: "Há 6 horas" },
  { id: 12, type: "create", user: "Lucas Mendes", email: "lucas@fastcart.com", role: "SUPER_ADMIN", action: "Criou novo plano 'Business' com preço R$ 399/mês", ip: "189.23.45.67", time: "Há 8 horas" },
];

const roleTagMap: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "accent" },
  ADMIN: { label: "Admin", color: "info" },
  STAFF: { label: "Staff", color: "warning" },
  SYSTEM: { label: "Sistema", color: "success" },
};

export function SaActivityPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = mockActivities.filter(a => {
    const matchSearch = !search || a.action.toLowerCase().includes(search.toLowerCase()) || a.user.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.type === filter;
    return matchSearch && matchFilter;
  });

  const filters = [
    { key: "all", label: "Todos" },
    { key: "login", label: "Login" },
    { key: "create", label: "Criação" },
    { key: "update", label: "Alteração" },
    { key: "delete", label: "Remoção" },
    { key: "security", label: "Segurança" },
    { key: "billing", label: "Financeiro" },
  ];

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Registro de Atividades"
        description="Log de todas as ações realizadas na plataforma"
      />

      {/* Filters */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
          <Input
            placeholder="Buscar atividade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] rounded-xl h-10 text-[12px]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.key}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg text-[11px] h-8 px-3 transition-all ${
                filter === f.key
                  ? "bg-[hsl(var(--sa-accent))]/15 text-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-accent))]/30"
                  : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))]"
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Activity Feed */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
        {filtered.map((activity, i) => {
          const Icon = activityIcons[activity.type] || Activity;
          const color = activityColors[activity.type] || "sa-text-muted";
          const tag = roleTagMap[activity.role];

          return (
            <motion.div
              key={activity.id}
              variants={fadeInUp}
              className="group flex items-start gap-4 p-4 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 hover:bg-[hsl(var(--sa-surface-hover))] transition-all backdrop-blur-sm"
            >
              {/* Icon */}
              <div className={`h-10 w-10 shrink-0 rounded-xl bg-[hsl(var(--${color}))]/10 flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-[hsl(var(--${color}))]`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">
                    {activity.user}
                  </span>
                  {tag && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[hsl(var(--sa-${tag.color}))]/10 text-[hsl(var(--sa-${tag.color}))]`}>
                      {tag.label}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[hsl(var(--sa-text-secondary))] leading-relaxed">
                  {activity.action}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {activity.time}
                  </span>
                  {activity.ip !== "—" && (
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))] font-mono">
                      IP: {activity.ip}
                    </span>
                  )}
                  {activity.email !== "—" && (
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">
                      {activity.email}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center py-16">
          <Activity className="h-12 w-12 text-[hsl(var(--sa-text-muted))] mx-auto mb-4" />
          <p className="text-[14px] text-[hsl(var(--sa-text-muted))]">Nenhuma atividade encontrada</p>
        </motion.div>
      )}
    </div>
  );
}
