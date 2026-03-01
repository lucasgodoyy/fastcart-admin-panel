'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';

type CustomerMessageSettings = {
  enabled: boolean;
  message: string;
};

const DEFAULTS: CustomerMessageSettings = { enabled: false, message: '' };

function parseMsg(json: string | null | undefined): CustomerMessageSettings {
  if (!json) return { ...DEFAULTS };
  try { return { ...DEFAULTS, ...JSON.parse(json) }; } catch { return { ...DEFAULTS }; }
}

export function MessagesClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState<CustomerMessageSettings>({ ...DEFAULTS });

  useEffect(() => {
    if (store) setForm(parseMsg(store.customerMessageJson));
  }, [store]);

  const mutation = useMutation({
    mutationFn: () =>
      storeSettingsService.updateMyStore({ customerMessageJson: JSON.stringify(form) }),
    onSuccess: () => {
      toast.success('Mensagem salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error('Erro ao salvar mensagem.'),
  });

  if (isLoading) {
    return (
      <SettingsPageLayout title="Mensagem para clientes" description="Configure uma mensagem para mostrar aos seus clientes antes que finalizem a compra." helpText="Mais sobre mensagem informativa" helpHref="#">
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Mensagem para clientes"
      description="Configure uma mensagem para mostrar aos seus clientes antes que finalizem a compra."
      helpText="Mais sobre mensagem informativa"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">Mostrar uma mensagem</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1 ml-6">Será mostrada na calculadora de fretes e no checkout.</p>
        </div>

        {form.enabled && (
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Escreva sua mensagem aqui..."
          />
        )}
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Campo Personalizado</p>
        <p className="text-xs text-muted-foreground mt-1">
          Personalize sua página de produto. Adicione campos personalizados para vender sob demanda.
        </p>
        <Button variant="outline" size="sm" className="mt-3" disabled>Em breve</Button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => store && setForm(parseMsg(store.customerMessageJson))}>Cancelar</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
