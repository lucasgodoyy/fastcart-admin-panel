'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';

export function ContactInfoClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    addressCountry: '',
    description: '',
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || '',
        email: store.email || '',
        phone: store.phone || '',
        addressStreet: store.addressStreet || '',
        addressCity: store.addressCity || '',
        addressState: store.addressState || '',
        addressZipCode: store.addressZipCode || '',
        addressCountry: store.addressCountry || '',
        description: store.description || '',
      });
    }
  }, [store]);

  const mutation = useMutation({
    mutationFn: () => storeSettingsService.updateMyStore(form),
    onSuccess: () => {
      toast.success('Informações de contato salvas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error('Erro ao salvar informações.'),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <SettingsPageLayout title="Informação de contato" helpText="Mais sobre informação de contato" helpHref="#">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout title="Informação de contato" helpText="Mais sobre informação de contato" helpHref="#">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Nome da empresa / Nome do responsável
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nome da empresa"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="addressStreet" className="text-sm font-medium text-foreground">Rua</Label>
            <Input id="addressStreet" value={form.addressStreet} onChange={(e) => handleChange('addressStreet', e.target.value)} placeholder="Rua e número" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressCity" className="text-sm font-medium text-foreground">Cidade</Label>
            <Input id="addressCity" value={form.addressCity} onChange={(e) => handleChange('addressCity', e.target.value)} placeholder="Cidade" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressState" className="text-sm font-medium text-foreground">Estado</Label>
            <Input id="addressState" value={form.addressState} onChange={(e) => handleChange('addressState', e.target.value)} placeholder="UF" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressZipCode" className="text-sm font-medium text-foreground">CEP</Label>
            <Input id="addressZipCode" value={form.addressZipCode} onChange={(e) => handleChange('addressZipCode', e.target.value)} placeholder="00000-000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressCountry" className="text-sm font-medium text-foreground">País</Label>
            <Input id="addressCountry" value={form.addressCountry} onChange={(e) => handleChange('addressCountry', e.target.value)} placeholder="BR" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium text-foreground">
            Descrição da loja
          </Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Informação sobre a sua loja."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => store && setForm({
          name: store.name || '', email: store.email || '', phone: store.phone || '',
          addressStreet: store.addressStreet || '', addressCity: store.addressCity || '',
          addressState: store.addressState || '', addressZipCode: store.addressZipCode || '',
          addressCountry: store.addressCountry || '', description: store.description || '',
        })}>Cancelar</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
