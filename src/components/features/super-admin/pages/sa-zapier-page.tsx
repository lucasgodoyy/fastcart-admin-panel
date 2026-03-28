'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trash2, PowerOff, Power, CheckCircle2, AlertCircle, Store, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SaPageHeader, SaCard, staggerContainer, fadeInUp } from '../ui/sa-components';
import zapierService, { ZAPIER_EVENTS, type ZapierWebhookConfig } from '@/services/zapierService';

function EventBadge({ event }: { event: string }) {
  const label = ZAPIER_EVENTS.find((e) => e.value === event)?.label ?? event;
  return (
    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
      {label}
    </span>
  );
}

function WebhookRow({ hook }: { hook: ZapierWebhookConfig & { storeName?: string } }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (active: boolean) => zapierService.superAdminToggle(hook.id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sa-zapier-webhooks'] }),
    onError: () => toast.error('Erro ao alterar status.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => zapierService.superAdminDelete(hook.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-zapier-webhooks'] });
      toast.success('Webhook removido.');
    },
    onError: () => toast.error('Erro ao remover webhook.'),
  });

  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] hover:bg-[hsl(var(--sa-surface-elevated))] transition-colors"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Store className="h-3.5 w-3.5 text-[hsl(var(--sa-text-muted))] shrink-0" />
          <span className="text-[11px] font-semibold text-[hsl(var(--sa-text-muted))] uppercase tracking-wide">
            Store #{hook.storeId}
            {hook.storeName ? ` — ${hook.storeName}` : ''}
          </span>
          {hook.active ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--sa-success))]">
              <CheckCircle2 className="h-3 w-3" /> Ativo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--sa-text-muted))]">
              <AlertCircle className="h-3 w-3" /> Inativo
            </span>
          )}
        </div>
        {hook.description && (
          <p className="text-[11px] text-[hsl(var(--sa-text-secondary))] truncate">{hook.description}</p>
        )}
        <p className="text-[10px] font-mono text-[hsl(var(--sa-text-muted))] truncate">{hook.targetUrlMasked}</p>
        <div className="flex flex-wrap gap-1">
          {hook.events.map((ev) => (
            <EventBadge key={ev} event={ev} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toggleMutation.mutate(!hook.active)}
          disabled={toggleMutation.isPending}
          title={hook.active ? 'Desativar' : 'Ativar'}
          className="rounded-lg p-1.5 text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-border))] transition-colors disabled:opacity-50"
        >
          {toggleMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hook.active ? (
            <PowerOff className="h-4 w-4" />
          ) : (
            <Power className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => {
            if (confirm('Remover este webhook permanentemente?')) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          title="Remover"
          className="rounded-lg p-1.5 text-[hsl(var(--sa-danger))] hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

export function SaZapierPage() {
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['sa-zapier-webhooks'],
    queryFn: zapierService.listAllWebhooks,
  });

  const total = webhooks?.length ?? 0;
  const active = webhooks?.filter((w) => w.active).length ?? 0;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <SaPageHeader
        title="Zapier Webhooks"
        description="Visualize e gerencie todos os webhooks Zapier configurados pelas lojas."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SaCard>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">
            Total de Webhooks
          </p>
          <p className="text-2xl font-bold text-[hsl(var(--sa-text))] mt-1">{isLoading ? '—' : total}</p>
        </SaCard>
        <SaCard>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">
            Ativos
          </p>
          <p className="text-2xl font-bold text-[hsl(var(--sa-success))] mt-1">{isLoading ? '—' : active}</p>
        </SaCard>
        <SaCard>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--sa-text-muted))]">
            Inativos
          </p>
          <p className="text-2xl font-bold text-[hsl(var(--sa-danger))] mt-1">{isLoading ? '—' : total - active}</p>
        </SaCard>
      </div>

      {/* List */}
      <SaCard>
        <h2 className="text-sm font-semibold text-[hsl(var(--sa-text))] mb-4">
          Todos os webhooks ({total})
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--sa-text-muted))]" />
          </div>
        ) : total === 0 ? (
          <p className="text-center py-10 text-sm text-[hsl(var(--sa-text-muted))]">
            Nenhuma loja configurou webhooks Zapier ainda.
          </p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {webhooks!.map((hook) => (
              <WebhookRow key={hook.id} hook={hook} />
            ))}
          </motion.div>
        )}
      </SaCard>
    </div>
  );
}
