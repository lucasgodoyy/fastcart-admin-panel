'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle, ExternalLink } from 'lucide-react';

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
      <div className="mb-6">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Configuracoes
        </Link>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="space-y-6">{children}</div>

      {helpText && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <a
            href={helpHref || '#'}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {helpText}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
