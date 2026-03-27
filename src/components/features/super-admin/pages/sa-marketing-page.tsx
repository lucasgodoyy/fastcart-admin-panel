"use client";

import { useTabFromPath } from "../hooks/use-tab-from-path";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Megaphone,
  Tag,
  Plus,
  Eye,
  Image,
  Calendar,
  Pencil,
  Power,
  RotateCcw,
  X,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { superAdminService } from "@/services/super-admin";
import type { MarketingCampaign, MarketingBanner } from "@/types/super-admin";
import { toast } from "sonner";

const campaignStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "success" },
  SCHEDULED: { label: "Agendado", color: "info" },
  COMPLETED: { label: "Concluído", color: "accent" },
  PAUSED: { label: "Pausado", color: "warning" },
  DRAFT: { label: "Rascunho", color: "accent" },
};

const inputCls = "bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9";

/* -- Campaign form defaults -- */
const emptyCampaign = { name: "", type: "DISCOUNT", status: "DRAFT", description: "", targetAudience: "ALL_STORES", discountValue: "", channel: "PLATFORM" };

/* -- Banner form defaults -- */
const emptyBanner = { title: "", imageUrl: "", linkUrl: "", position: "HOME_TOP", active: true };

export function SaMarketingPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useTabFromPath("/super-admin/marketing", { campaigns: "", banners: "banners" }, "campaigns");

  /* — Campaigns state — */
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState(emptyCampaign);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);

  /* — Banners state — */
  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState(emptyBanner);

  /* -- Queries -- */
  const { data: stats } = useQuery({
    queryKey: ["sa-marketing-stats"],
    queryFn: superAdminService.getMarketingStats,
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["sa-marketing-campaigns"],
    queryFn: () => superAdminService.listCampaigns({ page: 0, size: 50 }),
    enabled: tab === "campaigns",
  });

  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ["sa-marketing-banners"],
    queryFn: () => superAdminService.listBanners({ page: 0, size: 50 }),
    enabled: tab === "banners",
  });

  const campaigns = campaignsData?.content ?? [];
  const banners = bannersData?.content ?? [];

  /* -- Campaign mutations -- */
  const campaignMutation = useMutation({
    mutationFn: (data: typeof emptyCampaign) => {
      const body = { name: data.name, type: data.type, status: data.status, description: data.description, targetAudience: data.targetAudience, discountValue: data.discountValue, channel: data.channel, isPlatform: true };
      return editingCampaignId
        ? superAdminService.updateCampaign(editingCampaignId, body)
        : superAdminService.createCampaign(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-stats"] });
      toast.success(editingCampaignId ? "Campanha atualizada!" : "Campanha criada!");
      closeCampaignDialog();
    },
    onError: () => toast.error("Erro ao salvar campanha"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => superAdminService.updateCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-stats"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  /* -- Banner mutations -- */
  const bannerMutation = useMutation({
    mutationFn: (data: typeof emptyBanner) => superAdminService.createBanner({ title: data.title, imageUrl: data.imageUrl, linkUrl: data.linkUrl || null, active: data.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-banners"] });
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-stats"] });
      toast.success("Banner criado!");
      closeBannerDialog();
    },
    onError: () => toast.error("Erro ao criar banner"),
  });

  const toggleBannerMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => superAdminService.toggleBannerActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-banners"] });
      queryClient.invalidateQueries({ queryKey: ["sa-marketing-stats"] });
    },
    onError: () => toast.error("Erro ao alterar banner"),
  });

  /* -- Helpers -- */
  function openNewCampaign() {
    setEditingCampaignId(null);
    setCampaignForm(emptyCampaign);
    setCampaignOpen(true);
  }
  function openEditCampaign(c: MarketingCampaign) {
    setEditingCampaignId(c.id);
    setCampaignForm({ name: c.name, type: c.type, status: c.status, description: "", targetAudience: "", discountValue: "", channel: "" });
    setCampaignOpen(true);
  }
  function closeCampaignDialog() { setCampaignOpen(false); setEditingCampaignId(null); setCampaignForm(emptyCampaign); }
  function closeBannerDialog() { setBannerOpen(false); setBannerForm(emptyBanner); }

  function nextStatus(current: string): string | null {
    if (current === "DRAFT") return "ACTIVE";
    if (current === "ACTIVE") return "PAUSED";
    if (current === "PAUSED") return "ACTIVE";
    return null;
  }
  function nextStatusLabel(current: string): string | null {
    if (current === "DRAFT") return "Ativar";
    if (current === "ACTIVE") return "Pausar";
    if (current === "PAUSED") return "Reativar";
    return null;
  }

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Marketing"
        description="Campanhas, banners e promoções da plataforma"
        actions={
          tab === "campaigns" ? (
            <Button onClick={openNewCampaign} className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
              <Plus className="h-4 w-4" /> Nova Campanha
            </Button>
          ) : (
            <Button onClick={() => { setBannerForm(emptyBanner); setBannerOpen(true); }} className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
              <Plus className="h-4 w-4" /> Novo Banner
            </Button>
          )
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Campanhas Totais" value={String(stats?.totalCampaigns ?? 0)} icon={Megaphone} color="accent" />
        <SaStatCard title="Campanhas Ativas" value={String(stats?.activeCampaigns ?? 0)} icon={Tag} color="success" />
        <SaStatCard title="Banners Totais" value={String(stats?.totalBanners ?? 0)} icon={Image} color="info" />
        <SaStatCard title="Banners Ativos" value={String(stats?.activeBanners ?? 0)} icon={Eye} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-lg p-1">
          <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Banners
          </TabsTrigger>
        </TabsList>

        {/* -- Campaigns Tab -- */}
        <TabsContent value="campaigns" className="mt-6">
          {campaignsLoading ? (
            <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando campanhas...</div>
          ) : campaigns.length === 0 ? (
            <SaEmptyState icon={Megaphone} title="Nenhuma campanha encontrada" description="Crie sua primeira campanha de marketing" />
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              {campaigns.map(campaign => {
                const ns = nextStatus(campaign.status);
                const nsLabel = nextStatusLabel(campaign.status);
                return (
                  <motion.div
                    key={campaign.id}
                    variants={fadeInUp}
                    className="rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 backdrop-blur-sm p-5 hover:bg-[hsl(var(--sa-surface-hover))] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{campaign.name}</h4>
                          <SaStatusBadge status={campaign.status} map={campaignStatusMap} />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[hsl(var(--sa-accent))]/10 text-[hsl(var(--sa-accent))]">
                            {campaign.type}
                          </span>
                          {(campaign.startDate || campaign.endDate) && (
                            <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {campaign.startDate ?? "—"} — {campaign.endDate ?? "—"}
                            </span>
                          )}
                          {campaign.storeName && (
                            <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                              Loja: {campaign.storeName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ns && nsLabel && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-8 rounded-lg bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] gap-1"
                            onClick={() => statusMutation.mutate({ id: campaign.id, status: ns })}
                            disabled={statusMutation.isPending}
                          >
                            <Power className="h-3 w-3" /> {nsLabel}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-8 rounded-lg bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] gap-1"
                          onClick={() => openEditCampaign(campaign)}
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </TabsContent>

        {/* -- Banners Tab -- */}
        <TabsContent value="banners" className="mt-6">
          {bannersLoading ? (
            <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando banners...</div>
          ) : banners.length === 0 ? (
            <SaEmptyState icon={Image} title="Nenhum banner encontrado" description="Crie seu primeiro banner" />
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              <SaCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Banners ({banners.length})</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {banners.map(banner => (
                    <motion.div
                      key={banner.id}
                      variants={fadeInUp}
                      className="rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4"
                    >
                      {banner.imageUrl ? (
                        <div className="h-24 rounded-lg border border-[hsl(var(--sa-border-subtle))] mb-3 overflow-hidden">
                          <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 rounded-lg bg-linear-to-br from-[hsl(var(--sa-accent))]/20 to-[hsl(var(--sa-info))]/20 border border-dashed border-[hsl(var(--sa-border-subtle))] flex items-center justify-center mb-3">
                          <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Sem imagem</span>
                        </div>
                      )}
                      <h4 className="text-[12px] font-semibold text-[hsl(var(--sa-text))] mb-1">{banner.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${banner.active ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-text-muted))]"}`}>
                          {banner.active ? "Ativo" : "Inativo"}
                        </span>
                        <Switch
                          checked={banner.active}
                          onCheckedChange={(checked) => toggleBannerMutation.mutate({ id: banner.id, active: checked })}
                        />
                      </div>
                      {banner.linkUrl && (
                        <span className="text-[10px] text-[hsl(var(--sa-text-muted))] truncate block mt-1">{banner.linkUrl}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </SaCard>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* -- Campaign Dialog -- */}
      <Dialog open={campaignOpen} onOpenChange={(v) => { if (!v) closeCampaignDialog(); else setCampaignOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[14px]">
              <Megaphone className="h-4 w-4" /> {editingCampaignId ? "Editar Campanha" : "Nova Campanha"}
            </DialogTitle>
            <DialogDescription>Preencha os dados da campanha de marketing da plataforma.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Nome *</label>
              <Input
                placeholder="Ex: Black Friday 2026"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(p => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Tipo *</label>
                <Select value={campaignForm.type} onValueChange={(v) => setCampaignForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISCOUNT">Desconto</SelectItem>
                    <SelectItem value="SEASONAL">Sazonal</SelectItem>
                    <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                    <SelectItem value="LAUNCH">Lançamento</SelectItem>
                    <SelectItem value="LOYALTY">Fidelidade</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Canal</label>
                <Select value={campaignForm.channel} onValueChange={(v) => setCampaignForm(p => ({ ...p, channel: v }))}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLATFORM">Plataforma</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="SOCIAL">Social</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Descrição</label>
              <textarea
                placeholder="Descrição da campanha..."
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(p => ({ ...p, description: e.target.value }))}
                className={`w-full h-20 p-3 text-xs font-mono bg-[hsl(var(--sa-bg))] border border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sa-accent))]`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Público-alvo</label>
                <Select value={campaignForm.targetAudience} onValueChange={(v) => setCampaignForm(p => ({ ...p, targetAudience: v }))}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_STORES">Todas as Lojas</SelectItem>
                    <SelectItem value="ACTIVE_STORES">Lojas Ativas</SelectItem>
                    <SelectItem value="NEW_STORES">Lojas Novas</SelectItem>
                    <SelectItem value="TRIAL_STORES">Lojas em Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Valor do Desconto</label>
                <Input
                  placeholder="Ex: 20% ou R$ 50"
                  value={campaignForm.discountValue}
                  onChange={(e) => setCampaignForm(p => ({ ...p, discountValue: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeCampaignDialog} className="text-[12px]">Cancelar</Button>
              <Button
                onClick={() => campaignMutation.mutate(campaignForm)}
                disabled={campaignMutation.isPending || !campaignForm.name}
                className="bg-[hsl(var(--sa-accent))] text-white text-[12px] rounded-lg hover:opacity-90"
              >
                {campaignMutation.isPending ? (
                  <span className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 animate-spin" /> Salvando...</span>
                ) : editingCampaignId ? "Salvar" : "Criar Campanha"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* -- Banner Dialog -- */}
      <Dialog open={bannerOpen} onOpenChange={(v) => { if (!v) closeBannerDialog(); else setBannerOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[14px]">
              <Image className="h-4 w-4" /> Novo Banner
            </DialogTitle>
            <DialogDescription>Crie um banner para exibir na plataforma ou nas lojas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Título *</label>
              <Input
                placeholder="Ex: Promoção de Verão"
                value={bannerForm.title}
                onChange={(e) => setBannerForm(p => ({ ...p, title: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">URL da Imagem</label>
              <Input
                placeholder="https://exemplo.com/banner.jpg"
                value={bannerForm.imageUrl}
                onChange={(e) => setBannerForm(p => ({ ...p, imageUrl: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">URL de Destino (link)</label>
              <Input
                placeholder="https://exemplo.com/promo"
                value={bannerForm.linkUrl}
                onChange={(e) => setBannerForm(p => ({ ...p, linkUrl: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Posição</label>
                <Select value={bannerForm.position} onValueChange={(v) => setBannerForm(p => ({ ...p, position: v }))}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_TOP">Topo da Home</SelectItem>
                    <SelectItem value="HOME_MIDDLE">Meio da Home</SelectItem>
                    <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                    <SelectItem value="FOOTER">Rodapé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <label className="text-[12px] font-medium text-[hsl(var(--sa-text))]">Ativo</label>
                <Switch checked={bannerForm.active} onCheckedChange={(v) => setBannerForm(p => ({ ...p, active: v }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeBannerDialog} className="text-[12px]">Cancelar</Button>
              <Button
                onClick={() => bannerMutation.mutate(bannerForm)}
                disabled={bannerMutation.isPending || !bannerForm.title}
                className="bg-[hsl(var(--sa-accent))] text-white text-[12px] rounded-lg hover:opacity-90"
              >
                {bannerMutation.isPending ? (
                  <span className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 animate-spin" /> Criando...</span>
                ) : "Criar Banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
