'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShoppingCart,
  Clock,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { t } from '@/lib/admin-language';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const posNav = [
  { label: t('Venda', 'Sale'), href: '/admin/pos', icon: ShoppingCart },
  { label: t('Histórico', 'History'), href: '/admin/pos/history', icon: Clock },
  { label: t('Caixa', 'Cash Register'), href: '/admin/pos/cash-register', icon: DollarSign },
];

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin/pos') return pathname === '/admin/pos';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Slim POS sidebar */}
      <aside className="flex w-16 flex-col items-center border-r bg-sidebar-bg py-4">
        <TooltipProvider delayDuration={0}>
          {/* Back to admin */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/admin"
                className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {t('Voltar ao painel', 'Back to Admin')}
            </TooltipContent>
          </Tooltip>

          {/* POS nav items */}
          <div className="flex flex-1 flex-col items-center gap-2">
            {posNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </aside>

      {/* Main POS content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
