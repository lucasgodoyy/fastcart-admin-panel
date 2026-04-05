'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paintbrush, ExternalLink, Sparkles, Tag, LayoutGrid, ShoppingBag, Store, Zap, Package, Crown, Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import themeService from '@/services/theme';
import salesChannelsService from '@/services/salesChannels';
import storeSettingsService from '@/services/storeSettingsService';
import type { ThemeSectionsResponse } from '@/types/theme';
import { TEMPLATE_PRESETS } from '@/types/theme';
import type { SalesChannelSettings } from '@/types/salesChannel';
import { toast } from 'sonner';
import { t } from '@/lib/admin-language';

/* ─── Template catalog ─────────────────────────────────── */
const TEMPLATES = [
  {
    id: 'limpo',
    name: 'Limpo',
    tagline: 'Genérico, moderno e limpo',
    description: 'Template base universal — fundo branco, grid limpo, tipografia moderna. Funciona para qualquer nicho e serve como base para criar novos temas.',
    niches: ['general', 'all'],
    catalogSize: ['few', 'some', 'lots'],
    badge: 'free' as const,
    features: ['Grid 4 colunas', 'Hero slideshow', 'Drawer cart', 'Todas as rotas'],
    colors: { primary: '#000000', secondary: '#71717a', accent: '#2563eb', bg: '#ffffff', text: '#000000' },
    layout: { heroHeight: 'medium', gridCols: 4, logoPos: 'left', radius: 8 },
  },
  {
    id: 'template-6',
    name: 'Atlântico',
    tagline: 'Dark tech profissional',
    description: 'Tema dark com acentos cyan, design moderno e profissional. Inspirado no Atlántico da Nuvemshop — perfeito para tecnologia e brands premium.',
    niches: ['tech', 'premium', 'saas', 'electronics', 'fashion'],
    catalogSize: ['few', 'some', 'lots'],
    badge: 'pro' as const,
    features: ['Dark mode', 'Cyan accent', 'Glassmorphism cards', 'Smooth animations'],
    colors: { primary: '#0a0a0a', secondary: '#141414', accent: '#06b6d4', bg: '#0a0a0a', text: '#ffffff' },
    layout: { heroHeight: 'medium', gridCols: 4, logoPos: 'left', radius: 12 },
  },
  {
    id: 'template-7',
    name: 'Vitrine',
    tagline: 'Marketplace de moda e tênis',
    description: 'Layout estilo marketplace com mega menu de marcas, trust badges, fundo claro e cards de produto com "Comprar Agora". Ideal para moda, tênis e colecionáveis.',
    niches: ['fashion', 'sneakers', 'marketplace', 'streetwear', 'collectibles'],
    catalogSize: ['some', 'lots'],
    badge: 'pro' as const,
    features: ['Mega menu de marcas', 'Trust badges', 'Cards marketplace', 'A-Z brands page'],
    colors: { primary: '#111111', secondary: '#f5f5f5', accent: '#0d9f6e', bg: '#f5f5f5', text: '#111111' },
    layout: { heroHeight: 'small', gridCols: 4, logoPos: 'left', radius: 12 },
  },
];

/* ─── Niche presets ────────────────────────────────────── */
const NICHE_PRESETS = [
  { id: 'fashion-women', name: 'Moda Feminina', icon: <Crown className="h-4 w-4" />, recommendedTemplate: 'template-7', description: 'Marketplace de moda, mega menu, trust badges' },
  { id: 'fashion-men', name: 'Moda Masculina', icon: <ShoppingBag className="h-4 w-4" />, recommendedTemplate: 'limpo', description: 'Grid limpo, minimalista, preto e branco' },
  { id: 'electronics', name: 'Eletrônicos', icon: <Zap className="h-4 w-4" />, recommendedTemplate: 'template-6', description: 'Dark tech, profissional, glassmorphism' },
  { id: 'cosmetics', name: 'Cosméticos', icon: <Sparkles className="h-4 w-4" />, recommendedTemplate: 'limpo', description: 'Visual limpo, premium, tipografia moderna' },
  { id: 'food', name: 'Alimentação', icon: <Store className="h-4 w-4" />, recommendedTemplate: 'limpo', description: 'Grid simples, cores naturais, clean' },
  { id: 'sports', name: 'Esportes', icon: <Tag className="h-4 w-4" />, recommendedTemplate: 'template-7', description: 'Marketplace, marcas, badges' },
  { id: 'jewelry', name: 'Joias', icon: <Crown className="h-4 w-4" />, recommendedTemplate: 'limpo', description: 'Minimalista, imagens grandes, elegante' },
  { id: 'wholesale', name: 'Atacado / B2B', icon: <Package className="h-4 w-4" />, recommendedTemplate: 'limpo', description: 'Catálogo limpo, universal, eficiente' },
  { id: 'general', name: 'Loja Geral', icon: <LayoutGrid className="h-4 w-4" />, recommendedTemplate: 'limpo', description: 'Serve para tudo, universal, grátis' },
];

const CATALOG_SIZE_FILTERS = [
  { id: 'few', label: 'Poucos (1-10)' },
  { id: 'some', label: 'Médio (11-100)' },
  { id: 'lots', label: 'Grande (500+)' },
];

/* ─── CSS Mini-Preview Component ───────────────────────── */
function TemplateMiniPreview({ template }: { template: typeof TEMPLATES[0] }) {
  const { colors, layout } = template;

  return (
    <div
      className="aspect-[4/3] overflow-hidden border-b"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ borderBottom: `1px solid ${colors.text}10` }}
      >
        {layout.logoPos === 'center' ? (
          <>
            <div className="flex gap-1">
              <div className="h-1 w-4 rounded-full" style={{ backgroundColor: `${colors.text}30` }} />
              <div className="h-1 w-4 rounded-full" style={{ backgroundColor: `${colors.text}30` }} />
            </div>
            <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: colors.primary }} />
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `${colors.text}25` }} />
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `${colors.text}25` }} />
            </div>
          </>
        ) : (
          <>
            <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: colors.primary }} />
            <div className="flex gap-1">
              <div className="h-1 w-4 rounded-full" style={{ backgroundColor: `${colors.text}30` }} />
              <div className="h-1 w-4 rounded-full" style={{ backgroundColor: `${colors.text}30` }} />
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `${colors.text}25` }} />
            </div>
          </>
        )}
      </div>

      {/* Hero */}
      <div
        className="relative mx-2 mt-1.5 flex items-center justify-center"
        style={{
          height: layout.heroHeight === 'full' ? '42%' : layout.heroHeight === 'large' ? '34%' : layout.heroHeight === 'medium' ? '26%' : '18%',
          borderRadius: `${layout.radius}px`,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent}40)`,
        }}
      >
        <div className="text-center">
          <div className="mx-auto h-1 w-12 rounded-full" style={{ backgroundColor: '#ffffff' }} />
          <div className="mx-auto mt-1 h-0.5 w-8 rounded-full" style={{ backgroundColor: '#ffffff80' }} />
          <div
            className="mx-auto mt-1.5 h-2 w-8"
            style={{ backgroundColor: colors.accent, borderRadius: `${layout.radius}px` }}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-2 mt-2">
        <div className="mb-1.5">
          <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: `${colors.text}60` }} />
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${layout.gridCols}, 1fr)` }}>
          {Array.from({ length: layout.gridCols * 2 }).map((_, i) => (
            <div key={i}>
              <div
                className="aspect-[3/4]"
                style={{
                  borderRadius: `${Math.max(layout.radius - 4, 0)}px`,
                  backgroundColor: i % 3 === 0 ? `${colors.primary}12` : i % 3 === 1 ? `${colors.accent}12` : `${colors.secondary}12`,
                }}
              />
              <div className="mt-0.5 space-y-px">
                <div className="h-[2px] w-3/4 rounded-full" style={{ backgroundColor: `${colors.text}20` }} />
                <div className="h-[2px] w-1/2 rounded-full" style={{ backgroundColor: `${colors.text}15` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export function ThemeGalleryClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [nicheFilter, setNicheFilter] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string | null>(null);

  const { isLoading: isThemeLoading } = useQuery<ThemeSectionsResponse>({
    queryKey: ['theme-sections'],
    queryFn: () => themeService.getThemeSections(),
  });

  const { data: channelData, isLoading: isChannelLoading } = useQuery<SalesChannelSettings>({
    queryKey: ['sales-channel-settings'],
    queryFn: () => salesChannelsService.getSettings(),
  });

  const { data: storeData } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

  const activateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const preset = TEMPLATE_PRESETS[templateId];
      if (!preset) throw new Error('Template not found');
      await themeService.updateThemeSections({
        themeSectionsJson: JSON.stringify(preset),
      });
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
  const currentTemplateId = channelData?.templateId || 'limpo';

  const handleEditLayout = () => {
    router.push('/admin/online-store/layout-editor');
  };

  const handleViewStore = () => {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
    const url = new URL(base.replace(/\/$/, ''));
    if (storeData?.slug) {
      url.searchParams.set('storeSlug', storeData.slug);
    }
    window.open(url.toString(), '_blank');
  };

  const handleNicheSelect = (nicheId: string) => {
    const niche = NICHE_PRESETS.find((n) => n.id === nicheId);
    if (!niche) return;
    activateTemplateMutation.mutate(niche.recommendedTemplate);
  };

  // Filter templates
  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (nicheFilter && !tpl.niches.some((n) => n === nicheFilter || n === 'all' || n === 'general')) return false;
    if (sizeFilter && !tpl.catalogSize.includes(sizeFilter)) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="aspect-[4/3] bg-muted rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  const currentTemplate = TEMPLATES.find((tpl) => tpl.id === currentTemplateId);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tema e Layout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha um template pronto, selecione seu nicho e personalize tudo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleViewStore}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Ver loja
          </Button>
          <Button size="sm" onClick={handleEditLayout}>
            <Paintbrush className="mr-2 h-3.5 w-3.5" /> Editar layout
          </Button>
        </div>
      </div>

      {/* Current theme — compact */}
      {currentTemplate && (
        <Card className="border-primary/30 bg-primary/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border">
                <TemplateMiniPreview template={currentTemplate} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{currentTemplate.name}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    Publicado
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentTemplate.tagline}</p>
              </div>
              <Button size="sm" onClick={handleEditLayout}>
                <Paintbrush className="mr-2 h-3.5 w-3.5" /> Personalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Start — Niche presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Início rápido — Escolha seu nicho</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Selecione o tipo de loja e aplicamos o template ideal com cores e configurações prontas.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {NICHE_PRESETS.map((niche) => (
            <button
              key={niche.id}
              onClick={() => handleNicheSelect(niche.id)}
              disabled={activateTemplateMutation.isPending}
              className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm disabled:opacity-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                {niche.icon}
              </div>
              <span className="text-[11px] font-medium leading-tight">{niche.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground mr-1">Filtrar:</span>

        {CATALOG_SIZE_FILTERS.map((size) => (
          <button
            key={size.id}
            onClick={() => setSizeFilter(sizeFilter === size.id ? null : size.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              sizeFilter === size.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {size.label}
          </button>
        ))}

        <span className="text-muted-foreground/30">|</span>

        {['fashion', 'sneakers', 'brand', 'dropshipping', 'catalog'].map((n) => (
          <button
            key={n}
            onClick={() => setNicheFilter(nicheFilter === n ? null : n)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              nicheFilter === n ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {n === 'fashion' && 'Moda'}
            {n === 'sneakers' && 'Sneakers'}
            {n === 'brand' && 'Marca'}
            {n === 'dropshipping' && 'Dropshipping'}
            {n === 'catalog' && 'Catálogo'}
          </button>
        ))}

        {(sizeFilter || nicheFilter) && (
          <button
            onClick={() => { setSizeFilter(null); setNicheFilter(null); }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Template gallery */}
      <div>
        <h2 className="mb-4 text-sm font-semibold">
          Templates disponíveis
          <span className="ml-2 text-muted-foreground font-normal">({filteredTemplates.length})</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const isCurrent = template.id === currentTemplateId;
            return (
              <Card
                key={template.id}
                className={`overflow-hidden transition-shadow hover:shadow-md ${
                  isCurrent ? 'ring-2 ring-primary' : ''
                }`}
              >
                <TemplateMiniPreview template={template} />

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      {template.badge === 'free' ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Grátis</Badge>
                      ) : (
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 hover:bg-amber-100">Pro</Badge>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Check className="h-3 w-3" /> Atual
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {template.features.map((f) => (
                      <span key={f} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Cores:</span>
                    {Object.entries(template.colors).filter(([k]) => k !== 'bg' && k !== 'text').map(([key, color]) => (
                      <div
                        key={key}
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                        title={key}
                      />
                    ))}
                  </div>

                  {isCurrent ? (
                    <Button className="w-full" size="sm" onClick={handleEditLayout}>
                      <Paintbrush className="mr-2 h-3.5 w-3.5" />
                      {t('Personalizar', 'Customize')}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="sm"
                      variant="outline"
                      disabled={activateTemplateMutation.isPending}
                      onClick={() => activateTemplateMutation.mutate(template.id)}
                    >
                      {activateTemplateMutation.isPending
                        ? t('Ativando...', 'Activating...')
                        : t('Usar este template', 'Use this template')}
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
