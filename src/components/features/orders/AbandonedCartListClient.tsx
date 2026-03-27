'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart, Mail, Settings2, CheckCircle2, Clock, AlertCircle,
  TrendingUp, DollarSign, RefreshCw, Users, Send, X, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import abandonedCartService, { AbandonedCart, AbandonedCartSettings } from '@/services/abandonedCartService';
import storeService, { StoreInfo } from '@/services/storeService';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
}
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}
function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return t('< 1 hora atrás', '< 1 hour ago');
  if (h < 24) return t(`${h}h atrás`, `${h}h ago`);
  const d = Math.floor(h / 24);
  return t(`${d}d atrás`, `${d}d ago`);
}

type StatusFilter = 'PENDING' | 'RECOVERED' | 'OPTED_OUT' | 'ALL';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:    { label: t('Pendente', 'Pending'),       className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  EMAIL_SENT: { label: t('E-mail enviado', 'Email sent'), className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  RECOVERED:  { label: t('Recuperado', 'Recovered'),   className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  OPTED_OUT:  { label: t('Desistiu', 'Opted out'),     className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

// ─── Config Modal ────────────────────────────────────────────────────────────
function ConfigModal({
  storeId,
  initialSettings,
  onClose,
}: {
  storeId: number;
  initialSettings: AbandonedCartSettings;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>(initialSettings.mode);
  const [delayHours, setDelayHours] = useState(initialSettings.delayHours);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => abandonedCartService.saveSettings(storeId, { mode, delayHours }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['abandoned-cart-settings', storeId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            {t('Configurações de Envio', 'Send Settings')}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Mode selection */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {t('Modo de Envio', 'Send Mode')}
            </p>
            <label className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors
              ${mode === 'MANUAL' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
              <input type="radio" name="mode" className="mt-0.5" checked={mode === 'MANUAL'}
                onChange={() => setMode('MANUAL')} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('Manual', 'Manual')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    'Você decide para quem e quando enviar, clicando um a um.',
                    'You decide who and when to send, one by one.',
                  )}
                </p>
              </div>
            </label>
            <label className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors
              ${mode === 'AUTO' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'}`}>
              <input type="radio" name="mode" className="mt-0.5" checked={mode === 'AUTO'}
                onChange={() => setMode('AUTO')} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('Automático', 'Automatic')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(
                    'O sistema envia e-mails automaticamente após o tempo configurado.',
                    'The system sends emails automatically after the configured time.',
                  )}
                </p>
              </div>
            </label>
          </div>

          {/* Delay hours — only for AUTO */}
          {mode === 'AUTO' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                {t('Enviar após (horas)', 'Send after (hours)')}
              </label>
              <select
                value={delayHours}
                onChange={(e) => setDelayHours(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 6, 12, 24, 48, 72].map(h => (
                  <option key={h} value={h}>{h}h {t('após o abandono', 'after abandonment')}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('Cancelar', 'Cancel')}
          </Button>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? t('Salvando...', 'Saving...') : t('Salvar', 'Save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Email Modal ──────────────────────────────────────────────────────
function QuickEmailModal({
  cart,
  storeId,
  onClose,
}: {
  cart: AbandonedCart;
  storeId: number;
  onClose: () => void;
}) {
  const defaultSubject = t('Você deixou algo no carrinho!', 'You left something in your cart!');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(
    `Olá${cart.customerName ? ` ${cart.customerName}` : ''}!\n\nVocê deixou alguns itens no seu carrinho no valor de ${formatCurrency(cart.cartTotal, cart.cartCurrency)}.\n\nFinalize sua compra agora mesmo!`,
  );
  const qc = useQueryClient();
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => abandonedCartService.sendEmail(cart.id, storeId, subject, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['abandoned-carts', storeId] });
      onClose();
    },
    onError: () => setError(t('Erro ao enviar. Tente novamente.', 'Error sending. Please try again.')),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t('Enviar E-mail de Recuperação', 'Send Recovery Email')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{cart.customerEmail}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {t('Assunto', 'Subject')}
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {t('Mensagem', 'Message')}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-35 font-mono"
            />
          </div>
          {/* Variables hint */}
          <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
            <p className="text-[11px] font-semibold text-foreground mb-1">
              {t('Variáveis disponíveis:', 'Available variables:')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['{{store_name}}', '{{cart.contact_name}}', '{{cart.total}}', '{{recovery_link}}', '{{unsubscribe_link}}'].map(v => (
                <code key={v} className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5 text-primary">{v}</code>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('Cancelar', 'Cancel')}
          </Button>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {mutation.isPending ? t('Enviando...', 'Sending...') : t('Enviar', 'Send')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AbandonedCartListClient() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<AbandonedCart | null>(null);

  const { data: store } = useQuery<StoreInfo>({
    queryKey: ['my-store'],
    queryFn: storeService.getMyStore,
  });
  const storeId = store?.id;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['abandoned-cart-stats', storeId, days],
    queryFn: () => abandonedCartService.getStats(storeId!, days),
    enabled: !!storeId,
  });

  const { data: settings } = useQuery({
    queryKey: ['abandoned-cart-settings', storeId],
    queryFn: () => abandonedCartService.getSettings(storeId!),
    enabled: !!storeId,
  });

  const listStatus = statusFilter === 'ALL' ? 'PENDING,RECOVERED,OPTED_OUT,EMAIL_SENT' : statusFilter;
  const { data: cartList, isLoading: listLoading } = useQuery({
    queryKey: ['abandoned-carts', storeId, statusFilter, page],
    queryFn: () => abandonedCartService.list(storeId!, listStatus, page, 20),
    enabled: !!storeId,
  });

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'PENDING',   label: t('Pendente', 'Pending') },
    { key: 'RECOVERED', label: t('Recuperado', 'Recovered') },
    { key: 'OPTED_OUT', label: t('Desistiu', 'Opted out') },
    { key: 'ALL',       label: t('Todos', 'All') },
  ];

  const dayOptions = [7, 14, 30, 60, 90];
  const totalPages = cartList ? Math.ceil(cartList.totalElements / 20) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {t('Carrinhos Abandonados', 'Abandoned Carts')}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('Recupere vendas que foram iniciadas mas não concluídas', 'Recover sales that were started but not completed')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Days selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {dayOptions.map(d => (
              <button key={d} onClick={() => { setDays(d); setPage(0); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  days === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                {d}d
              </button>
            ))}
          </div>
          {/* Config button */}
          <Button variant="outline" size="sm" className="gap-1.5"
            onClick={() => setConfigOpen(true)} title={t('Configurações de envio', 'Send settings')}>
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Configurar', 'Settings')}</span>
            {settings && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] rounded-full px-1.5 py-0.5 font-medium
                ${settings.mode === 'AUTO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                {settings.mode === 'AUTO' ? t('Auto', 'Auto') : t('Manual', 'Manual')}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ── KPI Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            icon: <ShoppingCart className="h-5 w-5 text-amber-500" />,
            label: t('Abandonados', 'Abandoned'),
            value: stats ? String(stats.totalAbandoned) : '—',
            sub: t('no período', 'in period'),
          },
          {
            icon: <Clock className="h-5 w-5 text-blue-500" />,
            label: t('Pendentes', 'Pending'),
            value: stats ? String(stats.totalPending) : '—',
            sub: t('aguardando ação', 'awaiting action'),
          },
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
            label: t('Recuperados', 'Recovered'),
            value: stats ? String(stats.totalRecovered) : '—',
            sub: stats ? `${stats.recoveryRate.toFixed(1)}% taxa` : undefined,
          },
          {
            icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
            label: t('Valor Recuperado', 'Recovered Value'),
            value: stats ? formatCurrency(stats.totalRecoveryValue) : '—',
          },
        ].map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                {statsLoading ? (
                  <div className="h-6 w-16 mt-1 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-base font-bold text-foreground leading-tight">{item.value}</p>
                )}
                {!statsLoading && item.sub && <p className="text-[11px] text-muted-foreground">{item.sub}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recovery rate bar */}
      {stats && stats.totalAbandoned > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-foreground">{t('Taxa de Recuperação', 'Recovery Rate')}</span>
            <span className="font-semibold text-foreground">{stats.recoveryRate.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all duration-700"
              style={{ width: `${Math.min(stats.recoveryRate, 100)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>{stats.totalPending} {t('pendentes', 'pending')}</span>
            <span>{stats.totalOptedOut} {t('desistiram', 'opted out')}</span>
            <span>{stats.totalRecovered} {t('recuperados', 'recovered')}</span>
          </div>
        </div>
      )}

      {/* ── Cart List ─────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card">
        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(0); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {listLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : !cartList?.content?.length ? (
          <div className="p-10 flex flex-col items-center gap-3 text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-30" />
            <p className="text-sm">{t('Nenhum carrinho abandonado neste filtro.', 'No abandoned carts in this filter.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('Carrinho', 'Cart')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    {t('Data', 'Date')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('Total', 'Total')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    {t('Cliente / E-mail', 'Customer / Email')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    {t('E-mails', 'Emails')}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('Status', 'Status')}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('Ação', 'Action')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartList.content.map((cart) => {
                  const statusCfg = statusConfig[cart.recoveryStatus] ?? { label: cart.recoveryStatus, className: 'bg-muted text-muted-foreground' };
                  return (
                    <tr key={cart.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/abandoned-carts/${cart.id}`}
                          className="font-mono text-xs text-primary hover:underline font-medium">
                          #{cart.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                        <div>{timeAgo(cart.abandonedAt)}</div>
                        <div className="text-[10px] opacity-70">{formatDate(cart.abandonedAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-foreground text-xs">
                          {formatCurrency(cart.cartTotal, cart.cartCurrency)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs font-medium text-foreground truncate max-w-40">
                          {cart.customerName || '—'}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-40">
                          {cart.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {cart.emailCount ?? 0} {t('enviados', 'sent')}
                        </span>
                        {cart.lastEmailSentAt && (
                          <div className="text-[10px] text-muted-foreground/70">
                            {t('Último:', 'Last:')} {timeAgo(cart.lastEmailSentAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/abandoned-carts/${cart.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('Ver', 'View')}</span>
                          </Link>
                          {cart.recoveryStatus !== 'RECOVERED' && cart.recoveryStatus !== 'OPTED_OUT' && (
                            <button
                              onClick={() => setEmailTarget(cart)}
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{t('Enviar e-mail', 'Send email')}</span>
                            </button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {t(`${cartList?.totalElements ?? 0} resultado(s)`, `${cartList?.totalElements ?? 0} result(s)`)}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0}
                onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {configOpen && settings && storeId && (
        <ConfigModal storeId={storeId} initialSettings={settings} onClose={() => setConfigOpen(false)} />
      )}
      {emailTarget && storeId && (
        <QuickEmailModal cart={emailTarget} storeId={storeId} onClose={() => setEmailTarget(null)} />
      )}
    </div>
  );
}
