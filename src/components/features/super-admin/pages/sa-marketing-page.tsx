"use client";

import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  MousePointer,
  ShoppingBag,
  BarChart3,
  Calendar,
  ImageIcon,
  Bell,
  Power,
  Loader2,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useTabFromPath } from "../hooks/use-tab-from-path";
import { useCallback, useEffect, useState } from "react";
import saMarketingService from "@/services/super-admin/saMarketingService";
import type {
  MarketingCampaign,
  MarketingBanner,
  PushTemplate,
  MarketingStats,
  CampaignUpsertRequest,
  BannerUpsertRequest,
  PushTemplateUpsertRequest,
} from "@/types/marketing";

const campaignStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "success" },
  SCHEDULED: { label: "Agendado", color: "info" },
  COMPLETED: { label: "Concluído", color: "accent" },
  PAUSED: { label: "Pausado", color: "warning" },
  DRAFT: { label: "Rascunho", color: "accent" },
};

const bannerPositionMap: Record<string, string> = {
  HERO: "Hero",
  SIDEBAR: "Lateral",
  FOOTER: "Rodapé",
  CATEGORY: "Categoria",
  CHECKOUT: "Checkout",
};

const pushStatusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Rascunho", color: "warning" },
  SCHEDULED: { label: "Agendado", color: "info" },
  SENT: { label: "Enviado", color: "success" },
  CANCELLED: { label: "Cancelado", color: "danger" },
};

const marketingTabRoutes: Record<string, string> = {
  campaigns: "",
  push: "push",
  banners: "banners",
};

function formatCents(cents: number): string {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

function formatK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function SaMarketingPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/marketing", marketingTabRoutes, "campaigns");

  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [banners, setBanners] = useState<MarketingBanner[]>([]);
  const [pushTemplates, setPushTemplates] = useState<PushTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [campaignForm, setCampaignForm] = useState<CampaignUpsertRequest>({
    name: "", type: "DISCOUNT", channel: "ALL", status: "DRAFT",
  });
  const [bannerForm, setBannerForm] = useState<BannerUpsertRequest>({
    title: "", position: "HERO", active: true,
  });
  const [pushForm, setPushForm] = useState<PushTemplateUpsertRequest>({
    title: "", body: "", segment: "ALL", status: "DRAFT",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, b, p] = await Promise.all([
        saMarketingService.getStats(),
        saMarketingService.listCampaigns({ size: 50 }),
        saMarketingService.listBanners({ size: 50 }),
        saMarketingService.listPush({ size: 50 }),
      ]);
      setStats(s);
      setCampaigns(c.content);
      setBanners(b.content);
      setPushTemplates(p.content);
    } catch (e) {
      console.error("Failed to load marketing data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateCampaign = async () => {
    setSaving(true);
    try {
      await saMarketingService.createCampaign({ ...campaignForm, isPlatform: true });
      setCampaignDialogOpen(false);
      setCampaignForm({ name: "", type: "DISCOUNT", channel: "ALL", status: "DRAFT" });
      await loadData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleToggleCampaignStatus = async (id: number, current: string) => {
    const next = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await saMarketingService.updateCampaignStatus(id, next);
    await loadData();
  };

  const handleCreateBanner = async () => {
    setSaving(true);
    try {
      await saMarketingService.createBanner({ ...bannerForm, isPlatform: true });
      setBannerDialogOpen(false);
      setBannerForm({ title: "", position: "HERO", active: true });
      await loadData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleToggleBannerActive = async (id: number, active: boolean) => {
    await saMarketingService.toggleBannerActive(id, !active);
    await loadData();
  };

  const handleCreatePush = async () => {
    setSaving(true);
    try {
      await saMarketingService.createPush({ ...pushForm, isPlatform: true });
      setPushDialogOpen(false);
      setPushForm({ title: "", body: "", segment: "ALL", status: "DRAFT" });
      await loadData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Marketing"
        description="Campanhas, banners e push da plataforma"
        actions={
          <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-xl gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
                <Plus className="h-4 w-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[hsl(var(--sa-text))]">Nova Campanha de Plataforma</DialogTitle>
                <DialogDescription className="text-[hsl(var(--sa-text-muted))]">Campanhas de plataforma impactam todas as lojas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-[hsl(var(--sa-text-secondary))]">Nome</Label>
                  <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" value={campaignForm.name} onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[hsl(var(--sa-text-secondary))]">Descrição</Label>
                  <Textarea className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" value={campaignForm.description || ""} onChange={e => setCampaignForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Tipo</Label>
                    <Select value={campaignForm.type} onValueChange={v => setCampaignForm(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DISCOUNT">Desconto Global</SelectItem>
                        <SelectItem value="CASHBACK">Cashback</SelectItem>
                        <SelectItem value="FREE_SHIPPING">Frete Grátis</SelectItem>
                        <SelectItem value="COUPON">Cupom</SelectItem>
                        <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Canal</Label>
                    <Select value={campaignForm.channel || "ALL"} onValueChange={v => setCampaignForm(p => ({ ...p, channel: v }))}>
                      <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
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
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Valor do Desconto</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" placeholder="Ex: 30%" value={campaignForm.discountValue || ""} onChange={e => setCampaignForm(p => ({ ...p, discountValue: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Orçamento (R$)</Label>
                    <Input type="number" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" value={campaignForm.budgetCents ? campaignForm.budgetCents / 100 : ""} onChange={e => setCampaignForm(p => ({ ...p, budgetCents: Number(e.target.value) * 100 }))} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[hsl(var(--sa-text-secondary))]">Público-alvo</Label>
                  <Select value={campaignForm.targetAudience || ""} onValueChange={v => setCampaignForm(p => ({ ...p, targetAudience: v }))}>
                    <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                <Button variant="outline" onClick={() => setCampaignDialogOpen(false)} className="border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">Cancelar</Button>
                <Button onClick={handleCreateCampaign} disabled={saving || !campaignForm.name} className="bg-[hsl(var(--sa-accent))] text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Campanha"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Campanhas Ativas" value={stats?.activeCampaigns ?? "—"} icon={Megaphone} color="accent" />
        <SaStatCard title="Banners Ativos" value={stats?.activeBanners ?? "—"} icon={ImageIcon} color="info" />
        <SaStatCard title="Conversões (total)" value={stats ? formatK(stats.totalConversions) : "—"} icon={ShoppingBag} color="success" />
        <SaStatCard title="Receita Promocional" value={stats ? formatCents(stats.totalRevenueCents) : "—"} icon={BarChart3} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">Campanhas</TabsTrigger>
          <TabsTrigger value="push" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">Push Notifications</TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">Banners</TabsTrigger>
        </TabsList>

        {/* ═══ CAMPAIGNS ═══ */}
        <TabsContent value="campaigns" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sa-accent))]" /></div>
          ) : campaigns.length === 0 ? (
            <SaCard><div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--sa-text-muted))]" />
              <p className="text-[14px] text-[hsl(var(--sa-text-secondary))]">Nenhuma campanha criada.</p>
              <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">Crie a primeira campanha de plataforma.</p>
            </div></SaCard>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              {campaigns.map(c => (
                <motion.div key={c.id} variants={fadeInUp} className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 backdrop-blur-sm p-5 hover:bg-[hsl(var(--sa-surface-hover))] transition-all">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{c.name}</h4>
                        <SaStatusBadge status={c.status} map={campaignStatusMap} />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[hsl(var(--sa-accent))]/10 text-[hsl(var(--sa-accent))]">
                          {c.type}{c.discountValue ? `: ${c.discountValue}` : ""}
                        </span>
                        {c.startsAt && (
                          <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.startsAt).toLocaleDateString("pt-BR")}
                            {c.endsAt && ` — ${new Date(c.endsAt).toLocaleDateString("pt-BR")}`}
                          </span>
                        )}
                        {c.channel !== "ALL" && <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{c.channel}</span>}
                      </div>
                      {c.description && <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mt-2 line-clamp-1">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-0.5">Views</p>
                        <p className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{c.views > 0 ? formatK(c.views) : "—"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-0.5">Conversões</p>
                        <p className="text-[14px] font-bold text-[hsl(var(--sa-success))]">{c.conversions > 0 ? formatK(c.conversions) : "—"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-0.5">Receita</p>
                        <p className="text-[14px] font-bold text-[hsl(var(--sa-accent))]">{c.revenueCents > 0 ? formatCents(c.revenueCents) : "—"}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-accent))]"
                        onClick={() => handleToggleCampaignStatus(c.id, c.status)}>
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {c.status === "ACTIVE" && c.views > 0 && (
                    <div className="mt-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                        <motion.div className="h-full rounded-full bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-success))]"
                          initial={{ width: 0 }} animate={{ width: `${Math.min((c.conversions / c.views) * 100 * 5, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ═══ PUSH ═══ */}
        <TabsContent value="push" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Push Notifications</h3>
            <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[11px] rounded-lg h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" /> Nova Push
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[hsl(var(--sa-text))]">Nova Push Notification</DialogTitle>
                  <DialogDescription className="text-[hsl(var(--sa-text-muted))]">Envie notificações push para toda a plataforma.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Título</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" value={pushForm.title} onChange={e => setPushForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Corpo</Label>
                    <Textarea className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" rows={3} value={pushForm.body} onChange={e => setPushForm(p => ({ ...p, body: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[hsl(var(--sa-text-secondary))]">Segmento</Label>
                      <Select value={pushForm.segment || "ALL"} onValueChange={v => setPushForm(p => ({ ...p, segment: v }))}>
                        <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Todos</SelectItem>
                          <SelectItem value="NEW_USERS">Novos Usuários</SelectItem>
                          <SelectItem value="ACTIVE_BUYERS">Compradores Ativos</SelectItem>
                          <SelectItem value="INACTIVE">Inativos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[hsl(var(--sa-text-secondary))]">URL de Ação</Label>
                      <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" placeholder="https://..." value={pushForm.actionUrl || ""} onChange={e => setPushForm(p => ({ ...p, actionUrl: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">URL da Imagem</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" placeholder="https://..." value={pushForm.imageUrl || ""} onChange={e => setPushForm(p => ({ ...p, imageUrl: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPushDialogOpen(false)} className="border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">Cancelar</Button>
                  <Button onClick={handleCreatePush} disabled={saving || !pushForm.title || !pushForm.body} className="bg-[hsl(var(--sa-accent))] text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Push"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sa-accent))]" /></div>
          ) : pushTemplates.length === 0 ? (
            <SaCard><div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--sa-text-muted))]" />
              <p className="text-[14px] text-[hsl(var(--sa-text-secondary))]">Nenhum push template criado.</p>
            </div></SaCard>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2">
              {pushTemplates.map(push => (
                <motion.div key={push.id} variants={fadeInUp} className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 backdrop-blur-sm p-5 hover:bg-[hsl(var(--sa-surface-hover))] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                      <h4 className="text-[13px] font-bold text-[hsl(var(--sa-text))]">{push.title}</h4>
                    </div>
                    <SaStatusBadge status={push.status} map={pushStatusMap} />
                  </div>
                  <p className="text-[11px] text-[hsl(var(--sa-text-secondary))] mb-3 line-clamp-2">{push.body}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Enviados</p>
                      <p className="text-[13px] font-bold text-[hsl(var(--sa-text))]">{formatK(push.sentCount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Abertos</p>
                      <p className="text-[13px] font-bold text-[hsl(var(--sa-success))]">{formatK(push.openedCount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Clicados</p>
                      <p className="text-[13px] font-bold text-[hsl(var(--sa-accent))]">{formatK(push.clickedCount)}</p>
                    </div>
                  </div>
                  {push.sentCount > 0 && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                      <motion.div className="h-full rounded-full bg-linear-to-r from-[hsl(var(--sa-info))] to-[hsl(var(--sa-success))]"
                        initial={{ width: 0 }} animate={{ width: `${Math.min((push.openedCount / push.sentCount) * 100, 100)}%` }}
                        transition={{ duration: 0.6 }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ═══ BANNERS ═══ */}
        <TabsContent value="banners" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Banners da Plataforma</h3>
            <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[11px] rounded-lg h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" /> Novo Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[hsl(var(--sa-text))]">Novo Banner</DialogTitle>
                  <DialogDescription className="text-[hsl(var(--sa-text-muted))]">Banners são exibidos em todas as lojas da plataforma.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Título</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" value={bannerForm.title} onChange={e => setBannerForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Subtítulo</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" value={bannerForm.subtitle || ""} onChange={e => setBannerForm(p => ({ ...p, subtitle: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[hsl(var(--sa-text-secondary))]">Posição</Label>
                      <Select value={bannerForm.position || "HERO"} onValueChange={v => setBannerForm(p => ({ ...p, position: v }))}>
                        <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
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
                      <Label className="text-[hsl(var(--sa-text-secondary))]">Dimensões</Label>
                      <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" placeholder="1200x400" value={bannerForm.dimensions || ""} onChange={e => setBannerForm(p => ({ ...p, dimensions: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">URL da Imagem</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" placeholder="https://..." value={bannerForm.imageUrl || ""} onChange={e => setBannerForm(p => ({ ...p, imageUrl: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[hsl(var(--sa-text-secondary))]">Link de Destino</Label>
                    <Input className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" placeholder="https://..." value={bannerForm.linkUrl || ""} onChange={e => setBannerForm(p => ({ ...p, linkUrl: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBannerDialogOpen(false)} className="border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">Cancelar</Button>
                  <Button onClick={handleCreateBanner} disabled={saving || !bannerForm.title} className="bg-[hsl(var(--sa-accent))] text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Banner"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--sa-accent))]" /></div>
          ) : banners.length === 0 ? (
            <SaCard><div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--sa-text-muted))]" />
              <p className="text-[14px] text-[hsl(var(--sa-text-secondary))]">Nenhum banner criado.</p>
            </div></SaCard>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-3">
              {banners.map(banner => (
                <motion.div key={banner.id} variants={fadeInUp} className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4">
                  <div className="h-24 rounded-lg bg-linear-to-br from-[hsl(var(--sa-accent))]/20 to-[hsl(var(--sa-info))]/20 border border-dashed border-[hsl(var(--sa-border-subtle))] flex items-center justify-center mb-3 overflow-hidden">
                    {banner.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{banner.dimensions || "Sem imagem"}</span>
                    )}
                  </div>
                  <h4 className="text-[12px] font-semibold text-[hsl(var(--sa-text))] mb-1">{banner.title}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">{bannerPositionMap[banner.position] || banner.position}</span>
                    <span className="text-[11px] font-bold text-[hsl(var(--sa-accent))] flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {banner.clicks > 0 ? formatK(banner.clicks) + " cliques" : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${banner.active ? "bg-[hsl(var(--sa-success))]/10 text-[hsl(var(--sa-success))]" : "bg-[hsl(var(--sa-danger))]/10 text-[hsl(var(--sa-danger))]"}`}>
                      {banner.active ? "Ativo" : "Inativo"}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(var(--sa-text-muted))]"
                      onClick={() => handleToggleBannerActive(banner.id, banner.active)}>
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
