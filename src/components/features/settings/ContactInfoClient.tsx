'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import storeService, { type StoreInfo } from '@/services/storeService';

export function ContactInfoClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    storeService.getMyStore().then((store: StoreInfo) => {
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
      setLoading(false);
    }).catch(() => {
      showToast('error', 'Erro ao carregar dados da loja.');
      setLoading(false);
    });
  }, [showToast]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await storeService.updateMyStore({
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        addressStreet: form.addressStreet.trim() || undefined,
        addressCity: form.addressCity.trim() || undefined,
        addressState: form.addressState.trim() || undefined,
        addressZipCode: form.addressZipCode.trim() || undefined,
        addressCountry: form.addressCountry.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      showToast('success', 'Informações de contato salvas!');
    } catch {
      showToast('error', 'Erro ao salvar informações.');
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
    <SettingsPageLayout title="Informação de contato" helpText="Mais sobre informação de contato" helpHref="#">
      {/* Toast */}
      {toast && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'}`}>
          {toast.message}
        </div>
      )}

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
          <Label htmlFor="description" className="text-sm font-medium text-foreground">
            Descrição da loja
          </Label>
          <textarea
            id="description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Breve descrição da sua loja."
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

        <div className="space-y-1.5">
          <Label htmlFor="addressStreet" className="text-sm font-medium text-foreground">
            Endereço
          </Label>
          <Input
            id="addressStreet"
            value={form.addressStreet}
            onChange={(e) => handleChange('addressStreet', e.target.value)}
            placeholder="Rua, número, bairro"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="addressCity" className="text-sm font-medium text-foreground">
              Cidade
            </Label>
            <Input
              id="addressCity"
              value={form.addressCity}
              onChange={(e) => handleChange('addressCity', e.target.value)}
              placeholder="São Paulo"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressState" className="text-sm font-medium text-foreground">
              Estado
            </Label>
            <Input
              id="addressState"
              value={form.addressState}
              onChange={(e) => handleChange('addressState', e.target.value)}
              placeholder="SP"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="addressZipCode" className="text-sm font-medium text-foreground">
              CEP
            </Label>
            <Input
              id="addressZipCode"
              value={form.addressZipCode}
              onChange={(e) => handleChange('addressZipCode', e.target.value)}
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressCountry" className="text-sm font-medium text-foreground">
              País
            </Label>
            <Input
              id="addressCountry"
              value={form.addressCountry}
              onChange={(e) => handleChange('addressCountry', e.target.value)}
              placeholder="Brasil"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
