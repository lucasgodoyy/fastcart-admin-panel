"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

const mockStores = [
  { id: 1, name: "Fashion Store Oficial", slug: "fashion-store", plan: "Pro", status: "ACTIVE", products: 342, orders: 892, revenue: "R$ 124.580", domain: "fashionstore.com.br" },
  { id: 2, name: "TechGadgets Pro", slug: "techgadgets", plan: "Pro", status: "ACTIVE", products: 215, orders: 654, revenue: "R$ 98.450", domain: "techgadgets.com" },
  { id: 3, name: "Casa & Decor Market", slug: "casadecor", plan: "Business", status: "ACTIVE", products: 478, orders: 523, revenue: "R$ 76.320", domain: "casadecor.com.br" },
  { id: 4, name: "SportLife Brasil", slug: "sportlife", plan: "Trial", status: "TRIAL", products: 89, orders: 412, revenue: "R$ 54.100", domain: null },
  { id: 5, name: "Beleza Natural", slug: "belezanatural", plan: "Basic", status: "ACTIVE", products: 156, orders: 367, revenue: "R$ 43.890", domain: "belezanatural.com" },
  { id: 6, name: "Pet Paradise", slug: "petparadise", plan: "Trial", status: "PENDING", products: 12, orders: 0, revenue: "R$ 0", domain: null },
  { id: 7, name: "Loja Suspensa", slug: "lojasuspensa", plan: "Basic", status: "INACTIVE", products: 45, orders: 23, revenue: "R$ 1.200", domain: null },
];

export function SaStoresPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");

  const filtered = mockStores.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.slug.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (planFilter !== "ALL" && s.plan !== planFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <SaPageHeader title="Gerenciamento de Lojas" description="Visualize e gerencie todas as lojas da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Lojas" value="156" icon={Building2} color="accent" trend={{ value: 8, label: "" }} />
        <SaStatCard title="Lojas Ativas" value="134" icon={CheckCircle} color="success" />
        <SaStatCard title="Em Trial" value="18" icon={AlertTriangle} color="warning" />
        <SaStatCard title="GMV Total" value="R$ 2.4M" icon={TrendingUp} color="info" subtitle="Últimos 30 dias" />
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
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"><SelectValue placeholder="Plano" /></SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todos os Planos</SelectItem>
                <SelectItem value="Trial">Trial</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((store, i) => (
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
                  <DropdownMenuItem className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer gap-2"><Ban className="h-3.5 w-3.5" /> Suspender</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <SaStatusBadge status={store.status} />
              <span className="text-[11px] font-medium text-[hsl(var(--sa-text-muted))] bg-[hsl(var(--sa-surface-hover))] rounded-full px-2 py-0.5">{store.plan}</span>
              {store.domain && (<span className="text-[11px] text-[hsl(var(--sa-text-muted))] flex items-center gap-1"><Globe className="h-3 w-3" /> {store.domain}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[hsl(var(--sa-border-subtle))]">
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{store.products}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Produtos</p></div>
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-text))]">{store.orders}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Pedidos</p></div>
              <div className="text-center"><p className="text-[16px] font-bold text-[hsl(var(--sa-success))]">{store.revenue}</p><p className="text-[10px] text-[hsl(var(--sa-text-muted))]">Receita</p></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (<SaEmptyState icon={Building2} title="Nenhuma loja encontrada" description="Tente ajustar os filtros de busca" />)}
    </div>
  );
}
