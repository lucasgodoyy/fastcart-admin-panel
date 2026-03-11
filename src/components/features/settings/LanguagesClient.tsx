'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storeSettingsService from '@/services/storeSettingsService';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Globe, DollarSign, Clock, Lock, Rocket } from 'lucide-react';
import { toast } from 'sonner';

const CURRENCIES = [
  { code: 'BRL', label: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
  { code: 'USD', label: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', label: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'ARS', label: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', label: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'MXN', label: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
];

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
  { value: 'America/Belem', label: 'Belém (UTC-3)' },
  { value: 'America/Recife', label: 'Recife (UTC-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-3)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' },
];

export function LanguagesClient() {
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: ['my-store'],
    queryFn: storeSettingsService.getMyStore,
  });

  const [currency, setCurrency] = useState('BRL');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (store?.storeCurrency) {
      setCurrency(store.storeCurrency);
    }
  }, [store]);

  const saveMutation = useMutation({
    mutationFn: () =>
      storeSettingsService.updateMyStore({ storeCurrency: currency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      setDirty(false);
      toast.success('Configurações salvas!');
    },
    onError: () => toast.error('Erro ao salvar configurações.'),
  });

  if (isLoading) {
    return (
      <SettingsPageLayout title="Idiomas e moeda" description="Carregando...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  const selectedTimezone = TIMEZONES.find((t) => t.value === timezone) ?? TIMEZONES[0];

  return (
    <SettingsPageLayout
      title="Idiomas e moeda"
      description="Configure o idioma, moeda e fuso horário da sua loja."
    >
      {/* ── Primary Market ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Mercado primário</p>
          </div>
          <Badge variant="secondary" className="text-xs">Padrão</Badge>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
            🇧🇷
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Brasil</p>
            <p className="text-xs text-muted-foreground">Português • Real Brasileiro (BRL) • America/Sao_Paulo</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Fixo no lançamento
          </div>
        </div>
      </div>

      {/* ── Currency ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Moeda da loja</p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Os preços dos produtos e pedidos serão exibidos nesta moeda para você e seus clientes.
          </p>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Moeda principal</Label>
            <Select
              value={currency}
              onValueChange={(v) => { setCurrency(v); setDirty(true); }}
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag}&nbsp; {c.label} ({c.code}) {c.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 inline-flex items-center gap-3 text-sm">
            <span className="text-muted-foreground text-xs">Exemplo de preço:</span>
            <span className="font-semibold text-foreground">
              {selectedCurrency.symbol} 1.299,90 {selectedCurrency.code}
            </span>
          </div>
        </div>
      </div>

      {/* ── Timezone ── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Fuso horário e formato de data</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Fuso horário</Label>
              <Select
                value={timezone}
                onValueChange={(v) => { setTimezone(v); setDirty(true); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Formato de data</Label>
              <div className="flex h-9 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm items-center text-muted-foreground">
                DD/MM/AAAA (padrão Brasil)
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 inline-flex items-center gap-3 text-sm">
            <span className="text-muted-foreground text-xs">Horário atual no fuso:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {new Date().toLocaleString('pt-BR', { timeZone: selectedTimezone.value, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── International Markets ── */}
      <div className="rounded-lg border border-dashed border-border bg-card overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Mercados internacionais</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Expanda sua loja para outros países, moedas e idiomas. Defina preços por mercado, idiomas localizados e métodos de pagamento regionais.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['🇺🇸 English / USD', '🇲🇽 Español / MXN', '🇦🇷 Español / ARS', '🇵🇹 Português / EUR'].map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
              <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">+ mais</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs text-muted-foreground">Em breve</Badge>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !dirty}
          className="gap-1.5"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar alterações
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
