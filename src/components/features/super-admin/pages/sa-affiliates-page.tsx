"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import { motion } from "framer-motion";
import {
  Link2,
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Percent,
  BarChart3,
  Loader2,
  MousePointerClick,
  CreditCard,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { superAdminAffiliateService } from "@/services/affiliateService";
import type {
  AffiliateItem,
  AffiliateConversion,
  AffiliatePayout,
  AffiliateStats,
} from "@/types/affiliate";

// ── Helpers ──────────────────────────────────────────────────

function currency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ── Tab routes ───────────────────────────────────────────────

const affiliateTabRoutes: Record<string, string> = {
  overview: "",
  partners: "partners",
  commissions: "commissions",
  tracking: "tracking",
};

// ═══════════════════════════════════════════════════════════════
//  Main Page
// ═══════════════════════════════════════════════════════════════

export function SaAffiliatesPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/affiliates", affiliateTabRoutes, "overview");

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["sa-affiliate-stats"],
    queryFn: superAdminAffiliateService.getStats,
  });

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Programa de Afiliados"
        description="Visão geral da plataforma — todos os afiliados, comissões e pagamentos"
      />

      {/* ── Stats cards ─────────────────────────────────── */}
      {isLoadingStats ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--sa-text-muted))]" />
        </div>
      ) : stats ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SaStatCard
            title="Afiliados Ativos"
            value={String(stats.activeAffiliates)}
            icon={Users}
            color="accent"
            trend={{ value: stats.pendingAffiliates, label: "pendente(s)" }}
          />
          <SaStatCard
            title="Receita por Afiliados"
            value={currency(stats.totalRevenue)}
            icon={DollarSign}
            color="success"
            subtitle={`${stats.totalConversions} conversões`}
          />
          <SaStatCard
            title="Comissões Pagas"
            value={currency(stats.paidCommission)}
            icon={TrendingUp}
            color="info"
            subtitle={`${currency(stats.pendingCommission)} pendente`}
          />
          <SaStatCard
            title="Taxa de Conversão"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={Percent}
            color="warning"
            subtitle={`${stats.totalClicks} cliques`}
          />
        </motion.div>
      ) : null}

      {/* ── Tabs ────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="partners" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Parceiros
          </TabsTrigger>
          <TabsTrigger value="commissions" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Comissões
          </TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Pagamentos
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────── */}
        <TabsContent value="overview" className="mt-6">
          <OverviewTab stats={stats} />
        </TabsContent>

        {/* ── Partners ─────────────────────────────────── */}
        <TabsContent value="partners" className="mt-6">
          <PartnersTab />
        </TabsContent>

        {/* ── Commissions ──────────────────────────────── */}
        <TabsContent value="commissions" className="mt-6">
          <CommissionsTab />
        </TabsContent>

        {/* ── Payouts / Tracking ───────────────────────── */}
        <TabsContent value="tracking" className="mt-6">
          <PayoutsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Overview Tab — Top affiliates + recent conversions
// ═══════════════════════════════════════════════════════════════

function OverviewTab({ stats }: { stats?: AffiliateStats | null }) {
  const { data: topAffiliates } = useQuery({
    queryKey: ["sa-affiliates-top"],
    queryFn: () => superAdminAffiliateService.list({ status: "ACTIVE", size: 5 }),
  });

  const { data: recentConversions } = useQuery({
    queryKey: ["sa-conversions-recent"],
    queryFn: () => superAdminAffiliateService.listConversions({ size: 5 }),
  });

  const top = (topAffiliates?.content || []).sort((a, b) => b.totalRevenue - a.totalRevenue);
  const recent = recentConversions?.content || [];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
      {/* Top Affiliates */}
      <SaCard>
        <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Top Afiliados (por receita)</h3>
        {top.length === 0 ? (
          <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-4 text-center">Nenhum afiliado ativo na plataforma.</p>
        ) : (
          <div className="space-y-3">
            {top.map((a, i) => (
              <motion.div key={a.id} variants={fadeInUp} className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">#{i + 1}</span>
                  <div>
                    <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{a.name}</p>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{a.storeName || "—"} · <span className="font-mono">{a.referralCode}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{currency(a.totalRevenue)}</span>
                  <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{a.totalOrders} pedidos</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SaCard>

      {/* Recent Conversions */}
      <SaCard>
        <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Conversões Recentes</h3>
        {recent.length === 0 ? (
          <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-4 text-center">Nenhuma conversão registrada.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((c) => (
              <motion.div key={c.id} variants={fadeInUp} className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                <div>
                  <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{c.affiliateName}</p>
                  <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{c.storeName || "—"} · {fmtDate(c.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{currency(c.orderAmount)}</p>
                  <p className="text-[10px] font-bold text-[hsl(var(--sa-success))]">+{currency(c.commissionAmount)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SaCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Partners Tab
// ═══════════════════════════════════════════════════════════════

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--sa-bg))] px-2 py-1 text-[11px] font-mono font-bold text-[hsl(var(--sa-accent))]"
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {code}
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" />}
    </button>
  );
}

function PartnersTab() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["sa-affiliates-list", statusFilter, page],
    queryFn: () =>
      superAdminAffiliateService.list({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
  });

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px]">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Ativos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="SUSPENDED">Suspensos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--sa-text-muted))]" />
        </div>
      ) : items.length === 0 ? (
        <SaCard>
          <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-6 text-center">Nenhum parceiro encontrado.</p>
        </SaCard>
      ) : (
        <SaTableCard title="Parceiros Afiliados" subtitle={`${data?.totalElements || 0} parceiro(s)`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Parceiro</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Código</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Cliques</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Pedidos</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Receita</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Comissão</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{p.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{p.storeName || "—"}</TableCell>
                  <TableCell><CopyCode code={p.referralCode} /></TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{p.totalClicks.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.totalOrders}</TableCell>
                  <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{currency(p.totalRevenue)}</TableCell>
                  <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-accent))]">{currency(p.totalCommission)}</TableCell>
                  <TableCell><SaStatusBadge status={p.status} /></TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t border-[hsl(var(--sa-border-subtle))]">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="text-[11px]">Anterior</Button>
              <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="text-[11px]">Próximo</Button>
            </div>
          )}
        </SaTableCard>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Commissions Tab
// ═══════════════════════════════════════════════════════════════

function CommissionsTab() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["sa-conversions", statusFilter, page],
    queryFn: () =>
      superAdminAffiliateService.listConversions({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
  });

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4">
      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
        <SelectTrigger className="w-[180px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px]">
          <SelectValue placeholder="Filtrar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          <SelectItem value="PENDING">Pendentes</SelectItem>
          <SelectItem value="APPROVED">Aprovadas</SelectItem>
          <SelectItem value="REJECTED">Rejeitadas</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--sa-text-muted))]" />
        </div>
      ) : items.length === 0 ? (
        <SaCard>
          <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-6 text-center">Nenhuma comissão encontrada.</p>
        </SaCard>
      ) : (
        <SaTableCard title="Comissões" subtitle={`${data?.totalElements || 0} registro(s)`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Parceiro</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Valor Venda</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Taxa</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Comissão</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Data</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                >
                  <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{c.affiliateName}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{c.storeName || "—"}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">{currency(c.orderAmount)}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{c.commissionRate}%</TableCell>
                  <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{currency(c.commissionAmount)}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{fmtDate(c.createdAt)}</TableCell>
                  <TableCell>
                    <SaStatusBadge
                      status={c.status}
                      map={{
                        APPROVED: { label: "Aprovado", color: "success" },
                        PENDING: { label: "Pendente", color: "warning" },
                        REJECTED: { label: "Rejeitado", color: "error" },
                      }}
                    />
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t border-[hsl(var(--sa-border-subtle))]">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="text-[11px]">Anterior</Button>
              <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="text-[11px]">Próximo</Button>
            </div>
          )}
        </SaTableCard>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Payouts Tab
// ═══════════════════════════════════════════════════════════════

function PayoutsTab() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["sa-payouts", statusFilter, page],
    queryFn: () =>
      superAdminAffiliateService.listPayouts({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 20,
      }),
  });

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-4">
      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
        <SelectTrigger className="w-[180px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px]">
          <SelectValue placeholder="Filtrar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          <SelectItem value="PENDING">Pendentes</SelectItem>
          <SelectItem value="PROCESSING">Processando</SelectItem>
          <SelectItem value="PAID">Pagos</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--sa-text-muted))]" />
        </div>
      ) : items.length === 0 ? (
        <SaCard>
          <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-6 text-center">Nenhum pagamento encontrado.</p>
        </SaCard>
      ) : (
        <SaTableCard title="Pagamentos" subtitle={`${data?.totalElements || 0} registro(s)`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Parceiro</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Valor</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Método</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Referência</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Data</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                >
                  <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.affiliateName}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{p.storeName || "—"}</TableCell>
                  <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{currency(p.amount)}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    {p.method === "PIX" ? "PIX" : p.method === "BANK_TRANSFER" ? "Transferência" : p.method}
                  </TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{p.reference || "—"}</TableCell>
                  <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{fmtDate(p.createdAt)}</TableCell>
                  <TableCell>
                    <SaStatusBadge
                      status={p.status}
                      map={{
                        PAID: { label: "Pago", color: "success" },
                        PENDING: { label: "Pendente", color: "warning" },
                        PROCESSING: { label: "Processando", color: "info" },
                      }}
                    />
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t border-[hsl(var(--sa-border-subtle))]">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="text-[11px]">Anterior</Button>
              <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{page + 1} de {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="text-[11px]">Próximo</Button>
            </div>
          )}
        </SaTableCard>
      )}
    </motion.div>
  );
}
