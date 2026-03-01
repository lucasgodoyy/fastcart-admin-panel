"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  User,
} from "lucide-react";
import { SaSidebar } from "./sidebar/sa-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

export function SaShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Apply super-admin-theme to <body> so Radix UI portals
  // (DropdownMenu, Select, etc.) rendered outside this tree inherit SA vars
  useEffect(() => {
    document.body.classList.add("super-admin-theme");
    return () => {
      document.body.classList.remove("super-admin-theme");
    };
  }, []);

  return (
    <div className="super-admin-theme min-h-screen bg-[hsl(var(--sa-bg))] text-[hsl(var(--sa-text))]">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] h-[80vh] w-[60vw] rounded-full bg-[hsl(var(--sa-accent))] opacity-[0.02] blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[15%] h-[70vh] w-[50vw] rounded-full bg-[hsl(var(--sa-info))] opacity-[0.015] blur-[100px]" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SaSidebar collapsed={collapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SaSidebar collapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <motion.div
        className="relative flex flex-col min-h-screen"
        animate={{ marginLeft: collapsed ? 72 : 272 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ marginLeft: 272 }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-header))]/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              className="lg:hidden rounded-lg p-2 text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))] hover:text-[hsl(var(--sa-text))]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Collapse toggle */}
            <button
              className="hidden lg:flex items-center justify-center rounded-lg p-2 text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))] hover:text-[hsl(var(--sa-text))] transition-colors"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            {/* Quick search */}
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] px-3 py-1.5 text-[12px] text-[hsl(var(--sa-text-muted))] cursor-pointer hover:border-[hsl(var(--sa-accent))/0.3] transition-colors">
              <Search className="h-3.5 w-3.5" />
              <span>Busca rápida...</span>
              <kbd className="ml-6 rounded bg-[hsl(var(--sa-surface))] px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--sa-text-muted))]">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Platform status indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[hsl(var(--sa-success))/0.2] bg-[hsl(var(--sa-success-subtle))] px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sa-success))] animate-pulse" />
              <span className="text-[10px] font-semibold text-[hsl(var(--sa-success))]">ONLINE</span>
            </div>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-surface-hover))] hover:text-[hsl(var(--sa-text))] transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[hsl(var(--sa-danger))] ring-2 ring-[hsl(var(--sa-header))]" />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[hsl(var(--sa-surface-hover))] transition-colors outline-none">
                  <Avatar className="h-8 w-8 border-2 border-[hsl(var(--sa-accent))/0.3]">
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white text-xs font-bold">
                      {user?.email?.slice(0, 1).toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                      {user?.email?.split("@")[0] || "Admin"}
                    </span>
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Super Admin</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--sa-text-muted))]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-[hsl(var(--sa-border))] bg-[hsl(var(--sa-surface))]"
              >
                <DropdownMenuLabel className="text-[hsl(var(--sa-text-secondary))]">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-[hsl(var(--sa-text))]">{user?.email || "admin@fastcart.com"}</p>
                    <p className="text-xs text-[hsl(var(--sa-text-muted))]">SUPER_ADMIN</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[hsl(var(--sa-border))]" />
                <DropdownMenuItem className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[hsl(var(--sa-border))]" />
                <DropdownMenuItem
                  className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto sa-dot-pattern">
          <motion.div
            key={typeof window !== "undefined" ? window.location.pathname : "shell"}
            {...pageTransition}
            className="p-6 md:p-8 lg:p-10"
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}

export { SaShell as SuperAdminShell };
