'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Mail, MessageCircle, Copy, CheckCircle2, Clock, AlertCircle,
  ShoppingCart, Package, MapPin, Send, X, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import abandonedCartService, { AbandonedCartItem } from '@/services/abandonedCartService';
import storeService, { StoreInfo } from '@/services/storeService';
import { t } from '@/lib/admin-language';

function formatCurrency(amount: number, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
}
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

// ─── Status chip ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    PENDING:    { label: t('Pendente', 'Pending'),      icon: <Clock className="h-3.5 w-3.5" />,       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    EMAIL_SENT: { label: t('E-mail enviado', 'Email sent'), icon: <Mail className="h-3.5 w-3.5" />,    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    RECOVERED:  { label: t('Recuperado', 'Recovered'),  icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    OPTED_OUT:  { label: t('Desistiu', 'Opted out'),    icon: <AlertCircle className="h-3.5 w-3.5" />,  cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  };
  const cfg = map[status] ?? { label: status, icon: null, cls: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ─── Email Editor Modal ───────────────────────────────────────────────────────
function EmailEditorModal({
  cartId,
  storeId,
  customerEmail,
  customerName,
  cartTotal,
  cartCurrency,
  onClose,
}: {
  cartId: number;
  storeId: number;
  customerEmail: string;
  customerName: string | null;
  cartTotal: number;
  cartCurrency: string;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(
    t('Você deixou algo no seu carrinho!', 'You left something in your cart!')
  );
  const [body, setBody] = useState(
    `Olá${customerName ? ` ${customerName}` : ''}!\n\nVocê deixou itens no seu carrinho no valor de ${formatCurrency(cartTotal, cartCurrency)}.\n\nClique no link abaixo para finalizar sua compra:\n\n{{recovery_link}}\n\nAproveite enquanto há estoque!\n\nA equipe da {{store_name}}`
  );
  const [format, setFormat] = useState<'TEXT' | 'HTML'>('TEXT');
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => abandonedCartService.sendEmail(cartId, storeId, subject, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['abandoned-cart-detail', cartId, storeId] });
      onClose();
    },
    onError: () => setError(t('Erro ao enviar. Tente novamente.', 'Error sending. Please try again.')),
  });

  const variables = [
    { key: '{{store_name}}',       desc: t('Nome da loja', 'Store name') },
    { key: '{{cart.contact_name}}', desc: t('Nome do cliente', 'Customer name') },
    { key: '{{cart.total}}',        desc: t('Valor do carrinho', 'Cart total') },
    { key: '{{recovery_link}}',     desc: t('Link de recuperação', 'Recovery link') },
    { key: '{{unsubscribe_link}}',  desc: t('Link descadastro', 'Unsubscribe link') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t('Enviar E-mail Personalizado', 'Send Custom Email')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Para: {customerEmail}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Format toggle */}
          <div className="flex items-center gap-1 w-fit rounded-lg border border-border bg-muted p-1">
            {(['TEXT', 'HTML'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  format === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {t('Assunto do e-mail', 'Email subject')}
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {t('Corpo', 'Body')}{' '}
              <span className="text-muted-foreground font-normal">
                ({format === 'HTML' ? t('HTML aceito', 'HTML accepted') : t('Texto simples', 'Plain text')})
              </span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-50 font-mono"
            />
          </div>

          {/* Variables */}
          <details className="rounded-lg border border-border">
            <summary className="px-4 py-3 text-xs font-semibold text-foreground cursor-pointer select-none">
              {t('Variáveis disponíveis', 'Available variables')}
            </summary>
            <div className="border-t border-border">
              {variables.map(v => (
                <div key={v.key} className="flex items-center justify-between px-4 py-2 border-b border-border/50 last:border-0">
                  <code className="text-xs text-primary bg-primary/5 px-1.5 py-0.5 rounded">{v.key}</code>
                  <span className="text-xs text-muted-foreground">{v.desc}</span>
                  <button
                    onClick={() => setBody(b => b + v.key)}
                    className="text-[11px] text-blue-600 hover:underline ml-2">
                    {t('Inserir', 'Insert')}
                  </button>
                </div>
              ))}
            </div>
          </details>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('Cancelar', 'Cancel')}
          </Button>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {mutation.isPending ? t('Enviando...', 'Sending...') : t('Enviar e-mail', 'Send email')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Address parser ───────────────────────────────────────────────────────────
function AddressBlock({ json }: { json: string | null | undefined }) {
  if (!json) return <p className="text-xs text-muted-foreground">{t('Endereço não informado', 'Address not provided')}</p>;
  try {
    const a = JSON.parse(json);
    const line1 = [a.addressStreet, a.streetNumber, a.complement].filter(Boolean).join(', ');
    const line2 = [a.neighborhood, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(' · ');
    return (
      <div className="space-y-0.5 text-xs text-foreground">
        {line1 && <p>{line1}</p>}
        {line2 && <p className="text-muted-foreground">{line2}</p>}
        {a.recipientName && <p className="text-muted-foreground">{t('Para:', 'To:')} {a.recipientName}</p>}
      </div>
    );
  } catch {
    return <p className="text-xs text-muted-foreground font-mono break-all">{json}</p>;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AbandonedCartDetailClient({ cartId }: { cartId: number }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: store } = useQuery<StoreInfo>({
    queryKey: ['my-store'],
    queryFn: storeService.getMyStore,
  });
  const storeId = store?.id;

  const { data: cart, isLoading } = useQuery({
    queryKey: ['abandoned-cart-detail', cartId, storeId],
    queryFn: () => abandonedCartService.getById(cartId, storeId!),
    enabled: !!storeId,
  });

  const recoveryUrl = cart?.recoveryToken
    ? `https://store.rapidocart.com.br/recover?token=${cart.recoveryToken}`
    : null;

  const handleCopyLink = async () => {
    if (!recoveryUrl) return;
    await navigator.clipboard.writeText(recoveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!recoveryUrl || !cart?.customerEmail) return;
    const name = cart.customerName ?? 'cliente';
    const msg = `Olá ${name}! Você deixou itens no seu carrinho. Finalize sua compra aqui: ${recoveryUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const items: AbandonedCartItem[] = abandonedCartService.parseCartItems(cart?.cartItemsSnapshot ?? null);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-4">
        {[100, 200, 300].map(w => (
          <div key={w} className="h-16 animate-pulse rounded-lg bg-muted" style={{ width: `${w}px` }} />
        ))}
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center gap-4 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 opacity-30" />
        <p className="text-sm">{t('Carrinho não encontrado.', 'Cart not found.')}</p>
        <Link href="/admin/abandoned-carts" className="text-sm text-primary hover:underline">
          {t('Voltar para a lista', 'Back to list')}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/abandoned-carts"
            className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t('Carrinho Abandonado', 'Abandoned Cart')} #{cart.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusChip status={cart.recoveryStatus} />
              <span className="text-xs text-muted-foreground">{formatDate(cart.abandonedAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {cart.recoveryStatus !== 'RECOVERED' && cart.recoveryStatus !== 'OPTED_OUT' && (
          <div className="flex flex-wrap items-center gap-2">
            {recoveryUrl && (
              <>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? t('Copiado!', 'Copied!') : t('Copiar link', 'Copy link')}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950/20"
                  onClick={handleWhatsApp}>
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
              </>
            )}
            <Button size="sm" className="gap-1.5" onClick={() => setEmailOpen(true)}>
              <Mail className="h-3.5 w-3.5" />
              {t('Enviar e-mail', 'Send email')}
            </Button>
          </div>
        )}
      </div>

      {/* Recovery link preview */}
      {recoveryUrl && (
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground mb-0.5">
              {t('Link de recuperação', 'Recovery link')}
            </p>
            <p className="text-xs text-muted-foreground font-mono truncate">{recoveryUrl}</p>
          </div>
          <button onClick={handleCopyLink}
            className="shrink-0 text-xs font-medium text-primary hover:underline">
            {copied ? t('Copiado!', 'Copied!') : t('Copiar', 'Copy')}
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Cart Items */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                {t('Itens do Carrinho', 'Cart Items')}
              </h2>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('Sem itens registrados.', 'No items recorded.')}</p>
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName ?? item.name ?? 'Produto'}
                        className="h-12 w-12 rounded-lg object-cover border border-border shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.productName ?? item.name ?? t('Produto sem nome', 'Unnamed product')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('Qtd:', 'Qty:')} {item.quantity} × {formatCurrency(item.price, cart.cartCurrency)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      {formatCurrency(item.price * item.quantity, cart.cartCurrency)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">{t('Total', 'Total')}</span>
                  <span className="text-base font-bold text-foreground">
                    {formatCurrency(cart.cartTotal, cart.cartCurrency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment failure context */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                {t('Motivo do Abandono', 'Abandonment Reason')}
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {t('Cartão recusado pelo banco', 'Card rejected by bank')}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                {t('Boleto/PIX não pago', 'Boleto/PIX not paid')}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                {t('Cliente fechou a janela antes de confirmar', 'Customer closed window before confirming')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 italic">
                {t(
                  'Detalhes de falha de pagamento estarão disponíveis quando vinculados a tentativas de checkout.',
                  'Payment failure details will be available when linked to checkout attempts.',
                )}
              </p>
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Customer info */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {t('Cliente', 'Customer')}
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {cart.customerName ?? t('Nome não informado', 'Name not provided')}
                </p>
                <p className="text-xs text-muted-foreground">{cart.customerEmail}</p>
              </div>
              {cart.customerId && (
                <Link href={`/admin/customers/${cart.customerId}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {t('Ver perfil do cliente', 'View customer profile')}
                </Link>
              )}
            </div>
          </div>

          {/* Email history */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {t('Histórico de E-mails', 'Email History')}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('E-mails enviados', 'Emails sent')}</span>
                <span className="font-semibold text-foreground">{cart.emailCount ?? 0}</span>
              </div>
              {cart.lastEmailSentAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t('Último envio', 'Last sent')}</span>
                  <span className="text-foreground">{formatDate(cart.lastEmailSentAt)}</span>
                </div>
              )}
              {(cart.emailCount ?? 0) === 0 && !cart.lastEmailSentAt && (
                <p className="text-xs text-muted-foreground italic">
                  {t('Nenhum e-mail enviado ainda.', 'No email sent yet.')}
                </p>
              )}
            </div>
          </div>

          {/* Delivery address */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t('Endereço de Entrega', 'Delivery Address')}
              </h2>
            </div>
            <AddressBlock json={null} />
          </div>

          {/* Recovery metadata */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {t('Dados de Rastreamento', 'Tracking Data')}
            </h2>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('Abandonado em', 'Abandoned at')}</span>
              <span className="text-foreground">{formatDate(cart.abandonedAt)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t('Criado em', 'Created at')}</span>
              <span className="text-foreground">{formatDate(cart.createdAt)}</span>
            </div>
            {cart.recoveryToken && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('Token', 'Token')}</span>
                <span className="text-foreground font-mono text-[10px] truncate max-w-25">
                  {cart.recoveryToken}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email editor modal */}
      {emailOpen && storeId && (
        <EmailEditorModal
          cartId={cart.id}
          storeId={storeId}
          customerEmail={cart.customerEmail}
          customerName={cart.customerName}
          cartTotal={cart.cartTotal}
          cartCurrency={cart.cartCurrency}
          onClose={() => setEmailOpen(false)}
        />
      )}
    </div>
  );
}
