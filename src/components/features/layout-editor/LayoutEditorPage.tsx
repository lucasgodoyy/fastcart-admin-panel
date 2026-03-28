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
  X, Eye, HelpCircle, ExternalLink, ChevronRight, ChevronLeft, Plus, Trash2,
  ArrowUp, Home, LayoutGrid, ScanSearch, ShoppingCart, GripVertical,
  ArrowDown, Code2, Paintbrush, Type, Settings2, Image as ImageIcon,
  Monitor, Tablet, Smartphone, RefreshCw, Check,
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
  const [logoUrl, setLogoUrl] = useState('');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // ── Listen for "iframe ready" signal from the store ───────
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LOJAKI_PREVIEW_READY') {
        setIframeReady(true);
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
      <SidebarButton icon={<Paintbrush className="h-4 w-4 text-muted-foreground" />} label="Cores da sua loja" onClick={() => onSelectSection('colors')} />
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
        {panelKey === 'homeSections' && <HomeSectionsEditor value={sections.homeSections} hero={sections.hero} onChange={(v) => onUpdate('homeSections', v)} onHeroChange={(v) => onUpdate('hero', v)} />}
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

  return (
    <div className="space-y-5">
      {/* Colors */}
      <SectionDivider label="Cores do cabeçalho" />
      <ToggleRow label="Usar cores personalizadas" checked={value.useCustomColors} onChange={(v) => set('useCustomColors', v)} />
      {value.useCustomColors && (
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Cor de fundo" value={value.bgColor} onChange={(v) => set('bgColor', v)} />
          <ColorField label="Cor dos textos e ícones" value={value.textColor} onChange={(v) => set('textColor', v)} />
        </div>
      )}

      {/* Logo */}
      <SectionDivider label="Logo" />
      <div>
        <Label className="text-xs">Tamanho do logo</Label>
        <Select value={value.logoSize} onValueChange={(v) => set('logoSize', v as HeaderSection['logoSize'])}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Pequeno</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="large">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Features */}
      <SectionDivider label="Recursos" />
      <ToggleRow label="Exibir busca" checked={value.showSearch} onChange={(v) => set('showSearch', v)} />
      <ToggleRow label="Exibir carrinho" checked={value.showCart} onChange={(v) => set('showCart', v)} />
      <ToggleRow label="Fixar no topo ao rolar" checked={value.stickyHeader} onChange={(v) => set('stickyHeader', v)} />
      <ToggleRow label="Mostrar idiomas e moedas" checked={value.showLanguagesAndCurrencies} onChange={(v) => set('showLanguagesAndCurrencies', v)} />

      {/* Transparent header */}
      <SectionDivider label="Cabeçalho transparente" />
      <ToggleRow label="Mostrar fundo transparente" checked={value.transparentOnHero} onChange={(v) => set('transparentOnHero', v)} />
      {value.transparentOnHero && (
        <>
          <div>
            <Label className="text-xs">Aplicar transparência sobre</Label>
            <Select value={value.transparentApplyOver} onValueChange={(v) => set('transparentApplyOver', v as HeaderSection['transparentApplyOver'])}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="banners">Os banners rotativos</SelectItem>
                <SelectItem value="banners-video">Os banners rotativos e o vídeo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ToggleRow label="Usar cor e logotipo alternativos" checked={value.useAlternativeColorsOnTransparent} onChange={(v) => set('useAlternativeColorsOnTransparent', v)} />
          {value.useAlternativeColorsOnTransparent && (
            <ColorField label="Cor alternativa dos textos" value={value.alternativeTextColor} onChange={(v) => set('alternativeTextColor', v)} />
          )}
        </>
      )}

      {/* Mobile header */}
      <SectionDivider label="Cabeçalho em celulares" />
      <div>
        <Label className="text-xs">Posição do logo</Label>
        <Select value={value.mobileLogoPosition} onValueChange={(v) => set('mobileLogoPosition', v as 'left' | 'center')}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Links para carrinho e menu</Label>
        <Select value={value.mobileLinksStyle} onValueChange={(v) => set('mobileLinksStyle', v as 'text' | 'icons')}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="icons">Ícones</SelectItem>
            <SelectItem value="text">Apenas textos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Exibição da barra de pesquisa</Label>
        <Select value={value.mobileSearchDisplay} onValueChange={(v) => set('mobileSearchDisplay', v as 'icon' | 'open')}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="icon">Ícone</SelectItem>
            <SelectItem value="open">Campo aberto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcement bar */}
      <SectionDivider label="Barra de anúncio" />
      <ToggleRow
        label="Ativar barra"
        checked={value.announcementBar.enabled}
        onChange={(v) => set('announcementBar', { ...value.announcementBar, enabled: v })}
      />
      {value.announcementBar.enabled && (
        <>
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
            <ColorField label="Cor fundo" value={value.announcementBar.bgColor} onChange={(v) => set('announcementBar', { ...value.announcementBar, bgColor: v })} />
            <ColorField label="Cor texto" value={value.announcementBar.textColor} onChange={(v) => set('announcementBar', { ...value.announcementBar, textColor: v })} />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Home Sections Editor (Drag & Drop) ────────────────── */
function HomeSectionsEditor({
  value,
  hero,
  onChange,
  onHeroChange,
}: {
  value: HomeSectionItem[];
  hero: HeroSection;
  onChange: (v: HomeSectionItem[]) => void;
  onHeroChange: (v: HeroSection) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const editingSection = editingId ? value.find((s) => s.id === editingId) : null;

  if (editingSection) {
    return (
      <div>
        <button
          onClick={() => setEditingId(null)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{editingSection.title}</span>
        </button>

        {/* Hero-specific editor */}
        {editingSection.type === 'hero' && (
          <HeroEditor value={hero} onChange={onHeroChange} />
        )}

        {/* SectionItem-specific fields */}
        {(editingSection.type === 'featuredProducts' || editingSection.type === 'newProducts' || editingSection.type === 'saleProducts') && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Título da seção</Label>
              <Input value={editingSection.title} onChange={(e) => updateSection(editingSection.id, { title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Máx. produtos</Label>
              <Input type="number" min={2} max={24} value={editingSection.maxProducts || 8} onChange={(e) => updateSection(editingSection.id, { maxProducts: parseInt(e.target.value) || 8 })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Colunas</Label>
              <Select value={String(editingSection.columns || 4)} onValueChange={(v) => updateSection(editingSection.id, { columns: parseInt(v) })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 colunas</SelectItem>
                  <SelectItem value="3">3 colunas</SelectItem>
                  <SelectItem value="4">4 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Banner-type sections */}
        {(editingSection.type === 'promoBanners' || editingSection.type === 'categoryBanners' || editingSection.type === 'newsBanners' || editingSection.type === 'brandBanners') && (
          <BannerListEditor
            banners={editingSection.banners || []}
            onChange={(banners) => updateSection(editingSection.id, { banners })}
          />
        )}

        {/* Image + Text */}
        {editingSection.type === 'imageText' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">URL da imagem</Label>
              <Input value={editingSection.imageUrl || ''} onChange={(e) => updateSection(editingSection.id, { imageUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Texto</Label>
              <Textarea value={editingSection.text || ''} onChange={(e) => updateSection(editingSection.id, { text: e.target.value })} className="mt-1" rows={4} />
            </div>
            <div>
              <Label className="text-xs">Posição do texto</Label>
              <Select value={editingSection.textPosition || 'right'} onValueChange={(v) => updateSection(editingSection.id, { textPosition: v as 'left' | 'right' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Video */}
        {editingSection.type === 'video' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">URL do vídeo (YouTube/Vimeo)</Label>
              <Input value={editingSection.videoUrl || ''} onChange={(e) => updateSection(editingSection.id, { videoUrl: e.target.value })} className="mt-1" placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>
        )}

        {/* Newsletter */}
        {editingSection.type === 'newsletter' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={editingSection.newsletterTitle || ''} onChange={(e) => updateSection(editingSection.id, { newsletterTitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={editingSection.newsletterDescription || ''} onChange={(e) => updateSection(editingSection.id, { newsletterDescription: e.target.value })} className="mt-1" rows={3} />
            </div>
          </div>
        )}

        {/* Instagram */}
        {editingSection.type === 'instagramPosts' && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nome de usuário do Instagram</Label>
              <Input value={editingSection.instagramUsername || ''} onChange={(e) => updateSection(editingSection.id, { instagramUsername: e.target.value })} className="mt-1" placeholder="@sualoja" />
            </div>
          </div>
        )}

        {/* Testimonials */}
        {editingSection.type === 'testimonials' && (
          <TestimonialsEditor
            testimonials={editingSection.testimonials || []}
            onChange={(testimonials) => updateSection(editingSection.id, { testimonials })}
          />
        )}

        {/* Main product */}
        {editingSection.type === 'mainProduct' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Escolha um produto para destacar na página inicial.</p>
            <div>
              <Label className="text-xs">ID do produto</Label>
              <Input type="number" value={editingSection.productId || ''} onChange={(e) => updateSection(editingSection.id, { productId: parseInt(e.target.value) || undefined })} className="mt-1" placeholder="Ex: 123" />
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
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border bg-background p-2.5 mb-1.5">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none">
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onEdit} className="flex-1 text-left text-sm truncate hover:text-primary transition-colors">
        <span className={section.enabled ? 'text-foreground' : 'text-muted-foreground line-through'}>{section.title}</span>
      </button>
      <Switch checked={section.enabled} onCheckedChange={onToggle} />
    </div>
  );
}

/* ── Banner List Editor ────────────────────────────────── */
function BannerListEditor({
  banners,
  onChange,
}: {
  banners: { imageUrl: string; mobileImageUrl: string; linkUrl: string; altText: string }[];
  onChange: (banners: { imageUrl: string; mobileImageUrl: string; linkUrl: string; altText: string }[]) => void;
}) {
  const add = () => onChange([...banners, { imageUrl: '', mobileImageUrl: '', linkUrl: '', altText: '' }]);
  const remove = (idx: number) => onChange(banners.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<typeof banners[number]>) =>
    onChange(banners.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Tamanho recomendado: 1580px × 650px</p>
      {banners.map((banner, idx) => (
        <div key={idx} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Banner {idx + 1}</span>
            <button onClick={() => remove(idx)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <Input placeholder="URL da imagem" value={banner.imageUrl} onChange={(e) => update(idx, { imageUrl: e.target.value })} />
          <Input placeholder="URL imagem mobile (opcional)" value={banner.mobileImageUrl} onChange={(e) => update(idx, { mobileImageUrl: e.target.value })} />
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
          <Input placeholder="Nome" value={t.name} onChange={(e) => update(idx, { name: e.target.value })} />
          <Textarea placeholder="Texto do depoimento" value={t.text} onChange={(e) => update(idx, { text: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nota (1-5)</Label>
              <Input type="number" min={1} max={5} value={t.rating} onChange={(e) => update(idx, { rating: parseInt(e.target.value) || 5 })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">URL do avatar</Label>
              <Input value={t.avatarUrl} onChange={(e) => update(idx, { avatarUrl: e.target.value })} className="mt-1" placeholder="https://..." />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar depoimento
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

/* ── Product List Editor (Nuvemshop-style) ─────────────── */
function ProductListEditor({ value, onChange }: { value: ProductListSection; onChange: (v: ProductListSection) => void }) {
  const set = <K extends keyof ProductListSection>(key: K, val: ProductListSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
      <SectionDivider label="Grid de produtos" />
      <div>
        <Label className="text-xs">Produtos por linha (celular)</Label>
        <Select value={String(value.mobileColumns)} onValueChange={(v) => set('mobileColumns', parseInt(v) as 1 | 2)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 produto</SelectItem>
            <SelectItem value="2">2 produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Produtos por linha (computador)</Label>
        <Select value={String(value.columns)} onValueChange={(v) => set('columns', parseInt(v) as 2 | 3 | 4)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 produtos</SelectItem>
            <SelectItem value="3">3 produtos</SelectItem>
            <SelectItem value="4">4 produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ToggleRow label="Grade irregular" checked={value.showIrregularGrid} onChange={(v) => set('showIrregularGrid', v)} />

      <SectionDivider label="Navegação" />
      <div>
        <Label className="text-xs">Navegação entre produtos</Label>
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
        <Input type="number" min={8} max={48} value={value.productsPerPage} onChange={(e) => set('productsPerPage', parseInt(e.target.value) || 24)} className="mt-1" />
      </div>

      <SectionDivider label="Recursos" />
      <ToggleRow label="Compra rápida" checked={value.quickBuy} onChange={(v) => set('quickBuy', v)} />
      <p className="text-[11px] text-muted-foreground -mt-2">Permite adicionar ao carrinho direto da lista.</p>
      <ToggleRow label="Visualização rápida" checked={value.quickView} onChange={(v) => set('quickView', v)} />
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
      <ToggleRow label="Exibir ordenação" checked={value.showSort} onChange={(v) => set('showSort', v)} />

      <SectionDivider label="Efeito hover" />
      <div>
        <Label className="text-xs">Efeito ao passar o mouse</Label>
        <Select value={value.hoverEffect} onValueChange={(v) => set('hoverEffect', v as ProductListSection['hoverEffect'])}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="swap">Trocar imagem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SectionDivider label="Banner de categoria" />
      <div>
        <Label className="text-xs">Imagem para as categorias</Label>
        <p className="text-[11px] text-muted-foreground mb-1">Tamanho recomendado: 1580px × 220px</p>
        <Input value={value.categoryBannerUrl} onChange={(e) => set('categoryBannerUrl', e.target.value)} placeholder="https://..." className="mt-1" />
      </div>
    </div>
  );
}

/* ── Product Detail Editor (Nuvemshop-style) ───────────── */
function ProductDetailEditor({ value, onChange }: { value: ProductDetailSection; onChange: (v: ProductDetailSection) => void }) {
  const set = <K extends keyof ProductDetailSection>(key: K, val: ProductDetailSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
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
      <ToggleRow label="Calculadora de frete" checked={value.showShippingCalculator} onChange={(v) => set('showShippingCalculator', v)} />
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
      <ToggleRow label="Produtos relacionados" checked={value.showRelated} onChange={(v) => set('showRelated', v)} />
      <ToggleRow label="Avaliações" checked={value.showReviews} onChange={(v) => set('showReviews', v)} />
      <ToggleRow label="Botões de compartilhar" checked={value.showShareButtons} onChange={(v) => set('showShareButtons', v)} />
      <ToggleRow label="Botão fixo 'Comprar'" checked={value.stickyAddToCart} onChange={(v) => set('stickyAddToCart', v)} />
      <ToggleRow label="Exibir SKU" checked={value.showSku} onChange={(v) => set('showSku', v)} />
    </div>
  );
}

/* ── Cart Editor (Nuvemshop-style) ─────────────────────── */
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
      <ToggleRow label="Notas do pedido" checked={value.showOrderNotes} onChange={(v) => set('showOrderNotes', v)} />
      <ToggleRow label="Barra de frete grátis" checked={value.showFreeShippingBar} onChange={(v) => set('showFreeShippingBar', v)} />
    </div>
  );
}

/* ── Footer Editor (Nuvemshop-style) ───────────────────── */
function FooterEditor({ value, onChange }: { value: FooterSection; onChange: (v: FooterSection) => void }) {
  const set = <K extends keyof FooterSection>(key: K, val: FooterSection[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-5">
      {/* Colors */}
      <SectionDivider label="Cores do rodapé" />
      <ToggleRow label="Usar cores personalizadas" checked={value.useCustomColors} onChange={(v) => set('useCustomColors', v)} />
      {value.useCustomColors && (
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Cor de fundo" value={value.bgColor} onChange={(v) => set('bgColor', v)} />
          <ColorField label="Cor dos textos" value={value.textColor} onChange={(v) => set('textColor', v)} />
        </div>
      )}

      {/* Content */}
      <SectionDivider label="Conteúdo" />
      <ToggleRow label="Logo no rodapé" checked={value.showLogo} onChange={(v) => set('showLogo', v)} />
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

      {/* Newsletter */}
      <SectionDivider label="Newsletter" />
      <ToggleRow label="Exibir newsletter" checked={value.showNewsletter} onChange={(v) => set('showNewsletter', v)} />
      {value.showNewsletter && (
        <>
          <div>
            <Label className="text-xs">Título</Label>
            <Input value={value.newsletterTitle} onChange={(e) => set('newsletterTitle', e.target.value)} className="mt-1" placeholder="Fique por dentro" />
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={value.newsletterDescription} onChange={(e) => set('newsletterDescription', e.target.value)} className="mt-1" rows={2} placeholder="Receba novidades e promoções" />
          </div>
        </>
      )}

      {/* Social links */}
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

      {/* Contact info */}
      <SectionDivider label="Informações de contato" />
      <ToggleRow label="Exibir contato" checked={value.showContactInfo} onChange={(v) => set('showContactInfo', v)} />
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

      {/* Nav links */}
      <SectionDivider label="Links de navegação" />
      <FooterNavLinksEditor
        links={value.navigationLinks}
        onChange={(links) => set('navigationLinks', links)}
      />

      {/* Seals & payment */}
      <SectionDivider label="Selos e pagamento" />
      <ToggleRow label="Ícones de pagamento" checked={value.showPaymentIcons} onChange={(v) => set('showPaymentIcons', v)} />
      <ToggleRow label="Selos de segurança" checked={value.showSecuritySeals} onChange={(v) => set('showSecuritySeals', v)} />
      <ToggleRow label="Ícones de envio" checked={value.showShippingIcons} onChange={(v) => set('showShippingIcons', v)} />

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
        Configurações gerais de design — arredondamento, botões e largura do conteúdo.
      </p>

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
