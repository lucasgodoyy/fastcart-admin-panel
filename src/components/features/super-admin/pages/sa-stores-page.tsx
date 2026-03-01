"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  ExternalLink,
  MoreHorizontal,
  Globe,
  ShoppingCart,
  Star,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { superAdminService } from "@/services/super-admin";
import type { StoreSummary } from "@/types/super-admin";

export function SaStoresPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: overview } = useQuery({
    queryKey: ["super-admin-overview"],
    queryFn: superAdminService.getOverview,
  });

  const { data: storesData, isLoading } = useQuery({
    queryKey: ["sa-stores", statusFilter, search, page],
    queryFn: () =>
      superAdminService.listStores({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search || undefined,
        page,
        size: 20,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (storeId: number) => superAdminService.toggleStoreStatus(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-stores"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-overview"] });
    },
  });

  const stores = storesData?.content ?? [];
  const fmt = (n?: number) => (n ?? 0).toLocaleString("pt-BR");

  return (
    <div className="space-y-8">
      <SaPageHeader title="Gerenciamento de Lojas" description="Visualize e gerencie todas as lojas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Lojas" value={fmt(overview?.totalStores)} icon={Building2} color="accent" trend={{ value: 8, label: "" }} />
        <SaStatCard title="Lojas Ativas" value={fmt(overview?.activeStores)} icon={CheckCircle} color="success" />
        <SaStatCard title="Em Trial" value={fmt((overview?.totalStores ?? 0) - (overview?.activeStores ?? 0))} icon={AlertTriangle} color="warning" />
        <SaStatCard title="Resultados" value={fmt(storesData?.totalElements)} icon={TrendingUp} color="info" subtitle="Nesta busca" />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar loja..." className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]" />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <motion.div key={store.id} variants={fadeInUp} whileHover={{ y: -4 }} className="group relative rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-5 hover:border-[hsl(var(--sa-border))] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-accent))] font-bold text-sm">{store.name.charAt(0)}</div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{store.name}</h4>
                  <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">/{store.slug}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                  <DropdownMenuItem className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"><Eye className="h-3.5 w-3.5" /> Ver Detalhes</DropdownMenuItem>
                  <DropdownMenuItem className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"><ExternalLink className="h-3.5 w-3.5" /> Abrir Loja</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleMutation.mutate(store.id)} className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer gap-2"><Ban className="h-3.5 w-3.5" /> {store.status === "ACTIVE" ? "Suspender" : "Ativar"}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <SaStatusBadge status={store.status} />
              {store.planName && <span className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] bg-[hsl(var(--sa-surface-hover))] rounded-full px-2 py-0.5">{store.planName}</span>}
              {store.customDomain && (<span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1"><Globe className="h-3 w-3" /> {store.customDomain}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[hsl(var(--sa-border-subtle))]">
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{store.productsCount}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Produtos</p></div>
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{store.ordersCount}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Pedidos</p></div>
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-success))]">R$ {(store.paidRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Receita</p></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {stores.length === 0 && !isLoading && (<SaEmptyState icon={Building2} title="Nenhuma loja encontrada" description="Tente ajustar os filtros de busca" />)}
    </div>
  );
}
