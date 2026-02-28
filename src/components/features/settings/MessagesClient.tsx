'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import storeService, {
  type CustomerMessageSettings,
  DEFAULT_CUSTOMER_MESSAGE,
} from '@/services/storeService';

export function MessagesClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CustomerMessageSettings>({ ...DEFAULT_CUSTOMER_MESSAGE });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const store = await storeService.getMyStore();
      setSettings(storeService.parseCustomerMessage(store.customerMessageJson));
    } catch {
      toast.error('Erro ao carregar configurações de mensagem.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await storeService.updateMyStore({
        customerMessageJson: JSON.stringify(settings),
      });
      toast.success('Mensagem para clientes salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar mensagem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
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
              checked={settings.showMessage}
              onChange={(e) => setSettings((prev) => ({ ...prev, showMessage: e.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">Mostrar uma mensagem</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1 ml-6">Será mostrada na calculadora de fretes e no checkout.</p>
        </div>

        {settings.showMessage && (
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={settings.message}
            onChange={(e) => setSettings((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Escreva sua mensagem aqui..."
          />
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Campo Personalizado</p>
        <p className="text-xs text-muted-foreground mt-1">
          Personalize sua página de produto. Adicione campos personalizados para vender sob demanda.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm">Instalar</Button>
          <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
            Mais apps de recursos extras
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
