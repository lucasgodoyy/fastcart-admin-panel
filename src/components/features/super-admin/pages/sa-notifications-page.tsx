"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import {
  Bell,
  Mail,
  Smartphone,
  AlertTriangle,
  Send,
  BarChart3,
  List,
  Plus,
  Package,
  CreditCard,
  Users,
  Shield,
  Settings,
  ShoppingCart,
  Monitor,
  Loader2,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { superAdminNotificationService } from "@/services/notificationService";
import notificationService from "@/services/notificationService";
import type { NotificationItem, CreateNotificationRequest } from "@/types/super-admin";

// ── Type icon mapping ────────────────────────────────────────
const typeIcon: Record<string, React.ReactNode> = {
  NEW_ORDER: <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />,
  ORDER_PAID: <CreditCard className="h-3.5 w-3.5 text-green-500" />,
  ORDER_SHIPPED: <Package className="h-3.5 w-3.5 text-indigo-500" />,
  ORDER_DELIVERED: <Package className="h-3.5 w-3.5 text-emerald-500" />,
  ORDER_CANCELED: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
  LOW_STOCK: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />,
  OUT_OF_STOCK: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
  PAYMENT_RECEIVED: <CreditCard className="h-3.5 w-3.5 text-green-500" />,
  PAYMENT_FAILED: <CreditCard className="h-3.5 w-3.5 text-red-500" />,
  REFUND_PROCESSED: <CreditCard className="h-3.5 w-3.5 text-orange-500" />,
  NEW_CUSTOMER: <Users className="h-3.5 w-3.5 text-blue-500" />,
  CONTACT_FORM: <Users className="h-3.5 w-3.5 text-purple-500" />,
  NEW_REVIEW: <Users className="h-3.5 w-3.5 text-yellow-500" />,
  SUBSCRIPTION_CHANGE: <CreditCard className="h-3.5 w-3.5 text-indigo-500" />,
  SUBSCRIPTION_EXPIRING: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />,
  SECURITY_ALERT: <Shield className="h-3.5 w-3.5 text-red-500" />,
  SYSTEM_UPDATE: <Settings className="h-3.5 w-3.5 text-blue-500" />,
  SYSTEM_MAINTENANCE: <Settings className="h-3.5 w-3.5 text-yellow-500" />,
};

const tabRoutes: Record<string, string> = {
  overview: "",
  list: "list",
  send: "send",
};

export function SaNotificationsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/notifications", tabRoutes, "overview");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateNotificationRequest>({
    type: "SYSTEM_UPDATE",
    title: "",
    message: "",
    actionUrl: "",
  });
  const queryClient = useQueryClient();

  // ── Stats ──────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["sa-notification-stats"],
    queryFn: () => superAdminNotificationService.getStats(),
  });

  // ── List all ───────────────────────────────────────────────
  const { data: notifData, isLoading } = useQuery({
    queryKey: ["sa-notifications", typeFilter, storeFilter, page],
    queryFn: () =>
      superAdminNotificationService.list({
        type: typeFilter === "ALL" ? undefined : typeFilter,
        storeId: storeFilter.trim() ? Number(storeFilter) : undefined,
        page,
        size: 20,
      }),
    enabled: tab === "list",
  });

  // ── Notification types ─────────────────────────────────────
  const { data: types } = useQuery({
    queryKey: ["notification-types"],
    queryFn: () => notificationService.listTypes(),
  });

  // ── Send ───────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (data: CreateNotificationRequest) => superAdminNotificationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sa-notification-stats"] });
      setForm({ type: "SYSTEM_UPDATE", title: "", message: "", actionUrl: "" });
      setDialogOpen(false);
    },
  });

  // ── Group top 5 types for stats ────────────────────────────
  const topTypes = stats?.countByType
    ? Object.entries(stats.countByType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Notificações"
        description="Monitore, gerencie e envie notificações da plataforma"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))]/90 text-white text-[12px]">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Enviar Notificação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--sa-text))]">Nova Notificação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Tipo</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                        {(types ?? []).map((t) => (
                          <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">ID Loja (opcional)</Label>
                    <Input
                      value={form.storeId ?? ""}
                      onChange={(e) => setForm({ ...form, storeId: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Todas as lojas"
                      className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Título</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Título da notificação"
                    className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Mensagem</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Corpo da notificação"
                    rows={3}
                    className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">URL de Ação (opcional)</Label>
                  <Input
                    value={form.actionUrl ?? ""}
                    onChange={(e) => setForm({ ...form, actionUrl: e.target.value || undefined })}
                    placeholder="/admin/settings"
                    className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>
                <Button
                  onClick={() => sendMutation.mutate(form)}
                  disabled={!form.title || !form.message || sendMutation.isPending}
                  className="w-full bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))]/90 text-white"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total" value={(stats?.totalNotifications ?? 0).toLocaleString("pt-BR")} icon={Bell} color="info" />
        <SaStatCard title="Não Lidas" value={(stats?.unreadNotifications ?? 0).toLocaleString("pt-BR")} icon={Mail} color="warning" />
        <SaStatCard title="Hoje" value={(stats?.todayNotifications ?? 0).toLocaleString("pt-BR")} icon={Send} color="success" />
        <SaStatCard title="Tipos Ativos" value={topTypes.length.toString()} icon={BarChart3} color="accent" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Todas as Notificações
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            {/* Channels */}
            <motion.div variants={fadeInUp}>
              <SaCard>
                <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Canais Ativos</h3>
                <div className="space-y-4">
                  {[
                    { icon: Monitor, title: "Notificação In-App", desc: "Alertas no painel do lojista", active: true },
                    { icon: Mail, title: "E-mail Transacional", desc: "Pedidos, faturas e autenticação via Resend", active: true },
                    { icon: Smartphone, title: "Push Notification", desc: "Em breve — notificações no navegador", active: false },
                  ].map((ch) => (
                    <div key={ch.title} className="flex items-center justify-between border-b border-[hsl(var(--sa-border-subtle))] pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sa-surface-hover))]">
                          <ch.icon className="h-4 w-4 text-[hsl(var(--sa-text-secondary))]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{ch.title}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{ch.desc}</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold ${ch.active ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-text-muted))]"}`}>
                        {ch.active ? "Ativo" : "Em breve"}
                      </span>
                    </div>
                  ))}
                </div>
              </SaCard>
            </motion.div>

            {/* Top types */}
            <motion.div variants={fadeInUp}>
              <SaCard>
                <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Distribuição por Tipo</h3>
                {topTypes.length > 0 ? (
                  <div className="space-y-3">
                    {topTypes.map(([type, count]) => {
                      const total = stats?.totalNotifications || 1;
                      const pct = ((count / total) * 100).toFixed(1);
                      const typeObj = (types ?? []).find((t) => t.code === type);
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {typeIcon[type] ?? <Bell className="h-3.5 w-3.5 text-[hsl(var(--sa-text-muted))]" />}
                              <span className="text-[12px] font-medium text-[hsl(var(--sa-text))]">{typeObj?.label ?? type}</span>
                            </div>
                            <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[hsl(var(--sa-surface-hover))]">
                            <div
                              className="h-full rounded-full bg-[hsl(var(--sa-accent))]"
                              style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-8 text-center">Nenhuma notificação enviada ainda</p>
                )}
              </SaCard>
            </motion.div>

            {/* Notification types catalog */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <SaCard>
                <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Catálogo de Eventos ({(types ?? []).length} tipos)</h3>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {(types ?? []).map((t) => (
                    <div key={t.code} className="flex items-center gap-2.5 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] px-3 py-2.5">
                      {typeIcon[t.code] ?? <Bell className="h-3.5 w-3.5 text-[hsl(var(--sa-text-muted))]" />}
                      <div className="min-w-0">
                        <span className="text-[12px] font-medium text-[hsl(var(--sa-text))] block">{t.label}</span>
                        <span className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">{t.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SaCard>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* ── List ─────────────────────────────────────────── */}
        <TabsContent value="list" className="mt-6 space-y-4">
          <SaCard className="!p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-48 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  {(types ?? []).map((t) => (
                    <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={storeFilter}
                onChange={(e) => { setStoreFilter(e.target.value); setPage(0); }}
                placeholder="ID da Loja"
                className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
              />
            </div>
          </SaCard>

          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Notificações" subtitle={isLoading ? "Carregando..." : `${notifData?.totalElements ?? 0} registro(s)`}>
              {isLoading ? (
                <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Carregando...
                </div>
              ) : notifData && notifData.content.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Tipo</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Título</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Usuário</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifData.content.map((n: NotificationItem, i: number) => (
                        <motion.tr
                          key={n.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {typeIcon[n.type] ?? <Bell className="h-3.5 w-3.5 text-[hsl(var(--sa-text-muted))]" />}
                              <span className="text-[11px] font-mono text-[hsl(var(--sa-accent))]">{n.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className={`text-[12px] ${!n.isRead ? "font-semibold text-[hsl(var(--sa-text))]" : "text-[hsl(var(--sa-text-secondary))]"}`}>
                              {n.title}
                            </p>
                            <p className="text-[11px] text-[hsl(var(--sa-text-muted))] truncate max-w-xs">{n.message}</p>
                          </TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                            {n.storeName || (n.storeId ? `Loja ${n.storeId}` : "—")}
                          </TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                            {n.userEmail || "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              n.isRead
                                ? "bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-muted))]"
                                : "bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]"
                            }`}>
                              {n.isRead ? "Lida" : "Não lida"}
                            </span>
                          </TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">Página {notifData.page + 1} de {Math.max(notifData.totalPages, 1)}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={notifData.first} className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={notifData.last} className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                        Próxima
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <SaEmptyState icon={Bell} title="Nenhuma notificação" description="Nenhuma notificação encontrada com os filtros selecionados" />
              )}
            </SaTableCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
