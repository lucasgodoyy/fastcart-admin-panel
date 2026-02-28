'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export function LanguagesClient() {
  return (
    <SettingsPageLayout
      title="Idiomas e moedas"
      description="Chegue mais longe! Configure diferentes moedas para administrar seus produtos e habilite sua loja para vendas em outros países."
      helpText="Mais sobre idiomas e moedas"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Países habilitados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Defina onde quer que sua loja esteja disponível. Seus clientes poderão escolher em qual navegar.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex items-center gap-3">
            <span className="text-lg">🇧🇷</span>
            <div>
              <p className="text-sm font-medium text-foreground">Brasil</p>
              <p className="text-xs text-muted-foreground">Reais - Português</p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Habilitar outro país
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">País padrão da loja</p>
          <p className="text-xs text-muted-foreground mt-1">
            Defina o idioma e em que moeda os preços devem aparecer para seus clientes ao visitar a loja.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="defaultCountry" className="text-sm font-medium text-foreground">País padrão</Label>
          <Input id="defaultCountry" defaultValue="Brasil" disabled />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Moeda do administrador</p>
          <p className="text-xs text-muted-foreground mt-1">
            Defina uma moeda para gerenciar os preços dos seus produtos. Só você verá essa informação.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency" className="text-sm font-medium text-foreground">Moeda padrão</Label>
          <Input id="currency" defaultValue="Reais" disabled />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Taxas de câmbio</p>
          <p className="text-xs text-muted-foreground mt-1">
            Defina o câmbio que deve ser aplicado aos preços determinados na moeda do administrador.
          </p>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3 items-center text-xs font-medium text-muted-foreground border-b border-border pb-2">
            <span>Moeda</span>
            <span>Equivale a</span>
            <span></span>
          </div>
          <div className="grid grid-cols-3 gap-3 items-center">
            <span className="text-sm text-foreground">1 EUR</span>
            <span className="text-sm text-foreground">BRL 6.1044</span>
            <Button variant="ghost" size="sm" className="text-xs text-primary">Sugestão</Button>
          </div>
          <div className="grid grid-cols-3 gap-3 items-center">
            <span className="text-sm text-foreground">1 USD</span>
            <span className="text-sm text-foreground">BRL 5.1780</span>
            <Button variant="ghost" size="sm" className="text-xs text-primary">Sugestão</Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Recomendamos atualizar as taxas de câmbio com frequência.</p>
      </div>

      <div className="flex items-center justify-end">
        <Button>Salvar</Button>
      </div>
    </SettingsPageLayout>
  );
}
