'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Clock,
  RotateCcw,
  Eye,
  X,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/admin-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import posService from '@/services/pos/posService';
import type { PosSaleResponse, PosPaymentMethod } from '@/types/pos';

const PAYMENT_LABELS: Record<PosPaymentMethod, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  PIX: 'PIX',
};

export default function PosHistoryPage() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSale, setSelectedSale] = useState<PosSaleResponse | null>(null);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['pos-sales', startDate, endDate],
    queryFn: () =>
      posService.getSalesHistory(
        startDate ? `${startDate}T00:00:00Z` : undefined,
        endDate ? `${endDate}T23:59:59Z` : undefined
      ),
  });

  const reverseMutation = useMutation({
    mutationFn: (id: number) => posService.reverseSale(id),
    onSuccess: () => {
      toast.success(t('Venda estornada com sucesso!', 'Sale reversed!'));
      queryClient.invalidateQueries({ queryKey: ['pos-sales'] });
      setSelectedSale(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('Erro ao estornar venda', 'Error reversing sale'));
    },
  });

  const activeSales = sales.filter((s) => s.status !== 'CANCELLED');
  const totalRevenue = activeSales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('Histórico de Vendas', 'Sales History')}</h1>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <span className="text-sm text-muted-foreground">{t('até', 'to')}</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('Total de Vendas', 'Total Sales')}</p>
            <p className="text-2xl font-bold">{activeSales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('Receita Total', 'Total Revenue')}</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('Ticket Médio', 'Avg Ticket')}</p>
            <p className="text-2xl font-bold">
              R$ {activeSales.length > 0 ? (totalRevenue / activeSales.length).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales list */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {t('Vendas', 'Sales')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}

          {!isLoading && sales.length === 0 && (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <Search className="mb-3 h-10 w-10" />
              <p>{t('Nenhuma venda encontrada', 'No sales found')}</p>
            </div>
          )}

          {!isLoading && sales.length > 0 && (
            <ScrollArea className="max-h-[calc(100vh-380px)]">
              <div className="space-y-2">
                {sales.map((sale) => (
                  <div
                    key={sale.orderId}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer',
                      sale.status === 'CANCELLED' && 'opacity-50'
                    )}
                    onClick={() => setSelectedSale(sale)}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          #{sale.orderId}
                          {sale.customerName && (
                            <span className="ml-2 text-muted-foreground">— {sale.customerName}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleString('pt-BR')} •{' '}
                          {PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}
                          {sale.operatorName && ` • ${sale.operatorName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={sale.status === 'CANCELLED' ? 'destructive' : 'default'}
                        className={cn(
                          sale.status === 'CANCELLED'
                            ? ''
                            : 'bg-green-600 hover:bg-green-700'
                        )}
                      >
                        {sale.status === 'CANCELLED'
                          ? t('Estornada', 'Reversed')
                          : t('Paga', 'Paid')}
                      </Badge>
                      <p className="text-sm font-bold">R$ {sale.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Sale detail modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedSale(null)}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {t('Venda', 'Sale')} #{selectedSale.orderId}
              </h2>
              <button onClick={() => setSelectedSale(null)} className="rounded-md p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t('Data', 'Date')}:</span>{' '}
                {new Date(selectedSale.createdAt).toLocaleString('pt-BR')}
              </p>
              <p>
                <span className="text-muted-foreground">{t('Pagamento', 'Payment')}:</span>{' '}
                {PAYMENT_LABELS[selectedSale.paymentMethod]}
              </p>
              {selectedSale.operatorName && (
                <p>
                  <span className="text-muted-foreground">{t('Operador', 'Operator')}:</span>{' '}
                  {selectedSale.operatorName}
                </p>
              )}
              {selectedSale.customerName && (
                <p>
                  <span className="text-muted-foreground">{t('Cliente', 'Customer')}:</span>{' '}
                  {selectedSale.customerName}
                </p>
              )}
              {selectedSale.customerDocument && (
                <p>
                  <span className="text-muted-foreground">{t('CPF/CNPJ', 'Document')}:</span>{' '}
                  {selectedSale.customerDocument}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="mb-4 rounded-lg border">
              <div className="border-b bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                {t('Itens', 'Items')}
              </div>
              <div className="divide-y">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">R$ {item.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mb-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('Subtotal', 'Subtotal')}</span>
                <span>R$ {selectedSale.subtotal.toFixed(2)}</span>
              </div>
              {selectedSale.discountAmount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>{t('Desconto', 'Discount')}</span>
                  <span>- R$ {selectedSale.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>{t('Total', 'Total')}</span>
                <span>R$ {selectedSale.totalAmount.toFixed(2)}</span>
              </div>
              {selectedSale.amountReceived != null && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('Recebido', 'Received')}</span>
                  <span>R$ {selectedSale.amountReceived.toFixed(2)}</span>
                </div>
              )}
              {selectedSale.changeAmount != null && selectedSale.changeAmount > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('Troco', 'Change')}</span>
                  <span>R$ {selectedSale.changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Reverse button */}
            {selectedSale.status !== 'CANCELLED' && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => reverseMutation.mutate(selectedSale.orderId)}
                disabled={reverseMutation.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {reverseMutation.isPending
                  ? t('Estornando...', 'Reversing...')
                  : t('Estornar Venda', 'Reverse Sale')}
              </Button>
            )}
            {selectedSale.status === 'CANCELLED' && (
              <Badge variant="destructive" className="w-full justify-center py-2">
                {t('Venda Estornada', 'Sale Reversed')}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
