'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, DollarSign, Users, ShoppingBag, Loader2, BarChart3, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import orderService, { type AdminOrder, type OrderStats } from '@/services/orderService';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  PENDING: { icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', label: 'Pendente' },
  PAID: { icon: <DollarSign className="h-3 w-3" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', label: 'Pago' },
  PROCESSING: { icon: <Package className="h-3 w-3" />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', label: 'Processando' },
  SHIPPED: { icon: <Truck className="h-3 w-3" />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', label: 'Enviado' },
  DELIVERED: { icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', label: 'Entregue' },
  CANCELLED: { icon: <XCircle className="h-3 w-3" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', label: 'Cancelado' },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function OrdersClient() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderList, orderStats] = await Promise.all([
        orderService.listStoreOrders(),
        orderService.getStoreStats(),
      ]);
      setOrders(orderList);
      setStats(orderStats);
    } catch {
      showToast('error', 'Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDispatch = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const updated = await orderService.dispatchOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast('success', `Pedido #${orderId} marcado como enviado!`);
    } catch {
      showToast('error', 'Erro ao despachar pedido.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (orderId: number) => {
    setActionLoading(orderId);
    try {
      const updated = await orderService.deliverOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast('success', `Pedido #${orderId} marcado como entregue!`);
    } catch {
      showToast('error', 'Erro ao confirmar entrega.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = filter
    ? orders.filter((o) => o.status === filter)
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">Vendas</h1>
        <p className="text-sm text-muted-foreground">Gerencie pedidos e acompanhe suas vendas.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total de pedidos', value: stats.totalOrders, icon: <ShoppingBag className="h-4 w-4" />, color: 'text-blue-600' },
            { label: 'Pedidos pagos', value: stats.paidOrders, icon: <DollarSign className="h-4 w-4" />, color: 'text-green-600' },
            { label: 'Enviados', value: stats.shippedOrders, icon: <Truck className="h-4 w-4" />, color: 'text-purple-600' },
            { label: 'Clientes', value: stats.totalCustomers, icon: <Users className="h-4 w-4" />, color: 'text-indigo-600' },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <span className={card.color}>{card.icon}</span>
              </div>
              <p className="mt-1 text-xl font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Receita total</span>
            <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Ticket médio</span>
            <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(stats.averageOrderValue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Produtos</span>
            <p className="mt-1 text-lg font-bold text-foreground">{stats.totalProducts}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Pedidos</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendente</option>
          <option value="PAID">Pago</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Pedido</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Cliente</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Total</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Data</th>
                <th className="p-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">#{order.id}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusCfg.color} ${statusCfg.bg}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="p-3 text-foreground">{order.customerName || order.customerEmail || '—'}</td>
                    <td className="p-3 text-right font-medium text-foreground">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'PAID' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-[10px]"
                            disabled={actionLoading === order.id}
                            onClick={() => handleDispatch(order.id)}
                          >
                            {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                            Despachar
                          </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-[10px]"
                            disabled={actionLoading === order.id}
                            onClick={() => handleDeliver(order.id)}
                          >
                            {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Entregar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
