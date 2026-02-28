"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Plus,
  Search,
  Loader2,
  ImageIcon,
  Bell,
  BarChart3,
  MousePointerClick,
  Trash2,
  ShoppingBag,
  Plug,
  Facebook,
  Instagram,
  Globe,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import marketingService from "@/services/marketingService";
import type {
  MarketingCampaign,
  MarketingBanner,
  AdsAccount,
  AdsCampaign,
  PushTemplate,
  MarketingStats,
  CampaignUpsertRequest,
  BannerUpsertRequest,
  AdsAccountUpsertRequest,
  PushTemplateUpsertRequest,
  AdsPlatform,
} from "@/types/marketing";

// ── Query keys ──────────────────────────────────────────────
const QK = {
  stats: ["marketing", "stats"],
  campaigns: ["marketing", "campaigns"],
  banners: ["marketing", "banners"],
  adsAccounts: ["marketing", "ads-accounts"],
  adsCampaigns: ["marketing", "ads-campaigns"],
  push: ["marketing", "push"],
};

// ── Helpers ─────────────────────────────────────────────────
function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
function formatK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const campaignStatusVariant: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  PAUSED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  COMPLETED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const campaignStatusLabel: Record<string, string> = {
  ACTIVE: "Ativo",
  SCHEDULED: "Agendado",
  PAUSED: "Pausado",
  DRAFT: "Rascunho",
  COMPLETED: "Concluído",
};

const pushStatusVariant: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  SENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const adsPlatformIcon: Record<string, React.ReactNode> = {
  FACEBOOK: <Facebook className="h-5 w-5" />,
  INSTAGRAM: <Instagram className="h-5 w-5" />,
  GOOGLE: <Globe className="h-5 w-5" />,
  TIKTOK: <span className="text-sm font-bold">TT</span>,
  PINTEREST: <span className="text-sm font-bold">P</span>,
};

const adsPlatformColor: Record<string, string> = {
  FACEBOOK: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20",
  INSTAGRAM: "border-pink-500/30 bg-pink-50 dark:bg-pink-950/20",
  GOOGLE: "border-red-500/30 bg-red-50 dark:bg-red-950/20",
  TIKTOK: "border-zinc-500/30 bg-zinc-50 dark:bg-zinc-950/20",
  PINTEREST: "border-red-600/30 bg-red-50 dark:bg-red-950/20",
};

const ALL_PLATFORMS: AdsPlatform[] = ["FACEBOOK", "INSTAGRAM", "GOOGLE", "TIKTOK", "PINTEREST"];

// ═════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════
export default function MarketingClient() {
  const [tab, setTab] = useState("dashboard");
  const queryClient = useQueryClient();

  // ── Queries ─────────────────────────────────────────────
  const statsQ = useQuery({ queryKey: QK.stats, queryFn: marketingService.getStats });
  const campaignsQ = useQuery({ queryKey: QK.campaigns, queryFn: () => marketingService.listCampaigns({ size: 100 }) });
  const bannersQ = useQuery({ queryKey: QK.banners, queryFn: () => marketingService.listBanners({ size: 100 }) });
  const adsAccountsQ = useQuery({ queryKey: QK.adsAccounts, queryFn: marketingService.listAdsAccounts });
  const adsCampaignsQ = useQuery({ queryKey: QK.adsCampaigns, queryFn: () => marketingService.listAdsCampaigns({ size: 100 }) });
  const pushQ = useQuery({ queryKey: QK.push, queryFn: () => marketingService.listPush({ size: 100 }) });

  const stats = statsQ.data;
  const campaigns = campaignsQ.data?.content ?? [];
  const banners = bannersQ.data?.content ?? [];
  const adsAccounts = adsAccountsQ.data ?? [];
  const adsCampaigns = adsCampaignsQ.data?.content ?? [];
  const pushTemplates = pushQ.data?.content ?? [];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Marketing</h1>
          <p className="text-sm text-muted-foreground">Campanhas, banners, anúncios e push da sua loja.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard"><BarChart3 className="mr-1.5 h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns"><Megaphone className="mr-1.5 h-4 w-4" /> Campanhas</TabsTrigger>
          <TabsTrigger value="banners"><ImageIcon className="mr-1.5 h-4 w-4" /> Banners</TabsTrigger>
          <TabsTrigger value="ads"><Plug className="mr-1.5 h-4 w-4" /> Anúncios</TabsTrigger>
          <TabsTrigger value="push"><Bell className="mr-1.5 h-4 w-4" /> Push</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab stats={stats} loading={statsQ.isLoading} />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-6">
          <CampaignsTab campaigns={campaigns} loading={campaignsQ.isLoading} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="banners" className="mt-6">
          <BannersTab banners={banners} loading={bannersQ.isLoading} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="ads" className="mt-6">
          <AdsTab accounts={adsAccounts} adsCampaigns={adsCampaigns} loading={adsAccountsQ.isLoading} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="push" className="mt-6">
          <PushTab templates={pushTemplates} loading={pushQ.isLoading} queryClient={queryClient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Dashboard Tab
// ═════════════════════════════════════════════════════════════
function DashboardTab({ stats, loading }: { stats?: MarketingStats | null; loading: boolean }) {
  if (loading) return <Loader className="py-12" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Campanhas Ativas" value={stats?.activeCampaigns ?? 0} icon={<Megaphone className="h-5 w-5 text-primary" />} />
        <StatCard label="Banners Ativos" value={stats?.activeBanners ?? 0} icon={<ImageIcon className="h-5 w-5 text-blue-500" />} />
        <StatCard label="Conversões Totais" value={formatK(stats?.totalConversions ?? 0)} icon={<ShoppingBag className="h-5 w-5 text-emerald-500" />} />
        <StatCard label="Receita Promocional" value={formatCents(stats?.totalRevenueCents ?? 0)} icon={<TrendingUp className="h-5 w-5 text-amber-500" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Push Templates Ativos" value={stats?.activePushTemplates ?? 0} icon={<Bell className="h-5 w-5 text-violet-500" />} />
        <StatCard label="Contas de Ads" value={stats?.connectedAdsAccounts ?? 0} icon={<Plug className="h-5 w-5 text-pink-500" />} />
        <StatCard label="Total de Campanhas" value={stats?.totalCampaigns ?? 0} icon={<BarChart3 className="h-5 w-5 text-zinc-500" />} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Loader({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className ?? ""}`}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Campaigns Tab
// ═════════════════════════════════════════════════════════════
function CampaignsTab({
  campaigns,
  loading,
  queryClient,
}: {
  campaigns: MarketingCampaign[];
  loading: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CampaignUpsertRequest>({
    name: "",
    type: "DISCOUNT",
    channel: "ALL",
    status: "DRAFT",
  });

  const createMut = useMutation({
    mutationFn: (data: CampaignUpsertRequest) => marketingService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.campaigns });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Campanha criada com sucesso");
      setDialogOpen(false);
      setForm({ name: "", type: "DISCOUNT", channel: "ALL", status: "DRAFT" });
    },
    onError: () => toast.error("Erro ao criar campanha"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => marketingService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.campaigns });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Campanha removida");
    },
    onError: () => toast.error("Erro ao remover campanha"),
  });

  const filtered = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader className="py-12" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
              <DialogDescription>Crie uma campanha de marketing para sua loja.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Textarea value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCOUNT">Desconto</SelectItem>
                      <SelectItem value="CASHBACK">Cashback</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Frete Grátis</SelectItem>
                      <SelectItem value="COUPON">Cupom</SelectItem>
                      <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Canal</Label>
                  <Select value={form.channel || "ALL"} onValueChange={(v) => setForm((p) => ({ ...p, channel: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="GOOGLE">Google</SelectItem>
                      <SelectItem value="TIKTOK">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor do Desconto</Label>
                  <Input placeholder="Ex: 30%" value={form.discountValue || ""} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Orçamento (R$)</Label>
                  <Input type="number" value={form.budgetCents ? form.budgetCents / 100 : ""} onChange={(e) => setForm((p) => ({ ...p, budgetCents: Number(e.target.value) * 100 }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Início</Label>
                  <Input type="datetime-local" value={form.startsAt || ""} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Fim</Label>
                  <Input type="datetime-local" value={form.endsAt || ""} onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Público-alvo</Label>
                <Select value={form.targetAudience || ""} onValueChange={(v) => setForm((p) => ({ ...p, targetAudience: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="NEW_CUSTOMERS">Novos Clientes</SelectItem>
                    <SelectItem value="RETURNING">Recorrentes</SelectItem>
                    <SelectItem value="HIGH_VALUE">Alto Valor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.name}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} campanha(s)</p>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Nome</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Tipo</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Canal</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Views</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Conversões</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Receita</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhuma campanha encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm text-foreground font-medium">
                    <div>
                      {c.name}
                      {c.discountValue && <span className="ml-2 text-xs text-muted-foreground">({c.discountValue})</span>}
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{c.type}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{c.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${campaignStatusVariant[c.status] ?? ""}`}>
                      {campaignStatusLabel[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(c.views)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(c.conversions)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{c.revenueCents > 0 ? formatCents(c.revenueCents) : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => { if (confirm("Remover esta campanha?")) deleteMut.mutate(c.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Banners Tab
// ═════════════════════════════════════════════════════════════
function BannersTab({
  banners,
  loading,
  queryClient,
}: {
  banners: MarketingBanner[];
  loading: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<BannerUpsertRequest>({
    title: "",
    position: "HERO",
    active: true,
  });

  const createMut = useMutation({
    mutationFn: (data: BannerUpsertRequest) => marketingService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.banners });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Banner criado com sucesso");
      setDialogOpen(false);
      setForm({ title: "", position: "HERO", active: true });
    },
    onError: () => toast.error("Erro ao criar banner"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => marketingService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.banners });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Banner removido");
    },
    onError: () => toast.error("Erro ao remover banner"),
  });

  if (loading) return <Loader className="py-12" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{banners.length} banner(s)</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Banner</DialogTitle>
              <DialogDescription>Banners são exibidos na sua loja online.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Subtítulo</Label>
                <Input value={form.subtitle || ""} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Posição</Label>
                  <Select value={form.position || "HERO"} onValueChange={(v) => setForm((p) => ({ ...p, position: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HERO">Hero</SelectItem>
                      <SelectItem value="SIDEBAR">Lateral</SelectItem>
                      <SelectItem value="FOOTER">Rodapé</SelectItem>
                      <SelectItem value="CATEGORY">Categoria</SelectItem>
                      <SelectItem value="CHECKOUT">Checkout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Dimensões</Label>
                  <Input placeholder="1200x400" value={form.dimensions || ""} onChange={(e) => setForm((p) => ({ ...p, dimensions: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>URL da Imagem</Label>
                <Input placeholder="https://..." value={form.imageUrl || ""} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Link de Destino</Label>
                <Input placeholder="https://..." value={form.linkUrl || ""} onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.title}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum banner criado.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-md border border-border bg-card">
              <div className="h-28 bg-muted/30 flex items-center justify-center overflow-hidden">
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">{b.dimensions || "Sem imagem"}</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground">{b.title}</h4>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${b.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {b.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                {b.subtitle && <p className="text-xs text-muted-foreground mb-2">{b.subtitle}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{b.position}</span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="h-3 w-3" />
                    {b.clicks} cliques / {formatK(b.impressions)} impressões
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => { if (confirm("Remover este banner?")) deleteMut.mutate(b.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Ads Tab
// ═════════════════════════════════════════════════════════════
function AdsTab({
  accounts,
  adsCampaigns,
  loading,
  queryClient,
}: {
  accounts: AdsAccount[];
  adsCampaigns: AdsCampaign[];
  loading: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectForm, setConnectForm] = useState<AdsAccountUpsertRequest>({
    platform: "FACEBOOK",
    status: "ACTIVE",
  });

  const connectMut = useMutation({
    mutationFn: (data: AdsAccountUpsertRequest) => marketingService.upsertAdsAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.adsAccounts });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Conta de Ads conectada");
      setConnectDialogOpen(false);
      setConnectForm({ platform: "FACEBOOK", status: "ACTIVE" });
    },
    onError: () => toast.error("Erro ao conectar conta"),
  });

  const disconnectMut = useMutation({
    mutationFn: (platform: string) => marketingService.disconnectAdsAccount(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.adsAccounts });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Conta desconectada");
    },
    onError: () => toast.error("Erro ao desconectar conta"),
  });

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  if (loading) return <Loader className="py-12" />;

  return (
    <div className="space-y-6">
      {/* Connected accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Contas Conectadas</h3>
          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Conectar Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Conectar Conta de Ads</DialogTitle>
                <DialogDescription>Conecte sua conta de anúncios para gerenciar campanhas pagas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Plataforma</Label>
                  <Select value={connectForm.platform} onValueChange={(v) => setConnectForm((p) => ({ ...p, platform: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_PLATFORMS.filter((pl) => !connectedPlatforms.has(pl)).map((pl) => (
                        <SelectItem key={pl} value={pl}>{pl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Nome da Conta</Label>
                  <Input placeholder="Ex: Minha Loja Ads" value={connectForm.accountName || ""} onChange={(e) => setConnectForm((p) => ({ ...p, accountName: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Account ID</Label>
                  <Input placeholder="ID do gerenciador de anúncios" value={connectForm.accountId || ""} onChange={(e) => setConnectForm((p) => ({ ...p, accountId: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Pixel ID (opcional)</Label>
                  <Input value={connectForm.pixelId || ""} onChange={(e) => setConnectForm((p) => ({ ...p, pixelId: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Catalog ID (opcional)</Label>
                  <Input value={connectForm.catalogId || ""} onChange={(e) => setConnectForm((p) => ({ ...p, catalogId: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>Cancelar</Button>
                <Button onClick={() => connectMut.mutate(connectForm)} disabled={connectMut.isPending}>
                  {connectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Conectar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_PLATFORMS.map((platform) => {
            const account = accounts.find((a) => a.platform === platform);
            const connected = !!account;
            return (
              <div key={platform} className={`rounded-md border p-4 transition-colors ${connected ? adsPlatformColor[platform] : "border-border bg-card opacity-60"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {adsPlatformIcon[platform]}
                    <h4 className="text-sm font-medium text-foreground">{platform}</h4>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${connected ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {connected ? "Conectado" : "Desconectado"}
                  </span>
                </div>
                {connected && account ? (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {account.accountName && <p>Conta: {account.accountName}</p>}
                    {account.pixelId && <p>Pixel: {account.pixelId}</p>}
                    {account.lastSyncAt && <p>Último sync: {new Date(account.lastSyncAt).toLocaleDateString("pt-BR")}</p>}
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => { if (confirm(`Desconectar ${platform}?`)) disconnectMut.mutate(platform); }}>
                      Desconectar
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Clique em &quot;Conectar Conta&quot; para configurar.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ads Campaigns from connected accounts */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Campanhas de Anúncios</h3>
        {adsCampaigns.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma campanha de ads sincronizada.</p>
            <p className="text-xs text-muted-foreground mt-1">Conecte uma conta e sincronize campanhas.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Campanha</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Plataforma</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Gasto</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Impressões</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Cliques</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Conversões</th>
                  <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {adsCampaigns.map((ac) => (
                  <tr key={ac.id} className="border-b border-border transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                      {ac.name}
                      {ac.objective && <span className="ml-2 text-xs text-muted-foreground">({ac.objective})</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{ac.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${campaignStatusVariant[ac.status] ?? ""}`}>
                        {campaignStatusLabel[ac.status] ?? ac.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">{formatCents(ac.spentCents)}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(ac.impressions)}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(ac.clicks)}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(ac.conversions)}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right">{ac.roas ? `${ac.roas.toFixed(2)}x` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Push Tab
// ═════════════════════════════════════════════════════════════
function PushTab({
  templates,
  loading,
  queryClient,
}: {
  templates: PushTemplate[];
  loading: boolean;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PushTemplateUpsertRequest>({
    title: "",
    body: "",
    segment: "ALL",
    status: "DRAFT",
  });

  const createMut = useMutation({
    mutationFn: (data: PushTemplateUpsertRequest) => marketingService.createPush(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.push });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Push template criado");
      setDialogOpen(false);
      setForm({ title: "", body: "", segment: "ALL", status: "DRAFT" });
    },
    onError: () => toast.error("Erro ao criar push"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => marketingService.deletePush(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.push });
      queryClient.invalidateQueries({ queryKey: QK.stats });
      toast.success("Push template removido");
    },
    onError: () => toast.error("Erro ao remover push"),
  });

  if (loading) return <Loader className="py-12" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{templates.length} template(s)</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nova Push
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Push Notification</DialogTitle>
              <DialogDescription>Envie notificações push para seus clientes.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Corpo</Label>
                <Textarea rows={3} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Segmento</Label>
                  <Select value={form.segment || "ALL"} onValueChange={(v) => setForm((p) => ({ ...p, segment: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="NEW_USERS">Novos Usuários</SelectItem>
                      <SelectItem value="ACTIVE_BUYERS">Compradores Ativos</SelectItem>
                      <SelectItem value="INACTIVE">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>URL da Imagem</Label>
                  <Input placeholder="https://..." value={form.imageUrl || ""} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>URL de Ação</Label>
                <Input placeholder="https://..." value={form.actionUrl || ""} onChange={(e) => setForm((p) => ({ ...p, actionUrl: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Agendar para</Label>
                <Input type="datetime-local" value={form.scheduledAt || ""} onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.title || !form.body}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum push template criado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Título</th>
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Segmento</th>
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Enviados</th>
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Abertos</th>
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-right">Clicados</th>
                <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="font-medium">{t.title}</div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.body}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{t.segment}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${pushStatusVariant[t.status] ?? ""}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(t.sentCount)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(t.openedCount)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">{formatK(t.clickedCount)}</td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => { if (confirm("Remover este push?")) deleteMut.mutate(t.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
