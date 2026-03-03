'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Rocket,
} from 'lucide-react';
import setupProgressService, { type StoreSetupProgress } from '@/services/setupProgressService';
import { t } from '@/lib/admin-language';

export function SetupChecklist() {
  const { data: progress, isLoading } = useQuery<StoreSetupProgress>({
    queryKey: ['store-setup-progress'],
    queryFn: () => setupProgressService.getProgress(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-4 w-48 animate-pulse rounded bg-muted mb-4" />
        <div className="h-2 w-full animate-pulse rounded-full bg-muted mb-5" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!progress) return null;

  // If everything is done, show a compact congratulatory card
  if (progress.percentComplete === 100) {
    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Rocket className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              {t('Sua loja está pronta! 🎉', 'Your store is ready! 🎉')}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {t(
                'Todas as etapas de configuração foram concluídas.',
                'All setup steps have been completed.'
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground">
          {t('Configure sua loja', 'Set up your store')}
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {progress.completedSteps}/{progress.totalSteps}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {t(
          `Complete as etapas abaixo para começar a vender.`,
          `Complete the steps below to start selling.`
        )}
      </p>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[11px] font-medium text-muted-foreground">
          {progress.percentComplete}%
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {progress.steps.map((step) => (
          <Link
            key={step.key}
            href={step.actionUrl}
            className={`
              group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors
              ${step.completed
                ? 'bg-muted/30 hover:bg-muted/50'
                : 'hover:bg-muted/50 border border-transparent hover:border-border'
              }
            `}
          >
            {/* Check icon */}
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
            )}

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>

            {/* Arrow */}
            {!step.completed && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
