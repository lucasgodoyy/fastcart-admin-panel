'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import billingService from '@/services/billingService';
import { t } from '@/lib/admin-language';

export function QuotaWarningBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const { data: limits } = useQuery({
    queryKey: ['plan-limits'],
    queryFn: billingService.getPlanLimits,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (dismissed || !limits) return null;

  const warnings: { label: string; current: number; max: number }[] = [];

  if (limits.maxProducts !== null && limits.maxProducts > 0) {
    const pct = limits.currentProducts / limits.maxProducts;
    if (pct >= 0.8) {
      warnings.push({
        label: t('produtos', 'products'),
        current: limits.currentProducts,
        max: limits.maxProducts,
      });
    }
  }

  if (limits.maxStaff > 0) {
    const pct = limits.currentStaff / limits.maxStaff;
    if (pct >= 0.8) {
      warnings.push({
        label: t('colaboradores', 'staff members'),
        current: limits.currentStaff,
        max: limits.maxStaff,
      });
    }
  }

  if (warnings.length === 0) return null;

  const isAtLimit = warnings.some((w) => w.current >= w.max);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm border-b ${
        isAtLimit
          ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300'
          : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300'
      }`}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        {warnings.map((w, i) => (
          <span key={w.label}>
            {i > 0 && ' · '}
            <strong>{w.current}/{w.max}</strong> {w.label}
          </span>
        ))}
        {isAtLimit
          ? ` — ${t('Limite atingido! Faça upgrade para continuar.', 'Limit reached! Upgrade to continue.')}`
          : ` — ${t('Você está perto do limite do seu plano.', "You're approaching your plan limit.")}`}
      </div>
      <button
        onClick={() => router.push('/admin/billing')}
        className="shrink-0 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {t('Fazer upgrade', 'Upgrade')}
        <ArrowRight className="h-3 w-3" />
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label={t('Fechar', 'Close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
