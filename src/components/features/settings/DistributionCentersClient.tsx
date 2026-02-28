'use client';

import { useState } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function DistributionCentersClient() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    country: 'Brasil',
    cep: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SettingsPageLayout
      title="Definir centro de distribuição principal"
      description="Será usado como o principal local de envio ou armazenamento dos produtos da loja."
      helpText="Mais sobre centros de distribuição"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">Nome do local</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Depósito principal"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-medium text-foreground">Endereço</Label>
          <Input id="address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country" className="text-sm font-medium text-foreground">País</Label>
          <Input id="country" value={form.country} onChange={(e) => handleChange('country', e.target.value)} disabled />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cep" className="text-sm font-medium text-foreground">CEP</Label>
            <Input id="cep" value={form.cep} onChange={(e) => handleChange('cep', e.target.value)} placeholder="00000-000" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-sm font-medium text-foreground">Estado</Label>
            <Input id="state" value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium text-foreground">Cidade</Label>
            <Input id="city" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-sm font-medium text-foreground">Bairro</Label>
            <Input
              id="neighborhood"
              value={form.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="street" className="text-sm font-medium text-foreground">Rua</Label>
          <Input id="street" value={form.street} onChange={(e) => handleChange('street', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="number" className="text-sm font-medium text-foreground">Número</Label>
            <Input id="number" value={form.number} onChange={(e) => handleChange('number', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="complement" className="text-sm font-medium text-foreground">Complemento (opcional)</Label>
            <Input
              id="complement"
              value={form.complement}
              onChange={(e) => handleChange('complement', e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <Label className="text-sm font-medium text-foreground">Estoque</Label>
          <p className="text-xs text-muted-foreground mt-1">O estoque deste centro estará disponível para todas as vendas</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Definir</Button>
      </div>
    </SettingsPageLayout>
  );
}
