"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Link2,
  ArrowUpRight,
  Wallet,
  Headphones,
  Settings,
  Zap,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/affiliate",
    icon: LayoutDashboard,
  },
  {
    label: "Meus Links",
    href: "/affiliate/links",
    icon: Link2,
  },
  {
    label: "Conversões",
    href: "/affiliate/conversions",
    icon: ArrowUpRight,
  },
  {
    label: "Pagamentos",
    href: "/affiliate/payouts",
    icon: Wallet,
  },
  {
    label: "Suporte",
    href: "/affiliate/support",
    icon: Headphones,
  },
  {
    label: "Meu Perfil",
    href: "/affiliate/settings",
    icon: Settings,
  },
];

export function AffiliateSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/affiliate") return pathname === "/affiliate";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="hidden lg:flex h-full w-60 flex-col bg-sidebar-bg overflow-y-auto shrink-0 border-r">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <Zap className="h-4.5 w-4.5 text-white" fill="white" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground block">Lojaki</span>
          <span className="text-[10px] text-sidebar-muted font-medium">Painel Afiliado</span>
        </div>
      </div>

      {/* User info */}
      <div className="mx-3 mb-4 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
        <p className="text-[12px] font-semibold text-sidebar-foreground truncate">
          {user?.name || user?.email}
        </p>
        <p className="text-[10px] text-sidebar-muted">Afiliado</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-sidebar-primary" : "text-sidebar-muted"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="rounded-lg bg-primary/5 px-3 py-3 text-center">
          <p className="text-[11px] font-semibold text-primary">Programa de Afiliados</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ganhe comissões por cada venda</p>
        </div>
      </div>
    </aside>
  );
}
