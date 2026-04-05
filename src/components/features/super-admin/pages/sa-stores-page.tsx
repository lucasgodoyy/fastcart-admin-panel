"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  ExternalLink,
  MoreHorizontal,
  Globe,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  Loader2,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { superAdminService } from "@/services/super-admin";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import type { StoreSummary } from "@/types/super-admin";

export function SaStoresPage() {
  const [tab, setTab] = useTabFromPath(
    "/super-admin/stores",
    { stores: "", approvals: "approvals", performance: "performance" },
    "stores"
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreSummary | null>(null);
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("welcome");
  const [emailForm, setEmailForm] = useState({ to: "", subject: "", bodyHtml: "" });
  const queryClient = useQueryClient();
  const router = useRouter();

  const PRESET_TEMPLATES: Record<string, { subject: string; bodyHtml: string }> = {
    welcome: {
      subject: "Bem-vindo(a) a Lojaki!",
      bodyHtml: "<p>Olá!</p><p>Seu painel está pronto para vender mais.</p><p>Conte com nosso time para acelerar seus resultados.</p>",
    },
    order_updates: {
      subject: "Ative os e-mails automáticos da sua loja",
      bodyHtml: "<p>Olá!</p><p>Configure os e-mails de pedido pago, envio e entrega para melhorar sua conversão e suporte.</p>",
    },
    growth: {
      subject: "Novos recursos para aumentar suas vendas",
      bodyHtml: "<p>Olá!</p><p>Liberamos novos recursos de marketing e recuperação de carrinho para sua loja.</p>",
    },
  };

  const { data: overview } = useQuery({
    queryKey: ["super-admin-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: storesData, isLoading } = useQuery({
    queryKey: ["sa-stores", tab, statusFilter, search, page],
    queryFn: () =>
      superAdminService.listStores({
        status:
          tab === "approvals"
            ? "INACTIVE"
            : statusFilter !== "ALL" ? statusFilter : undefined,
        search: tab === "performance" ? undefined : (search || undefined),
        page: tab === "performance" ? 0 : page,
        size: tab === "performance" ? 100 : 20,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (storeId: number) => superAdminService.toggleStoreStatus(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-stores"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-overview"] });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: () => superAdminService.sendPlatformEmail(emailForm),
    onSuccess: () => {
      setEmailDialogOpen(false);
      setSelectedStore(null);
      setUseCustomMessage(false);
      setEmailTemplate("welcome");
      setEmailForm({ to: "", subject: "", bodyHtml: "" });
    },
  });

  const openEmailDialog = (store: StoreSummary) => {
    const base = PRESET_TEMPLATES.welcome;
    setSelectedStore(store);
    setUseCustomMessage(false);
    setEmailTemplate("welcome");
    setEmailForm({
      to: store.email || "",
      subject: base.subject,
      bodyHtml: base.bodyHtml,
    });
    setEmailDialogOpen(true);
  };

  const stores = storesData?.content ?? [];
  const totalPages = storesData?.totalPages ?? 0;
  const fmt = (n?: number) => (n ?? 0).toLocaleString("pt-BR");

  return (
    <div className="space-y-8">
      <SaPageHeader title="Gerenciamento de Lojas" description="Visualize e gerencie todas as lojas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Lojas" value={fmt(overview?.totalStores)} icon={Building2} color="accent" />
        <SaStatCard title="Lojas Ativas" value={fmt(overview?.activeStores)} icon={CheckCircle} color="success" />
        <SaStatCard title="Em Trial" value={fmt((overview?.totalStores ?? 0) - (overview?.activeStores ?? 0))} icon={AlertTriangle} color="warning" />
        <SaStatCard title="Resultados" value={fmt(storesData?.totalElements)} icon={TrendingUp} color="info" subtitle="Nesta busca" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-lg p-1 h-auto">
          <TabsTrigger value="stores" className="rounded-md data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px] px-4 py-1.5">
            Todas as Lojas
          </TabsTrigger>
          <TabsTrigger value="approvals" className="rounded-md data-[state=active]:bg-[hsl(var(--sa-warning))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px] px-4 py-1.5">
            Aprovações
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-md data-[state=active]:bg-[hsl(var(--sa-success))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px] px-4 py-1.5">
            Performance
          </TabsTrigger>
        </TabsList>

        {/* ── TODAS AS LOJAS ── */}
        <TabsContent value="stores" className="space-y-4">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard className="p-4!">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
                  <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar loja por nome ou slug..." className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]" />
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SaCard>
          </motion.div>

          {/* -- Tabela de lojas -- */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard className="p-0! overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg-secondary))]">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Loja</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Status</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Plano</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Produtos</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Pedidos</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Receita</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr
                        key={store.id}
                        onClick={() => router.push(`/super-admin/stores/${store.id}`)}
                        className="border-b border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors cursor-pointer"
                      >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-accent))] font-bold text-sm">
                          {store.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))] truncate">{store.name}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] truncate">/{store.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <SaStatusBadge status={store.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] font-medium text-[hsl(var(--sa-text-secondary))] bg-[hsl(var(--sa-surface-hover))] rounded-full px-2.5 py-1">
                        {store.planName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-medium text-[hsl(var(--sa-text))]">{store.productsCount}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-medium text-[hsl(var(--sa-text))]">{store.ordersCount}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-bold text-[hsl(var(--sa-success))]">
                        R$ {(store.paidRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                          <DropdownMenuItem
                            onClick={() => router.push(`/super-admin/stores/${store.id}`)}
                            className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleMutation.mutate(store.id)}
                            className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer gap-2"
                          >
                            <Ban className="h-3.5 w-3.5" /> {store.status === "ACTIVE" ? "Suspender" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEmailDialog(store)}
                            className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"
                          >
                            <Mail className="h-3.5 w-3.5" /> Enviar e-mail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[hsl(var(--sa-border-subtle))] px-5 py-3">
              <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                Página {page + 1} de {totalPages} · {storesData?.totalElements ?? 0} lojas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 px-2 text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))]"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 px-2 text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))]"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
            </SaCard>
          </motion.div>
          {stores.length === 0 && !isLoading && (
            <SaEmptyState icon={Building2} title="Nenhuma loja encontrada" description="Tente ajustar os filtros de busca" />
          )}
        </TabsContent>

        {/* ── APROVAÇÕES ── */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="mb-2 flex items-center gap-2 px-1">
            <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">
              Lojas inativas aguardando ativação. Revise e ative conforme necessário.
            </p>
          </div>
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard className="p-0! overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg-secondary))]">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Loja</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Plano</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Cadastro</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id} className="border-b border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--sa-warning-subtle))] text-[hsl(var(--sa-warning))] font-bold text-sm">
                              {store.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{store.name}</p>
                              <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{store.email ?? `/${store.slug}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[12px] font-medium text-[hsl(var(--sa-text-secondary))] bg-[hsl(var(--sa-surface-hover))] rounded-full px-2.5 py-1">
                            {store.planName || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[hsl(var(--sa-text-muted))]">
                          {new Date(store.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button
                            size="sm"
                            className="bg-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/90 text-white rounded-lg gap-1.5 text-[11px]"
                            onClick={() => toggleMutation.mutate(store.id)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Ativar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {stores.length === 0 && !isLoading && (
                <SaEmptyState icon={CheckCircle} title="Nenhuma loja para aprovar" description="Todas as lojas estão ativas" />
              )}
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* ── PERFORMANCE ── */}
        <TabsContent value="performance" className="space-y-4">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard className="p-0! overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg-secondary))]">
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] w-10">#</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Loja</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Receita</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Pedidos</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Produtos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stores]
                      .sort((a, b) => (b.paidRevenue ?? 0) - (a.paidRevenue ?? 0))
                      .map((store, idx) => {
                        const maxRev = Math.max(...stores.map((s) => s.paidRevenue ?? 0), 1);
                        const pct = Math.round(((store.paidRevenue ?? 0) / maxRev) * 100);
                        return (
                          <tr
                            key={store.id}
                            onClick={() => router.push(`/super-admin/stores/${store.id}`)}
                            className="border-b border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors cursor-pointer"
                          >
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                                  idx === 0
                                    ? "bg-[hsl(var(--sa-warning))] text-white"
                                    : idx === 1
                                    ? "bg-[hsl(var(--sa-text-muted))] text-white"
                                    : idx === 2
                                    ? "bg-amber-600 text-white"
                                    : "bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-muted))]"
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{store.name}</p>
                              <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">/{store.slug}</p>
                            </td>
                            <td className="px-5 py-4 min-w-45">
                              <p className="text-[13px] font-bold text-[hsl(var(--sa-success))] mb-1">
                                R$ {(store.paidRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                              <div className="h-1.5 w-full rounded-full bg-[hsl(var(--sa-surface-hover))]">
                                <div className="h-1.5 rounded-full bg-[hsl(var(--sa-success))]" style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right text-[13px] font-medium text-[hsl(var(--sa-text))]">{store.ordersCount}</td>
                            <td className="px-5 py-4 text-right text-[13px] font-medium text-[hsl(var(--sa-text))]">{store.productsCount}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              {stores.length === 0 && !isLoading && (
                <SaEmptyState icon={TrendingUp} title="Sem dados de performance" description="Nenhuma loja encontrada" />
              )}
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Enviar e-mail para lojista
            </DialogTitle>
            <DialogDescription>
              Escolha um template pronto ou escreva uma mensagem personalizada para {selectedStore?.name ?? "a loja"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Destinatario</Label>
              <Input
                type="email"
                value={emailForm.to}
                onChange={(e) => setEmailForm((p) => ({ ...p, to: e.target.value }))}
                placeholder="lojista@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Modo</Label>
              <div className="flex gap-2">
                <Button
                  variant={!useCustomMessage ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const preset = PRESET_TEMPLATES[emailTemplate] ?? PRESET_TEMPLATES.welcome;
                    setUseCustomMessage(false);
                    setEmailForm((p) => ({ ...p, subject: preset.subject, bodyHtml: preset.bodyHtml }));
                  }}
                >
                  Template
                </Button>
                <Button
                  variant={useCustomMessage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomMessage(true)}
                >
                  Personalizado
                </Button>
              </div>
            </div>

            {!useCustomMessage && (
              <div className="space-y-1.5">
                <Label>Template</Label>
                <Select
                  value={emailTemplate}
                  onValueChange={(value) => {
                    const preset = PRESET_TEMPLATES[value] ?? PRESET_TEMPLATES.welcome;
                    setEmailTemplate(value);
                    setEmailForm((p) => ({ ...p, subject: preset.subject, bodyHtml: preset.bodyHtml }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Boas-vindas</SelectItem>
                    <SelectItem value="order_updates">Setup de e-mails de pedido</SelectItem>
                    <SelectItem value="growth">Novidades de crescimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Assunto</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Assunto do e-mail"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Conteudo HTML</Label>
              <textarea
                className="w-full h-40 p-3 text-xs font-mono bg-background border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                value={emailForm.bodyHtml}
                onChange={(e) => setEmailForm((p) => ({ ...p, bodyHtml: e.target.value }))}
                placeholder="<p>Mensagem para a loja</p>"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => sendEmailMutation.mutate()}
                disabled={sendEmailMutation.isPending || !emailForm.to || !emailForm.subject || !emailForm.bodyHtml}
              >
                {sendEmailMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
