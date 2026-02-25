"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BarChart3,
  ShoppingCart,
  Tag,
  DollarSign,
  Truck,
  MessageCircle,
  Users,
  Percent,
  Megaphone,
  Store,
  CreditCard,
  ShoppingBag,
  Instagram,
  Search as SearchIcon,
  Music2,
  Pin,
  Layers,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { useState } from "react"

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
      { label: "Home", href: "/admin", icon: <Home className="h-4 w-4" /> },
      { label: "Statistics", href: "/admin/statistics", icon: <BarChart3 className="h-4 w-4" />, children: [
        { label: "Overview", href: "/admin/statistics" },
        { label: "Payments", href: "/admin/statistics/payments" },
        { label: "Shipping", href: "/admin/statistics/shipping" },
        { label: "Products", href: "/admin/statistics/products" },
        { label: "Traffic Sources", href: "/admin/statistics/traffic" },
      ]},
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Sales", href: "/admin/sales", icon: <ShoppingCart className="h-4 w-4" />, children: [
        { label: "Sales List", href: "/admin/sales" },
        { label: "Manual Orders", href: "/admin/sales/manual-orders" },
        { label: "Abandoned Carts", href: "/admin/sales/abandoned-carts" },
      ]},
      { label: "Products", href: "/admin/products", icon: <Tag className="h-4 w-4" />, children: [
        { label: "Product List", href: "/admin/products" },
        { label: "Inventory", href: "/admin/products/inventory" },
        { label: "Categories", href: "/admin/products/categories" },
        { label: "Price Tables", href: "/admin/products/price-tables" },
      ]},
      { label: "Payments", href: "/admin/payments", icon: <DollarSign className="h-4 w-4" /> },
      { label: "Shipping", href: "/admin/shipping", icon: <Truck className="h-4 w-4" /> },
      { label: "Chat", href: "/admin/chat", icon: <MessageCircle className="h-4 w-4" />, badge: "New" },
      { label: "Customers", href: "/admin/customers", icon: <Users className="h-4 w-4" />, children: [
        { label: "Customer List", href: "/admin/customers" },
        { label: "Messages", href: "/admin/customers/messages" },
      ]},
      { label: "Discounts", href: "/admin/discounts", icon: <Percent className="h-4 w-4" />, children: [
        { label: "Coupons", href: "/admin/discounts/coupons" },
        { label: "Free Shipping", href: "/admin/discounts/free-shipping" },
        { label: "Promotions", href: "/admin/discounts/promotions" },
      ]},
      { label: "Marketing", href: "/admin/marketing", icon: <Megaphone className="h-4 w-4" /> },
    ],
  },
  {
    title: "Sales Channels",
    items: [
      { label: "Online Store", href: "/admin/online-store", icon: <Store className="h-4 w-4" />, external: true, children: [
        { label: "Layout", href: "/admin/online-store/layout-theme" },
        { label: "Pages", href: "/admin/online-store/pages" },
        { label: "Blog", href: "/admin/online-store/blog", badge: "New" },
        { label: "Menus", href: "/admin/online-store/menus" },
        { label: "Filters", href: "/admin/online-store/filters" },
        { label: "Social Media Links", href: "/admin/online-store/social-links" },
        { label: "Under Construction", href: "/admin/online-store/under-construction" },
      ]},
      { label: "Point of Sale", href: "/admin/pos", icon: <CreditCard className="h-4 w-4" />, external: true },
      { label: "Instagram & Facebook", href: "/admin/instagram-facebook", icon: <Instagram className="h-4 w-4" /> },
      { label: "Google Shopping", href: "/admin/google-shopping", icon: <SearchIcon className="h-4 w-4" /> },
      { label: "TikTok", href: "/admin/tiktok", icon: <Music2 className="h-4 w-4" /> },
      { label: "Pinterest", href: "/admin/pinterest", icon: <Pin className="h-4 w-4" /> },
      { label: "Marketplaces", href: "/admin/marketplaces", icon: <ShoppingBag className="h-4 w-4" /> },
    ],
  },
  {
    title: "Enhance",
    items: [
      { label: "Apps", href: "/admin/apps", icon: <Layers className="h-4 w-4" /> },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
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
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-card overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#2563EB"/>
            <path d="M8 14C8 10.686 10.686 8 14 8C17.314 8 20 10.686 20 14C20 17.314 17.314 20 14 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="3" fill="white"/>
          </svg>
          <span className="text-base font-semibold text-foreground">fastcart</span>
        </div>
        <button className="ml-auto p-1 text-muted-foreground hover:text-foreground">
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-1">
            {section.title && (
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {section.title}
              </div>
            )}
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
                        "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-primary font-medium"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
                          {item.badge}
                        </span>
                      )}
                      {item.external && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                      {hasChildren && (
                        <span className="text-muted-foreground">
                          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </span>
                      )}
                    </Link>
                  </div>
                  {hasChildren && expanded && (
                    <div className="ml-6 mt-0.5 border-l border-border pl-3">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-sm transition-colors",
                              childActive
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {child.label}
                            {child.badge && (
                              <span className="ml-2 rounded-full border border-primary px-2 py-0.5 text-[10px] font-medium text-primary">
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
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-border px-2 py-2">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/admin/settings")
              ? "bg-accent text-primary font-medium"
              : "text-foreground hover:bg-accent/50"
          )}
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Settings</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  )
}
