'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Landmark,
  Settings2,
  QrCode,
  Banknote,
  MessageCircle,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Percent,
  Layers,
  Unplug,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import storeSettingsService from '@/services/storeSettingsService';
import integrationService from '@/services/integrationService';
import { MercadoPagoStatus, StripeConnectStatus } from '@/types/integration';

// ─── Query keys ────────────────────────────────────────────────────────────────
const STORE_QUERY_KEY = ['store-settings'];
const STRIPE_QK = ['integration', 'stripe-connect'];
const MP_QK = ['integration', 'mercadopago'];

// ─── Stripe helpers ─────────────────────────────────────────────────────────────
function getStripeState(s?: StripeConnectStatus) {
  if (!s?.connected) return 'NOT_CONNECTED';
  if (s.chargesEnabled && s.payoutsEnabled) return 'ACTIVE';
  if (s.pendingReview) return 'REVIEW';
  if (s.onboardingCompleted) return 'RESTRICTED';
  return 'ONBOARDING_PENDING';
}

// ─── PIX key type labels ────────────────────────────────────────────────────────
const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
] as const;

// ─── Small helpers ───────────────────────────────────────────────────────────────
function StatusPill({
  ok,
  loading,
  activeLabel = 'Ativo',
  inactiveLabel = 'Não configurado',
}: {
  ok: boolean;
  loading?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-medium">
      <CheckCircle2 className="h-3 w-3" />
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border text-muted-foreground px-2.5 py-0.5 text-xs font-medium">
      <XCircle className="h-3 w-3" />
      {inactiveLabel}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
      {children}
    </p>
  );
}

// ─── Gateway card ────────────────────────────────────────────────────────────────
interface GatewayCardProps {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  badge?: React.ReactNode;
  statusNode: React.ReactNode;
  onConfigure: () => void;
  configureLabel: string;
  disabled?: boolean;
}
function GatewayCard({
  icon,
  name,
  tagline,
  badge,
  statusNode,
  onConfigure,
  configureLabel,
  disabled,
}: GatewayCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card transition-shadow ${disabled ? 'opacity-50 pointer-events-none' : 'hover:shadow-sm'}`}
    >
      <div className="flex items-center gap-4 p-5">
        <div className="shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            {badge}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{tagline}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {statusNode}
          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={onConfigure}
            >
              {configureLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {disabled && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Em breve
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Offline method row ─────────────────────────────────────────────────────────
interface OfflineRowProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  onConfigure?: () => void;
  saving?: boolean;
}
function OfflineRow({ icon, name, description, enabled, onToggle, onConfigure, saving }: OfflineRowProps) {
  return (
    <div className="flex items-center gap-4 py-4 px-5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {enabled && onConfigure && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={onConfigure}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configurar
          </Button>
        )}
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            aria-label={`Ativar ${name}`}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────────
type ActiveDialog = 'mercadopago' | 'stripe' | 'pix' | 'manual-payment' | null;

export function PaymentMethodsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState<ActiveDialog>(null);

  // ── Pix form draft ──
  const [pixKeyDraft, setPixKeyDraft] = useState('');
  const [pixKeyTypeDraft, setPixKeyTypeDraft] = useState('CPF');

  // ── Manual payment form draft ──
  const [manualLabelDraft, setManualLabelDraft] = useState('');
  const [manualInstrDraft, setManualInstrDraft] = useState('');

  // ── MP installment + interest draft ──
  const [mpInstDraft, setMpInstDraft] = useState(12);
  const [mpInterestDraft, setMpInterestDraft] = useState(false);

  // ── Queries ──
  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: STORE_QUERY_KEY,
    queryFn: storeSettingsService.getMyStore,
  });

  const { data: stripeStatus, isLoading: isLoadingStripe } = useQuery<StripeConnectStatus>({
    queryKey: STRIPE_QK,
    queryFn: integrationService.getStripeStatus,
  });

  const { data: mpStatus, isLoading: isLoadingMp } = useQuery<MercadoPagoStatus>({
    queryKey: MP_QK,
    queryFn: integrationService.getMercadoPagoStatus,
  });

  // ── Populate drafts when dialogs open ──
  useEffect(() => {
    if (openDialog === 'pix' && store) {
      setPixKeyDraft(store.pixKey ?? '');
      setPixKeyTypeDraft(store.pixKeyType ?? 'CPF');
    }
    if (openDialog === 'manual-payment' && store) {
      setManualLabelDraft(store.manualPaymentLabel ?? '');
      setManualInstrDraft(store.manualPaymentInstructions ?? '');
    }
    if (openDialog === 'mercadopago' && store) {
      setMpInstDraft(store.mpMaxInstallments ?? 12);
      setMpInterestDraft(store.mpInterestByCustomer ?? false);
    }
  }, [openDialog, store]);

  // ── Store mutations ──
  const updateStoreMutation = useMutation({
    mutationFn: storeSettingsService.updateMyStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY }),
    onError: () => toast.error('Não foi possível salvar. Tente novamente.'),
  });

  function toggleStore(patch: Parameters<typeof storeSettingsService.updateMyStore>[0]) {
    updateStoreMutation.mutate(patch);
  }

  // ── MP mutations ──
  const mpAuthorizeMutation = useMutation({
    mutationFn: integrationService.getMercadoPagoAuthorizeUrl,
    onSuccess: (r) => { window.location.href = r.authorizeUrl; },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Falha ao conectar Mercado Pago.'),
  });

  const mpDisconnectMutation = useMutation({
    mutationFn: integrationService.disconnectMercadoPago,
    onSuccess: () => {
      toast.success('Mercado Pago desconectado.');
      queryClient.invalidateQueries({ queryKey: MP_QK });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
    onError: () => toast.error('Falha ao desconectar Mercado Pago.'),
  });

  // ── Stripe mutations ──
  const stripeOnboardMutation = useMutation({
    mutationFn: integrationService.createStripeOnboardingLink,
    onSuccess: (r) => { window.location.href = r.onboardingUrl; },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Falha ao iniciar Stripe.'),
  });

  const stripeDashMutation = useMutation({
    mutationFn: integrationService.createStripeDashboardLink,
    onSuccess: (r) => { window.location.href = r.dashboardUrl; },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Falha ao abrir dashboard Stripe.'),
  });

  const stripeDisconnectMutation = useMutation({
    mutationFn: integrationService.disconnectStripe,
    onSuccess: () => {
      toast.success('Stripe desconectado.');
      queryClient.invalidateQueries({ queryKey: STRIPE_QK });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
    onError: () => toast.error('Falha ao desconectar Stripe.'),
  });

  // ── URL callback handling ──
  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    if (stripeParam === 'return' || stripeParam === 'refresh') {
      toast.info('Stripe: verificando status...');
      queryClient.invalidateQueries({ queryKey: STRIPE_QK });
      router.replace('/admin/settings/payment-methods');
    }
    const mpParam = searchParams.get('mercadopago');
    if (mpParam === 'success') {
      toast.success('Mercado Pago conectado com sucesso!');
      queryClient.invalidateQueries({ queryKey: MP_QK });
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
      router.replace('/admin/settings/payment-methods');
    } else if (mpParam === 'error') {
      const reason = searchParams.get('reason') ?? 'unknown';
      const msgs: Record<string, string> = {
        missing_params: 'Parâmetros ausentes na resposta do Mercado Pago.',
        invalid_state: 'Identificador de loja inválido.',
        exchange_failed: 'Falha ao trocar código de autorização.',
      };
      toast.error(msgs[reason] ?? 'Falha ao conectar Mercado Pago.');
      router.replace('/admin/settings/payment-methods');
    }
  }, [searchParams, queryClient, router]);

  // ── Derived state ──
  const stripeState = getStripeState(stripeStatus);
  const stripeActive = stripeState === 'ACTIVE';
  const stripeConnected = stripeStatus?.connected ?? false;
  const mpConnected = mpStatus?.connected ?? false;

  const isSavingToggle = updateStoreMutation.isPending;

  // ── Save PIX settings ──
  function savePixConfig() {
    updateStoreMutation.mutate(
      { pixDirectEnabled: true, pixKey: pixKeyDraft, pixKeyType: pixKeyTypeDraft },
      { onSuccess: () => { toast.success('PIX direto configurado.'); setOpenDialog(null); } }
    );
  }

  // ── Save manual payment settings ──
  function saveManualConfig() {
    updateStoreMutation.mutate(
      { manualPaymentEnabled: true, manualPaymentLabel: manualLabelDraft, manualPaymentInstructions: manualInstrDraft },
      { onSuccess: () => { toast.success('Pagamento manual atualizado.'); setOpenDialog(null); } }
    );
  }

  // ── Save MP config (installments + interest) ──
  function saveMpConfig() {
    updateStoreMutation.mutate(
      { mpMaxInstallments: mpInstDraft, mpInterestByCustomer: mpInterestDraft },
      { onSuccess: () => toast.success('Configurações do Mercado Pago salvas.') }
    );
  }

  return (
    <>
      <SettingsPageLayout
        title="Como você quer receber suas vendas"
        description="Escolha os meios de pagamento disponíveis na sua loja e configure cada um deles."
        helpText="Entender taxas e prazos"
      >
        {/* ── Online gateways ── */}
        <div>
          <SectionTitle>Pagamentos online</SectionTitle>
          <div className="space-y-3">
            {/* Mercado Pago */}
            <GatewayCard
              icon={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#009EE3]/10">
                  <Landmark className="h-5 w-5 text-[#009EE3]" />
                </div>
              }
              name="Mercado Pago"
              tagline="Aceite Pix, boleto, cartão e parcelamento — sem taxas adicionais da plataforma."
              badge={
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-400/20 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
                  Recomendado
                </Badge>
              }
              statusNode={
                <StatusPill
                  ok={mpConnected}
                  loading={isLoadingMp}
                  activeLabel="Ativo"
                  inactiveLabel="Não conectado"
                />
              }
              configureLabel={mpConnected ? 'Gerenciar' : 'Conectar'}
              onConfigure={() => setOpenDialog('mercadopago')}
            />

            {/* Stripe */}
            <GatewayCard
              icon={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/20">
                  <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
              }
              name="Stripe"
              tagline="Cartão de crédito e débito internacionais, checkout seguro e repasse automático."
              badge={
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                  Internacional
                </Badge>
              }
              statusNode={
                <StatusPill
                  ok={stripeActive}
                  loading={isLoadingStripe}
                  activeLabel="Ativo"
                  inactiveLabel={stripeConnected ? 'Pendente' : 'Não conectado'}
                />
              }
              configureLabel={stripeConnected ? 'Gerenciar' : 'Conectar'}
              onConfigure={() => setOpenDialog('stripe')}
            />

            {/* PayPal — coming soon */}
            <GatewayCard
              icon={
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/20">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>
              }
              name="PayPal"
              tagline="Pagamentos internacionais via PayPal. Em breve disponível."
              statusNode={null}
              configureLabel=""
              onConfigure={() => {}}
              disabled
            />
          </div>
        </div>

        {/* ── Offline methods ── */}
        <div>
          <SectionTitle>Pagamentos manuais</SectionTitle>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {/* PIX Direto */}
            <OfflineRow
              icon={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <QrCode className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              }
              name="PIX direto"
              description="O cliente vê sua chave PIX no checkout e paga fora da plataforma."
              enabled={store?.pixDirectEnabled ?? false}
              saving={isSavingToggle}
              onToggle={(v) => {
                if (v) {
                  setOpenDialog('pix');
                } else {
                  toggleStore({ pixDirectEnabled: false });
                }
              }}
              onConfigure={() => setOpenDialog('pix')}
            />

            {/* Dinheiro na entrega */}
            <OfflineRow
              icon={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <Banknote className="h-4.5 w-4.5 text-yellow-600 dark:text-yellow-400" />
                </div>
              }
              name="Dinheiro na entrega"
              description="O cliente paga em espécie na hora da entrega do pedido."
              enabled={store?.cashOnDeliveryEnabled ?? false}
              saving={isSavingToggle}
              onToggle={(v) => toggleStore({ cashOnDeliveryEnabled: v })}
            />

            {/* Combinar com vendedor */}
            <OfflineRow
              icon={
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/20">
                  <MessageCircle className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
                </div>
              }
              name="Combinar com o vendedor"
              description={store?.manualPaymentLabel ? `"${store.manualPaymentLabel}" — acertado fora da plataforma.` : 'Pedido gerado, pagamento acertado por WhatsApp ou outro canal.'}
              enabled={store?.manualPaymentEnabled ?? false}
              saving={isSavingToggle}
              onToggle={(v) => {
                if (v) {
                  setOpenDialog('manual-payment');
                } else {
                  toggleStore({ manualPaymentEnabled: false });
                }
              }}
              onConfigure={() => setOpenDialog('manual-payment')}
            />
          </div>
        </div>

        {/* ── Fee transparency note ── */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-900/10 dark:border-blue-800 p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            <strong>Sobre taxas:</strong> As taxas de transação são cobradas diretamente pelo gateway
            (Mercado Pago, Stripe etc.) na sua conta lá. Não cobramos nenhuma comissão adicional sobre
            as suas vendas. Consulte a tabela de taxas de cada provedor no site deles.{' '}
            <Link href="/admin/settings/shipping-methods" className="font-medium underline">
              Meios de envio
            </Link>{' '}
            ficam em uma seção separada.
          </div>
        </div>
      </SettingsPageLayout>

      {/* ════════════════════════════════════════════════════
          DIALOG: Mercado Pago
      ════════════════════════════════════════════════════ */}
      <Dialog open={openDialog === 'mercadopago'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#009EE3]" />
              Mercado Pago
            </DialogTitle>
            <DialogDescription>
              Conecte sua conta do Mercado Pago via OAuth para receber pagamentos diretamente na sua
              conta — sem intermediários.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Connection status banner */}
            {isLoadingMp ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando conexão...
              </div>
            ) : mpConnected ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  <strong>Conta conectada.</strong> Os pagamentos serão processados diretamente na
                  sua conta do Mercado Pago.
                  {mpStatus?.mercadoPagoUserId && (
                    <span className="ml-1 font-mono opacity-70">
                      (ID: {mpStatus.mercadoPagoUserId})
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Como conectar:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Clique em <strong>Conectar com Mercado Pago</strong> abaixo</li>
                  <li>Faça login na sua conta do Mercado Pago</li>
                  <li>Autorize o acesso ao app da plataforma</li>
                  <li>Você será redirecionado de volta automaticamente</li>
                </ol>
              </div>
            )}

            {/* Connect / disconnect */}
            <div className="flex flex-wrap gap-2">
              {!mpConnected ? (
                <Button
                  className="bg-[#009EE3] hover:bg-[#0082C6] text-white gap-2"
                  onClick={() => mpAuthorizeMutation.mutate()}
                  disabled={mpAuthorizeMutation.isPending}
                >
                  {mpAuthorizeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Conectar com Mercado Pago
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => mpDisconnectMutation.mutate()}
                  disabled={mpDisconnectMutation.isPending}
                >
                  {mpDisconnectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unplug className="h-4 w-4" />
                  )}
                  Desconectar conta
                </Button>
              )}
            </div>

            {mpConnected && <Separator />}

            {/* Installments */}
            {mpConnected && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Parcelamento máximo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Número máximo de parcelas que seus clientes podem escolher no checkout.
                  </p>
                  <Select
                    value={String(mpInstDraft)}
                    onValueChange={(v) => setMpInstDraft(Number(v))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n === 1 ? 'Apenas à vista' : `Até ${n}x`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Interest switch */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      Juros por conta do cliente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Quando ativado, o Mercado Pago repassa o custo dos juros para o comprador.
                      Desativado, o valor parcelado pode não incluir juros adicionais.
                    </p>
                  </div>
                  <Switch
                    checked={mpInterestDraft}
                    onCheckedChange={setMpInterestDraft}
                    className="shrink-0 mt-0.5"
                  />
                </div>

                {/* Transparent checkout note */}
                <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Checkout transparente ativo:</strong> seus clientes pagam dentro da
                    sua loja, sem sair para o site do Mercado Pago. Isso aumenta a taxa de conversão.
                  </p>
                </div>
              </div>
            )}
          </div>

          {mpConnected && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(null)}>Fechar</Button>
              <Button
                onClick={saveMpConfig}
                disabled={updateStoreMutation.isPending}
              >
                {updateStoreMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Salvar configurações
              </Button>
            </DialogFooter>
          )}
          {!mpConnected && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(null)}>Fechar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════
          DIALOG: Stripe
      ════════════════════════════════════════════════════ */}
      <Dialog open={openDialog === 'stripe'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-600" />
              Stripe Connect
            </DialogTitle>
            <DialogDescription>
              Conecte sua conta Stripe para receber pagamentos de cartão de crédito e débito
              diretamente na sua conta bancária.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {isLoadingStripe ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando conexão...
              </div>
            ) : stripeActive ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  <strong>Conta ativa.</strong> Pagamentos e repasses funcionando normalmente.
                  {store?.stripeAccountId && (
                    <span className="ml-1 font-mono opacity-70">({store.stripeAccountId})</span>
                  )}
                </div>
              </div>
            ) : stripeConnected ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Cadastro incompleto.</strong> Finalize o onboarding no Stripe para
                  ativar os pagamentos.
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Como conectar:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Clique em <strong>Conectar com Stripe</strong> abaixo</li>
                  <li>Crie ou acesse sua conta Stripe</li>
                  <li>Preencha os dados da empresa e conta bancária</li>
                  <li>Retorne e os pagamentos já estarão ativos</li>
                </ol>
              </div>
            )}

            {/* Transparent checkout note */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Checkout transparente:</strong> os dados de cartão são inseridos direto na
                sua loja via Stripe Elements — seus clientes nunca saem do seu domínio.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {!stripeConnected ? (
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                  onClick={() => stripeOnboardMutation.mutate()}
                  disabled={stripeOnboardMutation.isPending}
                >
                  {stripeOnboardMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Conectar com Stripe
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <>
                  {!stripeActive && (
                    <Button
                      className="gap-2"
                      onClick={() => stripeOnboardMutation.mutate()}
                      disabled={stripeOnboardMutation.isPending}
                    >
                      {stripeOnboardMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Completar cadastro
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => stripeDashMutation.mutate()}
                    disabled={stripeDashMutation.isPending}
                  >
                    {stripeDashMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    Acessar dashboard Stripe
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => stripeDisconnectMutation.mutate()}
                    disabled={stripeDisconnectMutation.isPending}
                  >
                    {stripeDisconnectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Unplug className="h-4 w-4" />
                    )}
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════
          DIALOG: PIX Direto
      ════════════════════════════════════════════════════ */}
      <Dialog open={openDialog === 'pix'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              PIX direto
            </DialogTitle>
            <DialogDescription>
              A chave PIX que aparecerá para o cliente no checkout. O pagamento é acertado fora da
              plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="pix-key-type">Tipo de chave</Label>
              <Select value={pixKeyTypeDraft} onValueChange={setPixKeyTypeDraft}>
                <SelectTrigger id="pix-key-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIX_KEY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix-key">Chave PIX</Label>
              <Input
                id="pix-key"
                placeholder={
                  pixKeyTypeDraft === 'EMAIL'
                    ? 'contato@minhaloja.com'
                    : pixKeyTypeDraft === 'PHONE'
                    ? '+5511999999999'
                    : pixKeyTypeDraft === 'CPF'
                    ? '000.000.000-00'
                    : pixKeyTypeDraft === 'CNPJ'
                    ? '00.000.000/0001-00'
                    : 'Chave aleatória (32 caracteres)'
                }
                value={pixKeyDraft}
                onChange={(e) => setPixKeyDraft(e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-400">
              Nenhuma taxa da plataforma. O dinheiro vai direto para sua conta — você confirma
              o recebimento manualmente no painel a cada pedido.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button
              onClick={savePixConfig}
              disabled={!pixKeyDraft.trim() || updateStoreMutation.isPending}
            >
              {updateStoreMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════
          DIALOG: Combinar com vendedor
      ════════════════════════════════════════════════════ */}
      <Dialog open={openDialog === 'manual-payment'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-sky-600" />
              Combinar com o vendedor
            </DialogTitle>
            <DialogDescription>
              O pedido é criado normalmente, mas o pagamento é acertado por fora (WhatsApp,
              transferência, etc.).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="manual-label">Nome do método (visível ao cliente)</Label>
              <Input
                id="manual-label"
                placeholder="Ex: Pagar via WhatsApp, Transferência bancária..."
                value={manualLabelDraft}
                onChange={(e) => setManualLabelDraft(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-instr">Instruções para o cliente</Label>
              <Textarea
                id="manual-instr"
                placeholder="Ex: Após finalizar o pedido, entre em contato pelo WhatsApp (11) 99999-9999 para combinar o pagamento."
                value={manualInstrDraft}
                onChange={(e) => setManualInstrDraft(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button
              onClick={saveManualConfig}
              disabled={!manualLabelDraft.trim() || updateStoreMutation.isPending}
            >
              {updateStoreMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
