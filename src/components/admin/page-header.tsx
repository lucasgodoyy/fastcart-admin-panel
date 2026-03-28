import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  PageContainer — wraps every admin page with consistent padding    */
/* ------------------------------------------------------------------ */

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('p-4 md:p-6 lg:p-8 space-y-6', className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PageHeader — standard title + optional subtitle + action buttons  */
/* ------------------------------------------------------------------ */

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EmptyState — consistent "nothing here" state                      */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-3 text-muted-foreground/60">{icon}</div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DataCard — One row in a card-style list (replaces table rows)     */
/*  Nuvemshop-style: rounded card per row with hover + shadow         */
/* ------------------------------------------------------------------ */

interface DataCardProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function DataCard({ children, href, onClick, className }: DataCardProps) {
  const baseClasses = cn(
    'group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-150',
    'hover:shadow-md hover:border-border/80 hover:bg-accent/30',
    onClick || href ? 'cursor-pointer' : '',
    className,
  );

  if (href) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Link = require('next/link').default;
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DataList — Wrapper for a list of DataCards                        */
/* ------------------------------------------------------------------ */

interface DataListProps {
  children: ReactNode;
  className?: string;
}

export function DataList({ children, className }: DataListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatCard — KPI metric card (already duplicated across pages)      */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: number;
  loading?: boolean;
}

export function StatCard({ icon, label, value, trend, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <div className="mt-0.5 h-6 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-bold text-foreground truncate">{value}</p>
          )}
          {!loading && trend !== undefined && trend !== 0 && (
            <p className={`text-[11px] font-medium mt-0.5 ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
