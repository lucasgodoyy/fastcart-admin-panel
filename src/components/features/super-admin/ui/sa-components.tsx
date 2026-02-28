"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ────── Animation variants ────── */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

/* ────── Stat Card ────── */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "accent" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const colorMap = {
  accent: {
    icon: "text-[hsl(var(--sa-accent))]",
    bg: "bg-[hsl(var(--sa-accent-subtle))]",
    ring: "ring-[hsl(var(--sa-accent))/0.1]",
  },
  success: {
    icon: "text-[hsl(var(--sa-success))]",
    bg: "bg-[hsl(var(--sa-success-subtle))]",
    ring: "ring-[hsl(var(--sa-success))/0.1]",
  },
  warning: {
    icon: "text-[hsl(var(--sa-warning))]",
    bg: "bg-[hsl(var(--sa-warning-subtle))]",
    ring: "ring-[hsl(var(--sa-warning))/0.1]",
  },
  danger: {
    icon: "text-[hsl(var(--sa-danger))]",
    bg: "bg-[hsl(var(--sa-danger-subtle))]",
    ring: "ring-[hsl(var(--sa-danger))/0.1]",
  },
  info: {
    icon: "text-[hsl(var(--sa-info))]",
    bg: "bg-[hsl(var(--sa-info-subtle))]",
    ring: "ring-[hsl(var(--sa-info))/0.1]",
  },
};

export function SaStatCard({ title, value, subtitle, icon: Icon, trend, color = "accent", className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-5 transition-all hover:border-[hsl(var(--sa-border))] hover:shadow-lg hover:shadow-black/10",
        className
      )}
      whileHover={{ y: -2 }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[hsl(var(--sa-surface-hover))] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1", c.bg, c.ring)}>
            <Icon className={cn("h-5 w-5", c.icon)} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              trend.value > 0 ? "bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]" :
              trend.value < 0 ? "bg-[hsl(var(--sa-danger-subtle))] text-[hsl(var(--sa-danger))]" :
              "bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-muted))]"
            )}>
              {trend.value > 0 ? <TrendingUp className="h-3 w-3" /> : trend.value < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {trend.value > 0 && "+"}{trend.value}%
            </div>
          )}
        </div>

        <div className="text-[28px] font-bold tracking-tight text-[hsl(var(--sa-text))]">{value}</div>
        <div className="mt-1 text-[12px] font-medium text-[hsl(var(--sa-text-muted))]">{title}</div>
        {subtitle && <div className="mt-0.5 text-[11px] text-[hsl(var(--sa-text-muted))]">{subtitle}</div>}
      </div>
    </motion.div>
  );
}

/* ────── Section Title ────── */
export function SaPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8"
    >
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[hsl(var(--sa-text))]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-[hsl(var(--sa-text-muted))]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 mt-3 sm:mt-0">{actions}</div>}
    </motion.div>
  );
}

/* ────── Glass Card ────── */
export function SaCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-6 transition-colors hover:border-[hsl(var(--sa-border))]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/* ────── Empty State ────── */
export function SaEmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--sa-surface-hover))]">
        <Icon className="h-8 w-8 text-[hsl(var(--sa-text-muted))]" />
      </div>
      <h3 className="text-lg font-semibold text-[hsl(var(--sa-text-secondary))]">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-[hsl(var(--sa-text-muted))]">{description}</p>
    </motion.div>
  );
}

/* ────── Status Badge ────── */
export function SaStatusBadge({ status, map }: { status: string; map?: Record<string, { label: string; color: string }> }) {
  const defaultMap: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Ativo", color: "success" },
    INACTIVE: { label: "Inativo", color: "danger" },
    PENDING: { label: "Pendente", color: "warning" },
    TRIAL: { label: "Trial", color: "info" },
    SUSPENDED: { label: "Suspenso", color: "danger" },
    ...map,
  };
  const info = defaultMap[status] || { label: status, color: "accent" };
  const cls: Record<string, string> = {
    success: "bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]",
    warning: "bg-[hsl(var(--sa-warning-subtle))] text-[hsl(var(--sa-warning))]",
    danger: "bg-[hsl(var(--sa-danger-subtle))] text-[hsl(var(--sa-danger))]",
    info: "bg-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-info))]",
    accent: "bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold", cls[info.color] ?? cls.accent)}>
      {info.label}
    </span>
  );
}

/* ────── Skeleton Loader ────── */
export function SaSkeleton({ className }: { className?: string }) {
  return <div className={cn("sa-shimmer rounded-lg bg-[hsl(var(--sa-surface-hover))]", className)} />;
}

/* ────── Table wrapper ────── */
export function SaTableCard({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp} className="rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] overflow-hidden">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[hsl(var(--sa-border-subtle))] px-6 py-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </motion.div>
  );
}
