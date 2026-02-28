'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { t } from '@/lib/admin-language';

interface SettingsPageLayoutProps {
  title: string;
  description?: string;
  helpText?: string;
  helpHref?: string;
  children: React.ReactNode;
}

export function SettingsPageLayout({
  title,
  description,
  helpText,
  helpHref,
  children,
}: SettingsPageLayoutProps) {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('Configurações', 'Settings')}
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      <div className="space-y-5">{children}</div>

      {helpText && (
        <div className="mt-8 inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <a
            href={helpHref || '#'}
            className="text-primary hover:underline flex items-center gap-1 font-medium"
          >
            {helpText}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
