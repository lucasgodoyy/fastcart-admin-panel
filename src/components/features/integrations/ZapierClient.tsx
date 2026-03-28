'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FlaskConical,
  Power,
  PowerOff,
  Info,
  X,
} from 'lucide-react';
import zapierService, {
  ZAPIER_EVENTS,
  type CreateZapierWebhookRequest,
  type ZapierWebhookConfig,
} from '@/services/zapierService';
import { t } from '@/lib/admin-language';

// ─── Secret reveal banner ─────────────────────────────────────────────────────

function SecretBanner({ secret, onDismiss }: { secret: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {t(
              'Guarde este segredo agora! Ele não será exibido novamente.',
              'Save this secret now! It will never be shown again.'
            )}
          </p>
        </div>
        <button onClick={onDismiss} className="text-amber-500 hover:text-amber-700 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded bg-amber-100 dark:bg-amber-900/50 px-3 py-2 text-xs font-mono text-amber-900 dark:text-amber-200 break-all select-all">
          {secret}
        </code>
        <button
          onClick={copy}
          className="shrink-0 rounded-lg border border-amber-300 bg-white dark:bg-amber-900/30 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t('Copiado!', 'Copied!') : t('Copiar', 'Copy')}
        </button>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-400">
        {t(
          'Use como header X-Lojaki-Signature para verificar a autenticidade dos eventos recebidos.',
          'Use as X-Lojaki-Signature header to verify authenticity of received events.'
        )}
      </p>
    </div>
  );
}

// ─── Add webhook form ─────────────────────────────────────────────────────────

function AddWebhookForm({ onCreated }: { onCreated: (secret: string) => void }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const isValidUrl = /^https?:\/\/.+/.test(url.trim());

  const mutation = useMutation({
    mutationFn: (req: CreateZapierWebhookRequest) => zapierService.createWebhook(req),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['zapier-webhooks'] });
      toast.success(t('Webhook criado com sucesso!', 'Webhook created successfully!'));
      setUrl('');
      setDescription('');
      setSelectedEvents([]);
      onCreated(res.secret);
    },
    onError: () => {
      toast.error(t('Erro ao criar webhook. Verifique a URL.', 'Error creating webhook. Check the URL.'));
    },
  });

  const toggleEvent = (ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const canSubmit = isValidUrl && selectedEvents.length > 0 && !mutation.isPending;

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h3 className="font-semibold text-sm">{t('Novo webhook', 'New webhook')}</h3>

      {/* URL */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {t('URL do webhook (de Zapier → Catch Hook)', 'Webhook URL (from Zapier → Catch Hook)')}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.zapier.com/hooks/catch/..."
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {url && !isValidUrl && (
          <p className="text-xs text-red-500 mt-1">{t('URL inválida', 'Invalid URL')}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {t('Descrição (opcional)', 'Description (optional)')}
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('ex: Notificar CRM de pedidos pagos', 'e.g. Notify CRM of paid orders')}
          maxLength={255}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Events */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          {t('Eventos a escutar', 'Events to listen to')}
        </label>
        <div className="space-y-2">
          {ZAPIER_EVENTS.map((ev) => (
            <label
              key={ev.value}
              className="flex items-start gap-3 cursor-pointer rounded-lg border p-3 hover:bg-muted/50 transition-colors has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="checkbox"
                checked={selectedEvents.includes(ev.value)}
                onChange={() => toggleEvent(ev.value)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium leading-none">{ev.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() =>
          mutation.mutate({ targetUrl: url.trim(), events: selectedEvents, description: description.trim() || undefined })
        }
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-4 w-4" />
        {mutation.isPending ? t('Criando...', 'Creating...') : t('Criar webhook', 'Create webhook')}
      </button>
    </div>
  );
}

// ─── Webhook row ──────────────────────────────────────────────────────────────

function WebhookRow({ webhook }: { webhook: ZapierWebhookConfig }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => zapierService.deleteWebhook(webhook.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zapier-webhooks'] });
      toast.success(t('Webhook removido.', 'Webhook removed.'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (active: boolean) => zapierService.toggleWebhook(webhook.id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zapier-webhooks'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: () => zapierService.testWebhook(webhook.id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t('Teste enviado com sucesso!', 'Test sent successfully!'));
      } else {
        toast.error(res.message);
      }
    },
    onError: () => {
      toast.error(t('Falha ao enviar o teste.', 'Failed to send the test.'));
    },
  });

  const eventLabels = webhook.events.map(
    (ev) => ZAPIER_EVENTS.find((e) => e.value === ev)?.label ?? ev
  );

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${!webhook.active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {webhook.active ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t('Ativo', 'Active')}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                {t('Inativo', 'Inactive')}
              </span>
            )}
            {webhook.description && (
              <span className="text-xs text-muted-foreground truncate">{webhook.description}</span>
            )}
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
            {webhook.targetUrlMasked}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
            title={t('Enviar evento de teste', 'Send test event')}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <FlaskConical className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleMutation.mutate(!webhook.active)}
            disabled={toggleMutation.isPending}
            title={webhook.active ? t('Desativar', 'Disable') : t('Ativar', 'Enable')}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            {webhook.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              if (confirm(t('Remover este webhook?', 'Remove this webhook?'))) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            title={t('Remover', 'Remove')}
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {eventLabels.map((label) => (
          <span
            key={label}
            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

export function ZapierClient() {
  const router = useRouter();
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['zapier-webhooks'],
    queryFn: zapierService.listWebhooks,
  });

  const hasWebhooks = webhooks && webhooks.length > 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/integrations')}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-500 p-2.5">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Zapier</h1>
            <p className="text-sm text-muted-foreground">
              {t(
                'Conecte sua loja a mais de 7.000 aplicativos automaticamente',
                'Connect your store to 7,000+ apps automatically'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      {hasWebhooks ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {webhooks.length}{' '}
            {t(
              webhooks.length === 1 ? 'webhook configurado' : 'webhooks configurados',
              webhooks.length === 1 ? 'webhook configured' : 'webhooks configured'
            )}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {t('Nenhum webhook configurado', 'No webhooks configured')}
          </span>
        </div>
      )}

      {/* Secret reveal banner */}
      {newSecret && (
        <SecretBanner secret={newSecret} onDismiss={() => setNewSecret(null)} />
      )}

      {/* How-to info */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">
            {t('Como funciona', 'How it works')}
          </span>
        </div>
        <ol className="text-sm text-muted-foreground space-y-1 pl-6 list-decimal">
          <li>
            {t(
              'No Zapier, crie um Zap com trigger "Webhooks by Zapier → Catch Hook"',
              'In Zapier, create a Zap with trigger "Webhooks by Zapier → Catch Hook"'
            )}
          </li>
          <li>{t('Copie a URL gerada pelo Zapier', 'Copy the URL generated by Zapier')}</li>
          <li>
            {t(
              'Cole aqui abaixo, escolha os eventos e clique em Criar webhook',
              'Paste it below, choose events, and click Create webhook'
            )}
          </li>
          <li>
            {t(
              'Use o botão de teste (frasco) para confirmar que o Zapier recebeu o evento',
              'Use the test button (flask) to confirm Zapier received the event'
            )}
          </li>
        </ol>
      </div>

      {/* Existing webhooks */}
      {hasWebhooks && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('Webhooks ativos', 'Active webhooks')}
          </h2>
          {webhooks.map((wh) => (
            <WebhookRow key={wh.id} webhook={wh} />
          ))}
        </div>
      )}

      {/* Add form */}
      <AddWebhookForm onCreated={(secret) => setNewSecret(secret)} />
    </div>
  );
}
