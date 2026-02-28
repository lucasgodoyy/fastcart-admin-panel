"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Power,
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export function SaStoresPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-stores", statusFilter, search],
    queryFn: () =>
      superAdminService.listStores({
        status: statusFilter,
        search: search || undefined,
        page: 0,
        size: 100,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (storeId: number) => superAdminService.toggleStoreStatus(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-stores"] });
    },
  });

  const stores = data?.content ?? [];
  const totalStores = data?.totalElements ?? 0;
  const activeStores = useMemo(() => stores.filter((store) => store.status === "ACTIVE").length, [stores]);
  const inactiveStores = useMemo(() => stores.filter((store) => store.status === "INACTIVE").length, [stores]);
  const gmvTotal = useMemo(
    () => stores.reduce((acc, current) => acc + Number(current.paidRevenue ?? 0), 0),
    [stores],
  );

  const buildStorefrontUrl = (slug: string) => {
    const configured = (process.env.NEXT_PUBLIC_STOREFRONT_URL || "").trim();
    if (configured) {
      return `${configured.replace(/\/$/, "")}/?storeSlug=${encodeURIComponent(slug)}`;
    }

    if (typeof window === "undefined") {
      return "";
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const storefrontPort = process.env.NEXT_PUBLIC_STOREFRONT_PORT || "3000";

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${slug}.127.0.0.1.nip.io:${storefrontPort}`;
    }

    if (hostname.startsWith("admin.")) {
      const rootDomain = hostname.replace(/^admin\./, "");
      return `${protocol}//${slug}.${rootDomain}`;
    }

    return `${protocol}//${slug}.${hostname}`;
  };

  const openStorefront = (slug: string) => {
    const url = buildStorefrontUrl(slug);
    if (!url) {
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      <SaPageHeader title="Gerenciamento de Lojas" description="Visualize e gerencie todas as lojas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Lojas" value={String(totalStores)} icon={Building2} color="accent" />
        <SaStatCard title="Lojas Ativas" value={String(activeStores)} icon={CheckCircle} color="success" />
        <SaStatCard title="Inativas" value={String(inactiveStores)} icon={AlertTriangle} color="warning" />
        <SaStatCard title="GMV Total" value={formatCurrency(gmvTotal)} icon={TrendingUp} color="info" subtitle="Pedidos pagos" />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar loja..." className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  <DropdownMenuItem asChild className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2">
                    <Link href={`/super-admin/stores/${store.id}`}><Eye className="h-3.5 w-3.5" /> Ver Detalhes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openStorefront(store.slug)}
                    className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Abrir Loja
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleMutation.mutate(store.id)}
                    className={`cursor-pointer gap-2 ${store.status === "ACTIVE" ? "text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))]" : "text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/10"}`}
                  >
                    {store.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    {store.status === "ACTIVE" ? "Suspender" : "Ativar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <SaStatusBadge status={store.status} />
              {store.email && (
                <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{store.email}</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[hsl(var(--sa-border-subtle))]">
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{store.productsCount}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Produtos</p></div>
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{store.ordersCount}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Pedidos</p></div>
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-success))]">{formatCurrency(Number(store.paidRevenue ?? 0))}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Receita</p></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {!isLoading && stores.length === 0 && (<SaEmptyState icon={Building2} title="Nenhuma loja encontrada" description="Tente ajustar os filtros de busca" />)}
    </div>
  );
}
