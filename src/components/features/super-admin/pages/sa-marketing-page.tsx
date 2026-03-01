"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  Tag,
  Plus,
  Eye,
  Image,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { superAdminService } from "@/services/super-admin";
import type { MarketingCampaign, MarketingBanner } from "@/types/super-admin";

const campaignStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "success" },
  SCHEDULED: { label: "Agendado", color: "info" },
  COMPLETED: { label: "Concluído", color: "accent" },
  PAUSED: { label: "Pausado", color: "warning" },
  DRAFT: { label: "Rascunho", color: "accent" },
};

export function SaMarketingPage() {
  const [tab, setTab] = useState("campaigns");

  const { data: stats, isLoading: statsLoading } = useQuery({
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

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Marketing"
        description="Campanhas, banners e promoções da plataforma"
        actions={
          <Button className="bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-xl gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova Campanha
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Campanhas Totais" value={String(stats?.totalCampaigns ?? 0)} icon={Megaphone} color="accent" />
        <SaStatCard title="Campanhas Ativas" value={String(stats?.activeCampaigns ?? 0)} icon={Tag} color="success" />
        <SaStatCard title="Banners Totais" value={String(stats?.totalBanners ?? 0)} icon={Image} color="info" />
        <SaStatCard title="Banners Ativos" value={String(stats?.activeBanners ?? 0)} icon={Eye} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Banners
          </TabsTrigger>
        </TabsList>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="mt-6">
          {campaignsLoading ? (
            <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando campanhas...</div>
          ) : campaigns.length === 0 ? (
            <SaEmptyState icon={Megaphone} title="Nenhuma campanha encontrada" description="Crie sua primeira campanha de marketing" />
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              {campaigns.map(campaign => (
                <motion.div
                  key={campaign.id}
                  variants={fadeInUp}
                  className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 backdrop-blur-sm p-5 hover:bg-[hsl(var(--sa-surface-hover))] transition-all"
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
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Banners */}
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
                  <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[11px] rounded-lg h-8 gap-1">
                    <Plus className="h-3.5 w-3.5" /> Novo Banner
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {banners.map(banner => (
                    <motion.div
                      key={banner.id}
                      variants={fadeInUp}
                      className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4"
                    >
                      {banner.imageUrl ? (
                        <div className="h-24 rounded-lg border border-[hsl(var(--sa-border-subtle))] mb-3 overflow-hidden">
                          <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 rounded-lg bg-gradient-to-br from-[hsl(var(--sa-accent))]/20 to-[hsl(var(--sa-info))]/20 border border-dashed border-[hsl(var(--sa-border-subtle))] flex items-center justify-center mb-3">
                          <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Sem imagem</span>
                        </div>
                      )}
                      <h4 className="text-[12px] font-semibold text-[hsl(var(--sa-text))] mb-1">{banner.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${banner.active ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-text-muted))]"}`}>
                          {banner.active ? "Ativo" : "Inativo"}
                        </span>
                        {banner.linkUrl && (
                          <span className="text-[10px] text-[hsl(var(--sa-text-muted))] truncate max-w-[120px]">{banner.linkUrl}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SaCard>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
