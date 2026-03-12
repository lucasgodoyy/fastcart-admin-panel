'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paintbrush, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import themeService from '@/services/theme';
import salesChannelsService from '@/services/salesChannels';
import type { ThemeSectionsResponse } from '@/types/theme';
import { TEMPLATE_PRESETS } from '@/types/theme';
import type { SalesChannelSettings } from '@/types/salesChannel';
import { toast } from 'sonner';
import { t } from '@/lib/admin-language';

/* ──────────────────────────────────────────────
 * Template catalog — display available themes
 * ────────────────────────────────────────────── */
const TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  preview: string;
  niches: string[];
  status: 'available' | 'coming_soon';
}> = [
  {
    id: 'template-1',
    name: 'Morelia',
    description: 'Template clássico para moda. Layout limpo com hero banner, grade 4 colunas de produtos e carrinho lateral.',
    preview: '/templates/template-1-preview.png',
    niches: ['fashion', 'beauty', 'watches-accessories'],
    status: 'available',
  },
  {
    id: 'template-2',
    name: 'Patagonia',
    description: 'Template editorial para marcas premium. Hero full-screen, logo centralizado, grade 2 colunas com imagens grandes.',
    preview: '/templates/template-2-preview.png',
    niches: ['fashion', 'lifestyle', 'premium'],
    status: 'available',
  },
  {
    id: 'template-3',
    name: 'Aurora',
    description: 'Template moderno para eletrônicos e tech. Barra de promoções, grade 3 colunas com badges de specs, carrinho popup.',
    preview: '/templates/template-3-preview.png',
    niches: ['electronics', 'tech', 'gaming'],
    status: 'available',
  },
  {
    id: 'template-4',
    name: 'Glamour',
    description: 'Template luxuoso para beleza e cosméticos. Hero full-screen, logo centralizado, grade 4 colunas, carrinho lateral, estilo Kylie Cosmetics.',
    preview: '/templates/template-4-preview.png',
    niches: ['beauty', 'cosmetics', 'skincare', 'wellness'],
    status: 'available',
  },
];

export function ThemeGalleryClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: themeData, isLoading: isThemeLoading } = useQuery<ThemeSectionsResponse>({
    queryKey: ['theme-sections'],
    queryFn: () => themeService.getThemeSections(),
  });

  const { data: channelData, isLoading: isChannelLoading } = useQuery<SalesChannelSettings>({
    queryKey: ['sales-channel-settings'],
    queryFn: () => salesChannelsService.getSettings(),
  });

  const activateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const preset = TEMPLATE_PRESETS[templateId];
      if (!preset) throw new Error('Template not found');
      // Save the preset as the active theme sections
      await themeService.updateThemeSections({
        themeSectionsJson: JSON.stringify(preset),
      });
      // Update the template ID on the sales channel
      await salesChannelsService.updateSettings({ templateId });
    },
    onSuccess: () => {
      toast.success(t('Template ativado com sucesso!', 'Template activated successfully!'));
      queryClient.invalidateQueries({ queryKey: ['theme-sections'] });
      queryClient.invalidateQueries({ queryKey: ['sales-channel-settings'] });
    },
    onError: () => {
      toast.error(t('Erro ao ativar template.', 'Error activating template.'));
    },
  });

  const isLoading = isThemeLoading || isChannelLoading;
  const currentTemplateId = channelData?.templateId || 'template-1';

  const handleEditLayout = () => {
    router.push('/admin/online-store/layout-editor');
  };

  const handleViewStore = () => {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
    window.open(base, '_blank');
  };

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tema e Layout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personalize o visual da sua loja. Escolha um template e edite cada seção.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleViewStore}>
            <ExternalLink className="mr-2 h-4 w-4" /> Ver loja
          </Button>
          <Button onClick={handleEditLayout}>
            <Paintbrush className="mr-2 h-4 w-4" /> Editar layout
          </Button>
        </div>
      </div>

      {/* Current theme card */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Layout atual</CardTitle>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Publicado
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
            {/* Preview thumbnail */}
            <div className="aspect-[4/3] rounded-lg border bg-linear-to-b from-zinc-100 to-zinc-200 flex items-center justify-center overflow-hidden">
              <div className="text-center text-muted-foreground">
                <Eye className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs">Preview da loja</p>
              </div>
            </div>

            {/* Template info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Template</p>
                <p className="font-medium">
                  {TEMPLATES.find((t) => t.id === currentTemplateId)?.name || currentTemplateId}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nicho</p>
                  <p className="font-medium">{channelData?.storeNiche || 'fashion'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Preset</p>
                  <p className="font-medium">{channelData?.layoutPreset || 'fashion-classic'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fonte</p>
                  <p className="font-medium">{channelData?.appearanceSettings?.fontFamily || 'inter'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cor principal</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: `hsl(${channelData?.appearanceSettings?.primaryColor || '0 0% 9%'})` }}
                    />
                    <span className="font-medium">{channelData?.appearanceSettings?.primaryColor || '0 0% 9%'}</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleEditLayout}>
                <Paintbrush className="mr-2 h-4 w-4" /> Personalizar layout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template gallery */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Templates disponíveis</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => {
            const isCurrent = template.id === currentTemplateId;
            return (
              <Card key={template.id} className={isCurrent ? 'border-primary ring-1 ring-primary' : ''}>
                <CardContent className="p-4 space-y-3">
                  {/* Preview */}
                  <div className="aspect-[4/3] rounded-lg border bg-linear-to-b from-zinc-50 to-zinc-100 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      {template.status === 'coming_soon' ? 'Em breve' : 'Preview'}
                    </span>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{template.name}</h3>
                      {isCurrent && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Atual
                        </span>
                      )}
                      {template.status === 'coming_soon' && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Em breve
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                  </div>

                  {/* Niches */}
                  <div className="flex flex-wrap gap-1">
                    {template.niches.map((n) => (
                      <span key={n} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {n}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  {template.status === 'available' ? (
                    isCurrent ? (
                      <Button className="w-full" onClick={handleEditLayout}>
                        {t('Personalizar', 'Customize')}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={activateTemplateMutation.isPending}
                        onClick={() => activateTemplateMutation.mutate(template.id)}
                      >
                        {activateTemplateMutation.isPending
                          ? t('Ativando...', 'Activating...')
                          : t('Usar este template', 'Use this template')}
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Em breve
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
