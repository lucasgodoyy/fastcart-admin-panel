'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import abandonedCartService, {
  RecoveryStats,
  AbandonedCart,
  AbandonedCartListResponse,
} from '@/services/abandonedCartService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  RECOVERED: 'Recuperado',
  OPTED_OUT: 'Opt-out',
  EXPIRED: 'Expirado',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  RECOVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  OPTED_OUT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

function formatCurrency(value: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AbandonedCartsClient() {
  const { user } = useAuth();
  const storeId = user?.storeId ?? (typeof window !== 'undefined' ? Number(localStorage.getItem('storeId')) : 0);

  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: stats, isLoading: loadingStats } = useQuery<RecoveryStats>({
    queryKey: ['abandoned-cart-stats', storeId],
    queryFn: () => abandonedCartService.getStats(storeId, 30),
    enabled: !!storeId,
  });

  const { data: cartsData, isLoading: loadingCarts } = useQuery<AbandonedCartListResponse>({
    queryKey: ['abandoned-carts', storeId, status, page],
    queryFn: () => abandonedCartService.list(storeId, status, page, pageSize),
    enabled: !!storeId,
  });

  const carts = cartsData?.content ?? [];
  const totalElements = cartsData?.totalElements ?? 0;
  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Carrinhos Abandonados</h1>
        <p className="text-sm text-muted-foreground">
          Monitore e recupere vendas perdidas com e-mails automáticos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Abandonados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalAbandoned ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalPending ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando recuperação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Recuperados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalRecovered ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recoveryRate ? `${stats.recoveryRate.toFixed(1)}% taxa` : 'Taxa de recuperação'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Receita Recuperada</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingStats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                formatCurrency(stats?.totalRecoveryValue ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="RECOVERED">Recuperados</SelectItem>
            <SelectItem value="OPTED_OUT">Opt-out</SelectItem>
            <SelectItem value="EXPIRED">Expirados</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {totalElements} carrinho{totalElements !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loadingCarts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : carts.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum carrinho encontrado com esse status.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>E-mails</TableHead>
                  <TableHead>Abandonado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{cart.customerName || 'Anônimo'}</p>
                        <p className="text-xs text-muted-foreground">{cart.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(cart.cartTotal, cart.cartCurrency?.toUpperCase() || 'BRL')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[cart.recoveryStatus] ?? statusColors.PENDING
                        }`}
                      >
                        {statusLabels[cart.recoveryStatus] ?? cart.recoveryStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {cart.emailCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(cart.abandonedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
