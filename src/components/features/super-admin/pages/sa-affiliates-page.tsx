"use client";

import { useState } from "react";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Percent,
  Plus,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Wallet,
  Settings,
  Eye,
  Pencil,
  ExternalLink,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type {
  Affiliate,
  AffiliateConversion,
  AffiliatePayout,
  AffiliateLink,
  AffiliateSettings,
} from "@/types/super-admin";

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const thCls =
  "text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider";
const rowCls =
  "border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors";
const tabTriggerCls =
  "rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]";

// ─── Blank form helpers ────────────────────────────────────────
const blankPartnerForm = {
  name: "",
  email: "",
  phone: "",
  document: "",
  referralCode: "",
  commissionRate: "",
  pixKey: "",
  bankInfo: "",
  notes: "",
  storeId: "",
};

const blankPayoutForm = {
  affiliateId: "",
  amount: "",
  method: "PIX",
  reference: "",
  notes: "",
};

// ───────────────────────────────────────────────────────────────
export function SaAffiliatesPage() {
  const [tab, setTab] = useTabFromPath(
    "/super-admin/affiliates",
    {
      partners: "",
      commissions: "commissions",
      payouts: "payouts",
      tracking: "tracking",
      settings: "settings",
      "how-it-works": "how-it-works",
    },
    "partners",
  );

  const qc = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────
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
    enabled: tab === "payouts",
  });

  const { data: linksData } = useQuery({
    queryKey: ["sa-affiliate-links"],
    queryFn: () => superAdminService.listAffiliateLinks({ size: 50 }),
    enabled: tab === "tracking",
  });

  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ["sa-affiliate-settings"],
    queryFn: () => superAdminService.getAffiliateSettings(),
    enabled: tab === "settings",
  });

  const partners = affiliatesData?.content ?? [];
  const conversions = conversionsData?.content ?? [];
  const payouts = payoutsData?.content ?? [];
  const links = linksData?.content ?? [];

  // ── Dialog state ─────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<Affiliate | null>(null);
  const [detailPartner, setDetailPartner] = useState<Affiliate | null>(null);
  const [partnerForm, setPartnerForm] = useState(blankPartnerForm);

  const [rejectConvId, setRejectConvId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState(blankPayoutForm);

  const [settingsForm, setSettingsForm] = useState<Partial<AffiliateSettings>>({});
  const [settingsStoreId, setSettingsStoreId] = useState("1");

  // ── Mutations ────────────────────────────────────────────────
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sa-affiliates"] });
    qc.invalidateQueries({ queryKey: ["sa-affiliate-stats"] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      superAdminService.createAffiliate(Number(partnerForm.storeId) || 1, {
        name: partnerForm.name,
        email: partnerForm.email,
        phone: partnerForm.phone || undefined,
        document: partnerForm.document || undefined,
        referralCode: partnerForm.referralCode || undefined,
        commissionRate: partnerForm.commissionRate
          ? Number(partnerForm.commissionRate)
          : undefined,
        pixKey: partnerForm.pixKey || undefined,
        bankInfo: partnerForm.bankInfo || undefined,
        notes: partnerForm.notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setPartnerForm(blankPartnerForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      superAdminService.updateAffiliate(editPartner!.id, {
        name: partnerForm.name || undefined,
        phone: partnerForm.phone || undefined,
        document: partnerForm.document || undefined,
        commissionRate: partnerForm.commissionRate
          ? Number(partnerForm.commissionRate)
          : undefined,
        pixKey: partnerForm.pixKey || undefined,
        bankInfo: partnerForm.bankInfo || undefined,
        notes: partnerForm.notes || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setEditPartner(null);
      setPartnerForm(blankPartnerForm);
    },
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => superAdminService.approveAffiliate(id),
    onSuccess: invalidate,
  });

  const suspendMut = useMutation({
    mutationFn: (id: number) => superAdminService.suspendAffiliate(id),
    onSuccess: invalidate,
  });

  const approveConvMut = useMutation({
    mutationFn: (id: number) => superAdminService.approveAffiliateConversion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sa-affiliate-conversions"] }),
  });

  const rejectConvMut = useMutation({
    mutationFn: () => superAdminService.rejectAffiliateConversion(rejectConvId!, rejectReason || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sa-affiliate-conversions"] });
      setRejectConvId(null);
      setRejectReason("");
    },
  });

  const createPayoutMut = useMutation({
    mutationFn: () =>
      superAdminService.createAffiliatePayout({
        affiliateId: Number(payoutForm.affiliateId),
        amount: Number(payoutForm.amount),
        method: payoutForm.method || undefined,
        reference: payoutForm.reference || undefined,
        notes: payoutForm.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sa-affiliate-payouts"] });
      setPayoutOpen(false);
      setPayoutForm(blankPayoutForm);
    },
  });

  const markPaidMut = useMutation({
    mutationFn: (id: number) => superAdminService.markAffiliatePayoutPaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sa-affiliate-payouts"] }),
  });

  const saveSettingsMut = useMutation({
    mutationFn: () =>
      superAdminService.updateAffiliateSettings(Number(settingsStoreId) || 1, {
        enabled: settingsForm.enabled,
        commissionRate: settingsForm.commissionRate,
        cookieDays: settingsForm.cookieDays,
        minPayout: settingsForm.minPayout,
        payoutDay: settingsForm.payoutDay,
        autoApprove: settingsForm.autoApprove,
        termsUrl: settingsForm.termsUrl ?? undefined,
      }),
    onSuccess: () => refetchSettings(),
  });

  // ── Helpers ──────────────────────────────────────────────────
  const openCreate = () => {
    setPartnerForm(blankPartnerForm);
    setCreateOpen(true);
  };

  const openEdit = (p: Affiliate) => {
    setPartnerForm({
      name: p.name,
      email: p.email,
      phone: p.phone ?? "",
      document: p.document ?? "",
      referralCode: p.referralCode,
      commissionRate: String(p.commissionRate ?? ""),
      pixKey: p.pixKey ?? "",
      bankInfo: p.bankInfo ?? "",
      notes: p.notes ?? "",
      storeId: String(p.storeId ?? ""),
    });
    setEditPartner(p);
  };

  const loadSettings = () => {
    if (settingsData) setSettingsForm({ ...settingsData });
  };

  // Load settings when data arrives
  if (tab === "settings" && settingsData && !settingsForm.id) {
    setSettingsForm({ ...settingsData });
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Programa de Afiliados"
        description="Gerencie parceiros, comissões, pagamentos, links e configurações"
        actions={
          <Button
            className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-lg gap-2"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" /> Novo Parceiro
          </Button>
        }
      />

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <SaStatCard
          title="Parceiros Ativos"
          value={String(stats?.activeAffiliates ?? 0)}
          icon={Users}
          color="accent"
        />
        <SaStatCard
          title="Receita Afiliados"
          value={fmtMoney(stats?.totalRevenue ?? 0)}
          icon={DollarSign}
          color="success"
        />
        <SaStatCard
          title="Comissões Totais"
          value={fmtMoney(stats?.totalCommission ?? 0)}
          icon={TrendingUp}
          color="info"
        />
        <SaStatCard
          title="Pend. Pagamento"
          value={fmtMoney(stats?.pendingCommission ?? 0)}
          icon={Wallet}
          color="warning"
        />
        <SaStatCard
          title="Taxa Conversão"
          value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`}
          icon={Percent}
          color="accent"
        />
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-lg p-1">
          <TabsTrigger value="partners" className={tabTriggerCls}>Parceiros</TabsTrigger>
          <TabsTrigger value="commissions" className={tabTriggerCls}>Comissões</TabsTrigger>
          <TabsTrigger value="payouts" className={tabTriggerCls}>Pagamentos</TabsTrigger>
          <TabsTrigger value="tracking" className={tabTriggerCls}>Tracking</TabsTrigger>
          <TabsTrigger value="settings" className={tabTriggerCls}>Configurações</TabsTrigger>
          <TabsTrigger value="how-it-works" className={tabTriggerCls}>Como Funciona</TabsTrigger>
        </TabsList>

        {/* ─── PARTNERS TAB ─────────────────────────────────────── */}
        <TabsContent value="partners" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard
              title="Parceiros Afiliados"
              subtitle={`${affiliatesData?.totalElements ?? 0} parceiro(s)`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className={thCls}>Parceiro</TableHead>
                    <TableHead className={thCls}>Código</TableHead>
                    <TableHead className={thCls}>Comissão</TableHead>
                    <TableHead className={thCls}>Cliques</TableHead>
                    <TableHead className={thCls}>Conversões</TableHead>
                    <TableHead className={thCls}>Total Comissão</TableHead>
                    <TableHead className={thCls}>Status</TableHead>
                    <TableHead className={thCls}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <SaEmptyState icon={Users} title="Nenhum parceiro" description="Adicione o primeiro parceiro afiliado" />
                      </TableCell>
                    </TableRow>
                  )}
                  {partners.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={rowCls}
                    >
                      <TableCell>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{p.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--sa-bg))] px-2 py-1 text-[11px] font-mono font-bold text-[hsl(var(--sa-accent))]">
                          {p.referralCode}
                          <Copy
                            className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100"
                            onClick={() => navigator.clipboard.writeText(p.referralCode)}
                          />
                        </span>
                      </TableCell>
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                        {p.commissionRate != null ? `${p.commissionRate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {p.totalClicks.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                        {p.totalOrders}
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                        {fmtMoney(p.totalCommission)}
                      </TableCell>
                      <TableCell>
                        <SaStatusBadge status={p.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Ver detalhes"
                            onClick={() => setDetailPartner(p)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Editar"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {p.status === "PENDING" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-[hsl(var(--sa-success))]"
                              title="Aprovar"
                              onClick={() => approveMut.mutate(p.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {p.status === "ACTIVE" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-[hsl(var(--sa-warning))]"
                              title="Suspender"
                              onClick={() => suspendMut.mutate(p.id)}
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {p.status === "SUSPENDED" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-[hsl(var(--sa-success))]"
                              title="Reativar"
                              onClick={() => approveMut.mutate(p.id)}
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* ─── COMMISSIONS TAB ──────────────────────────────────── */}
        <TabsContent value="commissions" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard
              title="Conversões / Comissões"
              subtitle={`${conversionsData?.totalElements ?? 0} registro(s)`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className={thCls}>Parceiro</TableHead>
                    <TableHead className={thCls}>Loja</TableHead>
                    <TableHead className={thCls}>Pedido</TableHead>
                    <TableHead className={thCls}>Valor Venda</TableHead>
                    <TableHead className={thCls}>Taxa</TableHead>
                    <TableHead className={thCls}>Comissão</TableHead>
                    <TableHead className={thCls}>Data</TableHead>
                    <TableHead className={thCls}>Status</TableHead>
                    <TableHead className={thCls}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <SaEmptyState icon={DollarSign} title="Nenhuma conversão" description="As conversões aparecerão aqui" />
                      </TableCell>
                    </TableRow>
                  )}
                  {conversions.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={rowCls}
                    >
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                        {c.affiliateName}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {c.storeName}
                      </TableCell>
                      <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-text-muted))]">
                        #{c.orderId ?? "-"}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">
                        {fmtMoney(c.orderAmount)}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {c.commissionRate}%
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                        {fmtMoney(c.commissionAmount)}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <SaStatusBadge
                          status={c.status}
                          map={{
                            APPROVED: { label: "Aprovado", color: "success" },
                            PENDING: { label: "Pendente", color: "warning" },
                            REJECTED: { label: "Rejeitado", color: "danger" },
                            PAID: { label: "Pago", color: "info" },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {c.status === "PENDING" && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] text-[hsl(var(--sa-success))]"
                              onClick={() => approveConvMut.mutate(c.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] text-[hsl(var(--sa-error))]"
                              onClick={() => setRejectConvId(c.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Rejeitar
                            </Button>
                          </div>
                        )}
                        {c.rejectionReason && (
                          <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">
                            {c.rejectionReason}
                          </span>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* ─── PAYOUTS TAB ──────────────────────────────────────── */}
        <TabsContent value="payouts" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Button
              className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-lg gap-2"
              onClick={() => {
                setPayoutForm(blankPayoutForm);
                setPayoutOpen(true);
              }}
            >
              <Wallet className="h-4 w-4" /> Novo Pagamento
            </Button>
          </div>

          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard
              title="Pagamentos de Afiliados"
              subtitle={`${payoutsData?.totalElements ?? 0} pagamento(s)`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className={thCls}>Parceiro</TableHead>
                    <TableHead className={thCls}>Loja</TableHead>
                    <TableHead className={thCls}>Valor</TableHead>
                    <TableHead className={thCls}>Método</TableHead>
                    <TableHead className={thCls}>Referência</TableHead>
                    <TableHead className={thCls}>Data</TableHead>
                    <TableHead className={thCls}>Pago em</TableHead>
                    <TableHead className={thCls}>Status</TableHead>
                    <TableHead className={thCls}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <SaEmptyState icon={Wallet} title="Nenhum pagamento" description="Crie um pagamento para um afiliado" />
                      </TableCell>
                    </TableRow>
                  )}
                  {payouts.map((py, i) => (
                    <motion.tr
                      key={py.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={rowCls}
                    >
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                        {py.affiliateName}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                        {py.storeName}
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                        {fmtMoney(py.amount)}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">
                        {py.method ?? "-"}
                      </TableCell>
                      <TableCell className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))]">
                        {py.reference ?? "-"}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                        {new Date(py.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                        {py.paidAt ? new Date(py.paidAt).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell>
                        <SaStatusBadge
                          status={py.status}
                          map={{
                            PAID: { label: "Pago", color: "success" },
                            PENDING: { label: "Pendente", color: "warning" },
                            PROCESSING: { label: "Processando", color: "info" },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {py.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[11px] text-[hsl(var(--sa-success))]"
                            onClick={() => markPaidMut.mutate(py.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Marcar Pago
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* ─── TRACKING TAB ─────────────────────────────────────── */}
        <TabsContent value="tracking" className="mt-6 space-y-6">
          {/* Top partner cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-6 lg:grid-cols-2"
          >
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">
                Top Parceiros por Cliques
              </h3>
              <div className="space-y-3">
                {[...partners]
                  .sort((a, b) => b.totalClicks - a.totalClicks)
                  .slice(0, 5)
                  .map((p, i) => (
                    <motion.div
                      key={p.id}
                      variants={fadeInUp}
                      className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                          <p className="text-[10px] text-[hsl(var(--sa-text-muted))] font-mono">
                            {p.referralCode}
                          </p>
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-[hsl(var(--sa-accent))]">
                        {p.totalClicks.toLocaleString("pt-BR")} cliques
                      </span>
                    </motion.div>
                  ))}
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">
                Melhores Conversores
              </h3>
              <div className="space-y-3">
                {[...partners]
                  .filter((p) => p.totalClicks > 0)
                  .sort((a, b) => b.totalOrders / b.totalClicks - a.totalOrders / a.totalClicks)
                  .slice(0, 5)
                  .map((p, i) => (
                    <motion.div
                      key={p.id}
                      variants={fadeInUp}
                      className="flex items-center justify-between py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] w-5">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">{p.name}</p>
                          <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">
                            {p.totalOrders} conversões
                          </p>
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                        {((p.totalOrders / p.totalClicks) * 100).toFixed(1)}%
                      </span>
                    </motion.div>
                  ))}
              </div>
            </SaCard>
          </motion.div>

          {/* Links table */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard
              title="Links de Afiliados"
              subtitle={`${linksData?.totalElements ?? 0} link(s)`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                    <TableHead className={thCls}>Parceiro</TableHead>
                    <TableHead className={thCls}>Slug</TableHead>
                    <TableHead className={thCls}>Destino</TableHead>
                    <TableHead className={thCls}>UTM</TableHead>
                    <TableHead className={thCls}>Cliques</TableHead>
                    <TableHead className={thCls}>Conversões</TableHead>
                    <TableHead className={thCls}>Ativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <SaEmptyState icon={Link2} title="Nenhum link" description="Os links de afiliados aparecerão aqui" />
                      </TableCell>
                    </TableRow>
                  )}
                  {links.map((lk, i) => (
                    <motion.tr
                      key={lk.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={rowCls}
                    >
                      <TableCell className="text-[12px] font-semibold text-[hsl(var(--sa-text))]">
                        {lk.affiliateName ?? "-"}
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-mono font-bold text-[hsl(var(--sa-accent))]">
                          /{lk.slug}
                        </span>
                      </TableCell>
                      <TableCell className="text-[11px] text-[hsl(var(--sa-text-muted))] max-w-[200px] truncate">
                        {lk.destinationUrl}
                      </TableCell>
                      <TableCell className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                        {[lk.utmSource, lk.utmMedium, lk.utmCampaign].filter(Boolean).join(" / ") || "-"}
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-accent))]">
                        {lk.totalClicks.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-[12px] font-bold text-[hsl(var(--sa-success))]">
                        {lk.totalConversions}
                      </TableCell>
                      <TableCell>
                        <SaStatusBadge
                          status={lk.active ? "ACTIVE" : "INACTIVE"}
                          map={{
                            ACTIVE: { label: "Ativo", color: "success" },
                            INACTIVE: { label: "Inativo", color: "danger" },
                          }}
                        />
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* ─── SETTINGS TAB ─────────────────────────────────────── */}
        <TabsContent value="settings" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[16px] font-semibold text-[hsl(var(--sa-text))]">
                    Configurações do Programa de Afiliados
                  </h3>
                  <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                    Configure taxas, cookies, pagamentos e regras globais
                  </p>
                </div>
                <Button
                  className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-lg"
                  onClick={() => saveSettingsMut.mutate()}
                  disabled={saveSettingsMut.isPending}
                >
                  {saveSettingsMut.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Enabled */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]">
                  <div>
                    <Label className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">
                      Programa Ativo
                    </Label>
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                      Habilitar/desabilitar o programa de afiliados
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.enabled ?? false}
                    onCheckedChange={(v) => setSettingsForm((s) => ({ ...s, enabled: v }))}
                  />
                </div>

                {/* Auto-approve */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))]">
                  <div>
                    <Label className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">
                      Auto-Aprovar Conversões
                    </Label>
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                      Aprovar automaticamente conversões sem revisão manual
                    </p>
                  </div>
                  <Switch
                    checked={settingsForm.autoApprove ?? false}
                    onCheckedChange={(v) => setSettingsForm((s) => ({ ...s, autoApprove: v }))}
                  />
                </div>

                {/* Commission rate */}
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Taxa de Comissão Padrão (%)
                  </Label>
                  <Input
                    type="number"
                    value={settingsForm.commissionRate ?? ""}
                    onChange={(e) =>
                      setSettingsForm((s) => ({
                        ...s,
                        commissionRate: Number(e.target.value),
                      }))
                    }
                    className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>

                {/* Cookie days */}
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Duração do Cookie (dias)
                  </Label>
                  <Input
                    type="number"
                    value={settingsForm.cookieDays ?? ""}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, cookieDays: Number(e.target.value) }))
                    }
                    className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>

                {/* Min payout */}
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Pagamento Mínimo (R$)
                  </Label>
                  <Input
                    type="number"
                    value={settingsForm.minPayout ?? ""}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, minPayout: Number(e.target.value) }))
                    }
                    className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>

                {/* Payout day */}
                <div className="space-y-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    Dia do Pagamento (dia do mês)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={settingsForm.payoutDay ?? ""}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, payoutDay: Number(e.target.value) }))
                    }
                    className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>

                {/* Terms URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
                    URL dos Termos de Afiliados
                  </Label>
                  <Input
                    value={settingsForm.termsUrl ?? ""}
                    onChange={(e) =>
                      setSettingsForm((s) => ({ ...s, termsUrl: e.target.value }))
                    }
                    placeholder="https://suaempresa.com/termos-afiliados"
                    className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
                  />
                </div>
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>

        {/* ─── HOW IT WORKS TAB ─────────────────────────────────── */}
        <TabsContent value="how-it-works" className="mt-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-6">
            {/* Overview */}
            <SaCard title="Visão Geral do Programa de Afiliados" subtitle="Como o sistema funciona de ponta a ponta">
              <div className="space-y-4 text-[13px] text-[hsl(var(--sa-text-secondary))] leading-relaxed">
                <p>
                  O programa de afiliados permite que parceiros externos promovam as lojas da plataforma
                  e ganhem comissões sobre vendas geradas através de seus links exclusivos. O sistema
                  é gerenciado centralmente pelo Super Admin e funciona por loja individualmente.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { n: "1", t: "Cadastro do Parceiro", d: "Admin ou Super Admin cadastra o afiliado com nome, e-mail, comissão (%) e dados bancários/PIX." },
                    { n: "2", t: "Link de Referência", d: "Um código único (referralCode) é gerado. Links de afiliado incluem UTM params para rastreamento." },
                    { n: "3", t: "Cookie de Tracking", d: "Quando alguém clica no link, um cookie é salvo (duração configurável, padrão 30 dias)." },
                    { n: "4", t: "Click Registrado", d: "Cada clique é registrado com IP, user-agent, timestamp e associado ao afiliado." },
                    { n: "5", t: "Conversão (Venda)", d: "Se o visitante compra dentro do período do cookie, uma conversão é registrada automaticamente." },
                    { n: "6", t: "Comissão Calculada", d: "A comissão é calculada como % do valor da venda. Fica como PENDING até aprovação." },
                    { n: "7", t: "Aprovação", d: "Admin ou Super Admin aprova a conversão. Pode rejeitar com motivo." },
                    { n: "8", t: "Pagamento", d: "No dia definido, cria-se um payout via PIX ou transferência. Mínimo configurável." },
                  ].map(s => (
                    <div key={s.n} className="rounded-lg border border-[hsl(var(--sa-border-subtle))] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--sa-accent))] text-white text-[10px] font-bold">{s.n}</div>
                        <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{s.t}</span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SaCard>

            {/* Backend API Status */}
            <SaCard title="Status da API Backend" subtitle="Endpoints implementados e funcionalidades">
              <div className="space-y-3">
                <div className="text-[12px] font-bold text-[hsl(var(--sa-text))] mb-2">✅ Endpoints Implementados (Nível Loja — /api/v1/affiliates)</div>
                <div className="grid gap-1.5">
                  {[
                    { m: "GET", p: "/settings", d: "Obter config do programa" },
                    { m: "PUT", p: "/settings", d: "Atualizar config do programa" },
                    { m: "GET", p: "/", d: "Listar afiliados (com paginação e filtro status)" },
                    { m: "GET", p: "/{id}", d: "Detalhe do afiliado" },
                    { m: "POST", p: "/", d: "Criar afiliado" },
                    { m: "PUT", p: "/{id}", d: "Atualizar afiliado" },
                    { m: "GET", p: "/links", d: "Listar links (filtro por afiliado)" },
                    { m: "POST", p: "/links", d: "Criar link de afiliado" },
                    { m: "GET", p: "/conversions", d: "Listar conversões" },
                    { m: "PUT", p: "/conversions/{id}/approve", d: "Aprovar conversão" },
                    { m: "PUT", p: "/conversions/{id}/reject", d: "Rejeitar conversão" },
                    { m: "GET", p: "/payouts", d: "Listar pagamentos" },
                    { m: "POST", p: "/payouts", d: "Criar pagamento" },
                    { m: "PUT", p: "/payouts/{id}/paid", d: "Marcar como pago" },
                    { m: "GET", p: "/stats", d: "Estatísticas do programa" },
                  ].map((api, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--sa-border-subtle))] px-3 py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        api.m === "GET" ? "bg-blue-500/10 text-blue-400" :
                        api.m === "POST" ? "bg-green-500/10 text-green-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>{api.m}</span>
                      <code className="text-[11px] text-[hsl(var(--sa-text))] font-mono">{api.p}</code>
                      <span className="text-[11px] text-[hsl(var(--sa-text-muted))] ml-auto">{api.d}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[12px] font-bold text-[hsl(var(--sa-text))] mt-4 mb-2">✅ Endpoint Público (tracking de cliques)</div>
                <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--sa-border-subtle))] px-3 py-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">GET</span>
                  <code className="text-[11px] text-[hsl(var(--sa-text))] font-mono">/api/v1/public/affiliates/...</code>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))] ml-auto">Registro de cliques público</span>
                </div>
              </div>
            </SaCard>

            {/* Frontend Status */}
            <SaCard title="Status do Frontend" subtitle="Telas e funcionalidades implementadas">
              <div className="space-y-4">
                <div>
                  <div className="text-[12px] font-bold text-[hsl(var(--sa-text))] mb-2">✅ Super Admin (esta tela)</div>
                  <div className="grid gap-1.5 ml-4">
                    {[
                      "Dashboard com stats (parceiros ativos, receita, comissões, taxa conversão)",
                      "CRUD completo de parceiros (criar, editar, detalhe, aprovar, suspender, reativar)",
                      "Tabela de comissões com aprovação/rejeição",
                      "Tabela de pagamentos com criação e marcação como pago",
                      "Tracking: top parceiros por cliques, melhores conversores, tabela de links",
                      "Configurações: ativar/desativar, taxa, cookie, mínimo, dia de pagamento, auto-aprovação",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[hsl(var(--sa-text-secondary))]">
                        <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[hsl(var(--sa-text))] mb-2">✅ Painel do Lojista (/admin/marketing/affiliates)</div>
                  <div className="grid gap-1.5 ml-4">
                    {[
                      "Dashboard com stats e top afiliados",
                      "CRUD de afiliados com filtro de status",
                      "Criação e gerenciamento de links com UTM",
                      "Tabela de conversões com aprovação/rejeição",
                      "Criação de payouts mostrando saldo pendente",
                      "Configurações: comissão, cookie, mínimo, auto-aprovação, termos",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[hsl(var(--sa-text-secondary))]">
                        <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SaCard>

            {/* Database Entities */}
            <SaCard title="Entidades do Banco de Dados" subtitle="Estrutura de dados do programa">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { t: "AffiliateSettingsEntity", d: "Configurações do programa por loja: enabled, commissionRate, cookieDays, minPayout, payoutDay, autoApprove, termsUrl" },
                  { t: "AffiliateEntity", d: "Parceiro afiliado: name, email, phone, document, referralCode, commissionRate, pixKey, bankInfo, status, store" },
                  { t: "AffiliateLinkEntity", d: "Link de tracking: affiliate, slug, destinationUrl, utmSource, utmMedium, utmCampaign, clicks, conversions, active" },
                  { t: "AffiliateClickEntity", d: "Registro de clique: link, ip, userAgent, referer, timestamp" },
                  { t: "AffiliateConversionEntity", d: "Conversão (venda): affiliate, orderId, saleAmount, commissionRate, commissionAmount, status, rejectReason" },
                  { t: "AffiliatePayoutEntity", d: "Pagamento: affiliate, amount, method, reference, notes, status, paidAt" },
                ].map((e, i) => (
                  <div key={i} className="rounded-lg border border-[hsl(var(--sa-border-subtle))] p-4">
                    <code className="text-[11px] font-bold text-[hsl(var(--sa-accent))] font-mono">{e.t}</code>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))] mt-1.5 leading-relaxed">{e.d}</p>
                  </div>
                ))}
              </div>
            </SaCard>

            {/* What's Missing / TODO */}
            <SaCard title="O que falta / Melhorias futuras" subtitle="Items pendentes para completar o programa">
              <div className="space-y-4">
                <div>
                  <div className="text-[12px] font-bold text-amber-400 mb-2">⚠️ Pendente — Prioridade Alta</div>
                  <div className="grid gap-1.5 ml-4">
                    {[
                      "Registro automático de conversão no checkout (quando pedido é pago, verificar cookie e criar conversão)",
                      "Endpoint público de redirect: /ref/{code} → redireciona e seta cookie de tracking",
                      "Webhook de pagamento do Stripe → trigger de conversão automática",
                      "Página pública de registro de afiliado (landing page para novos afiliados se cadastrarem)",
                      "Dashboard do afiliado: área onde o afiliado vê suas stats, links e ganhos",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[hsl(var(--sa-text-secondary))]">
                        <XCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-blue-400 mb-2">📋 Pendente — Prioridade Média</div>
                  <div className="grid gap-1.5 ml-4">
                    {[
                      "E-mail automático para afiliado quando conversão é aprovada",
                      "E-mail automático quando pagamento é feito",
                      "Relatório exportável de comissões (CSV/Excel)",
                      "Filtro por período (mês/semana) nas tabelas de conversões e payouts",
                      "Integração com PIX automático via Stripe Payouts",
                      "Notificação no painel quando nova conversão pendente",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[hsl(var(--sa-text-secondary))]">
                        <XCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[hsl(var(--sa-text-muted))] mb-2">💡 Melhorias Futuras</div>
                  <div className="grid gap-1.5 ml-4">
                    {[
                      "Sistema de tiers de comissão (bronze/silver/gold)",
                      "Comissão recorrente para assinaturas",
                      "Materiais de marketing (banners, textos) para afiliados",
                      "API pública para afiliados integrarem com seus próprios sistemas",
                      "Painel de ranking de afiliados (gamificação)",
                      "Suporte a multi-nível (MLM) se necessário",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[hsl(var(--sa-text-muted))]">
                        <span className="h-3.5 w-3.5 shrink-0 mt-0.5 text-center">•</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SaCard>

            {/* Current Status Summary */}
            <div className="rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-6">
              <div className="text-center space-y-3">
                <div className="text-[14px] font-bold text-[hsl(var(--sa-text))]">Status Atual: 70% Implementado</div>
                <div className="w-full h-3 bg-[hsl(var(--sa-bg))] rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] rounded-full" style={{ width: "70%" }} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center pt-2">
                  <div>
                    <div className="text-[18px] font-bold text-green-400">15</div>
                    <div className="text-[10px] text-[hsl(var(--sa-text-muted))]">Endpoints API</div>
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-green-400">12</div>
                    <div className="text-[10px] text-[hsl(var(--sa-text-muted))]">Telas Frontend</div>
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-green-400">6</div>
                    <div className="text-[10px] text-[hsl(var(--sa-text-muted))]">Entidades DB</div>
                  </div>
                </div>
                <p className="text-[11px] text-[hsl(var(--sa-text-muted))] max-w-md mx-auto">
                  O CRUD completo está funcional. Falta a integração automática com checkout (conversão via cookie)
                  e a área pública do afiliado para tornar o programa 100% operacional.
                </p>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ─── DIALOGS ──────────────────────────────────────────── */}

      {/* Create partner dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Parceiro Afiliado</DialogTitle>
            <DialogDescription className="text-[hsl(var(--sa-text-muted))]">
              Preencha os dados do novo afiliado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Nome *</Label>
                <Input
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">E-mail *</Label>
                <Input
                  type="email"
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, email: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Telefone</Label>
                <Input
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">CPF/CNPJ</Label>
                <Input
                  value={partnerForm.document}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, document: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Código Referral</Label>
                <Input
                  value={partnerForm.referralCode}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, referralCode: e.target.value }))}
                  placeholder="Gerado automaticamente se vazio"
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Comissão (%)</Label>
                <Input
                  type="number"
                  value={partnerForm.commissionRate}
                  onChange={(e) =>
                    setPartnerForm((f) => ({ ...f, commissionRate: e.target.value }))
                  }
                  placeholder="Usa padrão se vazio"
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Chave PIX</Label>
                <Input
                  value={partnerForm.pixKey}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, pixKey: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Info Bancária</Label>
                <Input
                  value={partnerForm.bankInfo}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, bankInfo: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[12px]">ID da Loja</Label>
              <Input
                type="number"
                value={partnerForm.storeId}
                onChange={(e) => setPartnerForm((f) => ({ ...f, storeId: e.target.value }))}
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px]">Observações</Label>
              <Input
                value={partnerForm.notes}
                onChange={(e) => setPartnerForm((f) => ({ ...f, notes: e.target.value }))}
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white"
              onClick={() => createMut.mutate()}
              disabled={!partnerForm.name || !partnerForm.email || createMut.isPending}
            >
              {createMut.isPending ? "Criando..." : "Criar Parceiro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit partner dialog */}
      <Dialog open={!!editPartner} onOpenChange={(o) => !o && setEditPartner(null)}>
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
            <DialogDescription className="text-[hsl(var(--sa-text-muted))]">
              Edite os dados de {editPartner?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Nome</Label>
                <Input
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Telefone</Label>
                <Input
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">CPF/CNPJ</Label>
                <Input
                  value={partnerForm.document}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, document: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Comissão (%)</Label>
                <Input
                  type="number"
                  value={partnerForm.commissionRate}
                  onChange={(e) =>
                    setPartnerForm((f) => ({ ...f, commissionRate: e.target.value }))
                  }
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Chave PIX</Label>
                <Input
                  value={partnerForm.pixKey}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, pixKey: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Info Bancária</Label>
                <Input
                  value={partnerForm.bankInfo}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, bankInfo: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[12px]">Observações</Label>
              <Input
                value={partnerForm.notes}
                onChange={(e) => setPartnerForm((f) => ({ ...f, notes: e.target.value }))}
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPartner(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white"
              onClick={() => updateMut.mutate()}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail partner dialog */}
      <Dialog open={!!detailPartner} onOpenChange={(o) => !o && setDetailPartner(null)}>
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Parceiro</DialogTitle>
          </DialogHeader>
          {detailPartner && (
            <div className="space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Nome</span>
                  <p className="font-semibold">{detailPartner.name}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">E-mail</span>
                  <p>{detailPartner.email}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Telefone</span>
                  <p>{detailPartner.phone ?? "-"}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">CPF/CNPJ</span>
                  <p>{detailPartner.document ?? "-"}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Código</span>
                  <p className="font-mono font-bold text-[hsl(var(--sa-accent))]">
                    {detailPartner.referralCode}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Comissão</span>
                  <p className="font-bold">{detailPartner.commissionRate}%</p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Status</span>
                  <div className="mt-1">
                    <SaStatusBadge status={detailPartner.status} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Loja</span>
                  <p>{detailPartner.storeName ?? "-"}</p>
                </div>
              </div>
              <div className="border-t border-[hsl(var(--sa-border-subtle))] pt-3 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Chave PIX</span>
                  <p>{detailPartner.pixKey ?? "-"}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Info Bancária</span>
                  <p>{detailPartner.bankInfo ?? "-"}</p>
                </div>
              </div>
              <div className="border-t border-[hsl(var(--sa-border-subtle))] pt-3 grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-[18px] font-bold text-[hsl(var(--sa-accent))]">
                    {detailPartner.totalClicks.toLocaleString("pt-BR")}
                  </p>
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Cliques</span>
                </div>
                <div>
                  <p className="text-[18px] font-bold text-[hsl(var(--sa-text))]">
                    {detailPartner.totalOrders}
                  </p>
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Conversões</span>
                </div>
                <div>
                  <p className="text-[18px] font-bold text-[hsl(var(--sa-success))]">
                    {fmtMoney(detailPartner.totalRevenue)}
                  </p>
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Receita</span>
                </div>
                <div>
                  <p className="text-[18px] font-bold text-[hsl(var(--sa-success))]">
                    {fmtMoney(detailPartner.totalCommission)}
                  </p>
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Comissão</span>
                </div>
              </div>
              {detailPartner.notes && (
                <div className="border-t border-[hsl(var(--sa-border-subtle))] pt-3">
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">Observações</span>
                  <p className="text-[12px]">{detailPartner.notes}</p>
                </div>
              )}
              <div className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                Criado: {new Date(detailPartner.createdAt).toLocaleDateString("pt-BR")}
                {detailPartner.approvedAt &&
                  ` · Aprovado: ${new Date(detailPartner.approvedAt).toLocaleDateString("pt-BR")}`}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailPartner(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject conversion dialog */}
      <Dialog open={rejectConvId !== null} onOpenChange={(o) => !o && setRejectConvId(null)}>
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
          <DialogHeader>
            <DialogTitle>Rejeitar Conversão</DialogTitle>
            <DialogDescription className="text-[hsl(var(--sa-text-muted))]">
              Informe o motivo da rejeição (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-[12px]">Motivo</Label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Fraude, duplicata, etc."
              className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectConvId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectConvMut.mutate()}
              disabled={rejectConvMut.isPending}
            >
              {rejectConvMut.isPending ? "Rejeitando..." : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create payout dialog */}
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
          <DialogHeader>
            <DialogTitle>Novo Pagamento</DialogTitle>
            <DialogDescription className="text-[hsl(var(--sa-text-muted))]">
              Registre um pagamento de comissão para um afiliado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label className="text-[12px]">Parceiro</Label>
              <Select
                value={payoutForm.affiliateId}
                onValueChange={(v) => setPayoutForm((f) => ({ ...f, affiliateId: v }))}
              >
                <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]">
                  <SelectValue placeholder="Selecione o afiliado" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({p.referralCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px]">Valor (R$)</Label>
                <Input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm((f) => ({ ...f, amount: e.target.value }))}
                  className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[12px]">Método</Label>
                <Select
                  value={payoutForm.method}
                  onValueChange={(v) => setPayoutForm((f) => ({ ...f, method: v }))}
                >
                  <SelectTrigger className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="TED">TED</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[12px]">Referência</Label>
              <Input
                value={payoutForm.reference}
                onChange={(e) => setPayoutForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="ID da transação, comprovante, etc."
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px]">Observações</Label>
              <Input
                value={payoutForm.notes}
                onChange={(e) => setPayoutForm((f) => ({ ...f, notes: e.target.value }))}
                className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white"
              onClick={() => createPayoutMut.mutate()}
              disabled={!payoutForm.affiliateId || !payoutForm.amount || createPayoutMut.isPending}
            >
              {createPayoutMut.isPending ? "Criando..." : "Criar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
