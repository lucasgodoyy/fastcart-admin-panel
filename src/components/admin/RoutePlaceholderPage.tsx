import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { t } from '@/lib/admin-language';

type RoutePlaceholderPageProps = {
  title: string;
  description: string;
  links?: Array<{ label: string; href: string }>;
};

export function RoutePlaceholderPage({ title, description, links = [] }: RoutePlaceholderPageProps) {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>

      {links.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{link.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t('Abrir seção', 'Open section')}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
