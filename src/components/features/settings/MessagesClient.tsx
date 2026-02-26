'use client';

import { useState } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function MessagesClient() {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

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
              checked={showMessage}
              onChange={(e) => setShowMessage(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium text-foreground">Mostrar uma mensagem</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            Sera mostrada na calculadora de fretes e no checkout.
          </p>
        </div>

        {showMessage && (
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva sua mensagem aqui..."
          />
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Campo Personalizado</p>
        <p className="text-xs text-muted-foreground mt-1">
          Personalize sua pagina de produto. Adicione campos personalizados para vender sob demanda.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm">
            Instalar
          </Button>
          <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
            Mais apps de recursos extras
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button>Salvar</Button>
      </div>
    </SettingsPageLayout>
  );
}
