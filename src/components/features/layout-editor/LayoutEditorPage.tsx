'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  X, Eye, HelpCircle, ExternalLink, ChevronRight,
  ArrowUp, Home, LayoutGrid, ScanSearch, ShoppingCart,
  ArrowDown, Code2, Paintbrush, Type, Settings2, Image,
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
} from '@/types/theme';
import { DEFAULT_THEME_SECTIONS, SECTION_REGISTRY } from '@/types/theme';

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
      themeService.updateThemeSections({ themeSectionsJson: JSON.stringify(sections) }),
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

  // Hydrate from API
  useEffect(() => {
    if (data) {
      setSections(parseThemeSections(data.themeSectionsJson));
      setLogoUrl(data.logoUrl || '');
    }
  }, [data]);

  // ── Section update helper ───────────────────────────────
  const updateSection = useCallback(<K extends keyof ThemeSections>(key: K, value: ThemeSections[K]) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Publish action ──────────────────────────────────────
  const handlePublish = () => mutation.mutate(sections);

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
        <main className="flex-1 bg-zinc-100 p-4 overflow-hidden">
          <div className="mx-auto h-full w-full max-w-[1200px] overflow-hidden rounded-lg border bg-white shadow-sm">
            <iframe
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
        {panelKey === 'colors' && <ColorsEditor />}
        {panelKey === 'fonts' && <FontsEditor />}
        {panelKey === 'settings' && <DesignOptionsEditor />}
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
function ColorsEditor() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        As cores da loja são gerenciadas nas configurações de aparência do canal de vendas.
      </p>
      <div className="space-y-3">
        {[
          { label: 'Preto clássico', value: '0 0% 9%' },
          { label: 'Roxo editorial', value: '248 45% 38%' },
          { label: 'Verde essentials', value: '165 85% 32%' },
          { label: 'Azul clean', value: '196 85% 36%' },
        ].map((c) => (
          <div key={c.value} className="flex items-center gap-3 rounded-md border p-3">
            <div className="h-8 w-8 rounded-full border" style={{ backgroundColor: `hsl(${c.value})` }} />
            <div>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">HSL({c.value})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Fonts Editor ──────────────────────────────────────── */
function FontsEditor() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Escolha a fonte que melhor representa sua marca.
      </p>
      {[
        { label: 'Inter (moderna)', family: 'Inter, sans-serif', sample: 'AaBbCcDd 1234' },
        { label: 'Georgia (editorial)', family: 'Georgia, serif', sample: 'AaBbCcDd 1234' },
        { label: 'System UI (clean)', family: 'system-ui, sans-serif', sample: 'AaBbCcDd 1234' },
      ].map((f) => (
        <div key={f.label} className="rounded-md border p-3">
          <p className="text-sm font-medium">{f.label}</p>
          <p className="mt-1 text-lg" style={{ fontFamily: f.family }}>{f.sample}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Design Options Editor ─────────────────────────────── */
function DesignOptionsEditor() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Configurações gerais de design — logo, favicon e opções avançadas.
      </p>
      <div>
        <Label className="text-xs">URL do logotipo</Label>
        <Input placeholder="https://cdn.../logo.png" className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">URL do favicon</Label>
        <Input placeholder="https://cdn.../favicon.ico" className="mt-1" />
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
