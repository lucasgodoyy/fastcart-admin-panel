'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storeSettingsService from '@/services/storeSettingsService';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

const CURRENCIES = [
  { code: 'BRL', label: 'Real Brasileiro (BRL)', flag: '🇧🇷', locale: 'Português' },
  { code: 'USD', label: 'Dólar Americano (USD)', flag: '🇺🇸', locale: 'English' },
  { code: 'EUR', label: 'Euro (EUR)', flag: '🇪🇺', locale: 'Multilingual' },
  { code: 'GBP', label: 'Libra Esterlina (GBP)', flag: '🇬🇧', locale: 'English' },
  { code: 'ARS', label: 'Peso Argentino (ARS)', flag: '🇦🇷', locale: 'Español' },
  { code: 'CLP', label: 'Peso Chileno (CLP)', flag: '🇨🇱', locale: 'Español' },
  { code: 'MXN', label: 'Peso Mexicano (MXN)', flag: '🇲🇽', locale: 'Español' },
];

export function LanguagesClient() {
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store'],
    queryFn: storeSettingsService.getMyStore,
  });

  const [currency, setCurrency] = useState('BRL');
  const [country, setCountry] = useState('Brasil');

  useEffect(() => {
    if (store?.storeCurrency) {
      setCurrency(store.storeCurrency);
    }
    if (store?.addressCountry) {
      setCountry(store.addressCountry);
    }
  }, [store]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeSettingsService.updateMyStore({ storeCurrency: currency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      toast.success('Configurações salvas!');
    },
    onError: () => toast.error('Erro ao salvar configurações.'),
  });

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  if (isLoading) {
    return (
      <SettingsPageLayout
        title="Idiomas e moedas"
        description="Carregando..."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

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
            <span className="text-lg">{selectedCurrency.flag}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{country || 'Brasil'}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCurrency.label} - {selectedCurrency.locale}
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5" disabled>
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
          <Input id="defaultCountry" value={country || 'Brasil'} disabled />
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
          <Label className="text-sm font-medium text-foreground">Moeda padrão</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gap-1.5"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
