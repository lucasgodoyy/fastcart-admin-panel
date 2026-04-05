'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  X, Eye, EyeOff, HelpCircle, ExternalLink, ChevronRight, ChevronLeft, Plus, Trash2,
  ArrowUp, Home, LayoutGrid, ScanSearch, ShoppingCart, GripVertical,
  ArrowDown, Code2, Paintbrush, Type, Settings2, Image as ImageIcon,
  Monitor, Tablet, Smartphone, RefreshCw, Check, Search, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import themeService from '@/services/theme';
import { product as productService } from '@/services/catalog';
import productOrganizeService from '@/services/productOrganizeService';
import type { Product } from '@/types/product';
import type { ProductOrgSettings } from '@/services/productOrganizeService';
import storeSettingsService from '@/services/storeSettingsService';
import type {
  ThemeSections, ThemeSectionsResponse, SectionKey,
  HeaderSection, HeroSection, HeroSlide,
  FeaturedProductsSection, ProductListSection, ProductDetailSection,
  CartSection, FooterSection, ThemeColors, ThemeTypography, ThemeDesign,
  FontFamily, HomeSectionItem, HomeSectionType,
} from '@/types/theme';
import {
  DEFAULT_THEME_SECTIONS, SECTION_REGISTRY, DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY, DEFAULT_DESIGN, DEFAULT_HEADER, DEFAULT_FOOTER,
  HOME_SECTION_LABELS, DEFAULT_HOME_SECTIONS,
} from '@/types/theme';

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
  Image: <ImageIcon className="h-4 w-4" />,
};

const QUERY_KEY = ['theme-sections'];

/* ──────────────────────────────────────────────────────────
 * Helper: parse theme sections JSON safely
 * ────────────────────────────────────────────────────────── */
function parseThemeSections(json: string | null | undefined): ThemeSections {
  if (!json) return { ...DEFAULT_THEME_SECTIONS };
  try {
    const parsed = JSON.parse(json);
    return {
      ...DEFAULT_THEME_SECTIONS,
      ...parsed,
      header: { ...DEFAULT_HEADER, ...(parsed.header || {}) },
      footer: { ...DEFAULT_FOOTER, ...(parsed.footer || {}) },
      homeSections: parsed.homeSections || [...DEFAULT_HOME_SECTIONS],
    };
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
  const { data: storeData } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => storeSettingsService.getMyStore(),
  });

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
  const [pendingEditSectionId, setPendingEditSectionId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // ── Listen for signals from the preview iframe ───────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LOJAKI_PREVIEW_READY') {
        setIframeReady(true);
      } else if (event.data?.type === 'LOJAKI_EDIT_SECTION') {
        const sectionId = event.data?.sectionId as string | undefined;
        if (sectionId) {
          // Check if it's a top-level section key (productDetail, header, footer, etc.)
          const topLevelKeys = ['productDetail', 'header', 'footer', 'cart', 'productList', 'customCss', 'colors', 'fonts', 'settings', 'brand'];
          if (topLevelKeys.includes(sectionId)) {
            setActivePanel(sectionId as SectionKey);
          } else {
            setActivePanel('homeSections');
            setPendingEditSectionId(sectionId);
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ── Send live theme preview to iframe on every sections change (debounced 250ms) ──
  useEffect(() => {
    if (!iframeReady) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'LOJAKI_THEME_PREVIEW', payload: JSON.stringify(sections) },
        '*',
      );
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sections, iframeReady]);

  // Hydrate from API
  useEffect(() => {
    if (data) {
      const parsed = parseThemeSections(data.themeSectionsJson);
      setSections({
        ...parsed,
        colors: parsed.colors || { ...DEFAULT_COLORS },
        typography: parsed.typography || { ...DEFAULT_TYPOGRAPHY },
        header: { ...DEFAULT_HEADER, ...(parsed.header || {}) },
        footer: { ...DEFAULT_FOOTER, ...(parsed.footer || {}) },
        homeSections: parsed.homeSections || [...DEFAULT_HOME_SECTIONS],
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

  // On publish success, reset iframe-ready so we re-handshake on next reload
  useEffect(() => {
    if (mutation.isSuccess) {
      setIframeReady(false);
      setIframeKey((k) => k + 1);
    }
  }, [mutation.isSuccess]);

  // ── Storefront preview URL ──────────────────────────────
  const previewUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
    const params = new URLSearchParams({ preview: 'true' });
    if (storeData?.slug) {
      params.set('storeSlug', storeData.slug);
    }
    return `${base.replace(/\/$/, '')}/?${params.toString()}`;
  }, [storeData?.slug]);

  // ── Close editor ────────────────────────────────────────
  const handleClose = () => router.push('/admin/online-store/layout-theme');

  // ── View store ──────────────────────────────────────────
  const handleViewStore = () => {
    const base = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';
    const url = new URL(base.replace(/\/$/, ''));
    if (storeData?.slug) {
      url.searchParams.set('storeSlug', storeData.slug);
    }
    window.open(url.toString(), '_blank');
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
                pendingEditSectionId={pendingEditSectionId}
                onPendingEditSectionIdConsumed={() => setPendingEditSectionId(null)}
              />
            )}
          </div>

          {/* Publish button */}
          <div className="border-t p-3 shrink-0 space-y-2">
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={handlePublish}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Publicando...' : 'Publicar alterações'}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Voltar ao tema padrão? Todas as customizações atuais serão substituídas pelo tema genérico preto e branco.')) {
                  setSections({ ...DEFAULT_THEME_SECTIONS });
                }
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Restaurar padrão
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
 * SIDEBAR ROOT — Nuvemshop-style navigation menu
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
      {/* Brand / Design */}
      <div className="pb-2">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Aparência
        </p>
      </div>
      <SidebarButton icon={<Settings2 className="h-4 w-4 text-muted-foreground" />} label="Tipo de design" onClick={() => onSelectSection('settings')} />
      <SidebarButton icon={<Paintbrush className="h-4 w-4 text-muted-foreground" />} label="Cores da sua marca" onClick={() => onSelectSection('colors')} />
      <SidebarButton icon={<Type className="h-4 w-4 text-muted-foreground" />} label="Tipo de Letra" onClick={() => onSelectSection('fonts')} />
      <SidebarButton icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />} label="Imagem da sua marca" onClick={() => onSelectSection('brand')} />

      {/* Divider */}
      <div className="py-2">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Seções da loja
        </p>
      </div>

      {/* Section list — matches Nuvemshop spec exactly */}
      {SECTION_REGISTRY.map((meta) => (
        <SidebarButton
          key={meta.key}
          icon={ICON_MAP[meta.icon] ?? <Settings2 className="h-4 w-4 text-muted-foreground" />}
          label={meta.label}
          onClick={() => onSelectSection(meta.key)}
        />
      ))}
    </div>
  );
}

function SidebarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
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
  pendingEditSectionId,
  onPendingEditSectionIdConsumed,
}: {
  panelKey: string;
  sections: ThemeSections;
  onUpdate: <K extends keyof ThemeSections>(key: K, value: ThemeSections[K]) => void;
  onBack: () => void;
  pendingEditSectionId?: string | null;
  onPendingEditSectionIdConsumed?: () => void;
}) {
  const panelTitle = (() => {
    const reg = SECTION_REGISTRY.find((m) => m.key === panelKey);
    if (reg) return reg.label;
    if (panelKey === 'colors') return 'Cores da sua marca';
    if (panelKey === 'fonts') return 'Tipo de Letra';
    if (panelKey === 'settings') return 'Tipo de design';
    if (panelKey === 'brand') return 'Imagem da sua marca';
    return 'Configurações';
  })();

  return (
    <div>
      {/* Panel header */}
      <button
        onClick={onBack}
        className="flex w-full items-center gap-2 border-b px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>{panelTitle}</span>
      </button>

      <div className="p-4 space-y-4">
        {panelKey === 'header' && <HeaderEditor value={sections.header} onChange={(v) => onUpdate('header', v)} />}
        {panelKey === 'homeSections' && <HomeSectionsEditor value={sections.homeSections} hero={sections.hero} onChange={(v) => onUpdate('homeSections', v)} onHeroChange={(v) => onUpdate('hero', v)} initialEditingId={pendingEditSectionId} onInitialEditingIdConsumed={onPendingEditSectionIdConsumed} />}
        {panelKey === 'productList' && <ProductListEditor value={sections.productList} onChange={(v) => onUpdate('productList', v)} />}
        {panelKey === 'productDetail' && <ProductDetailEditor value={sections.productDetail} onChange={(v) => onUpdate('productDetail', v)} />}
        {panelKey === 'cart' && <CartEditor value={sections.cart} onChange={(v) => onUpdate('cart', v)} />}
        {panelKey === 'footer' && <FooterEditor value={sections.footer} onChange={(v) => onUpdate('footer', v)} />}
        {panelKey === 'customCss' && <CustomCssEditor value={sections.customCss} onChange={(v) => onUpdate('customCss', v)} />}
        {panelKey === 'colors' && <ColorsEditor value={sections.colors || { ...DEFAULT_COLORS }} onChange={(v) => onUpdate('colors', v)} />}
        {panelKey === 'fonts' && <FontsEditor value={sections.typography || { ...DEFAULT_TYPOGRAPHY }} onChange={(v) => onUpdate('typography', v)} />}
        {panelKey === 'settings' && <DesignOptionsEditor value={sections.design || { ...DEFAULT_DESIGN }} onChange={(v) => onUpdate('design', v)} />}
        {panelKey === 'brand' && <BrandEditor value={sections.design || { ...DEFAULT_DESIGN }} onChange={(v) => onUpdate('design', v)} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * SECTION EDITORS
 * ══════════════════════════════════════════════════════════ */

/* ── Header Editor (Nuvemshop-style) ───────────────────── */
function HeaderEditor({ value, onChange }: { value: HeaderSection; onChange: (v: HeaderSection) => void }) {
  const set = <K extends keyof HeaderSection>(key: K, val: HeaderSection[K]) =>
    onChange({ ...value, [key]: val });

  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (key: string) => setOpenSection((prev) => (prev === key ? null : key));

  /* Collapsible row — defined inline to avoid nested component issues */
  const renderCollapse = (id: string, label: string, children: React.ReactNode) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-border last:border-b-0">
        <button type="button" onClick={() => toggle(id)} className="flex w-full items-center justify-between py-3 text-left">
          <span className="text-sm text-foreground">{label}</span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        {isOpen && <div className="pb-4 space-y-3">{children}</div>}
      </div>
    );
  };

  /* Inline round color swatch row */
  const renderColorRow = (label: string, colorKey: 'bgColor' | 'textColor' | 'alternativeTextColor') => (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
      <input
        type="color"
        value={value[colorKey]}
        onChange={(e) => set(colorKey, e.target.value)}
        className="h-7 w-7 rounded-full border-2 border-border cursor-pointer shrink-0 appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );

  /* Option pill buttons */
  const renderOptions = <T extends string>(
    currentVal: T | undefined,
    fallback: T,
    options: { val: T; label: string }[],
    onSelect: (v: T) => void,
    cols: 2 | 3 | 4 = 2,
  ) => (
    <div className={`grid gap-1.5 mt-1.5 ${cols === 4 ? 'grid-cols-4' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map(({ val, label }) => (
        <button
          key={val}
          type="button"
          onClick={() => onSelect(val)}
          className={`rounded-md border px-1.5 py-2 text-[10px] text-center leading-tight font-medium transition-colors ${
            (currentVal ?? fallback) === val ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {/* Cores */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Cores</h3>
        <label className="flex items-center gap-2.5 py-1 cursor-pointer">
          <input
            type="checkbox"
            checked={value.useCustomColors}
            onChange={(e) => set('useCustomColors', e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
          <span className="text-sm text-foreground">Usar estas cores para o cabeçalho</span>
        </label>
        <div className={`mt-0.5 transition-opacity ${value.useCustomColors ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {renderColorRow('Cor de fundo', 'bgColor')}
          {renderColorRow('Cor dos textos e ícones', 'textColor')}
        </div>
      </div>

      {/* Logo */}
      <div className="border-t border-border pt-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Logo</h3>
        <Label className="text-xs text-muted-foreground">Tamanho do logo</Label>
        <Select
          value={value.logoSize ?? 'preset'}
          onValueChange={(v) => set('logoSize', v as HeaderSection['logoSize'])}
        >
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="preset">Pré-definido</SelectItem>
            <SelectItem value="small">Pequeno</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="large">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Idiomas e moedas */}
      <div className="border-t border-border pt-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Idiomas e moedas</h3>
        <label className="flex items-center gap-2.5 py-1 cursor-pointer">
          <input
            type="checkbox"
            checked={value.showLanguagesAndCurrencies}
            onChange={(e) => set('showLanguagesAndCurrencies', e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
          <span className="text-sm text-foreground">Mostrar idiomas e moedas no cabeçalho</span>
        </label>
      </div>

      {/* Collapsible sub-sections */}
      <div className="border-t border-border">

        {/* Cabeçalho transparente */}
        {renderCollapse('transparent', 'Cabeçalho transparente', <>
          <ToggleRow
            label="Mostrar fundo do cabeçalho transparente"
            checked={value.transparentOnHero}
            onChange={(v) => set('transparentOnHero', v)}
          />
          {value.transparentOnHero && (
            <div className="space-y-3 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground">Aplicar transparência sobre</Label>
                <Select
                  value={value.transparentApplyOver ?? 'banners-video'}
                  onValueChange={(v) => set('transparentApplyOver', v as HeaderSection['transparentApplyOver'])}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banners">Os banners rotativos</SelectItem>
                    <SelectItem value="banners-video">Os banners rotativos e o vídeo</SelectItem>
                    <SelectItem value="entire-store">Toda a loja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.useAlternativeColorsOnTransparent}
                  onChange={(e) => set('useAlternativeColorsOnTransparent', e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground leading-tight">
                  Usar cor e logotipo alternativos sobre banners rotativos e vídeo
                </span>
              </label>
              {value.useAlternativeColorsOnTransparent && (
                <div className="space-y-2 pt-1">
                  {renderColorRow('Cor dos textos e ícones', 'alternativeTextColor')}
                  <div>
                    <Label className="text-xs text-muted-foreground">Logo alternativo (URL)</Label>
                    <Input
                      value={value.alternativeLogoUrl ?? ''}
                      onChange={(e) => set('alternativeLogoUrl', e.target.value)}
                      placeholder="https://cdn.../logo-branco.png"
                      className="mt-1 text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Exibido sobre os banners quando a transparência está ativa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>)}

        {/* Cabeçalho em celulares */}
        {renderCollapse('mobile', 'Cabeçalho em celulares', <>
          <div>
            <Label className="text-xs text-muted-foreground">Posição do logo</Label>
            {renderOptions(
              value.mobileLogoPosition, 'left',
              [
                { val: 'left', label: 'Esquerda' },
                { val: 'center', label: 'Centralizado' },
                { val: 'center-below-icons', label: 'Centralizado abaixo dos ícones' },
              ],
              (v) => set('mobileLogoPosition', v),
              3,
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Exibição da barra de pesquisa</Label>
            <Select
              value={value.mobileSearchDisplay ?? 'icon'}
              onValueChange={(v) => set('mobileSearchDisplay', v as HeaderSection['mobileSearchDisplay'])}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="icon">Ícone</SelectItem>
                <SelectItem value="open">Campo aberto</SelectItem>
                <SelectItem value="hidden">Oculto (exibido dentro do menu)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-dashed border-border p-3 text-center">
            <p className="text-xs font-medium text-foreground">Carregando sua loja</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Faça ela única</p>
          </div>
        </>)}

        {/* Cabeçalho em computadores */}
        {renderCollapse('desktop', 'Cabeçalho em computadores', <>
          <ToggleRow
            label="Cabeçalho sempre visível ao navegar pela loja"
            checked={value.stickyHeader}
            onChange={(v) => set('stickyHeader', v)}
          />
          <div>
            <Label className="text-xs text-muted-foreground">Posição do logo</Label>
            {renderOptions(
              value.desktopLogoPosition, 'left',
              [{ val: 'left', label: 'Esquerda' }, { val: 'center', label: 'Centralizado' }],
              (v) => set('desktopLogoPosition', v),
              2,
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Mostrar barra de pesquisa grande</Label>
            {renderOptions(
              value.desktopSearchStyle, 'none',
              [
                { val: 'none', label: 'Oculto' },
                { val: 'bar-left', label: 'Esquerda' },
                { val: 'bar-center', label: 'Centralizado' },
                { val: 'bar-below-icons', label: 'Abaixo dos ícones' },
              ],
              (v) => set('desktopSearchStyle', v),
              4,
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Ícone</Label>
            {renderOptions(
              value.desktopIconSize, 'normal',
              [
                { val: 'normal', label: 'Normal' },
                { val: 'large', label: 'Grande' },
                { val: 'hidden', label: 'Oculto (dentro do menu)' },
              ],
              (v) => set('desktopIconSize', v),
              3,
            )}
          </div>
        </>)}
      </div>

      {/* Barra de anúncio */}
      <div className="border-t border-border pt-4 mt-1">
        <h3 className="text-sm font-semibold text-foreground mb-2">Barra de anúncio</h3>
        <ToggleRow
          label="Ativar barra"
          checked={value.announcementBar.enabled}
          onChange={(v) => set('announcementBar', { ...value.announcementBar, enabled: v })}
        />
        {value.announcementBar.enabled && (
          <div className="mt-3 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Texto</Label>
              <Input
                value={value.announcementBar.text}
                onChange={(e) => set('announcementBar', { ...value.announcementBar, text: e.target.value })}
                placeholder="Frete grátis acima de R$199"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorField label="Cor fundo" value={value.announcementBar.bgColor} onChange={(v) => set('announcementBar', { ...value.announcementBar, bgColor: v })} />
              <ColorField label="Cor texto" value={value.announcementBar.textColor} onChange={(v) => set('announcementBar', { ...value.announcementBar, textColor: v })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Home Sections Editor (Drag & Drop) ────────────────── */
function HomeSectionsEditor({
  value,
  hero,
  onChange,
  onHeroChange,
  initialEditingId,
  onInitialEditingIdConsumed,
}: {
  value: HomeSectionItem[];
  hero: HeroSection;
  onChange: (v: HomeSectionItem[]) => void;
  onHeroChange: (v: HeroSection) => void;
  initialEditingId?: string | null;
  onInitialEditingIdConsumed?: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Open a specific section editor when signalled from the preview iframe
  useEffect(() => {
    if (initialEditingId) {
      setEditingId(initialEditingId);
      onInitialEditingIdConsumed?.();
    }
  }, [initialEditingId, onInitialEditingIdConsumed]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((s) => s.id === active.id);
      const newIndex = value.findIndex((s) => s.id === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const toggleSection = (id: string) => {
    onChange(value.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const updateSection = (id: string, patch: Partial<HomeSectionItem>) => {
    onChange(value.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const editingSection = editingId
    ? value.find((s) => s.id === editingId) || value.find((s) => s.type === editingId)
    : null;

  if (editingSection) {
    const upd = (patch: Partial<HomeSectionItem>) => updateSection(editingSection.id, patch);

    return (
      <div>
        <button
          onClick={() => setEditingId(null)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{editingSection.title}</span>
        </button>

        {/* ─── Hero / Banners rotativos ─── */}
        {editingSection.type === 'hero' && (
          <div className="space-y-4">
            <ToggleRow label="Aumentar à largura da tela" checked={editingSection.fullWidth ?? false} onChange={(v) => upd({ fullWidth: v })} />
            <ToggleRow label="Adicionar efeito de movimento às imagens" checked={editingSection.parallaxEffect ?? false} onChange={(v) => upd({ parallaxEffect: v })} />
            <HeroEditor value={hero} onChange={onHeroChange} />
          </div>
        )}

        {/* ─── Categorias principais ─── */}
        {editingSection.type === 'mainCategories' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Exibir suas categorias na página inicial</p>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Máx. categorias exibidas</Label>
              <Input type="number" min={2} max={12} value={editingSection.maxCategories || 6} onChange={(e) => upd({ maxCategories: parseInt(e.target.value) || 6 })} className="mt-1" />
            </div>
            <SectionDivider label="Categorias" />
            <CategoryImagesEditor
              images={editingSection.categoryImages || []}
              onChange={(imgs) => upd({ categoryImages: imgs })}
            />
          </div>
        )}

        {/* ─── Mensagem de boas vindas ─── */}
        {editingSection.type === 'welcomeMessage' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Subtítulo</Label>
              <Input value={editingSection.subtitle || ''} onChange={(e) => upd({ subtitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" />
            </div>
            <ToggleRow label="Usar texto em itálico para o título" checked={editingSection.titleItalic ?? false} onChange={(v) => upd({ titleItalic: v })} />
            <div>
              <Label className="text-xs">Texto da mensagem</Label>
              <Textarea value={editingSection.welcomeText || ''} onChange={(e) => upd({ welcomeText: e.target.value })} className="mt-1" rows={4} placeholder="Escreva aqui sua mensagem de boas vindas..." />
            </div>
            <div>
              <Label className="text-xs">Link</Label>
              <Input value={editingSection.linkUrl || ''} onChange={(e) => upd({ linkUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Texto do botão</Label>
              <Input value={editingSection.buttonText || ''} onChange={(e) => upd({ buttonText: e.target.value })} className="mt-1" />
            </div>
          </div>
        )}

        {/* ─── Produtos em destaque ─── */}
        {editingSection.type === 'featuredProducts' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Mostrar produtos como:</Label>
              <Select value={editingSection.displayMode || 'grid'} onValueChange={(v) => upd({ displayMode: v as 'grid' | 'carousel' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grade</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Quantidade de produtos por linha em celulares</Label>
              <Select value={String(editingSection.mobileColumns || 2)} onValueChange={(v) => upd({ mobileColumns: parseInt(v) })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 produto</SelectItem>
                  <SelectItem value="2">2 produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Quantidade de produtos por linha em computadores</Label>
              <Select value={String(editingSection.desktopColumns || 3)} onValueChange={(v) => upd({ desktopColumns: parseInt(v) })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 produtos</SelectItem>
                  <SelectItem value="3">3 produtos</SelectItem>
                  <SelectItem value="4">4 produtos</SelectItem>
                  <SelectItem value="5">5 produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SectionDivider label="Produtos" />
            <ProductPickerInline
              selectedIds={editingSection.productIds || []}
              onChange={(ids) => upd({ productIds: ids })}
            />
            <div>
              <Label className="text-xs">Máx. produtos</Label>
              <Input type="number" min={2} max={24} value={editingSection.maxProducts || 8} onChange={(e) => upd({ maxProducts: parseInt(e.target.value) || 8 })} className="mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Caso nenhum produto seja escolhido acima, será exibido até esse limite de produtos do catálogo.</p>
            </div>
          </div>
        )}

        {/* ─── Produtos novos / Produtos em oferta ─── */}
        {(editingSection.type === 'newProducts' || editingSection.type === 'saleProducts') && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Mostrar produtos como:</Label>
              <Select value={editingSection.displayMode || 'carousel'} onValueChange={(v) => upd({ displayMode: v as 'grid' | 'carousel' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grade</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Quantidade de produtos por linha em celulares</Label>
              <Select value={String(editingSection.mobileColumns || 2)} onValueChange={(v) => upd({ mobileColumns: parseInt(v) })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 produto</SelectItem>
                  <SelectItem value="2">2 produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Quantidade de produtos por linha em computadores</Label>
              <Select value={String(editingSection.desktopColumns || 4)} onValueChange={(v) => upd({ desktopColumns: parseInt(v) })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 produtos</SelectItem>
                  <SelectItem value="3">3 produtos</SelectItem>
                  <SelectItem value="4">4 produtos</SelectItem>
                  <SelectItem value="5">5 produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Máx. produtos</Label>
              <Input type="number" min={2} max={24} value={editingSection.maxProducts || 8} onChange={(e) => upd({ maxProducts: parseInt(e.target.value) || 8 })} className="mt-1" />
            </div>
          </div>
        )}

        {/* ─── Mensagem institucional ─── */}
        {editingSection.type === 'institutionalMessage' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Subtítulo</Label>
              <Input value={editingSection.subtitle || ''} onChange={(e) => upd({ subtitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" />
            </div>
            <ToggleRow label="Usar texto em itálico para o título" checked={editingSection.titleItalic ?? false} onChange={(v) => upd({ titleItalic: v })} />
            <div>
              <Label className="text-xs">Texto da mensagem</Label>
              <Textarea value={editingSection.institutionalText || ''} onChange={(e) => upd({ institutionalText: e.target.value })} className="mt-1" rows={4} placeholder="Escreva aqui sua mensagem institucional..." />
            </div>
            <div>
              <Label className="text-xs">Link</Label>
              <Input value={editingSection.linkUrl || ''} onChange={(e) => upd({ linkUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Texto do botão</Label>
              <Input value={editingSection.buttonText || ''} onChange={(e) => upd({ buttonText: e.target.value })} className="mt-1" />
            </div>
          </div>
        )}

        {/* ─── Produto principal ─── */}
        {editingSection.type === 'mainProduct' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Só um produto da seção &apos;Principal&apos; será exibido.</p>
            <div>
              <Label className="text-xs">Mostrar:</Label>
              <Select value={editingSection.displayOrder || 'first'} onValueChange={(v) => upd({ displayOrder: v as 'first' | 'selected' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">O primeiro da lista</SelectItem>
                  <SelectItem value="selected">Produto selecionado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editingSection.displayOrder === 'selected') && (
              <div>
                <Label className="text-xs">ID do produto</Label>
                <Input type="number" value={editingSection.productId || ''} onChange={(e) => upd({ productId: parseInt(e.target.value) || undefined })} className="mt-1" placeholder="Ex: 123" />
              </div>
            )}
          </div>
        )}

        {/* ─── Banners promocionais / categorias / novidades ─── */}
        {(editingSection.type === 'promoBanners' || editingSection.type === 'categoryBanners' || editingSection.type === 'newsBanners') && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Você pode carregar os banners que precisar, sem limite de quantidade.</p>
            <div>
              <Label className="text-xs">Título para os banners</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" />
            </div>
            <ToggleRow label="Mostrar texto fora da imagem" checked={editingSection.showTextOutside ?? false} onChange={(v) => upd({ showTextOutside: v })} />
            <ToggleRow label="Mostrar banners dentro de um carrossel" checked={editingSection.showAsCarousel ?? false} onChange={(v) => upd({ showAsCarousel: v })} />
            <ToggleRow label="Usar a mesma altura para todos os banners" checked={editingSection.sameHeight ?? false} onChange={(v) => upd({ sameHeight: v })} />
            <ToggleRow label="Remover espaços entre os banners" checked={editingSection.removeSpacing ?? false} onChange={(v) => upd({ removeSpacing: v })} />
            <div>
              <Label className="text-xs">Alinhamento do texto</Label>
              <Select value={editingSection.textAlignment || 'center'} onValueChange={(v) => upd({ textAlignment: v as 'left' | 'center' | 'right' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centralizado</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SectionDivider label="Imagens para computadores" />
            <div>
              <Label className="text-xs">Disposição:</Label>
              <Select value={String(editingSection.bannersPerRow || (editingSection.type === 'categoryBanners' ? 4 : editingSection.type === 'newsBanners' ? 1 : 2))} onValueChange={(v) => upd({ bannersPerRow: parseInt(v) })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 banner por linha</SelectItem>
                  <SelectItem value="2">2 banners por linha</SelectItem>
                  <SelectItem value="3">3 banners por linha</SelectItem>
                  <SelectItem value="4">4 banners por linha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <BannerListEditor
              banners={editingSection.banners || []}
              onChange={(banners) => upd({ banners })}
            />
            <SectionDivider label="Imagens para celulares" />
            <ToggleRow label="Carregar outras imagens para celulares" checked={editingSection.useMobileImages ?? false} onChange={(v) => upd({ useMobileImages: v })} />
          </div>
        )}

        {/* ─── Marcas (brandBanners) ─── */}
        {editingSection.type === 'brandBanners' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Mostrar como:</Label>
              <Select value={editingSection.displayMode || 'carousel'} onValueChange={(v) => upd({ displayMode: v as 'grid' | 'carousel' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grade</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" placeholder="Nossas marcas" />
            </div>
            <BannerListEditor
              banners={editingSection.banners || []}
              onChange={(banners) => upd({ banners })}
              recommendedSize="200px × 200px"
            />
          </div>
        )}

        {/* ─── Depoimentos ─── */}
        {editingSection.type === 'testimonials' && (
          <div className="space-y-4">
            <ToggleRow label="Usar texto em itálico para as descrições" checked={editingSection.descriptionsItalic ?? false} onChange={(v) => upd({ descriptionsItalic: v })} />
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.title} onChange={(e) => upd({ title: e.target.value })} className="mt-1" placeholder="Depoimentos" />
            </div>
            <TestimonialsEditor
              testimonials={editingSection.testimonials || []}
              onChange={(testimonials) => upd({ testimonials })}
            />
          </div>
        )}

        {/* ─── Vídeo ─── */}
        {editingSection.type === 'video' && (
          <div className="space-y-4">
            <ToggleRow label="Aumentar à largura da tela" checked={editingSection.fullWidth ?? false} onChange={(v) => upd({ fullWidth: v })} />
            <div>
              <Label className="text-xs">Tipo de reprodução</Label>
              <Select value={editingSection.playbackType || 'auto-muted'} onValueChange={(v) => upd({ playbackType: v as 'auto-muted' | 'click' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto-muted">Automática e sem som</SelectItem>
                  <SelectItem value="click">Ao clicar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Link do YouTube</Label>
              <Input value={editingSection.videoUrl || ''} onChange={(e) => upd({ videoUrl: e.target.value })} className="mt-1" placeholder="Ex: https://www.youtube.com/watch?v=96Ec0dOHa5I" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Imagem do vídeo — Não se aplica se o tipo de reprodução for automática</p>
              <Label className="text-xs">URL da thumbnail</Label>
              <Input value={editingSection.videoThumbnailUrl || ''} onChange={(e) => upd({ videoThumbnailUrl: e.target.value })} className="mt-1" placeholder="https://..." />
              <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 1920px × 1080px</p>
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.videoTitle || ''} onChange={(e) => upd({ videoTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={editingSection.videoDescription || ''} onChange={(e) => upd({ videoDescription: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Texto do botão</Label>
                <Input value={editingSection.videoButtonText || ''} onChange={(e) => upd({ videoButtonText: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Link do botão</Label>
                <Input value={editingSection.videoButtonUrl || ''} onChange={(e) => upd({ videoButtonUrl: e.target.value })} className="mt-1" placeholder="https://..." />
              </div>
            </div>
            <ToggleRow label="Usar disposição vertical em celulares" checked={editingSection.verticalOnMobile ?? false} onChange={(v) => upd({ verticalOnMobile: v })} />
          </div>
        )}

        {/* ─── Informações de frete, pagamento e compra ─── */}
        {editingSection.type === 'shippingPaymentInfo' && (
          <div className="space-y-4">
            <ToggleRow label="Usar estas cores para a seção" checked={editingSection.useCustomColors ?? false} onChange={(v) => upd({ useCustomColors: v })} />
            {editingSection.useCustomColors && (
              <div className="grid grid-cols-2 gap-2">
                <ColorField label="Cor de fundo" value={editingSection.bgColor || '#ffffff'} onChange={(v) => upd({ bgColor: v })} />
                <ColorField label="Cor de texto" value={editingSection.textColor || '#111111'} onChange={(v) => upd({ textColor: v })} />
              </div>
            )}
            <ToggleRow label="Mostrar os banners na home" checked={editingSection.showOnHome ?? true} onChange={(v) => upd({ showOnHome: v })} />
            <ShippingInfoEditor
              items={editingSection.shippingInfoItems || []}
              onChange={(items) => upd({ shippingInfoItems: items })}
            />
          </div>
        )}

        {/* ─── Newsletter ─── */}
        {editingSection.type === 'newsletter' && (
          <div className="space-y-4">
            <ToggleRow label="Aumentar à largura da tela" checked={editingSection.fullWidth ?? false} onChange={(v) => upd({ fullWidth: v })} />
            <ToggleRow label="Usar estas cores para a newsletter" checked={editingSection.useCustomColors ?? false} onChange={(v) => upd({ useCustomColors: v })} />
            {editingSection.useCustomColors && (
              <div className="grid grid-cols-2 gap-2">
                <ColorField label="Cor de fundo" value={editingSection.bgColor || '#ffffff'} onChange={(v) => upd({ bgColor: v })} />
                <ColorField label="Cor de texto" value={editingSection.textColor || '#111111'} onChange={(v) => upd({ textColor: v })} />
              </div>
            )}
            <div>
              <Label className="text-xs">Imagem</Label>
              <Input value={editingSection.imageUrl || ''} onChange={(e) => upd({ imageUrl: e.target.value })} className="mt-1" placeholder="https://..." />
              <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 800px × 480px</p>
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.newsletterTitle || 'Newsletter'} onChange={(e) => upd({ newsletterTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={editingSection.newsletterDescription || 'Cadastre-se e receba nossas ofertas.'} onChange={(e) => upd({ newsletterDescription: e.target.value })} className="mt-1" rows={3} />
            </div>
          </div>
        )}

        {/* ─── Postagens do Instagram ─── */}
        {editingSection.type === 'instagramPosts' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">O feed do Instagram exibe automaticamente suas últimas postagens na página inicial da sua loja. Seu perfil deve ser público.</p>
            <ToggleRow label="Exibir suas postagens do Instagram na página inicial" checked={editingSection.showOnHome ?? true} onChange={(v) => upd({ showOnHome: v })} />
            <div>
              <Label className="text-xs">Nome de usuário</Label>
              <Input value={editingSection.instagramUsername || ''} onChange={(e) => upd({ instagramUsername: e.target.value })} className="mt-1" placeholder="@sualoja" />
            </div>
            <div>
              <Label className="text-xs">Token de acesso do Instagram</Label>
              <Input value={editingSection.instagramToken || ''} onChange={(e) => upd({ instagramToken: e.target.value })} className="mt-1" placeholder="Token gerado pelo Instagram" />
              <p className="text-[10px] text-muted-foreground mt-1">Para mostrar suas postagens, você precisa gerar um token.</p>
            </div>
          </div>
        )}

        {/* ─── Módulos de imagem e texto ─── */}
        {editingSection.type === 'imageText' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Você pode carregar os módulos que precisar, sem limite de quantidade.</p>
            <ToggleRow label="Mostrar os módulos dentro de um carrossel" checked={editingSection.showAsCarousel ?? false} onChange={(v) => upd({ showAsCarousel: v })} />
            <ToggleRow label="Usar a mesma altura para todos os módulos" checked={editingSection.sameHeight ?? false} onChange={(v) => upd({ sameHeight: v })} />
            <ToggleRow label="Remover espaços entre os módulos" checked={editingSection.removeSpacing ?? false} onChange={(v) => upd({ removeSpacing: v })} />
            <ImageTextModulesEditor
              modules={editingSection.modules || []}
              onChange={(modules) => upd({ modules })}
            />
          </div>
        )}

        {/* ─── Pop-up promocional ─── */}
        {editingSection.type === 'promoPopup' && (
          <div className="space-y-4">
            <ToggleRow label="Mostrar pop-up" checked={editingSection.showPopup ?? true} onChange={(v) => upd({ showPopup: v })} />
            <div>
              <Label className="text-xs">Imagem</Label>
              <Input value={editingSection.popupImageUrl || ''} onChange={(e) => upd({ popupImageUrl: e.target.value })} className="mt-1" placeholder="https://..." />
              <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 375px × 190px</p>
            </div>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.popupTitle || ''} onChange={(e) => upd({ popupTitle: e.target.value })} className="mt-1" placeholder="Oferta especial!" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={editingSection.popupDescription || ''} onChange={(e) => upd({ popupDescription: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Texto do botão</Label>
                <Input value={editingSection.popupButtonText || 'Ver ofertas'} onChange={(e) => upd({ popupButtonText: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Link do botão</Label>
                <Input value={editingSection.popupButtonUrl || ''} onChange={(e) => upd({ popupButtonUrl: e.target.value })} className="mt-1" placeholder="/ofertas" />
              </div>
            </div>
            <ToggleRow label="Permitir que seus clientes se inscrevam na newsletter" checked={editingSection.allowNewsletter ?? false} onChange={(v) => upd({ allowNewsletter: v })} />
            <p className="text-[10px] text-muted-foreground -mt-2">O texto e link do botão não aparecerão se a opção de inscrição na Newsletter estiver ativa</p>
            <div>
              <Label className="text-xs">Atraso para exibir (segundos)</Label>
              <Input type="number" min={0} max={60} value={editingSection.popupDelay ?? 3} onChange={(e) => upd({ popupDelay: parseInt(e.target.value) || 0 })} className="mt-1" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Arraste para reordenar as seções. Clique no botão para ativar/desativar.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {value.map((section) => (
            <SortableHomeSectionRow
              key={section.id}
              section={section}
              onToggle={() => toggleSection(section.id)}
              onEdit={() => setEditingId(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ── Sortable Home Section Row ─────────────────────────── */
function SortableHomeSectionRow({
  section,
  onToggle,
  onEdit,
}: {
  section: HomeSectionItem;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 mb-2">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none shrink-0">
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onEdit} className="flex-1 text-left text-sm truncate hover:text-primary transition-colors min-w-0">
        <span className={section.enabled ? 'text-foreground font-medium' : 'text-muted-foreground'}>{section.title}</span>
      </button>
      <button
        onClick={onToggle}
        className={`shrink-0 p-1 rounded transition-colors ${section.enabled ? 'text-primary hover:text-primary/80' : 'text-muted-foreground/40 hover:text-muted-foreground/60'}`}
        title={section.enabled ? 'Ocultar seção' : 'Mostrar seção'}
      >
        {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
      <button onClick={onEdit} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── Banner List Editor ────────────────────────────────── */
type BannerItem = { imageUrl: string; mobileImageUrl: string; linkUrl: string; altText: string; title?: string; description?: string; buttonText?: string; buttonUrl?: string };
function BannerListEditor({
  banners,
  onChange,
  recommendedSize,
}: {
  banners: BannerItem[];
  onChange: (banners: BannerItem[]) => void;
  recommendedSize?: string;
}) {
  const add = () => onChange([...banners, { imageUrl: '', mobileImageUrl: '', linkUrl: '', altText: '', title: '', description: '', buttonText: '', buttonUrl: '' }]);
  const remove = (idx: number) => onChange(banners.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<BannerItem>) =>
    onChange(banners.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Tamanho recomendado: {recommendedSize || '1920px × 900px'}</p>
      {banners.map((banner, idx) => (
        <div key={idx} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Banner {idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <Input placeholder="URL da imagem (computadores)" value={banner.imageUrl} onChange={(e) => update(idx, { imageUrl: e.target.value })} />
          <Input placeholder="URL imagem mobile (opcional)" value={banner.mobileImageUrl} onChange={(e) => update(idx, { mobileImageUrl: e.target.value })} />
          <Input placeholder="Título (opcional)" value={banner.title || ''} onChange={(e) => update(idx, { title: e.target.value })} />
          <Input placeholder="Descrição (opcional)" value={banner.description || ''} onChange={(e) => update(idx, { description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Texto do botão" value={banner.buttonText || ''} onChange={(e) => update(idx, { buttonText: e.target.value })} />
            <Input placeholder="Link do botão" value={banner.buttonUrl || ''} onChange={(e) => update(idx, { buttonUrl: e.target.value })} />
          </div>
          <Input placeholder="Link de destino" value={banner.linkUrl} onChange={(e) => update(idx, { linkUrl: e.target.value })} />
          <Input placeholder="Texto alternativo" value={banner.altText} onChange={(e) => update(idx, { altText: e.target.value })} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar banner
      </Button>
    </div>
  );
}

/* ── Testimonials Editor ───────────────────────────────── */
function TestimonialsEditor({
  testimonials,
  onChange,
}: {
  testimonials: { name: string; text: string; rating: number; avatarUrl: string }[];
  onChange: (testimonials: { name: string; text: string; rating: number; avatarUrl: string }[]) => void;
}) {
  const add = () => onChange([...testimonials, { name: '', text: '', rating: 5, avatarUrl: '' }]);
  const remove = (idx: number) => onChange(testimonials.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<typeof testimonials[number]>) =>
    onChange(testimonials.map((t, i) => (i === idx ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-3">
      {testimonials.map((t, idx) => (
        <div key={idx} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Depoimento {idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <div>
            <Label className="text-xs">Imagem</Label>
            <Input value={t.avatarUrl} onChange={(e) => update(idx, { avatarUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 250px × 250px</p>
          </div>
          <Input placeholder="Nome" value={t.name} onChange={(e) => update(idx, { name: e.target.value })} />
          <Textarea placeholder="Descrição" value={t.text} onChange={(e) => update(idx, { text: e.target.value })} rows={3} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar depoimento
      </Button>
    </div>
  );
}

/* ── Shipping Info Editor ──────────────────────────────── */
function ShippingInfoEditor({
  items,
  onChange,
}: {
  items: { icon: string; title: string; description: string; imageUrl?: string; linkUrl?: string }[];
  onChange: (items: { icon: string; title: string; description: string; imageUrl?: string; linkUrl?: string }[]) => void;
}) {
  const add = () => onChange([...items, { icon: 'truck', title: '', description: '', imageUrl: '', linkUrl: '' }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<typeof items[number]>) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const defaultLabels = ['Frete', 'Tarjetas de crédito', 'Segurança', 'Trocas e devoluções'];

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Banner {idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <div>
            <Label className="text-xs">Imagem (opcional)</Label>
            <Input value={item.imageUrl || ''} onChange={(e) => update(idx, { imageUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 120px × 120px</p>
          </div>
          <div>
            <Label className="text-xs">Ícone</Label>
            <Select value={item.icon} onValueChange={(v) => update(idx, { icon: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="truck">Frete</SelectItem>
                <SelectItem value="credit-card">Tarjetas de crédito</SelectItem>
                <SelectItem value="shield">Segurança</SelectItem>
                <SelectItem value="refresh">Trocas e devoluções</SelectItem>
                <SelectItem value="clock">Relógio (prazo)</SelectItem>
                <SelectItem value="headphones">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder={`Título (ex: ${defaultLabels[idx] || 'Título'})`} value={item.title} onChange={(e) => update(idx, { title: e.target.value })} />
          <Input placeholder="Descrição" value={item.description} onChange={(e) => update(idx, { description: e.target.value })} />
          <Input placeholder="Link (opcional)" value={item.linkUrl || ''} onChange={(e) => update(idx, { linkUrl: e.target.value })} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar informação
      </Button>
    </div>
  );
}

/* ── Category Images Editor ────────────────────────────── */
function CategoryImagesEditor({
  images,
  onChange,
}: {
  images: { imageUrl: string; categoryName?: string }[];
  onChange: (images: { imageUrl: string; categoryName?: string }[]) => void;
}) {
  const add = () => onChange([...images, { imageUrl: '', categoryName: '' }]);
  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<typeof images[number]>) =>
    onChange(images.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Tamanho recomendado: 170px × 80px</p>
      {images.map((cat, idx) => (
        <div key={idx} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Categoria {idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <Input placeholder="Nome da categoria" value={cat.categoryName || ''} onChange={(e) => update(idx, { categoryName: e.target.value })} />
          <Input placeholder="URL da imagem" value={cat.imageUrl} onChange={(e) => update(idx, { imageUrl: e.target.value })} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar categoria
      </Button>
    </div>
  );
}

/* ── Image Text Modules Editor ─────────────────────────── */
function ImageTextModulesEditor({
  modules,
  onChange,
}: {
  modules: { imageUrl: string; title?: string; description?: string; linkUrl?: string }[];
  onChange: (modules: { imageUrl: string; title?: string; description?: string; linkUrl?: string }[]) => void;
}) {
  const add = () => onChange([...modules, { imageUrl: '', title: '', description: '', linkUrl: '' }]);
  const remove = (idx: number) => onChange(modules.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<typeof modules[number]>) =>
    onChange(modules.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Tamanho recomendado: 1920px × 900px</p>
      {modules.map((mod, idx) => (
        <div key={idx} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Módulo {idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <Input placeholder="URL da imagem" value={mod.imageUrl} onChange={(e) => update(idx, { imageUrl: e.target.value })} />
          <Input placeholder="Título (opcional)" value={mod.title || ''} onChange={(e) => update(idx, { title: e.target.value })} />
          <Textarea placeholder="Descrição (opcional)" value={mod.description || ''} onChange={(e) => update(idx, { description: e.target.value })} rows={2} />
          <Input placeholder="Link (opcional)" value={mod.linkUrl || ''} onChange={(e) => update(idx, { linkUrl: e.target.value })} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar módulo
      </Button>
    </div>
  );
}

/* ── Hero Editor ───────────────────────────────────────── */
function HeroEditor({ value, onChange }: { value: HeroSection; onChange: (v: HeroSection) => void }) {
  const set = <K extends keyof HeroSection>(key: K, val: HeroSection[K]) =>
    onChange({ ...value, [key]: val });

  const addSlide = () => {
    set('slides', [...value.slides, { imageUrl: '', mobileImageUrl: '', title: '', subtitle: '', buttonText: '', buttonUrl: '' }]);
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
        <input type="range" min={0} max={1} step={0.05} value={value.overlayOpacity}
          onChange={(e) => set('overlayOpacity', parseFloat(e.target.value))} className="mt-1 w-full" />
      </div>
      <ToggleRow label="Autoplay" checked={value.autoplay} onChange={(v) => set('autoplay', v)} />
      {value.autoplay && (
        <div>
          <Label className="text-xs">Intervalo (segundos)</Label>
          <Input type="number" min={2} max={15} value={value.autoplayInterval} onChange={(e) => set('autoplayInterval', parseInt(e.target.value) || 5)} className="mt-1" />
        </div>
      )}

      {value.type === 'video' && (
        <div>
          <Label className="text-xs">URL do vídeo</Label>
          <Input value={value.videoUrl || ''} onChange={(e) => set('videoUrl', e.target.value)} className="mt-1" placeholder="https://youtube.com/watch?v=..." />
        </div>
      )}

      {/* Slides */}
      {value.type !== 'video' && (
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase text-muted-foreground">Slides ({value.slides.length})</p>
            <Button type="button" variant="outline" size="sm" onClick={addSlide}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Slide
            </Button>
          </div>
          {value.slides.map((slide, idx) => (
            <div key={idx} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Slide {idx + 1}</span>
                <button onClick={() => removeSlide(idx)} className="text-xs text-destructive hover:underline">Remover</button>
              </div>
              <Input placeholder="URL da imagem" value={slide.imageUrl} onChange={(e) => updateSlide(idx, { imageUrl: e.target.value })} />
              <Input placeholder="URL imagem mobile (opcional)" value={slide.mobileImageUrl || ''} onChange={(e) => updateSlide(idx, { mobileImageUrl: e.target.value })} />
              <Input placeholder="Título" value={slide.title} onChange={(e) => updateSlide(idx, { title: e.target.value })} />
              <Input placeholder="Subtítulo" value={slide.subtitle} onChange={(e) => updateSlide(idx, { subtitle: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Texto do botão" value={slide.buttonText} onChange={(e) => updateSlide(idx, { buttonText: e.target.value })} />
                <Input placeholder="URL do botão" value={slide.buttonUrl} onChange={(e) => updateSlide(idx, { buttonUrl: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Product List Editor ────────────────────────────────── */
function ProductListEditor({ value, onChange }: { value: ProductListSection; onChange: (v: ProductListSection) => void }) {
  const set = <K extends keyof ProductListSection>(key: K, val: ProductListSection[K]) =>
    onChange({ ...value, [key]: val });

  // Out-of-stock settings (separate API — /products/organization)
  const [oosSettings, setOosSettings] = useState<ProductOrgSettings | null>(null);
  const [oosDirty, setOosDirty] = useState(false);

  useEffect(() => {
    productOrganizeService.getSettings().then(setOosSettings).catch(() => {});
  }, []);

  const saveOos = useCallback(async () => {
    if (!oosSettings) return;
    try {
      await productOrganizeService.saveSettings(oosSettings);
      setOosDirty(false);
      toast.success('Configurações de estoque salvas');
    } catch { toast.error('Erro ao salvar configurações de estoque'); }
  }, [oosSettings]);

  const updateOos = (patch: Partial<ProductOrgSettings>) => {
    setOosSettings((prev) => prev ? { ...prev, ...patch } : null);
    setOosDirty(true);
  };

  return (
    <div className="space-y-5">

      {/* ── Banner de categoria ── */}
      <SectionDivider label="Imagem para as categorias" />
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Tamanho recomendado: 930px × 465px<br />Pode subir uma imagem diferente para cada categoria{' '}
          <a href="/admin/products/categories" className="text-primary underline" target="_blank" rel="noopener noreferrer">por aqui</a>
        </p>
        <div className="flex gap-2 items-center">
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2 w-full h-9 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground text-xs truncate">
                {value.categoryBannerUrl ? 'Imagem selecionada' : 'Nenhum arquivo escolhido'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => set('categoryBannerUrl', ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {value.categoryBannerUrl && (
            <button
              type="button"
              onClick={() => set('categoryBannerUrl', '')}
              className="h-9 px-2 rounded-md border border-input text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {value.categoryBannerUrl && (
          <div className="mt-2 rounded-md overflow-hidden border border-border h-20 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.categoryBannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
          </div>
        )}
        <Input
          className="mt-2 text-[11px] h-8"
          placeholder="Ou cole a URL da imagem..."
          value={value.categoryBannerUrl.startsWith('data:') ? '' : value.categoryBannerUrl}
          onChange={(e) => set('categoryBannerUrl', e.target.value)}
        />
      </div>

      {/* ── Filtros ── */}
      <SectionDivider label="Filtros" />
      <p className="text-[11px] text-muted-foreground -mt-2">
        Configure os filtros da sua loja no administrador.{' '}
        <a href="/admin/products/categories" className="text-primary underline" target="_blank" rel="noopener noreferrer">
          Gerenciar categorias
        </a>
      </p>
      <ToggleRow label="Exibir filtros" checked={value.showFilters} onChange={(v) => set('showFilters', v)} />
      {value.showFilters && (
        <div>
          <Label className="text-xs">Posição dos filtros</Label>
          <Select value={value.filtersPosition} onValueChange={(v) => set('filtersPosition', v as 'left' | 'right')}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Produtos na lista ── */}
      <SectionDivider label="Produtos na lista" />
      <div>
        <Label className="text-xs">Quantidade de produtos por linha em celulares</Label>
        <Select value={String(value.mobileColumns)} onValueChange={(v) => set('mobileColumns', parseInt(v) as 1 | 2)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 produto</SelectItem>
            <SelectItem value="2">2 produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Quantidade de produtos por linha em computadores</Label>
        <Select value={String(value.columns)} onValueChange={(v) => set('columns', parseInt(v) as 2 | 3 | 4 | 5)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 produtos</SelectItem>
            <SelectItem value="3">3 produtos</SelectItem>
            <SelectItem value="4">4 produtos</SelectItem>
            <SelectItem value="5">5 produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Mostrar produtos usando:</Label>
        <Select value={value.navigation} onValueChange={(v) => set('navigation', v as 'pagination' | 'infinite-scroll')}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pagination">Navegação entre páginas</SelectItem>
            <SelectItem value="infinite-scroll">Scroll infinito</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Produtos por página</Label>
        <Input type="number" min={8} max={60} value={value.productsPerPage} onChange={(e) => set('productsPerPage', parseInt(e.target.value) || 24)} className="mt-1" />
      </div>
      <ToggleRow label="Exibir ordenação" checked={value.showSort} onChange={(v) => set('showSort', v)} />

      {/* ── Compra rápida ── */}
      <SectionDivider label="Compra rápida" />
      <ToggleRow label="Compra rápida" checked={value.quickBuy} onChange={(v) => set('quickBuy', v)} />
      <p className="text-[11px] text-muted-foreground -mt-2">Permitir que seus clientes possam agregar produtos ao seu carrinho rapidamente na lista de produtos</p>

      {/* ── Variações de cor ── */}
      <SectionDivider label="Variações de cor" />
      <ToggleRow label="Variações de cor" checked={value.showColorVariants ?? true} onChange={(v) => set('showColorVariants', v)} />
      <p className="text-[11px] text-muted-foreground -mt-2">Mostrar variações de cores na lista de produtos</p>

      {/* ── Fotos do produto ── */}
      <SectionDivider label="Fotos do produto" />
      <ToggleRow
        label="Mostrar a segunda foto ao colocar o mouse"
        checked={value.showSecondImageOnHover ?? true}
        onChange={(v) => set('showSecondImageOnHover', v)}
      />
      <ToggleRow
        label="Exibir fotos em um carrossel para cada produto"
        checked={value.showImageCarousel ?? true}
        onChange={(v) => set('showImageCarousel', v)}
      />
      <p className="text-[11px] text-muted-foreground -mt-2">O carrossel se aplica somente a listagens de categorias e resultados de pesquisa</p>

      {/* ── Informações das parcelas ── */}
      <SectionDivider label="Informações das parcelas" />
      <ToggleRow label="Mostrar parcelas na lista de produtos" checked={value.showInstallments ?? false} onChange={(v) => set('showInstallments', v)} />

      {/* ── Avançado ── */}
      <SectionDivider label="Avançado" />
      <ToggleRow label="Visualização rápida" checked={value.quickView} onChange={(v) => set('quickView', v)} />
      <ToggleRow label="Grade irregular" checked={value.showIrregularGrid} onChange={(v) => set('showIrregularGrid', v)} />
      <div>
        <Label className="text-xs">Efeito de zoom ao passar o mouse</Label>
        <Select value={value.hoverEffect} onValueChange={(v) => set('hoverEffect', v as ProductListSection['hoverEffect'])}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Produtos sem estoque ── */}
      <SectionDivider label="Produtos sem estoque" />
      {oosSettings ? (
        <>
          <OosRadioGroup
            label="Produtos sem estoque nas listagens"
            value={oosSettings.outOfStockListBehavior}
            onChange={(v) => updateOos({ outOfStockListBehavior: v })}
            options={[
              { value: 'SHOW_AT_END', label: 'Mostrar no final da lista de produtos', desc: 'Produtos sem estoque aparecem depois dos que têm estoque.' },
              { value: 'MAINTAIN_ORDER', label: 'Manter a ordem original', desc: 'Os produtos sem estoque ficam onde estão.' },
              { value: 'HIDE', label: 'Ocultar na lista de produtos', desc: 'Produtos sem estoque não aparecem nas listagens.' },
            ]}
          />
          <OosRadioGroup
            label="Produtos sem estoque na busca"
            value={oosSettings.outOfStockSearchBehavior}
            onChange={(v) => updateOos({ outOfStockSearchBehavior: v })}
            options={[
              { value: 'SHOW_AT_END', label: 'Mostrar no final dos resultados', desc: 'Produtos sem estoque aparecem no final da busca.' },
              { value: 'MAINTAIN_ORDER', label: 'Manter a ordem original', desc: 'Os produtos sem estoque ficam onde estão nos resultados.' },
              { value: 'HIDE', label: 'Ocultar nos resultados', desc: 'Produtos sem estoque não aparecem na busca.' },
            ]}
          />
          {oosDirty && (
            <Button size="sm" onClick={saveOos} className="w-full">
              Salvar configurações de estoque
            </Button>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Carregando configurações...</p>
      )}
    </div>
  );
}

/* ── Product Detail Editor (Nuvemshop-style) ───────────── */
function ProductDetailEditor({ value, onChange }: { value: ProductDetailSection; onChange: (v: ProductDetailSection) => void }) {
  const set = <K extends keyof ProductDetailSection>(key: K, val: ProductDetailSection[K]) =>
    onChange({ ...value, [key]: val });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const SectionAccordion = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="border-b border-border last:border-b-0">
      <button type="button" onClick={() => toggle(id)} className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-primary transition-colors">
        {label}
        <ChevronRight className={`h-4 w-4 transition-transform ${openSections[id] ? 'rotate-90' : ''}`} />
      </button>
      {openSections[id] && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-0 divide-y-0">
      {/* Formas de entrega */}
      <SectionAccordion id="shipping" label="Formas de entrega">
        <p className="text-[11px] text-muted-foreground">Mostrar a calculadora de frete e as lojas físicas na página de produto</p>
        <ToggleRow label="Calculadora de frete" checked={value.showShippingCalculator ?? true} onChange={(v) => set('showShippingCalculator', v)} />
        <ToggleRow label="Lojas físicas para retirada" checked={value.showPhysicalStores ?? false} onChange={(v) => set('showPhysicalStores', v)} />
      </SectionAccordion>

      {/* Informações das parcelas */}
      <SectionAccordion id="installments" label="Informações das parcelas">
        <p className="text-[11px] text-muted-foreground">Mostrar parcelas na página de produto</p>
        <ToggleRow label="Mostrar parcelas" checked={value.showInstallments ?? true} onChange={(v) => set('showInstallments', v)} />
      </SectionAccordion>

      {/* Desconto por meio de pagamento */}
      <SectionAccordion id="paymentDiscount" label="Desconto por meio de pagamento">
        <p className="text-[11px] text-muted-foreground">Mostrar o preço com maior desconto nas listas, no detalhe do produto e carrinho de compras</p>
        <ToggleRow label="Ativar desconto por pagamento" checked={value.showPaymentDiscount ?? false} onChange={(v) => set('showPaymentDiscount', v)} />
        {value.showPaymentDiscount && (
          <>
            <div>
              <Label className="text-xs">Método de pagamento</Label>
              <Input className="mt-1.5" value={value.paymentDiscountMethod ?? 'Pix'} onChange={(e) => set('paymentDiscountMethod', e.target.value)} placeholder="Ex: Pix" />
            </div>
            <div>
              <Label className="text-xs">Percentual de desconto (%)</Label>
              <Input className="mt-1.5" type="number" min={0} max={100} value={value.paymentDiscountPercent ?? 10} onChange={(e) => set('paymentDiscountPercent', Number(e.target.value))} />
            </div>
          </>
        )}
      </SectionAccordion>

      {/* Variações do produto */}
      <SectionAccordion id="variants" label="Variações do produto">
        <div>
          <Label className="text-xs">Exibição de variantes</Label>
          <Select value={value.variantDisplay} onValueChange={(v) => set('variantDisplay', v as ProductDetailSection['variantDisplay'])}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dropdown">Dropdown (seletor)</SelectItem>
              <SelectItem value="buttons">Botões</SelectItem>
              <SelectItem value="color-swatches">Amostras de cor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ToggleRow label="Mostrar foto da variação de cor como botão" checked={value.showColorVariantPhoto ?? true} onChange={(v) => set('showColorVariantPhoto', v)} />
      </SectionAccordion>

      {/* Guia de medidas */}
      <SectionAccordion id="sizeGuide" label="Guia de medidas">
        <p className="text-[11px] text-muted-foreground">Quando houver um produto com variações de &apos;Tamanho&apos;, você pode incluir um pop-up na sua loja com as medidas.</p>
        <ToggleRow label="Ativar guia de medidas" checked={value.showSizeGuide ?? false} onChange={(v) => set('showSizeGuide', v)} />
        {value.showSizeGuide && (
          <div>
            <Label className="text-xs">Link da página</Label>
            <Input className="mt-1.5" value={value.sizeGuideUrl ?? ''} onChange={(e) => set('sizeGuideUrl', e.target.value)} placeholder="Ex: https://seudominio.com/guia-de-medidas/" />
          </div>
        )}
      </SectionAccordion>

      {/* SKU */}
      <SectionAccordion id="sku" label="SKU">
        <ToggleRow label="Mostrar código SKU" checked={value.showSku ?? false} onChange={(v) => set('showSku', v)} />
      </SectionAccordion>

      {/* Estoque */}
      <SectionAccordion id="stock" label="Estoque">
        <ToggleRow label="Mostrar estoque disponível" checked={value.showStock ?? false} onChange={(v) => set('showStock', v)} />
        <ToggleRow label="Último produto em estoque" checked={value.showLastUnitMessage ?? false} onChange={(v) => set('showLastUnitMessage', v)} />
        {value.showLastUnitMessage && (
          <>
            <p className="text-[11px] text-muted-foreground">Mostrar uma mensagem para incentivar a compra quando fique a última unidade de um produto</p>
            <div>
              <Label className="text-xs">Mensagem</Label>
              <Input className="mt-1.5" value={value.lastUnitMessage ?? 'Atenção, última peça!'} onChange={(e) => set('lastUnitMessage', e.target.value)} placeholder="Atenção, última peça!" />
            </div>
          </>
        )}
      </SectionAccordion>

      {/* Descrição do produto */}
      <SectionAccordion id="description" label="Descrição do produto">
        <ToggleRow label="Descrição em largura total (desktop)" checked={value.fullWidthDescription ?? false} onChange={(v) => set('fullWidthDescription', v)} />
      </SectionAccordion>

      {/* Facebook */}
      <SectionAccordion id="facebook" label="Facebook">
        <p className="text-[11px] text-muted-foreground">Permitir que seus clientes deixem comentários com seus respectivos usuários do Facebook na página de produto</p>
        <ToggleRow label="Comentários do Facebook" checked={value.showFacebookComments ?? false} onChange={(v) => set('showFacebookComments', v)} />
        {value.showFacebookComments && (
          <div>
            <Label className="text-xs">ID do seu perfil do Facebook</Label>
            <Input className="mt-1.5" value={value.facebookProfileId ?? ''} onChange={(e) => set('facebookProfileId', e.target.value)} placeholder="ID do perfil" />
            <p className="text-[10px] text-muted-foreground mt-1">É necessário caso queira moderar os comentários.</p>
          </div>
        )}
      </SectionAccordion>

      {/* Produtos relacionados */}
      <SectionAccordion id="related" label="Produtos relacionados">
        <ToggleRow label="Produtos alternativos" checked={value.showRelated ?? true} onChange={(v) => set('showRelated', v)} />
        {value.showRelated && (
          <div>
            <Label className="text-xs">Título para os produtos alternativos</Label>
            <Input className="mt-1.5" value={value.relatedTitle ?? 'Produtos similares'} onChange={(e) => set('relatedTitle', e.target.value)} placeholder="Produtos similares" />
          </div>
        )}
        <ToggleRow label="Produtos complementares" checked={value.showComplementary ?? true} onChange={(v) => set('showComplementary', v)} />
        {value.showComplementary && (
          <div>
            <Label className="text-xs">Título para os produtos complementares</Label>
            <Input className="mt-1.5" value={value.complementaryTitle ?? 'Para comprar com esse produto'} onChange={(e) => set('complementaryTitle', e.target.value)} placeholder="Para comprar com esse produto" />
          </div>
        )}
      </SectionAccordion>

      {/* Imagem + geral */}
      <SectionAccordion id="general" label="Imagem e exibição">
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
        <ToggleRow label="Zoom ao passar o mouse" checked={value.zoomOnHover} onChange={(v) => set('zoomOnHover', v)} />
        <ToggleRow label="Avaliações" checked={value.showReviews} onChange={(v) => set('showReviews', v)} />
        <ToggleRow label="Botões de compartilhar" checked={value.showShareButtons} onChange={(v) => set('showShareButtons', v)} />
        <ToggleRow label="Botão fixo 'Comprar'" checked={value.stickyAddToCart} onChange={(v) => set('stickyAddToCart', v)} />
      </SectionAccordion>
    </div>
  );
}

/* ── Cart Editor (Nuvemshop-style) ─────────────────────── */
function CartEditor({ value, onChange }: { value: CartSection; onChange: (v: CartSection) => void }) {
  const set = <K extends keyof CartSection>(key: K, val: CartSection[K]) =>
    onChange({ ...value, [key]: val });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const SectionAccordion = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="border-b border-border last:border-b-0">
      <button type="button" onClick={() => toggle(id)} className="flex w-full items-center justify-between py-3 text-sm font-medium hover:text-primary transition-colors">
        {label}
        <ChevronRight className={`h-4 w-4 transition-transform ${openSections[id] ? 'rotate-90' : ''}`} />
      </button>
      {openSections[id] && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-0 divide-y-0">
      {/* Carrinho de compras */}
      <SectionAccordion id="cart" label="Carrinho de compras">
        <ToggleRow
          label="Mostrar o botão 'Ver mais produtos' no carrinho"
          checked={value.showViewMoreButton ?? true}
          onChange={(v) => set('showViewMoreButton', v)}
        />
        <div>
          <Label className="text-xs text-muted-foreground">Valor mínimo de compra</Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Qual o valor mínimo que seus clientes devem gastar? Preencha somente se a loja for do tipo atacado. Insira 0 para desativar.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">R$</span>
            <Input
              type="number"
              min={0}
              value={value.minimumOrderValue ?? 0}
              onChange={(e) => set('minimumOrderValue', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="mt-0 flex-1"
            />
          </div>
        </div>
      </SectionAccordion>

      {/* Carrinho de compra rápida */}
      <SectionAccordion id="quickAdd" label="Carrinho de compra rápida">
        <p className="text-[11px] text-muted-foreground">
          Permitir que seus clientes adicionem produtos sem precisar ir a outra página.
        </p>
        <div>
          <Label className="text-xs text-muted-foreground">Ação ao adicionar um produto ao carrinho</Label>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {([ 
              { val: 'open-cart', label: 'Abrir o carrinho' },
              { val: 'notification', label: 'Mostrar notificação' },
            ] as const).map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => set('addToCartAction', val)}
                className={`rounded-md border px-2 py-2 text-[11px] text-center font-medium transition-colors ${
                  (value.addToCartAction ?? 'open-cart') === val
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:bg-accent/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <ToggleRow
          label="Recomendações de produtos"
          checked={value.showProductRecommendations ?? false}
          onChange={(v) => set('showProductRecommendations', v)}
        />
        <p className="text-[11px] text-muted-foreground -mt-2">
          Sugerir produtos complementares ao adicionar um ao carrinho de compra rápida.
        </p>
      </SectionAccordion>

      {/* Formas de entrega */}
      <SectionAccordion id="shipping" label="Formas de entrega">
        <p className="text-[11px] text-muted-foreground">
          Mostrar a calculadora de frete e as lojas físicas no carrinho.
        </p>
        <ToggleRow label="Calculadora de frete" checked={value.showShippingEstimate} onChange={(v) => set('showShippingEstimate', v)} />
        <ToggleRow label="Lojas físicas para retirada" checked={value.showPhysicalStoresInCart ?? false} onChange={(v) => set('showPhysicalStoresInCart', v)} />
      </SectionAccordion>

      {/* Geral */}
      <SectionAccordion id="general" label="Geral">
        <ToggleRow label="Campo de cupom" checked={value.showCouponField} onChange={(v) => set('showCouponField', v)} />
        <ToggleRow label="Notas do pedido" checked={value.showOrderNotes} onChange={(v) => set('showOrderNotes', v)} />
        <ToggleRow label="Barra de frete grátis" checked={value.showFreeShippingBar} onChange={(v) => set('showFreeShippingBar', v)} />
        <ToggleRow label="Sugestão de produtos (cross-sell)" checked={value.showCrossSell} onChange={(v) => set('showCrossSell', v)} />
      </SectionAccordion>
    </div>
  );
}

/* ── Footer Editor (Nuvemshop-style) ───────────────────── */
function FooterEditor({ value, onChange }: { value: FooterSection; onChange: (v: FooterSection) => void }) {
  const set = <K extends keyof FooterSection>(key: K, val: FooterSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
      {/* ── Cores ── */}
      <SectionDivider label="Cores" />
      <ToggleRow label="Usar estas cores para o rodapé da página" checked={value.useCustomColors} onChange={(v) => set('useCustomColors', v)} />
      {value.useCustomColors && (
        <div className="space-y-3">
          <ColorField label="Cor de fundo" value={value.bgColor} onChange={(v) => set('bgColor', v)} />
          <ColorField label="Cor dos textos e ícones" value={value.textColor} onChange={(v) => set('textColor', v)} />
        </div>
      )}

      {/* ── Logo ── */}
      <SectionDivider label="Logo" />
      <p className="text-[11px] text-muted-foreground">Escolha um logotipo para o rodapé da página (opcional)</p>
      <ToggleRow label="Exibir logo no rodapé" checked={value.showLogo} onChange={(v) => set('showLogo', v)} />
      {value.showLogo && (
        <div>
          <Label className="text-xs">URL do logotipo</Label>
          <Input value={value.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} className="mt-1" placeholder="https://..." />
          <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 60px × 40px</p>
        </div>
      )}

      {/* ── Idiomas e moedas ── */}
      <SectionDivider label="Idiomas e moedas" />
      <ToggleRow label="Mostrar idiomas e moedas no rodapé da página" checked={value.showLanguagesAndCurrencies} onChange={(v) => set('showLanguagesAndCurrencies', v)} />

      {/* ── Menus ── */}
      <SectionDivider label="Menus" />
      <p className="text-[11px] text-muted-foreground">Escolher menu para o final da página (rodapé). Caso não tenha nenhum configurado, pode fazê-lo aqui.</p>
      <ToggleRow label="Exibir menu" checked={value.showMenu} onChange={(v) => set('showMenu', v)} />
      {value.showMenu && (
        <FooterNavLinksEditor
          links={value.navigationLinks}
          onChange={(links) => set('navigationLinks', links)}
        />
      )}

      {/* ── Newsletter ── */}
      <SectionDivider label="Newsletter" />
      <ToggleRow label="Permitir que seus clientes se inscrevam para receber novidades" checked={value.showNewsletter} onChange={(v) => set('showNewsletter', v)} />
      {value.showNewsletter && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Título</Label>
            <Input value={value.newsletterTitle} onChange={(e) => set('newsletterTitle', e.target.value)} className="mt-1" placeholder="Fique por dentro" />
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={value.newsletterDescription} onChange={(e) => set('newsletterDescription', e.target.value)} className="mt-1" rows={2} placeholder="Receba novidades e promoções" />
          </div>
        </div>
      )}

      {/* ── Dados de contato ── */}
      <SectionDivider label="Dados de contato" />
      <ToggleRow label="Mostrar os dados de contato" checked={value.showContactInfo} onChange={(v) => set('showContactInfo', v)} />
      {value.showContactInfo && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">E-mail</Label>
            <Input value={value.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className="mt-1" placeholder="contato@sualoja.com" />
          </div>
          <div>
            <Label className="text-xs">Telefone</Label>
            <Input value={value.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} className="mt-1" placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label className="text-xs">Endereço</Label>
            <Textarea value={value.contactAddress} onChange={(e) => set('contactAddress', e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>
      )}

      {/* ── Redes sociais ── */}
      <SectionDivider label="Redes sociais" />
      <ToggleRow label="Exibir redes sociais" checked={value.showSocialLinks} onChange={(v) => set('showSocialLinks', v)} />
      {value.showSocialLinks && (
        <div className="space-y-2">
          {(Object.keys(value.socialLinks) as (keyof typeof value.socialLinks)[]).map((network) => (
            <div key={network}>
              <Label className="text-xs capitalize">{network}</Label>
              <Input
                value={value.socialLinks[network]}
                onChange={(e) => set('socialLinks', { ...value.socialLinks, [network]: e.target.value })}
                className="mt-1"
                placeholder={`https://${network}.com/sualoja`}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Meios de envio ── */}
      <SectionDivider label="Meios de envio" />
      <ToggleRow label="Mostrar as opções de frete na sua loja" checked={value.showShippingIcons} onChange={(v) => set('showShippingIcons', v)} />

      {/* ── Meios de pagamento ── */}
      <SectionDivider label="Meios de pagamento" />
      <ToggleRow label="Mostrar as opções de pagamento na sua loja" checked={value.showPaymentIcons} onChange={(v) => set('showPaymentIcons', v)} />

      {/* ── Selos personalizados no rodapé ── */}
      <SectionDivider label="Selos personalizados no rodapé" />
      <p className="text-[11px] text-muted-foreground">Você pode adicionar selos de duas formas: incluindo uma imagem ou adicionando um código HTML/Javascript</p>
      <ToggleRow label="Exibir selos de segurança" checked={value.showSecuritySeals} onChange={(v) => set('showSecuritySeals', v)} />
      {value.showSecuritySeals && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">URL da imagem do selo</Label>
            <Input value={value.customSealImageUrl} onChange={(e) => set('customSealImageUrl', e.target.value)} className="mt-1" placeholder="https://..." />
            <p className="text-[10px] text-muted-foreground mt-1">Tamanho recomendado: 24px × 24px</p>
          </div>
          <div>
            <Label className="text-xs">Código HTML ou Javascript do selo</Label>
            <Textarea value={value.customSealCode} onChange={(e) => set('customSealCode', e.target.value)} className="mt-1 font-mono text-xs" rows={3} placeholder="<script>..." />
          </div>
        </div>
      )}

      {/* ── Colunas ── */}
      <SectionDivider label="Layout" />
      <div>
        <Label className="text-xs">Colunas do rodapé</Label>
        <Select value={String(value.columns)} onValueChange={(v) => set('columns', parseInt(v) as 2 | 3 | 4)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 colunas</SelectItem>
            <SelectItem value="3">3 colunas</SelectItem>
            <SelectItem value="4">4 colunas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Copyright ── */}
      <SectionDivider label="Copyright" />
      <div>
        <Label className="text-xs">Texto de copyright</Label>
        <Input
          value={value.copyrightText}
          onChange={(e) => set('copyrightText', e.target.value)}
          placeholder="© 2026 Sua Loja. Todos os direitos reservados."
          className="mt-1"
        />
      </div>
    </div>
  );
}

/* ── Footer Nav Links Editor ───────────────────────────── */
function FooterNavLinksEditor({
  links,
  onChange,
}: {
  links: { label: string; url: string }[];
  onChange: (links: { label: string; url: string }[]) => void;
}) {
  const add = () => onChange([...links, { label: '', url: '' }]);
  const remove = (idx: number) => onChange(links.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<{ label: string; url: string }>) =>
    onChange(links.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-2">
      {links.map((link, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input placeholder="Texto" value={link.label} onChange={(e) => update(idx, { label: e.target.value })} className="flex-1" />
          <Input placeholder="URL" value={link.url} onChange={(e) => update(idx, { url: e.target.value })} className="flex-1" />
          <button onClick={() => remove(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar link
      </Button>
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

  const [openSection, setOpenSection] = useState<string | null>('brand');

  const toggle = (key: string) => setOpenSection((prev) => (prev === key ? null : key));

  /* ── Reusable color picker row ── */
  const ColorRow = ({ colorKey, label, description }: { colorKey: keyof ThemeColors; label: string; description?: string }) => (
    <div className="flex items-start gap-3 py-2">
      <input
        type="color"
        value={value[colorKey]}
        onChange={(e) => set(colorKey, e.target.value)}
        className="mt-0.5 h-8 w-8 rounded-full border cursor-pointer shrink-0 appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        )}
        <Input
          value={value[colorKey]}
          onChange={(e) => set(colorKey, e.target.value)}
          className="mt-1.5 h-7 font-mono text-xs w-28"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  /* ── Collapsible section ── */
  const Section = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-border last:border-b-0">
        <button
          type="button"
          onClick={() => toggle(id)}
          className="flex w-full items-center justify-between py-3 text-left"
        >
          <span className="text-sm font-medium text-foreground">{label}</span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        {isOpen && <div className="pb-4">{children}</div>}
      </div>
    );
  };

  /* ── Preset type ── */
  type ColorPreset = { name: string; description: string; colors: ThemeColors };

  const presets: ColorPreset[] = [
    {
      name: 'Clássico Preto & Branco',
      description: 'Elegante e atemporal — ideal para moda e acessórios',
      colors: {
        primary: '#000000', secondary: '#4b5563', accent: '#ef4444',
        background: '#ffffff', text: '#111111',
        buttonBg: '#000000', buttonText: '#ffffff',
        promoBadgeBg: '#ef4444', promoBadgeText: '#ffffff',
      },
    },
    {
      name: 'Azul Corporativo',
      description: 'Confiança e profissionalismo — ideal para tech e serviços',
      colors: {
        primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b',
        background: '#f8fafc', text: '#0f172a',
        buttonBg: '#2563eb', buttonText: '#ffffff',
        promoBadgeBg: '#f59e0b', promoBadgeText: '#1a1a1a',
      },
    },
    {
      name: 'Verde Natural',
      description: 'Orgânico e sustentável — ideal para saúde e bem-estar',
      colors: {
        primary: '#16a34a', secondary: '#15803d', accent: '#ea580c',
        background: '#f0fdf4', text: '#14532d',
        buttonBg: '#16a34a', buttonText: '#ffffff',
        promoBadgeBg: '#ea580c', promoBadgeText: '#ffffff',
      },
    },
  ];

  return (
    <div className="space-y-0">
      {/* Cores da sua marca */}
      <Section id="brand" label="Cores da sua marca">
        <ColorRow colorKey="background" label="Cor de fundo" description="Cor de fundo de todas as páginas da loja" />
        <ColorRow colorKey="text" label="Cor dos textos" description="Texto principal, títulos e links" />
        <ColorRow colorKey="accent" label="Cor de destaque" description="Aparece nos textos de desconto, frete grátis e parcelamento sem juros." />
      </Section>

      {/* Botão principal */}
      <Section id="button" label="Botão principal">
        <ColorRow colorKey="buttonBg" label="Cor de fundo" description="Fundo do botão principal (Adicionar ao carrinho, Comprar, etc.)" />
        <ColorRow colorKey="buttonText" label="Cor de texto" description="Texto dentro dos botões principais" />
      </Section>

      {/* Etiquetas de promoção */}
      <Section id="promo" label="Etiquetas de promoção">
        <ColorRow colorKey="promoBadgeBg" label="Cor de fundo" description="Fundo das etiquetas de promoção e oferta" />
        <ColorRow colorKey="promoBadgeText" label="Cor de texto" description="Texto das etiquetas de promoção" />
      </Section>

      {/* Combinações pré-definidas */}
      <Section id="presets" label="Combinações pré-definidas">
        <p className="text-[11px] text-muted-foreground mb-3">
          Ideais para quando você quiser resgatar as cores padrão do layout.
        </p>

        <div className="space-y-2">
          {presets.map((preset) => {
            const isActive =
              value.primary === preset.colors.primary &&
              value.background === preset.colors.background &&
              value.buttonBg === preset.colors.buttonBg;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange(preset.colors)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  isActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex -space-x-1.5 shrink-0">
                  <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.colors.background }} />
                  <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.colors.primary }} />
                  <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.colors.buttonBg }} />
                  <div className="h-6 w-6 rounded-full border-2 border-background" style={{ backgroundColor: preset.colors.promoBadgeBg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{preset.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{preset.description}</p>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ── Fonts Editor ──────────────────────────────────────── */
const FONT_OPTIONS: { value: FontFamily; label: string; family: string }[] = [
  { value: 'inter',           label: 'Inter',           family: 'Inter, sans-serif' },
  { value: 'poppins',         label: 'Poppins',         family: 'Poppins, sans-serif' },
  { value: 'dm-sans',         label: 'DM Sans',         family: '"DM Sans", sans-serif' },
  { value: 'nunito',          label: 'Nunito',          family: 'Nunito, sans-serif' },
  { value: 'raleway',         label: 'Raleway',         family: 'Raleway, sans-serif' },
  { value: 'instrument-sans', label: 'Instrument Sans', family: '"Instrument Sans", sans-serif' },
  { value: 'piazzolla',       label: 'Piazzolla',       family: 'Piazzolla, serif' },
  { value: 'playfair',        label: 'Playfair Display',family: '"Playfair Display", Georgia, serif' },
  { value: 'lora',            label: 'Lora',            family: 'Lora, Georgia, serif' },
  { value: 'georgia',         label: 'Georgia',         family: 'Georgia, serif' },
  { value: 'system',          label: 'System UI',       family: 'system-ui, sans-serif' },
];

function FontsEditor({ value, onChange }: { value: ThemeTypography; onChange: (v: ThemeTypography) => void }) {
  const set = <K extends keyof ThemeTypography>(key: K, val: ThemeTypography[K]) =>
    onChange({ ...value, [key]: val });

  // 'heading' | 'body' | null — which font picker is open
  const [pickerOpen, setPickerOpen] = useState<'heading' | 'body' | null>(null);

  const headingFont = FONT_OPTIONS.find((f) => f.value === value.headingFont) ?? FONT_OPTIONS[0];
  const bodyFont   = FONT_OPTIONS.find((f) => f.value === value.bodyFont)    ?? FONT_OPTIONS[0];

  /* ── Font picker sub-panel ── */
  if (pickerOpen) {
    const isHeading = pickerOpen === 'heading';
    const currentVal = isHeading ? value.headingFont : value.bodyFont;
    return (
      <div>
        <button
          type="button"
          onClick={() => setPickerOpen(null)}
          className="flex items-center gap-1.5 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {isHeading ? 'Títulos' : 'Textos'}
        </button>
        <p className="text-xs text-muted-foreground mb-3">Escolha a fonte para {isHeading ? 'títulos e destaques' : 'textos e parágrafos'}</p>
        <div className="space-y-1.5">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                set(isHeading ? 'headingFont' : 'bodyFont', f.value);
                setPickerOpen(null);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                currentVal === f.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5" style={{ fontFamily: f.family }}>
                  AaBbCc — Sua loja aqui
                </p>
              </div>
              {currentVal === f.value && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Shared row renderers ── */
  const FontRow = ({ label, font, onClick }: { label: string; font: typeof headingFont; onClick: () => void }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60">
      <span className="text-sm text-muted-foreground w-20 shrink-0">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <span style={{ fontFamily: font.family }}>{font.label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );

  const SizeRow = ({ label, val, min, max, onChangeVal }: { label: string; val: number; min: number; max: number; onChangeVal: (n: number) => void }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/60">
      <span className="text-sm text-muted-foreground w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={val}
        onChange={(e) => onChangeVal(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
      />
      <div className="w-10 shrink-0">
        <Input
          type="number"
          min={min}
          max={max}
          value={val}
          onChange={(e) => onChangeVal(Math.min(max, Math.max(min, Number(e.target.value))))}
          className="h-7 px-1.5 text-xs text-center font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );

  return (
    <div>
      {/* Títulos */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Títulos</h3>
        <FontRow label="Fonte" font={headingFont} onClick={() => setPickerOpen('heading')} />
        <SizeRow
          label="Tamanho"
          val={value.headingSize ?? 28}
          min={12}
          max={72}
          onChangeVal={(n) => set('headingSize', n)}
        />
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-muted-foreground w-20 shrink-0">Estilo</span>
          <button
            type="button"
            onClick={() => set('headingBold', !value.headingBold)}
            title="Negrito"
            className={`h-8 w-8 rounded-md border text-sm font-bold transition-colors ${
              value.headingBold ?? true
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-accent/50'
            }`}
          >
            B
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        {/* Textos */}
        <h3 className="text-sm font-semibold text-foreground mb-1">Textos</h3>
        <FontRow label="Fonte" font={bodyFont} onClick={() => setPickerOpen('body')} />
        <SizeRow
          label="Tamanho"
          val={value.bodySize ?? 14}
          min={10}
          max={24}
          onChangeVal={(n) => set('bodySize', n)}
        />
      </div>
    </div>
  );
}

/* ── Design Options Editor ─────────────────────────────── */
function DesignOptionsEditor({ value, onChange }: { value: ThemeDesign; onChange: (v: ThemeDesign) => void }) {
  const set = <K extends keyof ThemeDesign>(key: K, val: ThemeDesign[K]) =>
    onChange({ ...value, [key]: val });

  const width = typeof value.containerWidth === 'number' ? value.containerWidth : 1260;

  return (
    <div>
      {/* Largura da página */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Largura da página</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Defina a largura principal da página (só em computadores)
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-14 shrink-0">Largura</span>
          <input
            type="range"
            min={800}
            max={1600}
            step={10}
            value={width}
            onChange={(e) => set('containerWidth', Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
          />
          <div className="w-16 shrink-0">
            <Input
              type="number"
              min={800}
              max={1600}
              step={10}
              value={width}
              onChange={(e) => {
                const v = Math.min(1600, Math.max(800, Number(e.target.value)));
                set('containerWidth', v);
              }}
              className="h-7 px-1.5 text-xs text-center font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-5 mb-6">
        {/* Arredondamento */}
        <h3 className="text-sm font-semibold text-foreground mb-3">Arredondamento dos cantos</h3>
        <div className="grid grid-cols-5 gap-2">
          {([
            { val: 'none', label: 'Nenhum', radius: '0px' },
            { val: 'small', label: 'Sutil', radius: '4px' },
            { val: 'medium', label: 'Médio', radius: '8px' },
            { val: 'large', label: 'Grande', radius: '16px' },
            { val: 'full', label: 'Pill', radius: '9999px' },
          ] as const).map(({ val, label, radius }) => (
            <button
              key={val}
              type="button"
              onClick={() => set('borderRadius', val)}
              className={`flex flex-col items-center gap-1.5 rounded-md border p-2.5 transition-colors ${
                value.borderRadius === val ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent/50'
              }`}
            >
              <div className="h-8 w-8 border-2 border-foreground/40" style={{ borderRadius: radius }} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        {/* Estilo dos botões */}
        <h3 className="text-sm font-semibold text-foreground mb-3">Estilo dos botões</h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { val: 'filled', label: 'Preenchido' },
            { val: 'outline', label: 'Contorno' },
            { val: 'pill', label: 'Arredondado' },
          ] as const).map(({ val, label }) => (
            <button
              key={val}
              type="button"
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
    </div>
  );
}

/* ── Brand Editor (Logo + Favicon) ─────────────────────── */
function BrandEditor({ value, onChange }: { value: ThemeDesign; onChange: (v: ThemeDesign) => void }) {
  const set = <K extends keyof ThemeDesign>(key: K, val: ThemeDesign[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Configure o logotipo e o favicon da sua loja.
      </p>
      {/* Logo */}
      <div className="space-y-1.5">
        <Label className="text-xs">URL do logotipo</Label>
        <Input value={value.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://cdn.../logo.png" />
        {value.logoUrl && (
          <div className="mt-2 flex items-center justify-center rounded-md border bg-muted/30 p-4">
            <img src={value.logoUrl} alt="Logo" className="max-h-12 max-w-[180px] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">Recomendado: PNG ou SVG com fundo transparente. Max 200px de altura.</p>
      </div>
      {/* Favicon */}
      <div className="space-y-1.5">
        <Label className="text-xs">URL do favicon</Label>
        <Input value={value.faviconUrl} onChange={(e) => set('faviconUrl', e.target.value)} placeholder="https://cdn.../favicon.ico" />
        {value.faviconUrl && (
          <div className="mt-2 flex items-center gap-2">
            <img src={value.faviconUrl} alt="Favicon" className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xs text-muted-foreground">Preview do favicon</span>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">Recomendado: 32×32px .ico ou .png</p>
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 rounded border cursor-pointer shrink-0" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 font-mono text-xs" />
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── Product Picker Inline ──────────────────────────────── */
function ProductPickerInline({
  selectedIds,
  onChange,
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load selected products on mount
  useEffect(() => {
    if (selectedIds.length === 0) { setSelected([]); return; }
    productService.listAll({}).then((all) => {
      const picked = selectedIds.map((id) => all.find((p) => p.id === id)).filter(Boolean) as Product[];
      setSelected(picked);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    productService.listAll({ search: q }).then((data) => {
      setResults(data.filter((p) => !selectedIds.includes(p.id)).slice(0, 10));
    }).catch(() => setResults([])).finally(() => setSearching(false));
  }, [selectedIds]);

  const handleSearchChange = (q: string) => {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 300);
  };

  const addProduct = (product: Product) => {
    const newIds = [...selectedIds, product.id];
    onChange(newIds);
    setSelected((prev) => [...prev, product]);
    setResults((prev) => prev.filter((p) => p.id !== product.id));
    setSearch('');
  };

  const removeProduct = (id: number) => {
    onChange(selectedIds.filter((pid) => pid !== id));
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Escolha os produtos em destaque</Label>
      {/* Selected list */}
      {selected.length > 0 && (
        <div className="space-y-1.5">
          {selected.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
              {p.primaryImageUrl ? (
                <img src={p.primaryImageUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0"><Package className="h-3.5 w-3.5 text-muted-foreground" /></div>
              )}
              <span className="text-xs flex-1 truncate">{p.name}</span>
              <button type="button" onClick={() => removeProduct(p.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar produto por nome..."
          className="pl-8 text-xs h-8"
        />
      </div>
      {/* Results dropdown */}
      {(results.length > 0 || searching) && (
        <div className="rounded-md border border-border bg-card max-h-48 overflow-y-auto">
          {searching && <p className="text-xs text-muted-foreground p-2">Buscando...</p>}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p)}
              className="flex items-center gap-2 w-full px-2.5 py-2 hover:bg-accent transition-colors text-left"
            >
              {p.primaryImageUrl ? (
                <img src={p.primaryImageUrl} alt="" className="h-7 w-7 rounded object-cover shrink-0" />
              ) : (
                <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0"><Package className="h-3 w-3 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.price ? `R$ ${p.price.toFixed(2)}` : ''}</p>
              </div>
              <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
      {selected.length === 0 && !search && (
        <p className="text-[11px] text-muted-foreground">Nenhum produto selecionado. A seção usará os produtos marcados como destaque no catálogo.</p>
      )}
    </div>
  );
}

/* ── Out of Stock Radio Group ──────────────────────────── */
function OosRadioGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-2.5 rounded-md border p-3 cursor-pointer transition-colors ${
            value === opt.value ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-muted-foreground/40'
          }`}
        >
          <input
            type="radio"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-primary shrink-0"
          />
          <div>
            <p className="text-xs font-medium">{opt.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
