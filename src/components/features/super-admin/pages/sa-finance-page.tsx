"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Download,
  Calendar,
  Building2,
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
import { useTabFromPath } from "../hooks/use-tab-from-path";

const tabRouteMap = { overview: "", transactions: "transactions", payouts: "payouts", fees: "fees" };

const mockTransactions = [
  { id: "TXN-001", store: "Fashion Store", type: "Venda", amount: "R$ 349,90", fee: "R$ 17,50", net: "R$ 332,40", date: "28/02/2026", status: "COMPLETED" },
  { id: "TXN-002", store: "TechGadgets", type: "Venda", amount: "R$ 1.299,00", fee: "R$ 64,95", net: "R$ 1.234,05", date: "28/02/2026", status: "COMPLETED" },
  { id: "TXN-003", store: "Casa Decor", type: "Reembolso", amount: "-R$ 89,90", fee: "-R$ 4,50", net: "-R$ 85,40", date: "27/02/2026", status: "REFUNDED" },
  { id: "TXN-004", store: "SportLife", type: "Venda", amount: "R$ 199,00", fee: "R$ 9,95", net: "R$ 189,05", date: "27/02/2026", status: "PENDING" },
  { id: "TXN-005", store: "Beleza Natural", type: "Assinatura", amount: "R$ 149,00", fee: "—", net: "R$ 149,00", date: "27/02/2026", status: "COMPLETED" },
];

const mockPayouts = [
  { id: "PAY-001", store: "Fashion Store", amount: "R$ 12.450", period: "01-15 Fev", date: "20/02/2026", status: "PAID" },
  { id: "PAY-002", store: "TechGadgets", amount: "R$ 8.320", period: "01-15 Fev", date: "20/02/2026", status: "PAID" },
  { id: "PAY-003", store: "Casa Decor", amount: "R$ 6.780", period: "01-15 Fev", date: "20/02/2026", status: "PROCESSING" },
  { id: "PAY-004", store: "SportLife", amount: "R$ 3.450", period: "16-28 Fev", date: "—", status: "SCHEDULED" },
];

const txnStatusMap: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: "Concluído", color: "success" },
  PENDING: { label: "Pendente", color: "warning" },
  REFUNDED: { label: "Reembolsado", color: "danger" },
  PAID: { label: "Pago", color: "success" },
  PROCESSING: { label: "Processando", color: "info" },
  SCHEDULED: { label: "Agendado", color: "accent" },
};

export function SaFinancePage() {
  const [tab, setTab] = useTabFromPath("/super-admin/finance", tabRouteMap, "overview");

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Financeiro"
        description="Gestão financeira da plataforma: transações, repasses e taxas"
        actions={
          <Button className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] rounded-xl gap-2 text-[12px]">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Receita Bruta" value="R$ 847K" icon={DollarSign} color="success" trend={{ value: 23, label: "" }} subtitle="Últimos 30 dias" />
        <SaStatCard title="Taxas da Plataforma" value="R$ 42.3K" icon={Receipt} color="accent" trend={{ value: 18, label: "" }} />
        <SaStatCard title="Repasses Pendentes" value="R$ 28.4K" icon={Banknote} color="warning" />
        <SaStatCard title="Reembolsos" value="R$ 3.2K" icon={CreditCard} color="danger" subtitle="0.38% do GMV" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Transações
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Repasses
          </TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Taxas
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Fluxo de Caixa</h3>
              <div className="space-y-4">
                {[
                  { label: "Entrada (vendas)", value: "R$ 847.000", change: 23, color: "sa-success" },
                  { label: "Taxas coletadas", value: "R$ 42.350", change: 18, color: "sa-accent" },
                  { label: "Assinaturas", value: "R$ 38.670", change: 12, color: "sa-info" },
                  { label: "Reembolsos", value: "-R$ 3.200", change: -15, color: "sa-danger" },
                  { label: "Repasses às lojas", value: "-R$ 801.450", change: 22, color: "sa-warning" },
                ].map(item => (
                  <motion.div key={item.label} variants={fadeInUp} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[14px] font-bold text-[hsl(var(--${item.color}))]`}>{item.value}</span>
                      <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${item.change > 0 ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-danger))]"}`}>
                        {item.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(item.change)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Top Lojas por Volume</h3>
              <div className="space-y-3">
                {[
                  { name: "Fashion Store", volume: "R$ 124.580", pct: 14.7 },
                  { name: "TechGadgets Pro", volume: "R$ 98.450", pct: 11.6 },
                  { name: "Casa Decor", volume: "R$ 76.320", pct: 9.0 },
                  { name: "SportLife", volume: "R$ 54.100", pct: 6.4 },
                  { name: "Beleza Natural", volume: "R$ 43.890", pct: 5.2 },
                ].map((store, i) => (
                  <motion.div key={store.name} variants={fadeInUp} className="flex items-center gap-3 py-2">
                    <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{store.name}</span>
                        <span className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{store.volume}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                        <motion.div
                          className="h-full rounded-full bg-[hsl(var(--sa-accent))]"
                          initial={{ width: 0 }}
                          animate={{ width: `${store.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Transações Recentes" subtitle="Últimas transações processadas">
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">ID</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Tipo</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Valor</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Taxa</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Líquido</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-text-muted))]">{tx.id}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">{tx.store}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{tx.type}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{tx.amount}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-accent))]">{tx.fee}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{tx.net}</TableCell>
                      <TableCell><SaStatusBadge status={tx.status} map={txnStatusMap} /></TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* Payouts */}
        <TabsContent value="payouts" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Repasses às Lojas" subtitle="Histórico de pagamentos">
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">ID</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Valor</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Período</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Data</TableHead>
                    <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayouts.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                    >
                      <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-text-muted))]">{p.id}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">{p.store}</TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">{p.amount}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{p.period}</TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{p.date}</TableCell>
                      <TableCell><SaStatusBadge status={p.status} map={txnStatusMap} /></TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* Fees */}
        <TabsContent value="fees" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Estrutura de Taxas</h3>
              <div className="space-y-3">
                {[
                  { label: "Taxa por Transação", value: "5.0%", desc: "Sobre o valor bruto de cada venda" },
                  { label: "Taxa de Processamento", value: "2.49% + R$ 0,39", desc: "Gateway de pagamento (Stripe)" },
                  { label: "Taxa de Saque", value: "R$ 3,67", desc: "Por transferência bancária" },
                  { label: "Taxa de Marketplace", value: "3.5%", desc: "Comissão adicional para marketplace" },
                ].map(fee => (
                  <motion.div key={fee.label} variants={fadeInUp} className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{fee.label}</span>
                      <span className="text-[13px] font-bold text-[hsl(var(--sa-accent))]">{fee.value}</span>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{fee.desc}</p>
                  </motion.div>
                ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Receita de Taxas (Mês)</h3>
              <div className="space-y-3">
                {[
                  { label: "Taxa por transação", value: "R$ 28.450", pct: 67.2 },
                  { label: "Assinaturas", value: "R$ 11.200", pct: 26.5 },
                  { label: "Outros", value: "R$ 2.700", pct: 6.3 },
                ].map((item, i) => (
                  <motion.div key={item.label} variants={fadeInUp}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{item.label}</span>
                      <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--sa-surface-hover))]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))]"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                      />
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
