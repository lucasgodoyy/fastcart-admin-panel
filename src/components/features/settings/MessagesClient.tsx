'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Megaphone, MapPin } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';

type CustomerMessageSettings = {
  bannerEnabled: boolean;
  bannerMessage: string;
  trackingMessage: string;
};

const DEFAULTS: CustomerMessageSettings = {
  bannerEnabled: false,
  bannerMessage: '',
  trackingMessage: '',
};

function parseMsg(json: string | null | undefined): CustomerMessageSettings {
  if (!json) return { ...DEFAULTS };
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    return {
      bannerEnabled: (raw.bannerEnabled ?? raw.enabled ?? false) as boolean,
      bannerMessage: (raw.bannerMessage ?? raw.message ?? '') as string,
      trackingMessage: (raw.trackingMessage ?? '') as string,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function MessagesClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState<CustomerMessageSettings>({ ...DEFAULTS });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (store) {
      setForm(parseMsg(store.customerMessageJson));
      setDirty(false);
    }
  }, [store]);

  const mutation = useMutation({
    mutationFn: () =>
      storeSettingsService.updateMyStore({ customerMessageJson: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success('Mensagens salvas com sucesso!');
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error('Erro ao salvar.'),
  });

  const set = <K extends keyof CustomerMessageSettings>(key: K, val: CustomerMessageSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  if (isLoading) {
    return (
      <SettingsPageLayout title="Avisos e mensagens" description="Carregando...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Avisos e mensagens"
      description="Configure mensagens informativas exibidas para os clientes durante e após a compra."
    >
      {/* ── 1. Checkout announcement banner ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Aviso no carrinho e checkout</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Exibir aviso</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">
                Uma mensagem de destaque exibida no carrinho e na entrada do checkout. Use para comunicar promoções, prazos, políticas especiais ou aviso de frete.
              </p>
            </div>
            <Switch checked={form.bannerEnabled} onCheckedChange={(v) => set('bannerEnabled', v)} />
          </div>

          {form.bannerEnabled && (
            <div className="space-y-2">
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                value={form.bannerMessage}
                onChange={(e) => set('bannerMessage', e.target.value)}
                placeholder="Ex: 🚚 Frete grátis acima de R$299! · Prazo de entrega: 3 a 7 dias úteis."
                maxLength={300}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Máximo 300 caracteres</span>
                <span>{form.bannerMessage.length}/300</span>
              </div>
              {form.bannerMessage && (
                <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 dark:bg-amber-950/30 dark:border-amber-800">
                  <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Preview no checkout</p>
                  <p className="text-sm text-amber-900 dark:text-amber-200">{form.bannerMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Tracking page message ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Mensagem na página de acompanhamento</p>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Exibida na página onde o cliente acompanha o status do pedido. Use para tranquilizar sobre prazos, fornecer contato de suporte ou compartilhar informações adicionais.
          </p>
          <textarea
            className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            value={form.trackingMessage}
            onChange={(e) => set('trackingMessage', e.target.value)}
            placeholder="Ex: Dúvidas sobre seu pedido? Fale conosco por WhatsApp: (11) 99999-9999"
            maxLength={500}
          />
          <div className="flex justify-end text-xs text-muted-foreground">
            <span>{form.trackingMessage.length}/500</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => store && setForm(parseMsg(store.customerMessageJson))}
          disabled={!dirty}
        >
          Cancelar
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !dirty}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
