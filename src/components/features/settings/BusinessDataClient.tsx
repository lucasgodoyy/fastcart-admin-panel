'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import storeSettingsService, { StoreSettings } from '@/services/storeSettingsService';
import { toast } from 'sonner';
import { t } from '@/lib/admin-language';

const TIMEZONES = [
  'America/Sao_Paulo',
  'America/Fortaleza',
  'America/Manaus',
  'America/Rio_Branco',
  'America/Noronha',
  'America/Bahia',
  'America/Belem',
  'America/Cuiaba',
  'America/Campo_Grande',
  'America/Boa_Vista',
  'America/Porto_Velho',
  'America/Maceio',
  'America/Recife',
];

const BUSINESS_SECTORS = [
  'Moda e vestuário',
  'Eletrônicos',
  'Alimentos e bebidas',
  'Saúde e beleza',
  'Casa e decoração',
  'Esportes e lazer',
  'Brinquedos e jogos',
  'Livros e papelaria',
  'Joias e acessórios',
  'Pet shop',
  'Automotivo',
  'Informática',
  'Serviços',
  'Outro',
];

export function BusinessDataClient() {
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useQuery<StoreSettings>({
    queryKey: ['my-store'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const [form, setForm] = useState({
    name: '',
    seoDescription: '',
    phone: '',
    phoneCountryCode: '+55',
    timezone: 'America/Sao_Paulo',
    businessSector: '',
    useNameForSeo: true,
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || '',
        seoDescription: store.seoDescription || '',
        phone: store.phone || '',
        phoneCountryCode: store.phoneCountryCode || '+55',
        timezone: store.timezone || 'America/Sao_Paulo',
        businessSector: store.businessSector || '',
        useNameForSeo: store.useNameForSeo ?? true,
      });
    }
  }, [store]);

  const mutation = useMutation({
    mutationFn: () => storeSettingsService.updateMyStore(form),
    onSuccess: () => {
      toast.success(t('Dados do negócio salvos com sucesso!', 'Business data saved successfully!'));
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
    onError: () => toast.error(t('Erro ao salvar dados do negócio.', 'Error saving business data.')),
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const descCharCount = form.seoDescription.length;

  if (isLoading) {
    return (
      <SettingsPageLayout title={t('Dados do negócio', 'Business data')}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title={t('Dados do negócio', 'Business data')}
      description={t(
        'Configure as informações principais da sua loja, incluindo SEO e dados de contato.',
        'Configure your store main information, including SEO and contact data.'
      )}
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            {t('Nome da loja', 'Store name')}
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('Nome da sua loja', 'Your store name')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seoDescription" className="text-sm font-medium text-foreground">
            {t('Breve descrição', 'Short description')}
          </Label>
          <textarea
            id="seoDescription"
            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.seoDescription}
            onChange={(e) => {
              if (e.target.value.length <= 160) {
                handleChange('seoDescription', e.target.value);
              }
            }}
            placeholder={t('Descrição curta da sua loja (até 160 caracteres)', 'Short description of your store (up to 160 characters)')}
            maxLength={160}
          />
          <p className={`text-xs ${descCharCount > 140 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {descCharCount}/160 {t('caracteres', 'characters')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="useNameForSeo"
            checked={form.useNameForSeo}
            onCheckedChange={(checked) => handleChange('useNameForSeo', checked === true)}
          />
          <Label htmlFor="useNameForSeo" className="text-sm text-foreground cursor-pointer">
            {t('Utilizar o nome e a descrição para o SEO da loja', 'Use name and description for store SEO')}
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phoneCountryCode" className="text-sm font-medium text-foreground">
              {t('DDI', 'Country code')}
            </Label>
            <Input
              id="phoneCountryCode"
              value={form.phoneCountryCode}
              onChange={(e) => handleChange('phoneCountryCode', e.target.value)}
              placeholder="+55"
              maxLength={5}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              {t('Telefone', 'Phone')}
            </Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="timezone" className="text-sm font-medium text-foreground">
            {t('Fuso horário', 'Timezone')}
          </Label>
          <select
            id="timezone"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace('America/', '').replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessSector" className="text-sm font-medium text-foreground">
            {t('Ramo de atividade', 'Business sector')}
          </Label>
          <select
            id="businessSector"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.businessSector}
            onChange={(e) => handleChange('businessSector', e.target.value)}
          >
            <option value="">{t('Selecione...', 'Select...')}</option>
            {BUSINESS_SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => store && setForm({
          name: store.name || '', seoDescription: store.seoDescription || '',
          phone: store.phone || '', phoneCountryCode: store.phoneCountryCode || '+55',
          timezone: store.timezone || 'America/Sao_Paulo', businessSector: store.businessSector || '',
          useNameForSeo: store.useNameForSeo ?? true,
        })}>{t('Cancelar', 'Cancel')}</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('Salvar', 'Save')}
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
