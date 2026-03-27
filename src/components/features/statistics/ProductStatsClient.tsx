'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  MoreVertical,
  Loader2,
  XCircle,
  ShoppingBag,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import orderService from '@/services/sales/orderService';
import { ProductStats, ProductSalesItem, ProductStockItem, ProductViewItem } from '@/types/order';
import { t } from '@/lib/admin-language';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// ── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

const periods = [
  { key: 'today', label: t('Hoje', 'Today') },
  { key: '7d', label: t('7 dias', '7 days') },
  { key: '30d', label: t('30 dias', '30 days') },
  { key: '90d', label: t('90 dias', '90 days') },
  { key: 'all', label: t('Tudo', 'All time') },
];

// ── sub-components ─────────────────────────────────────────────────────────

function ProductThumbnail({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-8 w-8 rounded object-cover flex-shrink-0 border border-border"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0 border border-border">
      <Package className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function ProductActionMenu({ productId }: { productId: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded hover:bg-muted transition-colors">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}/edit`}>{t('Editar produto', 'Edit product')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}`}>{t('Ver detalhes', 'View details')}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── sales ranking row ──────────────────────────────────────────────────────

function SalesRow({ item, rank, metric }: { item: ProductSalesItem; rank: number; metric: 'qty' | 'revenue' }) {
  const metricValue = metric === 'qty'
    ? `${item.quantity.toLocaleString('pt-BR')} un.`
    : formatCurrency(item.revenue);

  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-muted/50 transition-colors">
      <span className="w-5 text-center text-xs font-bold text-muted-foreground">{rank}</span>
      <ProductThumbnail imageUrl={item.imageUrl} name={item.productName} />
      <span className="flex-1 text-sm text-foreground truncate">{item.productName}</span>
      <span className="text-sm font-medium text-foreground whitespace-nowrap">{metricValue}</span>
      <ProductActionMenu productId={item.productId} />
    </div>
  );
}

// ── stock row ──────────────────────────────────────────────────────────────

function StockRow({ item }: { item: ProductStockItem }) {
  const badge = item.stock === 0
    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';

  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-muted/50 transition-colors">
      <ProductThumbnail imageUrl={item.imageUrl} name={item.productName} />
      <span className="flex-1 text-sm text-foreground truncate">{item.productName}</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
        {item.stock === 0 ? t('Esgotado', 'Out of stock') : `${item.stock} ${t('un.', 'units')}`}
      </span>
      <ProductActionMenu productId={item.productId} />
    </div>
  );
}

// ── view row ───────────────────────────────────────────────────────────────

function ViewRow({ item, rank }: { item: ProductViewItem; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-muted/50 transition-colors">
      <span className="w-5 text-center text-xs font-bold text-muted-foreground">{rank}</span>
      <ProductThumbnail imageUrl={item.imageUrl} name={item.productName} />
      <span className="flex-1 text-sm text-foreground truncate">{item.productName}</span>
      <span className="flex items-center gap-1 text-sm font-medium text-foreground whitespace-nowrap">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        {item.viewCount.toLocaleString('pt-BR')}
      </span>
      <ProductActionMenu productId={item.productId} />
    </div>
  );
}

// ── KPI mini card ──────────────────────────────────────────────────────────

function MiniKpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

// ── section card ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  badge,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {badge}
      </div>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
      ) : children}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function ProductStatsClient() {
  const [period, setPeriod] = useState('30d');
  const [topLimit, setTopLimit] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const { data: stats, isLoading, isError, refetch } = useQuery<ProductStats>({
    queryKey: ['product-stats', period, topLimit, lowStockThreshold],
    queryFn: () => orderService.getProductStats(period, topLimit, lowStockThreshold),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
        <XCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-3">
          {t('Erro ao carregar as estatísticas de produtos.', 'Error loading product statistics.')}
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs text-primary underline hover:no-underline"
        >
          {t('Tentar novamente', 'Try again')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t('Estatísticas de Produtos', 'Product Statistics')}</h1>
          <p className="text-sm text-muted-foreground">{t('Rankings de vendas, visualizações e controle de estoque.', 'Sales rankings, views, and stock control.')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniKpi
          icon={<BarChart3 className="h-4 w-4" />}
          label={t('Produtos vendidos (período)', 'Products sold (period)')}
          value={stats.totalProductsSold.toLocaleString('pt-BR')}
          color="text-blue-600"
        />
        <MiniKpi
          icon={<Package className="h-4 w-4" />}
          label={t('Total no catálogo', 'Total in catalog')}
          value={stats.totalProductsInCatalog.toLocaleString('pt-BR')}
          color="text-indigo-600"
        />
        <MiniKpi
          icon={<AlertTriangle className="h-4 w-4" />}
          label={t('Produtos com estoque baixo', 'Low stock products')}
          value={stats.lowStockCount.toLocaleString('pt-BR')}
          color={stats.lowStockCount > 0 ? 'text-amber-500' : 'text-green-600'}
        />
      </div>

      {/* Low stock */}
      <SectionCard
        title={t('Estoque Baixo', 'Low Stock')}
        icon={<AlertTriangle className="h-4 w-4" />}
        badge={
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">{t('Limiar:', 'Threshold:')}</label>
            <input
              type="number"
              min={1}
              max={999}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 5))}
              className="w-16 rounded border border-border bg-background text-xs px-2 py-0.5 text-foreground"
            />
          </div>
        }
        isEmpty={stats.lowStock.length === 0}
        emptyMessage={t('Nenhum produto com estoque abaixo do limiar.', 'No products below stock threshold.')}
      >
        <div className="divide-y divide-border">
          {stats.lowStock.map((item) => (
            <StockRow key={item.productId} item={item} />
          ))}
        </div>
      </SectionCard>

      {/* Most viewed */}
      <SectionCard
        title={t('Produtos Mais Visitados', 'Most Visited Products')}
        icon={<Eye className="h-4 w-4" />}
        isEmpty={stats.mostViewed.length === 0}
        emptyMessage={t('Nenhuma visita registrada no período.', 'No visits recorded in this period.')}
      >
        <div className="divide-y divide-border">
          {stats.mostViewed.map((item, i) => (
            <ViewRow key={item.productId} item={item} rank={i + 1} />
          ))}
        </div>
      </SectionCard>

      {/* Top/bottom sellers by quantity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={t('Mais Vendidos (quantidade)', 'Top Sellers (qty)')}
          icon={<TrendingUp className="h-4 w-4" />}
          isEmpty={stats.topSellersByQty.length === 0}
          emptyMessage={t('Sem vendas no período selecionado.', 'No sales in the selected period.')}
        >
          <div className="divide-y divide-border">
            {stats.topSellersByQty.map((item, i) => (
              <SalesRow key={item.productId} item={item} rank={i + 1} metric="qty" />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={t('Menos Vendidos (quantidade)', 'Bottom Sellers (qty)')}
          icon={<TrendingDown className="h-4 w-4" />}
          isEmpty={stats.bottomSellersByQty.length === 0}
          emptyMessage={t('Sem vendas no período selecionado.', 'No sales in the selected period.')}
        >
          <div className="divide-y divide-border">
            {stats.bottomSellersByQty.map((item, i) => (
              <SalesRow key={item.productId} item={item} rank={i + 1} metric="qty" />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top/bottom sellers by revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title={t('Maior Receita', 'Highest Revenue')}
          icon={<DollarSign className="h-4 w-4" />}
          isEmpty={stats.topSellersByRevenue.length === 0}
          emptyMessage={t('Sem vendas no período selecionado.', 'No sales in the selected period.')}
        >
          <div className="divide-y divide-border">
            {stats.topSellersByRevenue.map((item, i) => (
              <SalesRow key={item.productId} item={item} rank={i + 1} metric="revenue" />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={t('Menor Receita', 'Lowest Revenue')}
          icon={<DollarSign className="h-4 w-4" />}
          isEmpty={stats.bottomSellersByRevenue.length === 0}
          emptyMessage={t('Sem vendas no período selecionado.', 'No sales in the selected period.')}
        >
          <div className="divide-y divide-border">
            {stats.bottomSellersByRevenue.map((item, i) => (
              <SalesRow key={item.productId} item={item} rank={i + 1} metric="revenue" />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Limit control */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <ShoppingBag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">{t('Itens por lista:', 'Items per list:')}</span>
        <input
          type="number"
          min={1}
          max={100}
          value={topLimit}
          onChange={(e) => setTopLimit(Math.max(1, parseInt(e.target.value) || 10))}
          className="w-16 rounded border border-border bg-background text-sm px-2 py-1 text-foreground"
        />
        <span className="text-xs text-muted-foreground">{t('(afeta todos os rankings)', '(affects all rankings)')}</span>
      </div>
    </div>
  );
}
