"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, ExternalLink, Package, CreditCard, Users, Shield, Settings, AlertTriangle, ShoppingCart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import notificationService from "@/services/notificationService";
import type { NotificationItem } from "@/types/super-admin";

const typeIconMap: Record<string, React.ReactNode> = {
  NEW_ORDER: <ShoppingCart className="h-4 w-4 text-blue-500" />,
  ORDER_PAID: <CreditCard className="h-4 w-4 text-green-500" />,
  ORDER_SHIPPED: <Package className="h-4 w-4 text-indigo-500" />,
  ORDER_DELIVERED: <Check className="h-4 w-4 text-emerald-500" />,
  ORDER_CANCELED: <AlertTriangle className="h-4 w-4 text-red-500" />,
  LOW_STOCK: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  OUT_OF_STOCK: <AlertTriangle className="h-4 w-4 text-red-500" />,
  PAYMENT_RECEIVED: <CreditCard className="h-4 w-4 text-green-500" />,
  PAYMENT_FAILED: <CreditCard className="h-4 w-4 text-red-500" />,
  REFUND_PROCESSED: <CreditCard className="h-4 w-4 text-orange-500" />,
  NEW_CUSTOMER: <Users className="h-4 w-4 text-blue-500" />,
  CONTACT_FORM: <Users className="h-4 w-4 text-purple-500" />,
  NEW_REVIEW: <Users className="h-4 w-4 text-yellow-500" />,
  SUBSCRIPTION_CHANGE: <CreditCard className="h-4 w-4 text-indigo-500" />,
  SUBSCRIPTION_EXPIRING: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  SECURITY_ALERT: <Shield className="h-4 w-4 text-red-500" />,
  SYSTEM_UPDATE: <Settings className="h-4 w-4 text-blue-500" />,
  SYSTEM_MAINTENANCE: <Settings className="h-4 w-4 text-yellow-500" />,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Unread count (polls every 30s)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  // Recent notifications (only when dropdown is open)
  const { data: recentNotifications } = useQuery({
    queryKey: ["notifications-recent"],
    queryFn: () => notificationService.list({ page: 0, size: 8 }),
    enabled: open,
    staleTime: 5_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
    },
  });

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const notifications = recentNotifications?.content ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-muted transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification: NotificationItem) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  {/* Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {typeIconMap[notification.type] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12px] leading-snug ${!notification.isRead ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/admin/settings/notifications"
              className="block text-center text-[12px] font-medium text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Ver todas as notificações
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
