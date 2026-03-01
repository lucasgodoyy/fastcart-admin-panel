"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Link2,
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Star,
  BarChart3,
  Clock,
  CheckCircle,
  Percent,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { superAdminService } from "@/services/super-admin";
import type { Affiliate, AffiliateConversion, AffiliatePayout, AffiliateStats } from "@/types/super-admin";

const fmtMoney = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function SaAffiliatesPage() {
  const [tab, setTab] = useState("partners");

  const { data: stats } = useQuery({
    queryKey: ["sa-affiliate-stats"],
    queryFn: superAdminService.getAffiliateStats,
  });

  const { data: affiliatesData } = useQuery({
    queryKey: ["sa-affiliates"],
    queryFn: () => superAdminService.listAffiliates({ size: 50 }),
  });

  const { data: conversionsData } = useQuery({
    queryKey: ["sa-affiliate-conversions"],
    queryFn: () => superAdminService.listAffiliateConversions({ size: 50 }),
    enabled: tab === "commissions" || tab === "tracking",
  });

  const { data: payoutsData } = useQuery({
    queryKey: ["sa-affiliate-payouts"],
    queryFn: () => superAdminService.listAffiliatePayouts({ size: 50 }),
    enabled: tab === "commissions",
  });

  const partners = affiliatesData?.content ?? [];
  const conversions = conversionsData?.content ?? [];

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Programa de Afiliados"
        description="Gerencie o programa de afiliados, parceiros e comissões"
        actions={
          <Button className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2">
            <Link2 className="h-4 w-4" /> Novo Parceiro
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Parceiros Ativos" value={String(stats?.activeAffiliates ?? 0)} icon={Users} color="accent" trend={{ value: 15, label: "" }} />
        <SaStatCard title="Receita por Afiliados" value={fmtMoney(stats?.totalRevenue ?? 0)} icon={DollarSign} color="success" trend={{ value: 22, label: "" }} />
        <SaStatCard title="Comissões Totais" value={fmtMoney(stats?.totalCommissions ?? 0)} icon={TrendingUp} color="info" />
        <SaStatCard title="Taxa de Conversão" value={`${(stats?.avgConversionRate ?? 0).toFixed(1)}%`} icon={Percent} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="partners" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Parceiros
          </TabsTrigger>
          <TabsTrigger value="commissions" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Comissões
          </TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Tracking
          </TabsTrigger>
        </TabsList>

        {/* Partners tab */}
        <TabsContent value="partners" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Parceiros Afiliados" subtitle={`${affiliatesData?.totalElements ?? 0} parceiro(s)`}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Parceiro</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Código</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Tier</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Cliques</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Conversões</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Comissão</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{p.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--sa-bg))] px-2 py-1 text-[11px] font-mono font-bold text-[hsl(var(--sa-accent))]">
                          {p.code} <Copy className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" />
                        </span>
                      </TableCell>
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.tier}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{p.totalClicks.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.totalConversions}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{fmtMoney(p.totalCommission)}</TableCell>
                      <TableCell><SaStatusBadge status={p.status} /></TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* Commissions tab */}
        <TabsContent value="commissions" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Últimas Conversões" subtitle="Histórico de comissões geradas">
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Parceiro</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Valor Venda</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Comissão</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Data</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{c.affiliateName}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{c.storeName}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">{fmtMoney(c.saleAmount)}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{fmtMoney(c.commissionAmount)}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <SaStatusBadge
                          status={c.status}
                          map={{ PAID: { label: "Pago", color: "success" }, PENDING: { label: "Pendente", color: "warning" } }}
                        />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* Tracking tab */}
        <TabsContent value="tracking" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Top Parceiros por Cliques</h3>
              <div className="space-y-3">
                {[...partners].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5).map((p, i) => (
                  <motion.div key={p.id} variants={fadeInUp} className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">#{i + 1}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                        <p className="text-[10px] text-[hsl(var(--sa-text-muted))] font-mono">{p.code}</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[hsl(var(--sa-accent))]">{p.totalClicks.toLocaleString("pt-BR")} cliques</span>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Melhores Conversores</h3>
              <div className="space-y-3">
                {[...partners].filter(p => p.totalClicks > 0).sort((a, b) => (b.totalConversions / b.totalClicks) - (a.totalConversions / a.totalClicks)).slice(0, 5).map((p, i) => (
                  <motion.div key={p.id} variants={fadeInUp} className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">#{i + 1}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                        <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{p.totalConversions} conversões</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{((p.totalConversions / p.totalClicks) * 100).toFixed(1)}%</span>
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
