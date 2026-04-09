'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSectionErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  section?: string;
}

export function AdminSectionError({ error, reset, section }: AdminSectionErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { section } });
    console.error(`[${section ?? 'admin'}]`, error);
  }, [error, section]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive/60" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Erro ao carregar {section ?? 'esta seção'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um problema inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={reset}>
        <RotateCcw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
