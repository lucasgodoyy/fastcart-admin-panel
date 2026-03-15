"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  ExternalLink,
  MoreHorizontal,
  Globe,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
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
  const router = useRouter();

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
  const totalPages = storesData?.totalPages ?? 0;
  const fmt = (n?: number) => (n ?? 0).toLocaleString("pt-BR");

  return (
    <div className="space-y-8">
      <SaPageHeader title="Gerenciamento de Lojas" description="Visualize e gerencie todas as lojas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Lojas" value={fmt(overview?.totalStores)} icon={Building2} color="accent" />
        <SaStatCard title="Lojas Ativas" value={fmt(overview?.activeStores)} icon={CheckCircle} color="success" />
        <SaStatCard title="Em Trial" value={fmt((overview?.totalStores ?? 0) - (overview?.activeStores ?? 0))} icon={AlertTriangle} color="warning" />
        <SaStatCard title="Resultados" value={fmt(storesData?.totalElements)} icon={TrendingUp} color="info" subtitle="Nesta busca" />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar loja por nome ou slug..." className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]" />
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

      {/* ── Table layout ── */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg-secondary))]">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Loja</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">Plano</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Produtos</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Pedidos</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-right">Receita</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))] text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr
                    key={store.id}
                    onClick={() => router.push(`/super-admin/stores/${store.id}`)}
                    className="border-b border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[hsl(var(--sa-accent-subtle))] to-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-accent))] font-bold text-sm">
                          {store.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))] truncate">{store.name}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))] truncate">/{store.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <SaStatusBadge status={store.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] font-medium text-[hsl(var(--sa-text-secondary))] bg-[hsl(var(--sa-surface-hover))] rounded-full px-2.5 py-1">
                        {store.planName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-medium text-[hsl(var(--sa-text))]">{store.productsCount}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-medium text-[hsl(var(--sa-text))]">{store.ordersCount}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[13px] font-bold text-[hsl(var(--sa-success))]">
                        R$ {(store.paidRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                          <DropdownMenuItem
                            onClick={() => router.push(`/super-admin/stores/${store.id}`)}
                            className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleMutation.mutate(store.id)}
                            className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer gap-2"
                          >
                            <Ban className="h-3.5 w-3.5" /> {store.status === "ACTIVE" ? "Suspender" : "Ativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[hsl(var(--sa-border-subtle))] px-5 py-3">
              <p className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                Página {page + 1} de {totalPages} — {storesData?.totalElements ?? 0} lojas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 px-2 text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))]"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 px-2 text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))]"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </SaCard>
      </motion.div>

      {stores.length === 0 && !isLoading && (<SaEmptyState icon={Building2} title="Nenhuma loja encontrada" description="Tente ajustar os filtros de busca" />)}
    </div>
  );
}
