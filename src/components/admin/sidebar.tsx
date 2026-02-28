"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  Package,
  Wallet,
  Truck,
  MessageSquare,
  Users2,
  TicketPercent,
  Speaker,
  Globe,
  CreditCard,
  Search as SearchIcon,
  Puzzle,
  Cog,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import salesChannelsService from "@/services/salesChannels"
import apiClient from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { t } from "@/lib/admin-language"

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string
  external?: boolean
  children?: { label: string; href: string; badge?: string }[]
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    items: [
      { label: t("Painel", "Dashboard"), href: "/admin", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { label: t("Estatísticas", "Analytics"), href: "/admin/statistics", icon: <TrendingUp className="h-[18px] w-[18px]" />, children: [
        { label: t("Visão geral", "Overview"), href: "/admin/statistics" },
        { label: t("Pagamentos", "Payments"), href: "/admin/statistics/payments" },
        { label: t("Envio", "Shipping"), href: "/admin/statistics/shipping" },
        { label: t("Produtos", "Products"), href: "/admin/statistics/products" },
        { label: t("Fontes de tráfego", "Traffic Sources"), href: "/admin/statistics/traffic" },
      ]},
    ],
  },
  {
    title: t("Comércio", "Commerce"),
    items: [
      { label: t("Pedidos", "Orders"), href: "/admin/sales", icon: <ShoppingBag className="h-[18px] w-[18px]" />, children: [
        { label: t("Todos os pedidos", "All Orders"), href: "/admin/sales" },
        { label: t("Pedidos manuais", "Manual Orders"), href: "/admin/sales/manual-orders" },
        { label: t("Carrinhos abandonados", "Abandoned Carts"), href: "/admin/sales/abandoned-carts" },
      ]},
      { label: t("Catálogo", "Catalog"), href: "/admin/products", icon: <Package className="h-[18px] w-[18px]" />, children: [
        { label: t("Todos os produtos", "All Products"), href: "/admin/products" },
        { label: t("Estoque", "Inventory"), href: "/admin/products/inventory" },
        { label: t("Categorias", "Categories"), href: "/admin/products/categories" },
        { label: t("Tabelas de preço", "Price Tables"), href: "/admin/products/price-tables" },
      ]},
      { label: t("Financeiro", "Finances"), href: "/admin/payments", icon: <Wallet className="h-[18px] w-[18px]" /> },
      { label: t("Logística", "Fulfillment"), href: "/admin/shipping", icon: <Truck className="h-[18px] w-[18px]" /> },
      { label: t("Caixa de entrada", "Inbox"), href: "/admin/chat", icon: <MessageSquare className="h-[18px] w-[18px]" />, badge: t("Novo", "New") },
      { label: t("Pessoas", "People"), href: "/admin/customers", icon: <Users2 className="h-[18px] w-[18px]" />, children: [
        { label: t("Todos os clientes", "All Customers"), href: "/admin/customers" },
        { label: t("Mensagens", "Messages"), href: "/admin/customers/messages" },
      ]},
    ],
  },
  {
    title: t("Crescimento", "Growth"),
    items: [
      { label: t("Promoções", "Promotions"), href: "/admin/discounts", icon: <TicketPercent className="h-[18px] w-[18px]" />, children: [
        { label: t("Cupons", "Coupons"), href: "/admin/discounts/coupons" },
        { label: t("Frete grátis", "Free Shipping"), href: "/admin/discounts/free-shipping" },
        { label: t("Campanhas", "Campaigns"), href: "/admin/discounts/promotions" },
      ]},
      { label: t("Marketing", "Marketing"), href: "/admin/marketing", icon: <Speaker className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: t("Canais", "Channels"),
    items: [
      { label: t("Loja virtual", "Storefront"), href: "/admin/online-store", icon: <Globe className="h-[18px] w-[18px]" />, external: true, children: [
        { label: t("Tema e layout", "Theme & Layout"), href: "/admin/online-store/layout-theme" },
        { label: t("Páginas", "Pages"), href: "/admin/online-store/pages" },
        { label: t("Blog", "Blog"), href: "/admin/online-store/blog", badge: t("Novo", "New") },
        { label: t("Navegação", "Navigation"), href: "/admin/online-store/menus" },
        { label: t("Filtros", "Filters"), href: "/admin/online-store/filters" },
        { label: t("Links sociais", "Social Links"), href: "/admin/online-store/social-links" },
        { label: t("Manutenção", "Maintenance"), href: "/admin/online-store/under-construction" },
      ]},
      { label: t("Ponto de venda", "Point of Sale"), href: "/admin/pos", icon: <CreditCard className="h-[18px] w-[18px]" />, external: true },
      { label: t("Google Shopping", "Google Shopping"), href: "/admin/google-shopping", icon: <SearchIcon className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: t("Expansão", "Extend"),
    items: [
      { label: t("Integrações", "Integrations"), href: "/admin/apps", icon: <Puzzle className="h-[18px] w-[18px]" /> },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: salesChannelSettings } = useQuery({
    queryKey: ["sales-channel-settings", "sidebar"],
    queryFn: () => salesChannelsService.getSettings(),
    staleTime: 60_000,
  })

  const { data: storeData } = useQuery<{ slug: string }>({
    queryKey: ["sidebar-store", user?.storeId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ slug: string }>(`/admin/stores/${user?.storeId}`)
      return data
    },
    enabled: Boolean(user?.storeId),
    staleTime: 60_000,
  })

  const resolveStorefrontBaseUrl = () => {
    const configured = (process.env.NEXT_PUBLIC_STOREFRONT_URL || "").trim()
    if (configured) {
      return configured.replace(/\/$/, "")
    }

    if (typeof window === "undefined") return ""

    const protocol = window.location.protocol
    const hostname = window.location.hostname

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const storefrontPort = process.env.NEXT_PUBLIC_STOREFRONT_PORT || "3000"
      return `${protocol}//${hostname}:${storefrontPort}`
    }

    if (hostname.startsWith("admin.")) {
      return `${protocol}//${hostname.replace(/^admin\./, "")}`
    }

    return `${protocol}//${hostname}`
  }

  const openStorefront = (rawUrl?: string | null) => {
    const trimmed = (rawUrl || "").trim()
    if (trimmed) {
      const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      window.open(normalizedUrl, "_blank", "noopener,noreferrer")
      return
    }

    const slug = (storeData?.slug || "").trim()
    const storefrontBaseUrl = resolveStorefrontBaseUrl()
    if (!slug || !storefrontBaseUrl) {
      toast.error("Não foi possível montar a URL da loja. Configure Online Store URL.")
      return
    }

    const dynamicUrl = `${storefrontBaseUrl}/?storeSlug=${encodeURIComponent(slug)}`
    window.open(dynamicUrl, "_blank", "noopener,noreferrer")
  }

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const expanded: string[] = []
    navigation.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          const isChildActive = item.children.some(child => pathname === child.href)
          const isParentActive = pathname === item.href
          if (isChildActive || isParentActive || pathname.startsWith(item.href + "/")) {
            expanded.push(item.label)
          }
        }
      })
    })
    return expanded
  })

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="flex h-full w-[248px] flex-col bg-[var(--sidebar-bg)] overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)]">
          <Zap className="h-4.5 w-4.5 text-white" fill="white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-[var(--sidebar-foreground)]">FastCart</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-4">
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold tracking-wide text-[var(--sidebar-muted)]">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item.href)
              const expanded = expandedItems.includes(item.label)
              const hasChildren = item.children && item.children.length > 0

              return (
                <div key={item.label}>
                  <div className="flex items-center">
                    <Link
                      href={hasChildren ? item.children![0].href : item.href}
                      onClick={(e) => {
                        if (hasChildren) {
                          e.preventDefault()
                          toggleExpand(item.label)
                        }
                      }}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
                        active
                          ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                          : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                      )}
                    >
                      <span className={cn(
                        "transition-colors",
                        active ? "text-[var(--sidebar-primary)]" : "text-[var(--sidebar-muted)]"
                      )}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-[var(--sidebar-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.external && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()

                            if (item.label === t("Loja virtual", "Storefront")) {
                              openStorefront(salesChannelSettings?.channelLinks?.onlineStore)
                              return
                            }

                            if (!hasChildren) {
                              window.open(item.href, "_blank", "noopener,noreferrer")
                            }
                          }}
                          className="text-[var(--sidebar-muted)] hover:text-[var(--sidebar-foreground)]"
                          aria-label={`Abrir ${item.label}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {hasChildren && (
                        <span className="text-[var(--sidebar-muted)]">
                          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </span>
                      )}
                    </Link>
                  </div>
                  {hasChildren && expanded && (
                    <div className="ml-[30px] mt-0.5 space-y-0.5 border-l-2 border-[var(--sidebar-border)] pl-3">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-[13px] transition-all duration-150",
                              childActive
                                ? "text-[var(--sidebar-primary)] font-semibold"
                                : "text-[var(--sidebar-muted)] hover:text-[var(--sidebar-foreground)]"
                            )}
                          >
                            {child.label}
                            {child.badge && (
                              <span className="ml-2 rounded-full bg-[var(--sidebar-primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-[var(--sidebar-border)] px-3 py-3">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
            pathname.startsWith("/admin/settings")
              ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
              : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
          )}
        >
          <Cog className="h-[18px] w-[18px] text-[var(--sidebar-muted)]" />
          <span className="flex-1">{t("Configurações", "Settings")}</span>
        </Link>
      </div>
    </aside>
  )
}
