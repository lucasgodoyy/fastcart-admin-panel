'use client';

import { useState } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function ContactInfoClient() {
  const [form, setForm] = useState({
    companyName: '',
    document: '',
    email: '',
    address: '',
    phone: '',
    infoText: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SettingsPageLayout title="Informação de contato" helpText="Mais sobre informação de contato" helpHref="#">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
            Nome da empresa / Nome do responsável
          </Label>
          <Input
            id="companyName"
            value={form.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="document" className="text-sm font-medium text-foreground">
            CNPJ ou CPF
          </Label>
          <Input
            id="document"
            value={form.document}
            onChange={(e) => handleChange('document', e.target.value)}
            placeholder="000.000.000-00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            E-mail da loja
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contato@sualoja.com"
          />
          <p className="text-xs text-muted-foreground">
            Pode ser diferente do e-mail que você usa para acessar seu painel administrador.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-medium text-foreground">
            Endereço da loja
          </Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Endereço completo"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            Telefone da sua loja
          </Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="infoText" className="text-sm font-medium text-foreground">
            Texto informativo para contato
          </Label>
          <textarea
            id="infoText"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.infoText}
            onChange={(e) => handleChange('infoText', e.target.value)}
            placeholder="Informação adicional que você queira exibir no formulário de contato."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </div>
    </SettingsPageLayout>
  );
}
