"use client"

import { Bell, Search, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useMemo } from "react"
import { t } from "@/lib/admin-language"

const breadcrumbLabelMap: Record<string, string> = {
  admin: t("Painel", "Dashboard"),
  statistics: t("Estatísticas", "Analytics"),
  payments: t("Pagamentos", "Payments"),
  shipping: t("Envio", "Shipping"),
  products: t("Produtos", "Products"),
  traffic: t("Fontes de Tráfego", "Traffic Sources"),
  sales: t("Vendas", "Sales"),
  "manual-orders": t("Pedidos Manuais", "Manual Orders"),
  "abandoned-carts": t("Carrinhos Abandonados", "Abandoned Carts"),
  customers: t("Clientes", "Customers"),
  messages: t("Mensagens", "Messages"),
  discounts: t("Promoções", "Promotions"),
  coupons: t("Cupons", "Coupons"),
  "free-shipping": t("Frete Grátis", "Free Shipping"),
  promotions: t("Campanhas", "Campaigns"),
  marketing: t("Marketing", "Marketing"),
  "online-store": t("Loja Virtual", "Online Store"),
  "layout-theme": t("Tema e Layout", "Theme & Layout"),
  menus: t("Navegação", "Navigation"),
  filters: t("Filtros", "Filters"),
  "social-links": t("Links Sociais", "Social Links"),
  "under-construction": t("Manutenção", "Maintenance"),
  settings: t("Configurações", "Settings"),
  integrations: t("Integrações", "Integrations"),
}

function useBreadcrumbs() {
  const pathname = usePathname()
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length <= 1) return [{ label: t("Painel", "Dashboard"), href: "/admin" }]
    const crumbs = segments.slice(1).map((seg, i) => ({
      label:
        breadcrumbLabelMap[seg] ||
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
      href: "/" + segments.slice(0, i + 2).join("/"),
    }))
    return crumbs
  }, [pathname])
}

export function AdminHeader() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 gap-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-foreground truncate">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground truncate transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search */}
        <button className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t("Pesquisar...", "Search...")}</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            3
          </span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-muted transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground">
            F
          </div>
        </button>
      </div>
    </header>
  )
}
