"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Mail,
  Globe,
  Power,
  Ban,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaSkeleton,
  SaStatusBadge,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { superAdminService } from "@/services/super-admin";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
};

const relativeDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
};

export function SaStoreDetailPage({ storeId }: { storeId: number }) {
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: ["super-admin-store", storeId],
    queryFn: () => superAdminService.getStoreById(storeId),
    enabled: !!storeId,
  });

  const { data: activityData } = useQuery({
    queryKey: ["super-admin-activity-store", storeId],
    queryFn: () => superAdminService.listActivityLogs({ search: `store #${storeId}`, page: 0, size: 5 }),
    enabled: !!storeId,
  });

  const toggleMutation = useMutation({
    mutationFn: () => superAdminService.toggleStoreStatus(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-store", storeId] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-stores"] });
      toast.success("Status da loja atualizado");
    },
    onError: () => toast.error("Erro ao alterar status"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SaSkeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SaSkeleton key={i} className="h-28" />
          ))}
        </div>
        <SaSkeleton className="h-64" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <Link href="/super-admin/stores" className="inline-flex items-center gap-2 text-[12px] text-[hsl(var(--sa-accent))] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para Lojas
        </Link>
        <SaCard className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--sa-text-muted))]" />
          <p className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Loja não encontrada</p>
          <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">A loja com ID #{storeId} não existe ou foi removida.</p>
        </SaCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back link + Header */}
      <div className="space-y-4">
        <Link href="/super-admin/stores" className="inline-flex items-center gap-2 text-[12px] text-[hsl(var(--sa-accent))] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para Lojas
        </Link>

        <SaPageHeader
          title={store.name}
          description={`/${store.slug} · Criada ${relativeDate(store.createdAt)}`}
          actions={
            <div className="flex items-center gap-2">
              <SaStatusBadge status={store.status} />
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-[12px] border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] gap-2"
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/${store.slug}`, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Abrir Loja
              </Button>
              <Button
                size="sm"
                className={`rounded-xl text-[12px] gap-2 ${store.status === "ACTIVE"
                  ? "bg-[hsl(var(--sa-danger))]/10 text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger))] hover:text-white"
                  : "bg-[hsl(var(--sa-success))]/10 text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))] hover:text-white"
                  }`}
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                {store.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                {store.status === "ACTIVE" ? "Suspender" : "Ativar"}
              </Button>
            </div>
          }
        />
      </div>

      {/* KPI Cards */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Produtos" value={store.productsCount.toLocaleString("pt-BR")} icon={Package} color="accent" />
        <SaStatCard title="Pedidos" value={store.ordersCount.toLocaleString("pt-BR")} icon={ShoppingCart} color="info" />
        <SaStatCard title="Receita Paga" value={formatCurrency(store.paidRevenue)} icon={DollarSign} color="success" />
        <SaStatCard title="Status" value={store.active ? "Ativa" : "Inativa"} icon={store.active ? CheckCircle : Clock} color={store.active ? "success" : "warning"} />
      </motion.div>

      {/* Detail Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Info */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <SaCard>
            <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Informações da Loja</h3>
            <div className="space-y-3">
              <DetailRow icon={Building2} label="Nome" value={store.name} />
              <DetailRow icon={Globe} label="Slug" value={`/${store.slug}`} />
              <DetailRow icon={Mail} label="E-mail" value={store.email || "Não informado"} />
              <DetailRow icon={Calendar} label="Criada em" value={formatDate(store.createdAt)} />
              <DetailRow icon={Calendar} label="Atualizada em" value={formatDate(store.updatedAt)} />
              <DetailRow icon={Activity} label="Status" value={store.active ? "Ativa" : "Inativa"} />
            </div>
          </SaCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <SaCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">Atividade Recente</h3>
              <Link href="/super-admin/activity" className="text-[11px] font-medium text-[hsl(var(--sa-accent))] hover:underline">
                Ver tudo
              </Link>
            </div>
            <div className="space-y-0">
              {activityData?.content && activityData.content.length > 0 ? (
                activityData.content.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[hsl(var(--sa-text))] truncate">{log.description}</p>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{relativeDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[hsl(var(--sa-text-muted))] py-6 text-center">Nenhuma atividade registrada para esta loja.</p>
              )}
            </div>
          </SaCard>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Detail row ── */
function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--sa-accent-subtle))]">
        <Icon className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{label}</p>
        <p className="text-[13px] font-medium text-[hsl(var(--sa-text))] truncate">{value}</p>
      </div>
    </div>
  );
}
