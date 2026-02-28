"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Link2,
  DollarSign,
  TrendingUp,
  Percent,
  Copy,
  Plus,
  Check,
  X,
  Loader2,
  Settings,
  BarChart3,
  CreditCard,
  MousePointerClick,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import affiliateService from "@/services/affiliateService";
import type {
  CreateAffiliateRequest,
  CreateAffiliateLinkRequest,
  CreateAffiliatePayoutRequest,
  UpdateAffiliateSettingsRequest,
} from "@/types/affiliate";

// ── Helpers ──────────────────────────────────────────────────

function currency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(s: string) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ACTIVE: { label: "Ativo", variant: "default" },
    PENDING: { label: "Pendente", variant: "secondary" },
    SUSPENDED: { label: "Suspenso", variant: "destructive" },
    REJECTED: { label: "Rejeitado", variant: "destructive" },
    APPROVED: { label: "Aprovado", variant: "default" },
    PAID: { label: "Pago", variant: "default" },
    PROCESSING: { label: "Processando", variant: "secondary" },
    CANCELED: { label: "Cancelado", variant: "destructive" },
  };
  const m = map[s] || { label: s, variant: "outline" as const };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ── Main Component ───────────────────────────────────────────

export function AffiliatesClient() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Afiliados</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seu programa de afiliados, parceiros, comissões e pagamentos.
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-1" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="affiliates">
            <Users className="h-4 w-4 mr-1" /> Afiliados
          </TabsTrigger>
          <TabsTrigger value="links">
            <Link2 className="h-4 w-4 mr-1" /> Links
          </TabsTrigger>
          <TabsTrigger value="conversions">
            <MousePointerClick className="h-4 w-4 mr-1" /> Conversões
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <CreditCard className="h-4 w-4 mr-1" /> Pagamentos
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" /> Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="affiliates" className="mt-6">
          <AffiliatesTab />
        </TabsContent>
        <TabsContent value="links" className="mt-6">
          <LinksTab />
        </TabsContent>
        <TabsContent value="conversions" className="mt-6">
          <ConversionsTab />
        </TabsContent>
        <TabsContent value="payouts" className="mt-6">
          <PayoutsTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Dashboard Tab
// ═══════════════════════════════════════════════════════════════

function DashboardTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["affiliate-stats"],
    queryFn: affiliateService.getStats,
  });

  if (isLoading) return <LoadingState />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Afiliados Ativos" value={stats.activeAffiliates} icon={<Users className="h-4 w-4" />} sub={`${stats.pendingAffiliates} pendente(s)`} />
        <StatCard title="Receita de Afiliados" value={currency(stats.totalRevenue)} icon={<DollarSign className="h-4 w-4" />} sub={`${stats.totalConversions} conversões`} />
        <StatCard title="Comissão Pendente" value={currency(stats.pendingCommission)} icon={<TrendingUp className="h-4 w-4" />} sub={`${currency(stats.paidCommission)} já pago`} />
        <StatCard title="Taxa de Conversão" value={`${stats.conversionRate.toFixed(1)}%`} icon={<Percent className="h-4 w-4" />} sub={`${stats.totalClicks} cliques`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopAffiliatesCard />
        <RecentConversionsCard />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub }: { title: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function TopAffiliatesCard() {
  const { data } = useQuery({
    queryKey: ["affiliate-list-top"],
    queryFn: () => affiliateService.list({ status: "ACTIVE", size: 5 }),
  });

  const items = data?.content || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Afiliados</CardTitle>
        <CardDescription>Por receita gerada</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum afiliado ativo ainda.</p>
        ) : (
          <div className="space-y-3">
            {items
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .map((a, i) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.referralCode}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{currency(a.totalRevenue)}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentConversionsCard() {
  const { data } = useQuery({
    queryKey: ["affiliate-conversions-recent"],
    queryFn: () => affiliateService.listConversions({ size: 5 }),
  });

  const items = data?.content || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversões Recentes</CardTitle>
        <CardDescription>Últimas vendas via afiliados</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma conversão registrada.</p>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{c.affiliateName}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(c.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{currency(c.orderAmount)}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">+{currency(c.commissionAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Affiliates Tab
// ═══════════════════════════════════════════════════════════════

function AffiliatesTab() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["affiliates", statusFilter, page],
    queryFn: () =>
      affiliateService.list({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
  });

  const createMut = useMutation({
    mutationFn: affiliateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
      toast.success("Afiliado criado com sucesso!");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao criar afiliado."),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Parameters<typeof affiliateService.update>[1] }) =>
      affiliateService.update(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
      toast.success("Afiliado atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar."),
  });

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const req: CreateAffiliateRequest = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      document: (fd.get("document") as string) || undefined,
      referralCode: (fd.get("referralCode") as string) || undefined,
      commissionRate: fd.get("commissionRate") ? Number(fd.get("commissionRate")) : undefined,
      pixKey: (fd.get("pixKey") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    createMut.mutate(req);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Ativos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="SUSPENDED">Suspensos</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo Afiliado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Afiliado</DialogTitle>
              <DialogDescription>Cadastre um novo parceiro afiliado.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CPF / CNPJ</Label>
                  <Input id="document" name="document" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralCode">Código (auto se vazio)</Label>
                  <Input id="referralCode" name="referralCode" placeholder="Ex: MARIA10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Comissão %</Label>
                  <Input id="commissionRate" name="commissionRate" type="number" step="0.01" placeholder="Padrão da loja" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input id="pixKey" name="pixKey" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Criar Afiliado
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Nenhum afiliado encontrado." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CopyCode code={a.referralCode} />
                    </TableCell>
                    <TableCell className="text-sm">{a.commissionRate}%</TableCell>
                    <TableCell className="text-sm">{a.totalClicks.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{a.totalOrders}</TableCell>
                    <TableCell className="text-sm font-semibold text-green-600 dark:text-green-400">{currency(a.totalRevenue)}</TableCell>
                    <TableCell>{statusLabel(a.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === "PENDING" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Aprovar"
                            onClick={() => updateMut.mutate({ id: a.id, data: { status: "ACTIVE" } })}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {a.status === "ACTIVE" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Suspender"
                            onClick={() => updateMut.mutate({ id: a.id, data: { status: "SUSPENDED" } })}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        {a.status === "SUSPENDED" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Reativar"
                            onClick={() => updateMut.mutate({ id: a.id, data: { status: "ACTIVE" } })}
                          >
                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                {page + 1} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Próximo
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Links Tab
// ═══════════════════════════════════════════════════════════════

function LinksTab() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-links"],
    queryFn: () => affiliateService.listLinks({ size: 50 }),
  });

  const { data: affiliatesData } = useQuery({
    queryKey: ["affiliates-for-select"],
    queryFn: () => affiliateService.list({ status: "ACTIVE", size: 100 }),
  });

  const createMut = useMutation({
    mutationFn: affiliateService.createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-links"] });
      toast.success("Link criado com sucesso!");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao criar link."),
  });

  const items = data?.content || [];
  const affiliates = affiliatesData?.content || [];

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const req: CreateAffiliateLinkRequest = {
      affiliateId: Number(fd.get("affiliateId")),
      slug: fd.get("slug") as string,
      destinationUrl: fd.get("destinationUrl") as string,
      utmSource: (fd.get("utmSource") as string) || undefined,
      utmMedium: (fd.get("utmMedium") as string) || undefined,
      utmCampaign: (fd.get("utmCampaign") as string) || undefined,
    };
    createMut.mutate(req);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Link de Afiliado</DialogTitle>
              <DialogDescription>Crie um link rastreável para um afiliado.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="affiliateId">Afiliado *</Label>
                <Select name="affiliateId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliates.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name} ({a.referralCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" required placeholder="promo-verao" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationUrl">URL de destino *</Label>
                  <Input id="destinationUrl" name="destinationUrl" required placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmSource">UTM Source</Label>
                  <Input id="utmSource" name="utmSource" placeholder="affiliate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmMedium">UTM Medium</Label>
                  <Input id="utmMedium" name="utmMedium" placeholder="referral" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="utmCampaign">UTM Campaign</Label>
                  <Input id="utmCampaign" name="utmCampaign" placeholder="verao-2026" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Criar Link
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Nenhum link criado ainda." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>URL de Destino</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>Conversões</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm font-medium">{l.affiliateName}</TableCell>
                    <TableCell>
                      <CopyCode code={l.slug} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{l.destinationUrl}</TableCell>
                    <TableCell className="text-sm">{l.totalClicks.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm font-semibold">{l.totalConversions}</TableCell>
                    <TableCell>
                      <Badge variant={l.active ? "default" : "secondary"}>{l.active ? "Ativo" : "Inativo"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Conversions Tab
// ═══════════════════════════════════════════════════════════════

function ConversionsTab() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-conversions", statusFilter, page],
    queryFn: () =>
      affiliateService.listConversions({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
  });

  const approveMut = useMutation({
    mutationFn: affiliateService.approveConversion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
      toast.success("Conversão aprovada!");
    },
    onError: () => toast.error("Erro ao aprovar conversão."),
  });

  const rejectMut = useMutation({
    mutationFn: (id: number) => affiliateService.rejectConversion(id, "Rejeitado pelo admin"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-conversions"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
      toast.success("Conversão rejeitada.");
    },
    onError: () => toast.error("Erro ao rejeitar conversão."),
  });

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-4">
      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          <SelectItem value="PENDING">Pendentes</SelectItem>
          <SelectItem value="APPROVED">Aprovadas</SelectItem>
          <SelectItem value="REJECTED">Rejeitadas</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Nenhuma conversão encontrada." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Valor do Pedido</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm font-medium">{c.affiliateName}</TableCell>
                    <TableCell className="text-sm">{currency(c.orderAmount)}</TableCell>
                    <TableCell className="text-sm">{c.commissionRate}%</TableCell>
                    <TableCell className="text-sm font-semibold text-green-600 dark:text-green-400">{currency(c.commissionAmount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(c.createdAt)}</TableCell>
                    <TableCell>{statusLabel(c.status)}</TableCell>
                    <TableCell className="text-right">
                      {c.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Aprovar"
                            disabled={approveMut.isPending}
                            onClick={() => approveMut.mutate(c.id)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Rejeitar"
                            disabled={rejectMut.isPending}
                            onClick={() => rejectMut.mutate(c.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-xs text-muted-foreground">{page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Payouts Tab
// ═══════════════════════════════════════════════════════════════

function PayoutsTab() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-payouts", statusFilter, page],
    queryFn: () =>
      affiliateService.listPayouts({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
  });

  const { data: affiliatesData } = useQuery({
    queryKey: ["affiliates-for-payout-select"],
    queryFn: () => affiliateService.list({ status: "ACTIVE", size: 100 }),
  });

  const createMut = useMutation({
    mutationFn: affiliateService.createPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
      toast.success("Pagamento criado com sucesso!");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao criar pagamento."),
  });

  const markPaidMut = useMutation({
    mutationFn: affiliateService.markPayoutPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
      toast.success("Pagamento marcado como pago!");
    },
    onError: () => toast.error("Erro ao atualizar pagamento."),
  });

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const affiliates = affiliatesData?.content || [];

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const req: CreateAffiliatePayoutRequest = {
      affiliateId: Number(fd.get("affiliateId")),
      amount: Number(fd.get("amount")),
      method: (fd.get("method") as string) || undefined,
      reference: (fd.get("reference") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    createMut.mutate(req);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="PROCESSING">Processando</SelectItem>
            <SelectItem value="PAID">Pagos</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
              <DialogDescription>Registre um pagamento para um afiliado.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pay-affiliateId">Afiliado *</Label>
                <Select name="affiliateId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliates.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name} — {currency(a.totalCommission)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Método</Label>
                  <Select name="method" defaultValue="PIX">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referência / Comprovante</Label>
                <Input id="reference" name="reference" placeholder="ID da transação" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-notes">Observações</Label>
                <Textarea id="pay-notes" name="notes" rows={2} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Criar Pagamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Nenhum pagamento encontrado." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm font-medium">{p.affiliateName}</TableCell>
                    <TableCell className="text-sm font-semibold">{currency(p.amount)}</TableCell>
                    <TableCell className="text-sm">{p.method === "PIX" ? "PIX" : p.method === "BANK_TRANSFER" ? "Transferência" : p.method}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.reference || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                    <TableCell>{statusLabel(p.status)}</TableCell>
                    <TableCell className="text-right">
                      {p.status !== "PAID" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={markPaidMut.isPending}
                          onClick={() => markPaidMut.mutate(p.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Marcar Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-xs text-muted-foreground">{page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Settings Tab
// ═══════════════════════════════════════════════════════════════

function SettingsTab() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["affiliate-settings"],
    queryFn: affiliateService.getSettings,
  });

  const updateMut = useMutation({
    mutationFn: affiliateService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar configurações."),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const req: UpdateAffiliateSettingsRequest = {
      enabled: fd.get("enabled") === "on",
      commissionRate: Number(fd.get("commissionRate")),
      cookieDays: Number(fd.get("cookieDays")),
      minPayout: Number(fd.get("minPayout")),
      payoutDay: Number(fd.get("payoutDay")),
      autoApprove: fd.get("autoApprove") === "on",
      termsUrl: (fd.get("termsUrl") as string) || undefined,
    };
    updateMut.mutate(req);
  }

  if (isLoading) return <LoadingState />;
  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Programa</CardTitle>
        <CardDescription>Defina as regras do seu programa de afiliados.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">Programa Ativo</p>
              <p className="text-xs text-muted-foreground">Ativar ou desativar o programa de afiliados.</p>
            </div>
            <Switch name="enabled" defaultChecked={settings.enabled} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Comissão Padrão (%)</Label>
              <Input id="commissionRate" name="commissionRate" type="number" step="0.01" defaultValue={settings.commissionRate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookieDays">Duração do Cookie (dias)</Label>
              <Input id="cookieDays" name="cookieDays" type="number" defaultValue={settings.cookieDays} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPayout">Pagamento Mínimo (R$)</Label>
              <Input id="minPayout" name="minPayout" type="number" step="0.01" defaultValue={settings.minPayout} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutDay">Dia do Pagamento</Label>
              <Input id="payoutDay" name="payoutDay" type="number" min="1" max="28" defaultValue={settings.payoutDay} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">Auto-aprovar Afiliados</p>
              <p className="text-xs text-muted-foreground">Novos afiliados são aprovados automaticamente.</p>
            </div>
            <Switch name="autoApprove" defaultChecked={settings.autoApprove} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termsUrl">URL dos Termos do Programa</Label>
            <Input id="termsUrl" name="termsUrl" defaultValue={settings.termsUrl || ""} placeholder="https://sualojacom/termos-afiliados" />
          </div>

          <Button type="submit" disabled={updateMut.isPending}>
            {updateMut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Salvar Configurações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Shared Components
// ═══════════════════════════════════════════════════════════════

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-mono font-semibold hover:bg-muted/80 transition-colors"
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {code}
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 opacity-50" />}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
