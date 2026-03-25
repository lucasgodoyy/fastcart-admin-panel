'use client';

import { useState } from 'react';
import { Banknote, CreditCard, QrCode, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/admin-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PosPaymentMethod } from '@/types/pos';

const PAYMENT_METHODS: { value: PosPaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Dinheiro', icon: <Banknote className="h-6 w-6" /> },
  { value: 'CREDIT_CARD', label: 'Crédito', icon: <CreditCard className="h-6 w-6" /> },
  { value: 'DEBIT_CARD', label: 'Débito', icon: <CreditCard className="h-6 w-6" /> },
  { value: 'PIX', label: 'PIX', icon: <QrCode className="h-6 w-6" /> },
];

const BILL_SHORTCUTS = [10, 20, 50, 100, 200];

interface PosPaymentModalProps {
  total: number;
  onConfirm: (method: PosPaymentMethod, amountReceived?: number) => void;
  onClose: () => void;
  isPending: boolean;
}

export function PosPaymentModal({ total, onConfirm, onClose, isPending }: PosPaymentModalProps) {
  const [method, setMethod] = useState<PosPaymentMethod | null>(null);
  const [amountReceived, setAmountReceived] = useState('');

  const parsedAmount = parseFloat(amountReceived.replace(',', '.')) || 0;
  const change = method === 'CASH' ? Math.max(0, parsedAmount - total) : 0;
  const canConfirm = method !== null && (method !== 'CASH' || parsedAmount >= total);

  const handleConfirm = () => {
    if (!method || isPending) return;
    onConfirm(method, method === 'CASH' ? parsedAmount : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('Pagamento', 'Payment')}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Total */}
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground">{t('Total a pagar', 'Total due')}</p>
          <p className="text-3xl font-bold">R$ {total.toFixed(2)}</p>
        </div>

        {/* Payment method selection */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.value}
              onClick={() => {
                setMethod(pm.value);
                if (pm.value !== 'CASH') setAmountReceived('');
              }}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors',
                method === pm.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-transparent bg-muted hover:border-border'
              )}
            >
              {pm.icon}
              <span className="text-xs font-medium">{pm.label}</span>
            </button>
          ))}
        </div>

        {/* Cash-specific: amount received + change */}
        {method === 'CASH' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('Valor recebido', 'Amount received')}
              </label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="text-lg font-bold text-center"
                autoFocus
              />
            </div>

            {/* Bill shortcuts */}
            <div className="flex flex-wrap gap-2">
              {BILL_SHORTCUTS.map((bill) => (
                <Button
                  key={bill}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmountReceived(String(bill))}
                  className="text-xs"
                >
                  R$ {bill}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmountReceived(total.toFixed(2))}
                className="text-xs"
              >
                {t('Exato', 'Exact')}
              </Button>
            </div>

            {/* Change display */}
            {parsedAmount > 0 && (
              <div className={cn(
                'rounded-lg p-3 text-center',
                parsedAmount >= total ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
              )}>
                {parsedAmount >= total ? (
                  <>
                    <p className="text-sm text-muted-foreground">{t('Troco', 'Change')}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      R$ {change.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {t('Valor insuficiente', 'Insufficient amount')} — {t('faltam', 'remaining')} R$ {(total - parsedAmount).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Confirm */}
        <Button
          className="w-full"
          size="lg"
          disabled={!canConfirm || isPending}
          onClick={handleConfirm}
        >
          {isPending
            ? t('Processando...', 'Processing...')
            : t('Confirmar Pagamento', 'Confirm Payment')}
        </Button>
      </div>
    </div>
  );
}
