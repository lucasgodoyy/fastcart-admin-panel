'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';
import { t } from '@/lib/admin-language';

export function FiscalDataClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState({
    fiscalName: '',
    fiscalCpfCnpj: '',
    fiscalCep: '',
    fiscalAddressStreet: '',
    fiscalAddressNumber: '',
    fiscalAddressComplement: '',
    fiscalAddressNeighborhood: '',
    fiscalAddressCity: '',
    fiscalAddressState: '',
    fiscalAddressCountry: 'Brasil',
  });

  useEffect(() => {
    if (store) {
      setForm({
        fiscalName: store.fiscalName || '',
        fiscalCpfCnpj: store.fiscalCpfCnpj || '',
        fiscalCep: store.fiscalCep || '',
        fiscalAddressStreet: store.fiscalAddressStreet || '',
        fiscalAddressNumber: store.fiscalAddressNumber || '',
        fiscalAddressComplement: store.fiscalAddressComplement || '',
        fiscalAddressNeighborhood: store.fiscalAddressNeighborhood || '',
        fiscalAddressCity: store.fiscalAddressCity || '',
        fiscalAddressState: store.fiscalAddressState || '',
        fiscalAddressCountry: store.fiscalAddressCountry || 'Brasil',
      });
    }
  }, [store]);

  const mutation = useMutation({
    mutationFn: () => {
      const isFilled = form.fiscalName && form.fiscalCpfCnpj && form.fiscalCep
        && form.fiscalAddressStreet && form.fiscalAddressCity && form.fiscalAddressState;
      return storeSettingsService.updateMyStore({
        ...form,
        fiscalDataComplete: Boolean(isFilled),
      });
    },
    onSuccess: () => {
      toast.success(t('Dados fiscais salvos com sucesso!', 'Fiscal data saved successfully!'));
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error(t('Erro ao salvar dados fiscais.', 'Error saving fiscal data.')),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── ViaCEP auto-fill ──
  const [cepLoading, setCepLoading] = useState(false);
  const fetchCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          fiscalAddressStreet: data.logradouro || prev.fiscalAddressStreet,
          fiscalAddressNeighborhood: data.bairro || prev.fiscalAddressNeighborhood,
          fiscalAddressCity: data.localidade || prev.fiscalAddressCity,
          fiscalAddressState: data.uf || prev.fiscalAddressState,
          fiscalAddressCountry: 'Brasil',
        }));
      }
    } catch { /* ignore */ }
    setCepLoading(false);
  }, []);

  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    handleChange('fiscalCep', formatted);
    if (digits.length === 8) fetchCep(digits);
  };

  const formatCpfCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    // CNPJ: 00.000.000/0000-00
    return digits
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const isFiscalIncomplete = store && !store.fiscalDataComplete;

  if (isLoading) {
    return (
      <SettingsPageLayout title={t('Dados fiscais', 'Fiscal data')}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title={t('Dados fiscais', 'Fiscal data')}
      description={t(
        'Preencha os dados fiscais para emissão de notas fiscais.',
        'Fill in fiscal data for invoice issuance.'
      )}
    >
      {isFiscalIncomplete && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t(
              'Os dados fiscais precisam ser preenchidos para a emissão de notas fiscais.',
              'Fiscal data must be filled in for invoice issuance.'
            )}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fiscalName" className="text-sm font-medium text-foreground">
            {t('Nome / Razão Social', 'Name / Company name')}
          </Label>
          <Input
            id="fiscalName"
            value={form.fiscalName}
            onChange={(e) => handleChange('fiscalName', e.target.value)}
            placeholder={t('Nome completo ou razão social', 'Full name or company name')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fiscalCpfCnpj" className="text-sm font-medium text-foreground">
            CPF / CNPJ
          </Label>
          <Input
            id="fiscalCpfCnpj"
            value={form.fiscalCpfCnpj}
            onChange={(e) => handleChange('fiscalCpfCnpj', formatCpfCnpj(e.target.value))}
            placeholder="000.000.000-00"
            maxLength={18}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fiscalCep" className="text-sm font-medium text-foreground">CEP</Label>
            <div className="relative">
              <Input
                id="fiscalCep"
                value={form.fiscalCep}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressStreet" className="text-sm font-medium text-foreground">
              {t('Rua / Logradouro', 'Street')}
            </Label>
            <Input
              id="fiscalAddressStreet"
              value={form.fiscalAddressStreet}
              onChange={(e) => handleChange('fiscalAddressStreet', e.target.value)}
              placeholder={t('Rua, avenida...', 'Street, avenue...')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressNumber" className="text-sm font-medium text-foreground">
              {t('Número', 'Number')}
            </Label>
            <Input
              id="fiscalAddressNumber"
              value={form.fiscalAddressNumber}
              onChange={(e) => handleChange('fiscalAddressNumber', e.target.value)}
              placeholder="123"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressComplement" className="text-sm font-medium text-foreground">
              {t('Complemento', 'Complement')}
            </Label>
            <Input
              id="fiscalAddressComplement"
              value={form.fiscalAddressComplement}
              onChange={(e) => handleChange('fiscalAddressComplement', e.target.value)}
              placeholder={t('Apto, sala...', 'Apt, suite...')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressNeighborhood" className="text-sm font-medium text-foreground">
              {t('Bairro', 'Neighborhood')}
            </Label>
            <Input
              id="fiscalAddressNeighborhood"
              value={form.fiscalAddressNeighborhood}
              onChange={(e) => handleChange('fiscalAddressNeighborhood', e.target.value)}
              placeholder={t('Bairro', 'Neighborhood')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressCity" className="text-sm font-medium text-foreground">
              {t('Cidade', 'City')}
            </Label>
            <Input
              id="fiscalAddressCity"
              value={form.fiscalAddressCity}
              onChange={(e) => handleChange('fiscalAddressCity', e.target.value)}
              placeholder={t('Cidade', 'City')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressState" className="text-sm font-medium text-foreground">
              {t('Estado', 'State')}
            </Label>
            <Input
              id="fiscalAddressState"
              value={form.fiscalAddressState}
              onChange={(e) => handleChange('fiscalAddressState', e.target.value)}
              placeholder="UF"
              maxLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fiscalAddressCountry" className="text-sm font-medium text-foreground">
              {t('País', 'Country')}
            </Label>
            <Input
              id="fiscalAddressCountry"
              value={form.fiscalAddressCountry}
              onChange={(e) => handleChange('fiscalAddressCountry', e.target.value)}
              placeholder="Brasil"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => store && setForm({
          fiscalName: store.fiscalName || '', fiscalCpfCnpj: store.fiscalCpfCnpj || '',
          fiscalCep: store.fiscalCep || '', fiscalAddressStreet: store.fiscalAddressStreet || '',
          fiscalAddressNumber: store.fiscalAddressNumber || '', fiscalAddressComplement: store.fiscalAddressComplement || '',
          fiscalAddressNeighborhood: store.fiscalAddressNeighborhood || '', fiscalAddressCity: store.fiscalAddressCity || '',
          fiscalAddressState: store.fiscalAddressState || '', fiscalAddressCountry: store.fiscalAddressCountry || 'Brasil',
        })}>{t('Cancelar', 'Cancel')}</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('Salvar', 'Save')}
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
