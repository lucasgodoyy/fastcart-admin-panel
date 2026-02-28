"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, ExternalLink, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { saSidebarSections, type SASidebarItem, type SASidebarSection } from "./sa-sidebar-data";

/* ──────────────── helpers ──────────────── */
const norm = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p || "/");
const isActive = (path: string, href: string) => {
  const c = norm(path), t = norm(href);
  return c === t || c.startsWith(`${t}/`);
};

/* ──────────────── Badge ──────────────── */
function SaBadge({ text, variant = "default" }: { text: string; variant?: string }) {
  const colors: Record<string, string> = {
    default: "bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]",
    success: "bg-[hsl(var(--sa-success-subtle))] text-[hsl(var(--sa-success))]",
    warning: "bg-[hsl(var(--sa-warning-subtle))] text-[hsl(var(--sa-warning))]",
    danger: "bg-[hsl(var(--sa-danger-subtle))] text-[hsl(var(--sa-danger))]",
  };
  return (
    <span className={cn("ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums", colors[variant] ?? colors.default)}>
      {text}
    </span>
  );
}

/* ──────────────── Single nav item ──────────────── */
function NavItem({ item, pathname, expanded, onToggle, collapsed }: {
  item: SASidebarItem; pathname: string; expanded: boolean; onToggle: () => void; collapsed: boolean;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const active = hasChildren
    ? item.children!.some(c => isActive(pathname, c.href)) || isActive(pathname, item.href)
    : isActive(pathname, item.href);

  const content = (
    <motion.div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium cursor-pointer select-none transition-colors duration-200",
        active
          ? "text-white"
          : "text-[hsl(var(--sa-text-secondary))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]"
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active indicator + glow */}
      {active && (
        <motion.div
          layoutId="sa-active-indicator"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--sa-accent))/0.15] to-[hsl(var(--sa-info))/0.08] border border-[hsl(var(--sa-accent))/0.2]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      <Icon className={cn("relative z-10 h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-[hsl(var(--sa-accent))]" : "text-[hsl(var(--sa-text-muted))] group-hover:text-[hsl(var(--sa-text-secondary))]")} />

      {!collapsed && (
        <>
          <span className="relative z-10 flex-1 truncate">{item.title}</span>
          {item.badge && <SaBadge text={item.badge} variant={item.badgeVariant} />}
          {hasChildren && (
            <motion.span
              className="relative z-10 text-[hsl(var(--sa-text-muted))]"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </>
      )}
    </motion.div>
  );

  if (hasChildren) {
    return (
      <div>
        <div onClick={onToggle}>{content}</div>
        <AnimatePresence initial={false}>
          {expanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="ml-[18px] mt-1 space-y-0.5 border-l border-[hsl(var(--sa-border-subtle))] pl-4">
                {item.children!.map(child => {
                  const childActive = isActive(pathname, child.href);
                  return (
                    <Link key={child.href} href={child.href} prefetch={false}>
                      <motion.div
                        className={cn(
                          "relative flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors",
                          childActive
                            ? "text-[hsl(var(--sa-accent))] font-semibold bg-[hsl(var(--sa-accent-subtle))]"
                            : "text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))]"
                        )}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", childActive ? "bg-[hsl(var(--sa-accent))]" : "bg-[hsl(var(--sa-border))]")} />
                        <span className="truncate">{child.title}</span>
                        {child.badge && <SaBadge text={child.badge} variant="warning" />}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href} prefetch={false}>{content}</Link>
  );
}

/* ──────────────── Section ──────────────── */
function NavSection({ section, pathname, expandedKeys, toggle, collapsed }: {
  section: SASidebarSection; pathname: string; expandedKeys: Set<string>; toggle: (k: string) => void; collapsed: boolean;
}) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--sa-text-muted))]"
        >
          {section.label}
        </motion.div>
      )}
      {collapsed && <div className="my-2 mx-3 h-px bg-[hsl(var(--sa-border-subtle))]" />}
      <div className="space-y-0.5">
        {section.items.map(item => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            expanded={expandedKeys.has(item.title)}
            onToggle={() => toggle(item.title)}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────── MAIN SIDEBAR ──────────────── */
export function SaSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [expandedKeys, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const autoExpandedKeys = useMemo(() => {
    const autoExpand = new Set<string>();
    for (const section of saSidebarSections) {
      for (const item of section.items) {
        if (item.children?.some(child => isActive(pathname, child.href)) || isActive(pathname, item.href)) {
          autoExpand.add(item.title);
        }
      }
    }
    return autoExpand;
  }, [pathname]);

  const mergedExpandedKeys = useMemo(() => {
    return new Set([...expandedKeys, ...autoExpandedKeys]);
  }, [expandedKeys, autoExpandedKeys]);

  const toggle = useCallback((key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // filter sections by search
  const filteredSections = useMemo(() => {
    if (!search.trim()) return saSidebarSections;
    const q = search.toLowerCase();
    return saSidebarSections
      .map(s => ({
        ...s,
        items: s.items.filter(
          i =>
            i.title.toLowerCase().includes(q) ||
            i.children?.some(c => c.title.toLowerCase().includes(q))
        ),
      }))
      .filter(s => s.items.length > 0);
  }, [search]);

  return (
    <motion.aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-sidebar))]",
        "transition-[width] duration-300 ease-in-out"
      )}
      animate={{ width: collapsed ? 72 : 272 }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--sa-border-subtle))] px-5">
        <motion.div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] shadow-lg shadow-[hsl(var(--sa-accent))/0.2]"
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield className="h-5 w-5 text-white" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <Link href="/super-admin" className="flex flex-col">
              <span className="text-[14px] font-bold text-[hsl(var(--sa-text))]">FastCart</span>
              <span className="text-[10px] font-medium text-[hsl(var(--sa-text-muted))]">Super Admin</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--sa-text-muted))]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar no menu..."
              className="w-full rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] py-2 pl-9 pr-8 text-[12px] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))] outline-none focus:border-[hsl(var(--sa-accent))] focus:ring-1 focus:ring-[hsl(var(--sa-accent))/0.3] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredSections.map(section => (
          <NavSection
            key={section.label}
            section={section}
            pathname={pathname}
            expandedKeys={mergedExpandedKeys}
            toggle={toggle}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom link to merchant panel */}
      <div className="border-t border-[hsl(var(--sa-border-subtle))] px-3 py-3">
        <Link href="/admin" prefetch={false}>
          <motion.div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
            whileHover={{ x: 2 }}
          >
            <ExternalLink className="h-4 w-4" />
            {!collapsed && <span>Painel do Lojista</span>}
          </motion.div>
        </Link>
      </div>
    </motion.aside>
  );
}
