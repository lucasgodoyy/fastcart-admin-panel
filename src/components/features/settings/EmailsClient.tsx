'use client';

import { useState } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

export function EmailsClient() {
  const [emailTitle, setEmailTitle] = useState('Retorne a sua compra na loja {{ store_name }}');
  const [htmlEnabled, setHtmlEnabled] = useState(true);

  return (
    <SettingsPageLayout
      title="Carrinhos abandonados"
      description="Incentiva seus clientes a concluirem sua compra."
      helpText="Mais sobre e-mails automaticos"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Personalizar mensagem</p>

        <div className="space-y-1.5">
          <Label htmlFor="emailTitle" className="text-sm font-medium text-foreground">
            Titulo do e-mail
          </Label>
          <Input
            id="emailTitle"
            value={emailTitle}
            onChange={(e) => setEmailTitle(e.target.value)}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">E-mail em HTML</p>
          <p className="text-xs text-muted-foreground mt-1">
            E uma forma de exibicao que utiliza codigo e mostra as informacoes de forma melhor organizada.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setHtmlEnabled(false)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                !htmlEnabled
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Formato texto
            </button>
            <button
              onClick={() => setHtmlEnabled(true)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                htmlEnabled
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              HTML
            </button>
          </div>

          {htmlEnabled && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableHtml"
                  defaultChecked
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="enableHtml" className="text-sm text-foreground">
                  Habilitar o e-mail em HTML
                </Label>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Code className="h-3.5 w-3.5" />
                Editar codigo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Email preview */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="rounded-md bg-muted p-4 text-sm text-foreground space-y-3">
          <p className="font-medium">Voce ainda pode fazer sua compra</p>
          <p className="text-xs text-muted-foreground">
            {'Ola Joao. Salvamos seu carrinho de compras na loja Lojjak e ele esta esperando por voce.'}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
            <span>{'Camiseta (M, Preto) x 1'}</span>
            <span>R$65 cada um</span>
          </div>
          <Button size="sm" className="w-full">
            Concluir a compra
          </Button>
        </div>
      </div>

      {/* Code variables */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Explicacao do codigo</p>
        <p className="text-xs text-muted-foreground">
          Este e-mail usa variaveis de codigo. Conheca-as para entender as informacoes que serao exibidas.
        </p>
        <div className="space-y-2">
          {[
            { var: '{{ cart.contact_name }}', desc: 'Nome do cliente.' },
            { var: '{{ product.name }}', desc: 'Nome do producto.' },
            { var: '{{ product.quantity }}', desc: 'Quantidade de unidades.' },
            { var: '{{ cart.abandoned_checkout_url }}', desc: 'Link ao carrinho criado.' },
            { var: '{{ store_name }}', desc: 'Nome da sua loja.' },
          ].map((item) => (
            <div key={item.var} className="flex items-center gap-3 text-xs">
              <code className="rounded bg-muted px-2 py-1 font-mono text-foreground">{item.var}</code>
              <span className="text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </div>
    </SettingsPageLayout>
  );
}
