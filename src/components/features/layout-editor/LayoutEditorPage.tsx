'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  X, Eye, HelpCircle, ExternalLink, ChevronRight,
  ArrowUp, Home, LayoutGrid, ScanSearch, ShoppingCart,
  ArrowDown, Code2, Paintbrush, Type, Settings2, Image,
  Monitor, Tablet, Smartphone, RefreshCw, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import themeService from '@/services/theme';
import type {
  ThemeSections,
  ThemeSectionsResponse,
  SectionKey,
  HeaderSection,
  HeroSection,
  HeroSlide,
  FeaturedProductsSection,
  ProductListSection,
  ProductDetailSection,
  CartSection,
  FooterSection,
  ThemeColors,
  ThemeTypography,
  ThemeDesign,
  FontFamily,
} from '@/types/theme';
import { DEFAULT_THEME_SECTIONS, SECTION_REGISTRY, DEFAULT_COLORS, DEFAULT_TYPOGRAPHY, DEFAULT_DESIGN } from '@/types/theme';

/* ──────────────────────────────────────────────────────────
 * Icon resolver — maps section keys to Lucide components
 * ────────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ReactNode> = {
  ArrowUp: <ArrowUp className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  LayoutGrid: <LayoutGrid className="h-4 w-4" />,
  ScanSearch: <ScanSearch className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  ArrowDown: <ArrowDown className="h-4 w-4" />,
  Code2: <Code2 className="h-4 w-4" />,
  Paintbrush: <Paintbrush className="h-4 w-4" />,
  Type: <Type className="h-4 w-4" />,
  Settings2: <Settings2 className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
};

const QUERY_KEY = ['theme-sections'];

/* ──────────────────────────────────────────────────────────
 * Helper: parse theme sections JSON safely
 * ────────────────────────────────────────────────────────── */
function parseThemeSections(json: string | null | undefined): ThemeSections {
  if (!json) return { ...DEFAULT_THEME_SECTIONS };
  try {
    const parsed = JSON.parse(json);
    return { ...DEFAULT_THEME_SECTIONS, ...parsed };
  } catch {
    return { ...DEFAULT_THEME_SECTIONS };
  }
}

/* ══════════════════════════════════════════════════════════
 * MAIN COMPONENT: LayoutEditorPage
 * ══════════════════════════════════════════════════════════ */
export default function LayoutEditorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── API queries ─────────────────────────────────────────
  const { data, isLoading } = useQuery<ThemeSectionsResponse>({
    queryKey: QUERY_KEY,
    queryFn: () => themeService.getThemeSections(),
  });

  const mutation = useMutation({
    mutationFn: (sections: ThemeSections) =>
      themeService.updateThemeSections({
        themeSectionsJson: JSON.stringify(sections),
        logoUrl: sections.design?.logoUrl || undefined,
        faviconUrl: sections.design?.faviconUrl || undefined,
      }),
    onSuccess: (resp) => {
      queryClient.setQueryData(QUERY_KEY, resp);
      toast.success('Alterações publicadas');
    },
    onError: () => toast.error('Erro ao salvar'),
  });

  // ── Local state ─────────────────────────────────────────
  const [sections, setSections] = useState<ThemeSections>(DEFAULT_THEME_SECTIONS);
  const [activePanel, setActivePanel] = useState<SectionKey | 'customCss' | 'colors' | 'fonts' | 'settings' | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Hydrate from API
  useEffect(() => {
    if (data) {
      const parsed = parseThemeSections(data.themeSectionsJson);
      // Ensure new fields have defaults if missing from API
      setSections({
        ...parsed,
        colors: parsed.colors || { ...DEFAULT_COLORS },
        typography: parsed.typography || { ...DEFAULT_TYPOGRAPHY },
        design: {
          ...DEFAULT_DESIGN,
          ...(parsed.design || {}),
          logoUrl: parsed.design?.logoUrl || data.logoUrl || '',
          faviconUrl: parsed.design?.faviconUrl || data.faviconUrl || '',
        },
      });
      setLogoUrl(data.logoUrl || '');
    }
  }, [data]);

  // ── Section update helper ───────────────────────────────
  const updateSection = useCallback(<K extends keyof ThemeSections>(key: K, value: ThemeSections[K]) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Publish action ──────────────────────────────────────
  const handlePublish = () => mutation.mutate(sections);

  // Refresh preview after publish
  useEffect(() => {
    if (mutation.isSuccess) {
      setIframeKey((k) => k + 1);
    }
  }, [mutation.isSuccess]);

  // ── Storefront preview URL ──────────────────────────────
  const previewUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}/?preview=true`;
  }, []);

  // ── Close editor ────────────────────────────────────────
  const handleClose = () => router.push('/admin/online-store/layout-theme');

  // ── View store ──────────────────────────────────────────
  const handleViewStore = () => {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
    window.open(base, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* ── Top toolbar ──────────────────────────────────── */}
      <header className="flex h-12 items-center justify-between border-b bg-background px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">Editar layout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`rounded-md p-1.5 transition-colors ${deviceView === 'desktop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`rounded-md p-1.5 transition-colors ${deviceView === 'tablet' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`rounded-md p-1.5 transition-colors ${deviceView === 'mobile' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-emerald-600 font-medium">● Layout atual</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" /> Ajuda
          </button>
          <button
            onClick={handleViewStore}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Ver loja
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + preview ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ─────────────────────────────── */}
        <aside className="flex w-[280px] shrink-0 flex-col border-r bg-background overflow-hidden">
          {/* sidebar scroll area */}
          <div className="flex-1 overflow-y-auto">
            {activePanel === null ? (
              <SidebarRoot
                logoUrl={logoUrl}
                onSelectSection={(key) => setActivePanel(key as SectionKey | 'customCss' | 'colors' | 'fonts' | 'settings')}
              />
            ) : (
              <SidebarPanel
                panelKey={activePanel}
                sections={sections}
                onUpdate={updateSection}
                onBack={() => setActivePanel(null)}
              />
            )}
          </div>

          {/* Publish button */}
          <div className="border-t p-3 shrink-0">
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={handlePublish}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Publicando...' : 'Publicar alterações'}
            </Button>
          </div>
        </aside>

        {/* ── Live preview iframe ──────────────────────── */}
        <main className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 overflow-hidden flex items-start justify-center">
          <div
            className="h-full overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 ease-in-out"
            style={{
              width: deviceView === 'desktop' ? '100%' : deviceView === 'tablet' ? '768px' : '375px',
              maxWidth: '100%',
            }}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={previewUrl}
              className="h-full w-full border-0"
              title="Preview da loja"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * SIDEBAR ROOT — Section list (like Nuvemshop)
 * ══════════════════════════════════════════════════════════ */
function SidebarRoot({
  logoUrl,
  onSelectSection,
}: {
  logoUrl: string;
  onSelectSection: (key: string) => void;
}) {
  return (
    <div className="space-y-1 p-3">
      {/* Brand / Logo */}
      <button
        onClick={() => onSelectSection('settings')}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
      >
        <Image className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate">Imagem da sua marca</span>
      </button>

      {/* Appearance settings */}
      <button
        onClick={() => onSelectSection('colors')}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
      >
        <Paintbrush className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1">Cores da sua loja</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={() => onSelectSection('fonts')}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
      >
        <Type className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1">Tipo de Letra</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={() => onSelectSection('settings')}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
      >
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1">Opções de design</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Divider */}
      <div className="py-2">
        <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Configurações avançadas
        </p>
      </div>

      {/* Section list */}
      {SECTION_REGISTRY.map((meta) => (
        <button
          key={meta.key}
          onClick={() => onSelectSection(meta.key)}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
        >
          {ICON_MAP[meta.icon] ?? <Settings2 className="h-4 w-4 text-muted-foreground" />}
          <span className="flex-1 truncate">{meta.label}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * SIDEBAR PANEL — Section-specific editor
 * ══════════════════════════════════════════════════════════ */
function SidebarPanel({
  panelKey,
  sections,
  onUpdate,
  onBack,
}: {
  panelKey: string;
  sections: ThemeSections;
  onUpdate: <K extends keyof ThemeSections>(key: K, value: ThemeSections[K]) => void;
  onBack: () => void;
}) {
  const panelTitle = (() => {
    const reg = SECTION_REGISTRY.find((m) => m.key === panelKey);
    if (reg) return reg.label;
    if (panelKey === 'colors') return 'Cores da sua loja';
    if (panelKey === 'fonts') return 'Tipo de Letra';
    if (panelKey === 'settings') return 'Opções de design';
    return 'Configurações';
  })();

  return (
    <div>
      {/* Panel header */}
      <button
        onClick={onBack}
        className="flex w-full items-center gap-2 border-b px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span>{panelTitle}</span>
      </button>

      <div className="p-4 space-y-4">
        {panelKey === 'header' && <HeaderEditor value={sections.header} onChange={(v) => onUpdate('header', v)} />}
        {panelKey === 'hero' && <HeroEditor value={sections.hero} onChange={(v) => onUpdate('hero', v)} />}
        {panelKey === 'featuredProducts' && <FeaturedProductsEditor value={sections.featuredProducts} onChange={(v) => onUpdate('featuredProducts', v)} />}
        {panelKey === 'productDetail' && <ProductDetailEditor value={sections.productDetail} onChange={(v) => onUpdate('productDetail', v)} />}
        {panelKey === 'cart' && <CartEditor value={sections.cart} onChange={(v) => onUpdate('cart', v)} />}
        {panelKey === 'footer' && <FooterEditor value={sections.footer} onChange={(v) => onUpdate('footer', v)} />}
        {panelKey === 'customCss' && <CustomCssEditor value={sections.customCss} onChange={(v) => onUpdate('customCss', v)} />}
        {panelKey === 'colors' && <ColorsEditor value={sections.colors || { ...DEFAULT_COLORS }} onChange={(v) => onUpdate('colors', v)} />}
        {panelKey === 'fonts' && <FontsEditor value={sections.typography || { ...DEFAULT_TYPOGRAPHY }} onChange={(v) => onUpdate('typography', v)} />}
        {panelKey === 'settings' && <DesignOptionsEditor value={sections.design || { ...DEFAULT_DESIGN }} onChange={(v) => onUpdate('design', v)} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * SECTION EDITORS
 * ══════════════════════════════════════════════════════════ */

/* ── Header Editor ─────────────────────────────────────── */
function HeaderEditor({ value, onChange }: { value: HeaderSection; onChange: (v: HeaderSection) => void }) {
  const set = <K extends keyof HeaderSection>(key: K, val: HeaderSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <ToggleRow label="Exibir cabeçalho" checked={value.enabled} onChange={(v) => set('enabled', v)} />
      <div>
        <Label className="text-xs">Posição do logo</Label>
        <Select value={value.logoPosition} onValueChange={(v) => set('logoPosition', v as 'left' | 'center')}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ToggleRow label="Exibir busca" checked={value.showSearch} onChange={(v) => set('showSearch', v)} />
      <ToggleRow label="Exibir carrinho" checked={value.showCart} onChange={(v) => set('showCart', v)} />
      <ToggleRow label="Fixar no topo" checked={value.stickyHeader} onChange={(v) => set('stickyHeader', v)} />
      <ToggleRow label="Transparente no hero" checked={value.transparentOnHero} onChange={(v) => set('transparentOnHero', v)} />

      {/* Announcement bar */}
      <div className="border-t pt-4 space-y-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">Barra de anúncio</p>
        <ToggleRow
          label="Ativar barra"
          checked={value.announcementBar.enabled}
          onChange={(v) => set('announcementBar', { ...value.announcementBar, enabled: v })}
        />
        <div>
          <Label className="text-xs">Texto</Label>
          <Input
            value={value.announcementBar.text}
            onChange={(e) => set('announcementBar', { ...value.announcementBar, text: e.target.value })}
            placeholder="Frete grátis acima de R$199"
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Cor fundo</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={value.announcementBar.bgColor}
                onChange={(e) => set('announcementBar', { ...value.announcementBar, bgColor: e.target.value })}
                className="h-8 w-8 rounded border cursor-pointer"
              />
              <Input
                value={value.announcementBar.bgColor}
                onChange={(e) => set('announcementBar', { ...value.announcementBar, bgColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Cor texto</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={value.announcementBar.textColor}
                onChange={(e) => set('announcementBar', { ...value.announcementBar, textColor: e.target.value })}
                className="h-8 w-8 rounded border cursor-pointer"
              />
              <Input
                value={value.announcementBar.textColor}
                onChange={(e) => set('announcementBar', { ...value.announcementBar, textColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero Editor ───────────────────────────────────────── */
function HeroEditor({ value, onChange }: { value: HeroSection; onChange: (v: HeroSection) => void }) {
  const set = <K extends keyof HeroSection>(key: K, val: HeroSection[K]) =>
    onChange({ ...value, [key]: val });

  const addSlide = () => {
    set('slides', [...value.slides, { imageUrl: '', title: '', subtitle: '', buttonText: '', buttonUrl: '' }]);
  };

  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const next = value.slides.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    set('slides', next);
  };

  const removeSlide = (idx: number) => {
    set('slides', value.slides.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <ToggleRow label="Exibir hero" checked={value.enabled} onChange={(v) => set('enabled', v)} />
      <div>
        <Label className="text-xs">Tipo</Label>
        <Select value={value.type} onValueChange={(v) => set('type', v as HeroSection['type'])}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="slideshow">Slideshow</SelectItem>
            <SelectItem value="single">Imagem única</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Altura</Label>
        <Select value={value.height} onValueChange={(v) => set('height', v as HeroSection['height'])}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Pequena</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="large">Grande</SelectItem>
            <SelectItem value="full">Tela cheia</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Opacidade do overlay ({Math.round(value.overlayOpacity * 100)}%)</Label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value.overlayOpacity}
          onChange={(e) => set('overlayOpacity', parseFloat(e.target.value))}
          className="mt-1 w-full"
        />
      </div>

      {/* Slides */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase text-muted-foreground">Slides ({value.slides.length})</p>
          <Button type="button" variant="outline" size="sm" onClick={addSlide}>
            + Slide
          </Button>
        </div>
        {value.slides.map((slide, idx) => (
          <div key={idx} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Slide {idx + 1}</span>
              <button onClick={() => removeSlide(idx)} className="text-xs text-destructive hover:underline">
                Remover
              </button>
            </div>
            <Input
              placeholder="URL da imagem"
              value={slide.imageUrl}
              onChange={(e) => updateSlide(idx, { imageUrl: e.target.value })}
            />
            <Input
              placeholder="Título"
              value={slide.title}
              onChange={(e) => updateSlide(idx, { title: e.target.value })}
            />
            <Input
              placeholder="Subtítulo"
              value={slide.subtitle}
              onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Texto do botão"
                value={slide.buttonText}
                onChange={(e) => updateSlide(idx, { buttonText: e.target.value })}
              />
              <Input
                placeholder="URL do botão"
                value={slide.buttonUrl}
                onChange={(e) => updateSlide(idx, { buttonUrl: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Featured Products Editor ──────────────────────────── */
function FeaturedProductsEditor({ value, onChange }: { value: FeaturedProductsSection; onChange: (v: FeaturedProductsSection) => void }) {
  const set = <K extends keyof FeaturedProductsSection>(key: K, val: FeaturedProductsSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <ToggleRow label="Exibir seção" checked={value.enabled} onChange={(v) => set('enabled', v)} />
      <div>
        <Label className="text-xs">Título da seção</Label>
        <Input value={value.title} onChange={(e) => set('title', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Máx. produtos</Label>
        <Input type="number" min={2} max={24} value={value.maxProducts} onChange={(e) => set('maxProducts', parseInt(e.target.value) || 8)} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Colunas</Label>
        <Select value={String(value.columns)} onValueChange={(v) => set('columns', parseInt(v) as 2 | 3 | 4)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 colunas</SelectItem>
            <SelectItem value="3">3 colunas</SelectItem>
            <SelectItem value="4">4 colunas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ToggleRow label="Exibir preço" checked={value.showPrice} onChange={(v) => set('showPrice', v)} />
      <ToggleRow label="Exibir badge" checked={value.showBadge} onChange={(v) => set('showBadge', v)} />
    </div>
  );
}

/* ── Product Detail Editor ─────────────────────────────── */
function ProductDetailEditor({ value, onChange }: { value: ProductDetailSection; onChange: (v: ProductDetailSection) => void }) {
  const set = <K extends keyof ProductDetailSection>(key: K, val: ProductDetailSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Posição da imagem</Label>
        <Select value={value.imagePosition} onValueChange={(v) => set('imagePosition', v as 'left' | 'right')}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ToggleRow label="Produtos relacionados" checked={value.showRelated} onChange={(v) => set('showRelated', v)} />
      <ToggleRow label="Avaliações" checked={value.showReviews} onChange={(v) => set('showReviews', v)} />
      <ToggleRow label="Botões de compartilhar" checked={value.showShareButtons} onChange={(v) => set('showShareButtons', v)} />
      <ToggleRow label="Botão fixo 'Comprar'" checked={value.stickyAddToCart} onChange={(v) => set('stickyAddToCart', v)} />
      <ToggleRow label="Zoom ao passar o mouse" checked={value.zoomOnHover} onChange={(v) => set('zoomOnHover', v)} />
    </div>
  );
}

/* ── Cart Editor ───────────────────────────────────────── */
function CartEditor({ value, onChange }: { value: CartSection; onChange: (v: CartSection) => void }) {
  const set = <K extends keyof CartSection>(key: K, val: CartSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Estilo do carrinho</Label>
        <Select value={value.style} onValueChange={(v) => set('style', v as CartSection['style'])}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="drawer">Drawer lateral</SelectItem>
            <SelectItem value="page">Página inteira</SelectItem>
            <SelectItem value="popup">Popup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ToggleRow label="Estimativa de frete" checked={value.showShippingEstimate} onChange={(v) => set('showShippingEstimate', v)} />
      <ToggleRow label="Campo de cupom" checked={value.showCouponField} onChange={(v) => set('showCouponField', v)} />
      <ToggleRow label="Sugestão de produtos" checked={value.showCrossSell} onChange={(v) => set('showCrossSell', v)} />
    </div>
  );
}

/* ── Footer Editor ─────────────────────────────────────── */
function FooterEditor({ value, onChange }: { value: FooterSection; onChange: (v: FooterSection) => void }) {
  const set = <K extends keyof FooterSection>(key: K, val: FooterSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <ToggleRow label="Exibir rodapé" checked={value.enabled} onChange={(v) => set('enabled', v)} />
      <div>
        <Label className="text-xs">Colunas</Label>
        <Select value={String(value.columns)} onValueChange={(v) => set('columns', parseInt(v) as 2 | 3 | 4)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 colunas</SelectItem>
            <SelectItem value="3">3 colunas</SelectItem>
            <SelectItem value="4">4 colunas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ToggleRow label="Newsletter" checked={value.showNewsletter} onChange={(v) => set('showNewsletter', v)} />
      <ToggleRow label="Links sociais" checked={value.showSocialLinks} onChange={(v) => set('showSocialLinks', v)} />
      <ToggleRow label="Ícones de pagamento" checked={value.showPaymentIcons} onChange={(v) => set('showPaymentIcons', v)} />
      <div>
        <Label className="text-xs">Texto de copyright</Label>
        <Input
          value={value.copyrightText}
          onChange={(e) => set('copyrightText', e.target.value)}
          placeholder="© 2026 Sua Loja. Todos os direitos reservados."
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Cor fundo</Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={value.bgColor}
              onChange={(e) => set('bgColor', e.target.value)}
              className="h-8 w-8 rounded border cursor-pointer"
            />
            <Input value={value.bgColor} onChange={(e) => set('bgColor', e.target.value)} className="flex-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Cor texto</Label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={value.textColor}
              onChange={(e) => set('textColor', e.target.value)}
              className="h-8 w-8 rounded border cursor-pointer"
            />
            <Input value={value.textColor} onChange={(e) => set('textColor', e.target.value)} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Custom CSS Editor ─────────────────────────────────── */
function CustomCssEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Adicione CSS personalizado. Use com cuidado — mudanças podem afetar toda a loja.
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`.my-class {\n  color: red;\n}`}
        className="font-mono text-xs min-h-[200px]"
      />
    </div>
  );
}

/* ── Colors Editor ─────────────────────────────────────── */
function ColorsEditor({ value, onChange }: { value: ThemeColors; onChange: (v: ThemeColors) => void }) {
  const set = <K extends keyof ThemeColors>(key: K, val: ThemeColors[K]) =>
    onChange({ ...value, [key]: val });

  const colorFields: { key: keyof ThemeColors; label: string; description: string }[] = [
    { key: 'primary', label: 'Cor primária', description: 'Botões, links e destaques' },
    { key: 'secondary', label: 'Cor secundária', description: 'Elementos de apoio' },
    { key: 'accent', label: 'Cor de destaque', description: 'Promoções e badges' },
    { key: 'background', label: 'Fundo da página', description: 'Cor de fundo geral' },
    { key: 'text', label: 'Cor do texto', description: 'Texto principal da loja' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Defina as cores que compõem a identidade visual da sua loja.
      </p>
      {colorFields.map(({ key, label, description }) => (
        <div key={key} className="space-y-1.5">
          <Label className="text-xs">{label}</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value[key]}
              onChange={(e) => set(key, e.target.value)}
              className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
            />
            <Input
              value={value[key]}
              onChange={(e) => set(key, e.target.value)}
              className="flex-1 font-mono text-xs"
              placeholder="#000000"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      ))}

      {/* Quick palette presets */}
      <div className="border-t pt-4 space-y-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">Paletas rápidas</p>
        {[
          { name: 'Preto clássico', colors: { primary: '#000000', secondary: '#4b5563', accent: '#ef4444', background: '#ffffff', text: '#111111' } },
          { name: 'Roxo editorial', colors: { primary: '#7c3aed', secondary: '#4c1d95', accent: '#f59e0b', background: '#faf5ff', text: '#1e1b4b' } },
          { name: 'Verde essentials', colors: { primary: '#059669', secondary: '#047857', accent: '#f97316', background: '#f0fdf4', text: '#064e3b' } },
          { name: 'Azul clean', colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#f43f5e', background: '#eff6ff', text: '#1e3a5f' } },
          { name: 'Rosa glam', colors: { primary: '#c9184a', secondary: '#1a1a1a', accent: '#f5e6e0', background: '#fffbf7', text: '#1a1a1a' } },
        ].map((preset) => (
          <button
            key={preset.name}
            onClick={() => onChange(preset.colors)}
            className="flex w-full items-center gap-3 rounded-md border p-2.5 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="flex gap-1">
              {Object.values(preset.colors).slice(0, 3).map((c, i) => (
                <div key={i} className="h-5 w-5 rounded-full border" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-xs font-medium">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Fonts Editor ──────────────────────────────────────── */
const FONT_OPTIONS: { value: FontFamily; label: string; family: string; sample: string }[] = [
  { value: 'inter', label: 'Inter (moderna)', family: 'Inter, sans-serif', sample: 'AaBbCcDd 1234 — Elegância em detalhes' },
  { value: 'poppins', label: 'Poppins (geométrica)', family: 'Poppins, sans-serif', sample: 'AaBbCcDd 1234 — Elegância em detalhes' },
  { value: 'playfair', label: 'Playfair (editorial)', family: 'Playfair Display, Georgia, serif', sample: 'AaBbCcDd 1234 — Elegância em detalhes' },
  { value: 'georgia', label: 'Georgia (clássica)', family: 'Georgia, serif', sample: 'AaBbCcDd 1234 — Elegância em detalhes' },
  { value: 'system', label: 'System UI (clean)', family: 'system-ui, sans-serif', sample: 'AaBbCcDd 1234 — Elegância em detalhes' },
];

function FontsEditor({ value, onChange }: { value: ThemeTypography; onChange: (v: ThemeTypography) => void }) {
  const set = <K extends keyof ThemeTypography>(key: K, val: ThemeTypography[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Escolha as fontes que melhor representam sua marca.
      </p>

      {/* Heading font */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Fonte dos títulos</Label>
        <div className="space-y-1.5">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => set('headingFont', f.value)}
              className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                value.headingFont === f.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{f.label}</p>
                <p className="mt-0.5 text-sm" style={{ fontFamily: f.family }}>{f.sample}</p>
              </div>
              {value.headingFont === f.value && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Body font */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Fonte do corpo</Label>
        <div className="space-y-1.5">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => set('bodyFont', f.value)}
              className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                value.bodyFont === f.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{f.label}</p>
                <p className="mt-0.5 text-sm" style={{ fontFamily: f.family }}>{f.sample}</p>
              </div>
              {value.bodyFont === f.value && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Tamanho base</Label>
        <Select value={value.baseFontSize} onValueChange={(v) => set('baseFontSize', v as ThemeTypography['baseFontSize'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Pequeno (14px)</SelectItem>
            <SelectItem value="medium">Médio (16px)</SelectItem>
            <SelectItem value="large">Grande (18px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ── Design Options Editor ─────────────────────────────── */
function DesignOptionsEditor({ value, onChange }: { value: ThemeDesign; onChange: (v: ThemeDesign) => void }) {
  const set = <K extends keyof ThemeDesign>(key: K, val: ThemeDesign[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Configurações gerais de design — logo, favicon e opções de aparência.
      </p>

      {/* Logo */}
      <div className="space-y-1.5">
        <Label className="text-xs">URL do logotipo</Label>
        <Input
          value={value.logoUrl}
          onChange={(e) => set('logoUrl', e.target.value)}
          placeholder="https://cdn.../logo.png"
        />
        {value.logoUrl && (
          <div className="mt-2 flex items-center justify-center rounded-md border bg-muted/30 p-4">
            <img src={value.logoUrl} alt="Logo" className="max-h-12 max-w-[180px] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
      </div>

      {/* Favicon */}
      <div className="space-y-1.5">
        <Label className="text-xs">URL do favicon</Label>
        <Input
          value={value.faviconUrl}
          onChange={(e) => set('faviconUrl', e.target.value)}
          placeholder="https://cdn.../favicon.ico"
        />
        {value.faviconUrl && (
          <div className="mt-2 flex items-center gap-2">
            <img src={value.faviconUrl} alt="Favicon" className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xs text-muted-foreground">Preview do favicon</span>
          </div>
        )}
      </div>

      {/* Border radius */}
      <div className="space-y-1.5">
        <Label className="text-xs">Arredondamento dos cantos</Label>
        <div className="grid grid-cols-4 gap-2">
          {([
            { val: 'none', label: 'Nenhum', radius: '0px' },
            { val: 'small', label: 'Sutil', radius: '4px' },
            { val: 'medium', label: 'Médio', radius: '8px' },
            { val: 'large', label: 'Grande', radius: '16px' },
          ] as const).map(({ val, label, radius }) => (
            <button
              key={val}
              onClick={() => set('borderRadius', val)}
              className={`flex flex-col items-center gap-1.5 rounded-md border p-2.5 transition-colors ${
                value.borderRadius === val ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
              }`}
            >
              <div
                className="h-8 w-8 border-2 border-foreground/40"
                style={{ borderRadius: radius }}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Button style */}
      <div className="space-y-1.5">
        <Label className="text-xs">Estilo dos botões</Label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { val: 'filled', label: 'Preenchido' },
            { val: 'outline', label: 'Contorno' },
            { val: 'pill', label: 'Arredondado' },
          ] as const).map(({ val, label }) => (
            <button
              key={val}
              onClick={() => set('buttonStyle', val)}
              className={`rounded-md border p-2.5 text-center transition-colors ${
                value.buttonStyle === val ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex justify-center mb-1.5">
                <div
                  className={`px-3 py-1 text-[10px] font-medium ${
                    val === 'filled' ? 'bg-foreground text-background rounded' :
                    val === 'outline' ? 'border border-foreground text-foreground rounded' :
                    'bg-foreground text-background rounded-full'
                  }`}
                >
                  Botão
                </div>
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Container width */}
      <div className="space-y-1.5">
        <Label className="text-xs">Largura do conteúdo</Label>
        <Select value={value.containerWidth} onValueChange={(v) => set('containerWidth', v as ThemeDesign['containerWidth'])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">Estreito (1024px)</SelectItem>
            <SelectItem value="default">Padrão (1200px)</SelectItem>
            <SelectItem value="wide">Largo (1440px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * SHARED UI COMPONENTS
 * ══════════════════════════════════════════════════════════ */
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
