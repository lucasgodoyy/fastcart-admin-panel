"use client";

import { motion } from "framer-motion";
import {
  Megaphone,
  Gift,
  Percent,
  BarChart3,
  Tag,
  Plus,
  Copy,
  Eye,
  MousePointer,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  PauseCircle,
  Clock,
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
import { useState } from "react";

const mockCampaigns = [
  { id: 1, name: "Black Friday 2026", type: "Desconto Global", discount: "30%", status: "SCHEDULED", startDate: "22/11/2026", endDate: "29/11/2026", stores: 156, views: 0, conversions: 0 },
  { id: 2, name: "Semana do Consumidor", type: "Cashback", discount: "15%", status: "ACTIVE", startDate: "10/03/2026", endDate: "17/03/2026", stores: 89, views: 45200, conversions: 3200 },
  { id: 3, name: "Lançamento Verão", type: "Frete Grátis", discount: "Free", status: "ACTIVE", startDate: "01/12/2025", endDate: "28/02/2026", stores: 120, views: 98000, conversions: 12400 },
  { id: 4, name: "Páscoa 2026", type: "Cupom", discount: "20%", status: "COMPLETED", startDate: "01/04/2026", endDate: "08/04/2026", stores: 67, views: 32000, conversions: 4500 },
];

const mockCoupons = [
  { code: "FASTCART30", discount: "30%", type: "Percentual", uses: 1234, maxUses: 5000, status: "ACTIVE", expires: "31/12/2026" },
  { code: "FRETE50", discount: "R$ 50", type: "Valor fixo", uses: 890, maxUses: 2000, status: "ACTIVE", expires: "30/06/2026" },
  { code: "WELCOME15", discount: "15%", type: "Percentual", uses: 4567, maxUses: 0, status: "ACTIVE", expires: "—" },
  { code: "SUMMER2025", discount: "25%", type: "Percentual", uses: 3200, maxUses: 3200, status: "EXPIRED", expires: "28/02/2026" },
];

const campaignStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "success" },
  SCHEDULED: { label: "Agendado", color: "info" },
  COMPLETED: { label: "Concluído", color: "accent" },
  PAUSED: { label: "Pausado", color: "warning" },
};

const couponStatusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "success" },
  EXPIRED: { label: "Expirado", color: "danger" },
  PAUSED: { label: "Pausado", color: "warning" },
};

export function SaMarketingPage() {
  const [tab, setTab] = useState("campaigns");

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Marketing"
        description="Campanhas, cupons e promoções da plataforma"
        actions={
          <Button className="bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-xl gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova Campanha
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Campanhas Ativas" value="3" icon={Megaphone} color="accent" />
        <SaStatCard title="Cupons Ativos" value="12" icon={Tag} color="info" />
        <SaStatCard title="Conversões (mês)" value="19.6K" icon={ShoppingBag} color="success" trend={{ value: 34, label: "" }} />
        <SaStatCard title="Receita Promocional" value="R$ 287K" icon={BarChart3} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="campaigns" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="coupons" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Cupons
          </TabsTrigger>
          <TabsTrigger value="banners" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Banners
          </TabsTrigger>
        </TabsList>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            {mockCampaigns.map(campaign => (
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
                        {campaign.type}: {campaign.discount}
                      </span>
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {campaign.startDate} — {campaign.endDate}
                      </span>
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                        {campaign.stores} lojas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-0.5">Views</p>
                      <p className="text-[14px] font-bold text-[hsl(var(--sa-text))]">
                        {campaign.views > 0 ? `${(campaign.views / 1000).toFixed(1)}K` : "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-0.5">Conversões</p>
                      <p className="text-[14px] font-bold text-[hsl(var(--sa-success))]">
                        {campaign.conversions > 0 ? `${(campaign.conversions / 1000).toFixed(1)}K` : "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-0.5">Taxa</p>
                      <p className="text-[14px] font-bold text-[hsl(var(--sa-accent))]">
                        {campaign.views > 0 ? `${((campaign.conversions / campaign.views) * 100).toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar for active campaigns */}
                {campaign.status === "ACTIVE" && campaign.views > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-success))]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((campaign.conversions / campaign.views) * 100 * 5, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Coupons */}
        <TabsContent value="coupons" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2">
            {mockCoupons.map(coupon => (
              <motion.div
                key={coupon.code}
                variants={fadeInUp}
                className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]/50 backdrop-blur-sm p-5 hover:bg-[hsl(var(--sa-surface-hover))] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold font-mono text-[hsl(var(--sa-accent))] tracking-wider sa-gradient-text">
                      {coupon.code}
                    </span>
                    <button className="h-6 w-6 rounded-md bg-[hsl(var(--sa-surface-hover))] flex items-center justify-center hover:bg-[hsl(var(--sa-accent))]/20 transition-colors">
                      <Copy className="h-3 w-3 text-[hsl(var(--sa-text-muted))]" />
                    </button>
                  </div>
                  <SaStatusBadge status={coupon.status} map={couponStatusMap} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Desconto</p>
                    <p className="text-[14px] font-bold text-[hsl(var(--sa-success))]">{coupon.discount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Tipo</p>
                    <p className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{coupon.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Usos</p>
                    <p className="text-[12px] text-[hsl(var(--sa-text))]">
                      {coupon.uses.toLocaleString()}{coupon.maxUses > 0 && ` / ${coupon.maxUses.toLocaleString()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">Expira</p>
                    <p className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{coupon.expires}</p>
                  </div>
                </div>

                {coupon.maxUses > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                    <motion.div
                      className={`h-full rounded-full ${
                        coupon.uses >= coupon.maxUses
                          ? "bg-[hsl(var(--sa-danger))]"
                          : "bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))]"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((coupon.uses / coupon.maxUses) * 100, 100)}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Banners */}
        <TabsContent value="banners" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            <SaCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Banners Ativos</h3>
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[11px] rounded-lg h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" /> Novo Banner
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: "Banner Principal", position: "Hero", clicks: 12400, size: "1200×400" },
                  { title: "Lateral Categorias", position: "Sidebar", clicks: 3200, size: "300×600" },
                  { title: "Rodapé Checkout", position: "Footer", clicks: 1800, size: "728×90" },
                ].map(banner => (
                  <motion.div
                    key={banner.title}
                    variants={fadeInUp}
                    className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4"
                  >
                    <div className="h-24 rounded-lg bg-gradient-to-br from-[hsl(var(--sa-accent))]/20 to-[hsl(var(--sa-info))]/20 border border-dashed border-[hsl(var(--sa-border-subtle))] flex items-center justify-center mb-3">
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{banner.size}</span>
                    </div>
                    <h4 className="text-[12px] font-semibold text-[hsl(var(--sa-text))] mb-1">{banner.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">{banner.position}</span>
                      <span className="text-[11px] font-bold text-[hsl(var(--sa-accent))] flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        {(banner.clicks / 1000).toFixed(1)}K cliques
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
