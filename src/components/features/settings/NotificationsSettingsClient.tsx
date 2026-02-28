"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Mail,
  Smartphone,
  Monitor,
  Package,
  CreditCard,
  Users,
  Shield,
  Settings,
  AlertTriangle,
  ShoppingCart,
  Filter,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import notificationService from "@/services/notificationService";
import type { NotificationItem, NotificationPreference } from "@/types/super-admin";

// ── Type icon mapping ────────────────────────────────────────
const typeIcon: Record<string, React.ReactNode> = {
  NEW_ORDER: <ShoppingCart className="h-4 w-4 text-blue-500" />,
  ORDER_PAID: <CreditCard className="h-4 w-4 text-green-500" />,
  ORDER_SHIPPED: <Package className="h-4 w-4 text-indigo-500" />,
  ORDER_DELIVERED: <Package className="h-4 w-4 text-emerald-500" />,
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

const categoryLabels: Record<string, string> = {
  ORDERS: "Pedidos",
  INVENTORY: "Estoque",
  FINANCE: "Financeiro",
  CUSTOMERS: "Clientes",
  BILLING: "Assinatura",
  SECURITY: "Segurança",
  SYSTEM: "Sistema",
};

type Tab = "all" | "preferences";

export function NotificationsSettingsClient() {
  const [tab, setTab] = useState<Tab>("all");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  // ── Notifications list ────────────────────────────────────
  const { data: notificationsData, isLoading: isLoadingList } = useQuery({
    queryKey: ["admin-notifications", typeFilter, unreadOnly, page],
    queryFn: () =>
      notificationService.list({
        type: typeFilter === "ALL" ? undefined : typeFilter,
        unreadOnly: unreadOnly || undefined,
        page,
        size: 20,
      }),
    enabled: tab === "all",
  });

  // ── Preferences ────────────────────────────────────────────
  const { data: preferences, isLoading: isLoadingPrefs } = useQuery({
    queryKey: ["admin-notification-preferences"],
    queryFn: () => notificationService.getPreferences(),
    enabled: tab === "preferences",
  });

  // ── Notification types ────────────────────────────────────
  const { data: types } = useQuery({
    queryKey: ["notification-types"],
    queryFn: () => notificationService.listTypes(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const updatePrefMutation = useMutation({
    mutationFn: notificationService.updatePreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-preferences"] });
    },
  });

  // ── Group preferences by category ────────────────────────
  const groupedPreferences = (preferences ?? []).reduce<Record<string, NotificationPreference[]>>((acc, pref) => {
    const cat = pref.typeCategory || "GENERAL";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pref);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Notificações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas notificações e defina como deseja ser avisado sobre eventos da loja.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {[
          { key: "all" as Tab, label: "Todas", icon: <Bell className="h-3.5 w-3.5" /> },
          { key: "preferences" as Tab, label: "Preferências", icon: <Settings className="h-3.5 w-3.5" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── All Notifications ──────────────────────────────── */}
      {tab === "all" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  {(types ?? []).map((t) => (
                    <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={unreadOnly ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => { setUnreadOnly(!unreadOnly); setPage(0); }}
              >
                Não lidas
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-3 w-3" />
              Marcar todas como lidas
            </Button>
          </div>

          {/* List */}
          {isLoadingList ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notificationsData && notificationsData.content.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
              {notificationsData.content.map((n: NotificationItem) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !n.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (!n.isRead) markReadMutation.mutate(n.id);
                  }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {typeIcon[n.type] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold" : ""}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-lg">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação encontrada</p>
            </div>
          )}

          {/* Pagination */}
          {notificationsData && notificationsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {notificationsData.page + 1} de {notificationsData.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7" disabled={notificationsData.first} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" disabled={notificationsData.last} onClick={() => setPage((p) => p + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Preferences ────────────────────────────────────── */}
      {tab === "preferences" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Escolha como deseja ser notificado para cada tipo de evento. As preferências são salvas automaticamente.
            </p>
          </div>

          {isLoadingPrefs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Channel legend */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5" /> No painel</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail</span>
                <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Push</span>
              </div>

              {Object.entries(groupedPreferences).map(([category, prefs]) => (
                <div key={category} className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {categoryLabels[category] ?? category}
                  </h3>
                  <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                    {prefs.map((pref) => (
                      <div key={pref.notificationType} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            {typeIcon[pref.notificationType] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{pref.typeLabel}</p>
                            {pref.typeDescription && (
                              <p className="text-[11px] text-muted-foreground truncate">{pref.typeDescription}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-5 shrink-0 ml-4">
                          {/* In-App */}
                          <div className="flex flex-col items-center gap-1">
                            <Monitor className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={pref.channelInApp}
                              onCheckedChange={(checked) =>
                                updatePrefMutation.mutate({
                                  notificationType: pref.notificationType,
                                  channelInApp: checked,
                                  channelEmail: pref.channelEmail,
                                  channelPush: pref.channelPush,
                                })
                              }
                            />
                          </div>
                          {/* Email */}
                          <div className="flex flex-col items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={pref.channelEmail}
                              onCheckedChange={(checked) =>
                                updatePrefMutation.mutate({
                                  notificationType: pref.notificationType,
                                  channelInApp: pref.channelInApp,
                                  channelEmail: checked,
                                  channelPush: pref.channelPush,
                                })
                              }
                            />
                          </div>
                          {/* Push */}
                          <div className="flex flex-col items-center gap-1">
                            <Smartphone className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={pref.channelPush}
                              onCheckedChange={(checked) =>
                                updatePrefMutation.mutate({
                                  notificationType: pref.notificationType,
                                  channelInApp: pref.channelInApp,
                                  channelEmail: pref.channelEmail,
                                  channelPush: checked,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
