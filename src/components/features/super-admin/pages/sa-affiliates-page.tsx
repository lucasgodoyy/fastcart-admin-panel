"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

const mockPartners = [
  { id: 1, name: "Influencer Maria", email: "maria@influencer.com", code: "MARIA10", clicks: 1245, conversions: 89, revenue: "R$ 12.340", commission: "R$ 1.234", status: "ACTIVE", tier: "Gold" },
  { id: 2, name: "Blog TechReview", email: "tech@review.com", code: "TECH15", clicks: 890, conversions: 56, revenue: "R$ 8.760", commission: "R$ 876", status: "ACTIVE", tier: "Silver" },
  { id: 3, name: "Canal YouTube FIT", email: "fit@youtube.com", code: "FIT20", clicks: 2340, conversions: 124, revenue: "R$ 24.560", commission: "R$ 2.456", status: "ACTIVE", tier: "Platinum" },
  { id: 4, name: "Podcast Empreenda", email: "empreenda@pod.com", code: "POD10", clicks: 456, conversions: 23, revenue: "R$ 3.450", commission: "R$ 345", status: "PENDING", tier: "Bronze" },
  { id: 5, name: "Newsletter Daily", email: "daily@news.com", code: "DAILY5", clicks: 678, conversions: 34, revenue: "R$ 5.670", commission: "R$ 567", status: "ACTIVE", tier: "Silver" },
];

const mockCommissions = [
  { id: 1, partner: "Canal YouTube FIT", store: "Fashion Store", amount: "R$ 149,90", commission: "R$ 14,99", date: "28/02/2026", status: "PAID" },
  { id: 2, partner: "Influencer Maria", store: "TechGadgets", amount: "R$ 299,00", commission: "R$ 29,90", date: "27/02/2026", status: "PAID" },
  { id: 3, partner: "Blog TechReview", store: "Casa Decor", amount: "R$ 189,50", commission: "R$ 18,95", date: "27/02/2026", status: "PENDING" },
  { id: 4, partner: "Newsletter Daily", store: "Beleza Natural", amount: "R$ 79,90", commission: "R$ 7,99", date: "26/02/2026", status: "PENDING" },
];

const tiers = [
  { name: "Bronze", color: "sa-warning", minSales: 0, commission: "5%", partners: 12 },
  { name: "Silver", color: "sa-text-secondary", minSales: 50, commission: "8%", partners: 8 },
  { name: "Gold", color: "sa-warning", minSales: 100, commission: "10%", partners: 4 },
  { name: "Platinum", color: "sa-accent", minSales: 250, commission: "12%", partners: 2 },
];

export function SaAffiliatesPage() {
  const [tab, setTab] = useState("program");

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
        <SaStatCard title="Parceiros Ativos" value="26" icon={Users} color="accent" trend={{ value: 15, label: "" }} />
        <SaStatCard title="Receita por Afiliados" value="R$ 54.8K" icon={DollarSign} color="success" trend={{ value: 22, label: "" }} />
        <SaStatCard title="Comissões Pagas" value="R$ 5.4K" icon={TrendingUp} color="info" subtitle="Este mês" />
        <SaStatCard title="Taxa de Conversão" value="6.8%" icon={Percent} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="program" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Programa
          </TabsTrigger>
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

        {/* Program config */}
        <TabsContent value="program" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Tiers do Programa</h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {tiers.map((tier) => (
                  <motion.div
                    key={tier.name}
                    variants={fadeInUp}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4 hover:border-[hsl(var(--sa-border))] transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Star className={`h-4 w-4 text-[hsl(var(--${tier.color}))]`} />
                      <span className="text-[13px] font-bold text-[hsl(var(--sa-text))]">{tier.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[hsl(var(--sa-text-muted))]">Comissão</span>
                        <span className="font-bold text-[hsl(var(--sa-success))]">{tier.commission}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[hsl(var(--sa-text-muted))]">Mín. vendas/mês</span>
                        <span className="font-semibold text-[hsl(var(--sa-text))]">{tier.minSales}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[hsl(var(--sa-text-muted))]">Parceiros</span>
                        <span className="font-semibold text-[hsl(var(--sa-text))]">{tier.partners}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Configurações do Programa</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Cookie Duration</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">30 dias</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Pagamento Mínimo</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">R$ 50,00</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Dia de Pagamento</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">Todo dia 15</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Status do Programa</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-success))]">Ativo</span>
                </div>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* Partners tab */}
        <TabsContent value="partners" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Parceiros Afiliados" subtitle={`${mockPartners.length} parceiro(s)`}>
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
                  {mockPartners.map((p, i) => (
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
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{p.clicks.toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.conversions}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{p.commission}</TableCell>
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
            <SaTableCard title="Últimas Comissões" subtitle="Histórico de comissões geradas">
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
                  {mockCommissions.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{c.partner}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{c.store}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">{c.amount}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{c.commission}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{c.date}</TableCell>
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
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Links Mais Clicados</h3>
              <div className="space-y-3">
                {mockPartners.sort((a, b) => b.clicks - a.clicks).slice(0, 5).map((p, i) => (
                  <motion.div key={p.id} variants={fadeInUp} className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">#{i + 1}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                        <p className="text-[10px] text-[hsl(var(--sa-text-muted))] font-mono">{p.code}</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[hsl(var(--sa-accent))]">{p.clicks.toLocaleString("pt-BR")} cliques</span>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Melhores Conversores</h3>
              <div className="space-y-3">
                {mockPartners.sort((a, b) => (b.conversions / b.clicks) - (a.conversions / a.clicks)).slice(0, 5).map((p, i) => (
                  <motion.div key={p.id} variants={fadeInUp} className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">#{i + 1}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                        <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{p.conversions} conversões</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{((p.conversions / p.clicks) * 100).toFixed(1)}%</span>
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
