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
  Receipt,
  Cog,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  Link2,
  Headphones,
  Bell,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import salesChannelsService from "@/services/salesChannels"
import apiClient from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { t } from "@/lib/admin-language"
import { useMobileSidebar } from "@/context/MobileSidebarContext"
import { AdminThemeToggle } from "@/components/shared/admin-theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
      ]},
    ],
  },
  {
    title: t("Comércio", "Commerce"),
    items: [
      { label: t("Pedidos", "Orders"), href: "/admin/sales", icon: <ShoppingBag className="h-[18px] w-[18px]" />, children: [
        { label: t("Todos os pedidos", "All Orders"), href: "/admin/sales" },
        { label: t("Carrinhos abandonados", "Abandoned Carts"), href: "/admin/sales/abandoned-carts" },
      ]},
      { label: t("Catálogo", "Catalog"), href: "/admin/products", icon: <Package className="h-[18px] w-[18px]" />, children: [
        { label: t("Todos os produtos", "All Products"), href: "/admin/products" },
        { label: t("Estoque", "Inventory"), href: "/admin/products/inventory" },
        { label: t("Categorias", "Categories"), href: "/admin/products/categories" },
      ]},
      { label: t("Financeiro", "Finances"), href: "/admin/payments", icon: <Wallet className="h-[18px] w-[18px]" /> },
      { label: t("Logística", "Fulfillment"), href: "/admin/shipping", icon: <Truck className="h-[18px] w-[18px]" /> },
      { label: t("Caixa de entrada", "Inbox"), href: "/admin/chat", icon: <MessageSquare className="h-[18px] w-[18px]" /> },
      { label: t("Suporte", "Support"), href: "/admin/support", icon: <Headphones className="h-[18px] w-[18px]" /> },
      { label: t("Notificações", "Notifications"), href: "/admin/notifications", icon: <Bell className="h-[18px] w-[18px]" /> },
      { label: t("Clientes", "Customers"), href: "/admin/customers", icon: <Users2 className="h-[18px] w-[18px]" /> },
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
      { label: t("Afiliados", "Affiliates"), href: "/admin/marketing/affiliates", icon: <Link2 className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    title: t("Canais", "Channels"),
    items: [
      { label: t("Loja virtual", "Storefront"), href: "/admin/online-store", icon: <Globe className="h-[18px] w-[18px]" />, external: true, children: [
        { label: t("Tema e layout", "Theme & Layout"), href: "/admin/online-store/layout-theme" },
        { label: t("Páginas", "Pages"), href: "/admin/online-store/pages" },
        { label: t("Blog", "Blog"), href: "/admin/online-store/blog" },
        { label: t("Navegação", "Navigation"), href: "/admin/online-store/menus" },
        { label: t("Filtros", "Filters"), href: "/admin/online-store/filters" },
        { label: t("Links sociais", "Social Links"), href: "/admin/online-store/social-links" },
        { label: t("Google Shopping", "Google Shopping"), href: "/admin/online-store/google-shopping" },
        { label: t("Manutenção", "Maintenance"), href: "/admin/online-store/under-construction" },
      ]},
    ],
  },
  {
    title: t("Conta", "Account"),
    items: [
      { label: t("Assinatura", "Billing"), href: "/admin/billing", icon: <Receipt className="h-[18px] w-[18px]" /> },
    ],
  },
]

export function AdminSidebar() {
  const { collapsed } = useMobileSidebar()
  return (
    <aside
      className={cn(
        "hidden lg:flex h-full flex-col bg-[var(--sidebar-bg)] overflow-y-auto shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-[64px]" : "w-[248px]"
      )}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  )
}

export function MobileSidebar() {
  return <SidebarContent collapsed={false} />
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
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

  const resolveTenantStorefrontUrl = (slug: string) => {
    const configured = (process.env.NEXT_PUBLIC_STOREFRONT_URL || "").trim()
    if (configured) {
      const normalizedBase = configured.replace(/\/$/, "")
      return `${normalizedBase}/?storeSlug=${encodeURIComponent(slug)}`
    }

    if (typeof window === "undefined") return ""

    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const storefrontPort = process.env.NEXT_PUBLIC_STOREFRONT_PORT || "3000"

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${slug}.127.0.0.1.nip.io:${storefrontPort}`
    }

    if (hostname.startsWith("admin.")) {
      const rootDomain = hostname.replace(/^admin\./, "")
      return `${protocol}//${slug}.${rootDomain}`
    }

    return `${protocol}//${slug}.${hostname}`
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

    const dynamicUrl = resolveTenantStorefrontUrl(slug)
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
    <TooltipProvider delayDuration={0}>
    <div className="flex h-full flex-col bg-[var(--sidebar-bg)] overflow-y-auto">
      {/* Logo */}
      <div className={cn("flex items-center gap-2.5 py-5", collapsed ? "justify-center px-2" : "px-5")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] shrink-0">
          <Zap className="h-4.5 w-4.5 text-white" fill="white" />
        </div>
        {!collapsed && <span className="text-[15px] font-bold tracking-tight text-[var(--sidebar-foreground)]">Lojaki</span>}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-1 space-y-4", collapsed ? "px-1.5" : "px-3")}>
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && !collapsed && (
              <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold tracking-wide text-[var(--sidebar-muted)]">
                {section.title}
              </div>
            )}
            {section.title && collapsed && (
              <div className="my-2 mx-1.5 h-px bg-[var(--sidebar-border)]" />
            )}
            <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item.href)
              const expanded = expandedItems.includes(item.label)
              const hasChildren = item.children && item.children.length > 0

              const linkContent = (
                <Link
                  href={hasChildren && !collapsed ? item.children![0].href : (hasChildren ? item.children![0].href : item.href)}
                  onClick={(e) => {
                    if (hasChildren && !collapsed) {
                      e.preventDefault()
                      toggleExpand(item.label)
                    }
                  }}
                  className={cn(
                    "flex flex-1 items-center rounded-lg transition-all duration-150",
                    collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-[13px]",
                    active
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                  )}
                >
                  <span className={cn(
                    "transition-colors shrink-0",
                    active ? "text-[var(--sidebar-primary)]" : "text-[var(--sidebar-muted)]"
                  )}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
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
                    </>
                  )}
                </Link>
              )

              return (
                <div key={item.label}>
                  <div className="flex items-center">
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      linkContent
                    )}
                  </div>
                  {hasChildren && expanded && !collapsed && (
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
      <div className={cn("border-t border-[var(--sidebar-border)] py-3 space-y-1", collapsed ? "px-1.5" : "px-3")}>
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/billing"
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2.5 transition-all duration-150",
                    pathname.startsWith("/admin/billing")
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                  )}
                >
                  <CreditCard className="h-[18px] w-[18px] text-[var(--sidebar-muted)]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>{t("Meu Plano", "My Plan")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2.5 transition-all duration-150",
                    pathname.startsWith("/admin/settings")
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                  )}
                >
                  <Cog className="h-[18px] w-[18px] text-[var(--sidebar-muted)]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>{t("Configurações", "Settings")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center rounded-lg p-2.5">
                  <AdminThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>{t("Tema", "Theme")}</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Link
              href="/admin/billing"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
                pathname.startsWith("/admin/billing")
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
              )}
            >
              <CreditCard className="h-[18px] w-[18px] text-[var(--sidebar-muted)]" />
              <span className="flex-1">{t("Meu Plano", "My Plan")}</span>
            </Link>
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
            <div className="flex items-center gap-3 rounded-lg px-3 py-1 text-[13px] text-[var(--sidebar-foreground)]">
              <AdminThemeToggle />
              <span className="text-[var(--sidebar-muted)] text-xs">{t("Tema", "Theme")}</span>
            </div>
          </>
        )}
      </div>
    </div>
    </TooltipProvider>
  )
}
