'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react';
import { t } from '@/lib/admin-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import posService from '@/services/pos/posService';
import type {
  CashRegisterResponse,
  CashRegisterSummaryResponse,
  CashMovementResponse,
  PosCashMovementType,
} from '@/types/pos';

export default function CashRegisterPage() {
  const queryClient = useQueryClient();

  // Current register
  const {
    data: register,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pos-current-register'],
    queryFn: () => posService.getCurrentRegister(),
    retry: false,
  });

  const isOpen = register && register.status === 'OPEN';
  const noRegister = !isLoading && (error || !register);

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('Caixa', 'Cash Register')}</h1>

      {isLoading && <LoadingSkeleton />}
      {noRegister && <OpenRegisterForm />}
      {isOpen && <OpenRegisterView register={register} />}
      {register && register.status === 'CLOSED' && <OpenRegisterForm />}
    </div>
  );
}

// ─── Open Register Form ───────────────────────────────────────────

function OpenRegisterForm() {
  const queryClient = useQueryClient();
  const [openingAmount, setOpeningAmount] = useState('');
  const [operatorName, setOperatorName] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      posService.openRegister({
        openingAmount: parseFloat(openingAmount.replace(',', '.')) || 0,
        operatorName: operatorName.trim(),
      }),
    onSuccess: () => {
      toast.success(t('Caixa aberto com sucesso!', 'Register opened!'));
      queryClient.invalidateQueries({ queryKey: ['pos-current-register'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('Erro ao abrir caixa', 'Error opening register'));
    },
  });

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Unlock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t('Abrir Caixa', 'Open Register')}</CardTitle>
          <CardDescription>
            {t('Informe o valor inicial para abrir o caixa', 'Enter the opening amount')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('Nome do operador', 'Operator name')}
            </label>
            <Input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder={t('Digite seu nome', 'Enter your name')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('Valor de abertura (R$)', 'Opening amount (R$)')}
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              placeholder="0,00"
              className="text-lg font-bold text-center"
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => mutation.mutate()}
            disabled={!operatorName.trim() || mutation.isPending}
          >
            {mutation.isPending ? t('Abrindo...', 'Opening...') : t('Abrir Caixa', 'Open Register')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Open Register View ───────────────────────────────────────────

function OpenRegisterView({ register }: { register: CashRegisterResponse }) {
  const queryClient = useQueryClient();

  // Summary
  const { data: summary } = useQuery({
    queryKey: ['pos-register-summary'],
    queryFn: () => posService.getRegisterSummary(),
    refetchInterval: 15_000,
  });

  // Close mutation
  const [closingAmount, setClosingAmount] = useState('');
  const [showCloseForm, setShowCloseForm] = useState(false);

  const closeMutation = useMutation({
    mutationFn: () =>
      posService.closeRegister({
        closingAmount: parseFloat(closingAmount.replace(',', '.')) || 0,
      }),
    onSuccess: () => {
      toast.success(t('Caixa fechado com sucesso!', 'Register closed!'));
      queryClient.invalidateQueries({ queryKey: ['pos-current-register'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('Erro ao fechar caixa', 'Error closing register'));
    },
  });

  // Cash movement
  const [movementType, setMovementType] = useState<PosCashMovementType>('SUPPLY');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [showMovementForm, setShowMovementForm] = useState(false);

  const movementMutation = useMutation({
    mutationFn: () =>
      posService.addCashMovement({
        type: movementType,
        amount: parseFloat(movementAmount.replace(',', '.')) || 0,
        reason: movementReason.trim(),
      }),
    onSuccess: () => {
      toast.success(
        movementType === 'SUPPLY'
          ? t('Suprimento registrado!', 'Supply recorded!')
          : t('Sangria registrada!', 'Withdrawal recorded!')
      );
      setMovementAmount('');
      setMovementReason('');
      setShowMovementForm(false);
      queryClient.invalidateQueries({ queryKey: ['pos-register-summary'] });
      queryClient.invalidateQueries({ queryKey: ['pos-current-register'] });
    },
    onError: () => toast.error(t('Erro ao registrar movimentação', 'Error recording movement')),
  });

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold">{register.operatorName}</p>
            <p className="text-xs text-muted-foreground">
              {t('Aberto em', 'Opened at')} {new Date(register.openedAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        <Badge variant="default" className="bg-green-600">
          {t('Aberto', 'Open')}
        </Badge>
      </div>

      {/* Summary cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setMovementType('SUPPLY');
            setShowMovementForm(true);
          }}
        >
          <ArrowDownCircle className="mr-2 h-4 w-4 text-green-600" />
          {t('Suprimento', 'Supply')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setMovementType('WITHDRAWAL');
            setShowMovementForm(true);
          }}
        >
          <ArrowUpCircle className="mr-2 h-4 w-4 text-red-600" />
          {t('Sangria', 'Withdrawal')}
        </Button>
        <Button variant="destructive" onClick={() => setShowCloseForm(true)}>
          <Lock className="mr-2 h-4 w-4" />
          {t('Fechar Caixa', 'Close Register')}
        </Button>
      </div>

      {/* Movement form */}
      {showMovementForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {movementType === 'SUPPLY'
                ? t('Suprimento de Caixa', 'Cash Supply')
                : t('Sangria de Caixa', 'Cash Withdrawal')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t('Valor (R$)', 'Amount (R$)')}
              value={movementAmount}
              onChange={(e) => setMovementAmount(e.target.value)}
            />
            <Input
              placeholder={t('Motivo', 'Reason')}
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => movementMutation.mutate()}
                disabled={!movementAmount || !movementReason.trim() || movementMutation.isPending}
              >
                {t('Confirmar', 'Confirm')}
              </Button>
              <Button variant="ghost" onClick={() => setShowMovementForm(false)}>
                {t('Cancelar', 'Cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close form */}
      {showCloseForm && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base">{t('Fechar Caixa', 'Close Register')}</CardTitle>
            <CardDescription>
              {t(
                'Conte o dinheiro em caixa e informe o valor para conferência.',
                'Count the cash in the register and enter the amount for verification.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p>
                  {t('Valor esperado em caixa', 'Expected cash in drawer')}:{' '}
                  <strong>R$ {summary.expectedCashInDrawer.toFixed(2)}</strong>
                </p>
              </div>
            )}
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t('Valor contado (R$)', 'Counted amount (R$)')}
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              className="text-lg font-bold text-center"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => closeMutation.mutate()}
                disabled={!closingAmount || closeMutation.isPending}
              >
                {closeMutation.isPending
                  ? t('Fechando...', 'Closing...')
                  : t('Confirmar Fechamento', 'Confirm Close')}
              </Button>
              <Button variant="ghost" onClick={() => setShowCloseForm(false)}>
                {t('Cancelar', 'Cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register history */}
      <RegisterHistory />
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: CashRegisterSummaryResponse }) {
  const cards = [
    { label: t('Abertura', 'Opening'), value: summary.openingAmount, color: 'text-blue-600' },
    { label: t('Vendas Dinheiro', 'Cash Sales'), value: summary.totalCashSales, color: 'text-green-600' },
    { label: t('Vendas Cartão', 'Card Sales'), value: summary.totalCardSales, color: 'text-purple-600' },
    { label: t('Vendas PIX', 'PIX Sales'), value: summary.totalPixSales, color: 'text-cyan-600' },
    { label: t('Suprimentos', 'Supplies'), value: summary.totalSupplies, color: 'text-emerald-600' },
    { label: t('Sangrias', 'Withdrawals'), value: summary.totalWithdrawals, color: 'text-red-600' },
    { label: t('Total Vendas', 'Total Sales'), value: summary.totalSales, color: 'text-primary' },
    { label: t('Esperado em Caixa', 'Expected in Drawer'), value: summary.expectedCashInDrawer, color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>R$ {c.value.toFixed(2)}</p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t('Nº Vendas', 'Sales Count')}</p>
          <p className="text-lg font-bold">{summary.salesCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Register History ─────────────────────────────────────────────

function RegisterHistory() {
  const { data: history = [] } = useQuery({
    queryKey: ['pos-register-history'],
    queryFn: () => posService.getRegisterHistory(),
  });

  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          {t('Histórico de Caixas', 'Register History')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {history.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{reg.operatorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reg.openedAt).toLocaleString('pt-BR')}
                    {reg.closedAt && ` → ${new Date(reg.closedAt).toLocaleString('pt-BR')}`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={reg.status === 'OPEN' ? 'default' : 'secondary'}>
                    {reg.status === 'OPEN' ? t('Aberto', 'Open') : t('Fechado', 'Closed')}
                  </Badge>
                  {reg.difference != null && (
                    <p className={`text-xs ${reg.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {t('Diferença', 'Difference')}: R$ {reg.difference.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
