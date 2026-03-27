'use client';

import { CheckCircle2 } from 'lucide-react';
import { t } from '@/lib/admin-language';
import { Button } from '@/components/ui/button';

interface PosSaleSuccessModalProps {
  orderId: number;
  changeAmount: number | null;
  onNewSale: () => void;
}

export function PosSaleSuccessModal({ orderId, changeAmount, onNewSale }: PosSaleSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-lg bg-card p-8 text-center shadow-2xl">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-xl font-bold">{t('Venda Finalizada!', 'Sale Complete!')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('Pedido', 'Order')} #{orderId}
        </p>

        {changeAmount != null && changeAmount > 0 && (
          <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-950">
            <p className="text-sm text-muted-foreground">{t('Troco', 'Change')}</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              R$ {changeAmount.toFixed(2)}
            </p>
          </div>
        )}

        <Button className="mt-6 w-full" size="lg" onClick={onNewSale}>
          {t('Nova Venda', 'New Sale')}
        </Button>
      </div>
    </div>
  );
}
