'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, DollarSign, Truck, CheckCircle2, Clock, XCircle, Users, Package, Loader2, TrendingUp } from 'lucide-react';
import orderService, { type OrderStats } from '@/services/orderService';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function StatisticsClient() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [error, setError] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getStoreStats();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
        <XCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Erro ao carregar estatísticas. Tente novamente.</p>
      </div>
    );
  }

  const mainCards = [
    { label: 'Receita total', value: formatCurrency(stats.totalRevenue), icon: <DollarSign className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' },
    { label: 'Total de pedidos', value: stats.totalOrders.toString(), icon: <ShoppingBag className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Ticket médio', value: formatCurrency(stats.averageOrderValue), icon: <TrendingUp className="h-5 w-5" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950' },
    { label: 'Total de clientes', value: stats.totalCustomers.toString(), icon: <Users className="h-5 w-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  ];

  const statusCards = [
    { status: 'Pendentes', value: stats.pendingOrders, icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600' },
    { status: 'Pagos', value: stats.paidOrders, icon: <DollarSign className="h-4 w-4" />, color: 'text-blue-600' },
    { status: 'Enviados', value: stats.shippedOrders, icon: <Truck className="h-4 w-4" />, color: 'text-purple-600' },
    { status: 'Entregues', value: stats.deliveredOrders, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' },
    { status: 'Cancelados', value: stats.cancelledOrders, icon: <XCircle className="h-4 w-4" />, color: 'text-red-600' },
    { status: 'Produtos', value: stats.totalProducts, icon: <Package className="h-4 w-4" />, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Estatísticas</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos indicadores da sua loja.</p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Detalhamento por status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statusCards.map((card) => (
            <div key={card.status} className="rounded-lg border border-border bg-card p-4 text-center">
              <div className={`flex items-center justify-center mb-2 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{card.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion funnel */}
      {stats.totalOrders > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Funil de conversão</h2>
          <div className="space-y-3">
            {[
              { label: 'Pedidos pagos', value: stats.paidOrders, total: stats.totalOrders, color: 'bg-blue-500' },
              { label: 'Enviados', value: stats.shippedOrders, total: stats.totalOrders, color: 'bg-purple-500' },
              { label: 'Entregues', value: stats.deliveredOrders, total: stats.totalOrders, color: 'bg-green-500' },
              { label: 'Cancelados', value: stats.cancelledOrders, total: stats.totalOrders, color: 'bg-red-500' },
            ].map((bar) => {
              const pct = stats.totalOrders > 0 ? Math.round((bar.value / bar.total) * 100) : 0;
              return (
                <div key={bar.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="font-medium text-foreground">{bar.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${bar.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
