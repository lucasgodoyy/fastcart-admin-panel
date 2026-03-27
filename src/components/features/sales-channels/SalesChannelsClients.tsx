'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, ChevronUp, ExternalLink, FileText, GripVertical, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import salesChannelsService from '@/services/salesChannels';
import {
  AppearanceSettings,
  ChannelLinks,
  CustomProductAttribute,
  OnlineStoreFilterItem,
  OnlineStoreMenuItem,
  OnlineStorePageItem,
  ProductAttributeSetting,
  SalesChannelSettings,
  SocialLinks,
  UpdateSalesChannelSettingsRequest,
} from '@/types/salesChannel';

const QUERY_KEY = ['sales-channel-settings'];

const defaultSettings = (): SalesChannelSettings => ({
  storeId: 0,
  templateId: 'template-1',
  storeNiche: 'fashion',
  layoutPreset: 'fashion-classic',
  pages: [
    { title: 'Quem somos', slug: 'quem-somos', active: true, addToMenu: true },
    { title: 'Como comprar', slug: 'como-comprar', active: true, addToMenu: true },
    { title: 'Política de devolução', slug: 'politica-de-devolucao', active: true, addToMenu: false },
    { title: 'Perguntas frequentes', slug: 'perguntas-frequentes', active: true, addToMenu: false },
    { title: 'Guia de tamanhos', slug: 'guia-de-tamanhos', active: true, addToMenu: false },
    { title: 'Política de Privacidade', slug: 'politica-de-privacidade', active: true, addToMenu: false },
  ],
  menus: [
    { label: 'Home', url: '/', active: true },
    { label: 'Products', url: '/products', active: true },
    { label: 'Contact', url: '/contact', active: true },
  ],
  filters: [
    { label: 'Categoria', active: true },
    { label: 'Brand', active: true },
    { label: 'Preço', active: true },
    { label: 'Cor', active: true },
    { label: 'Tamanho', active: true },
    { label: 'Gênero', active: false },
    { label: 'Promoção', active: false },
  ],
  appearanceSettings: {
    fontFamily: 'inter',
    primaryColor: '0 0% 9%',
    heroBannerUrl: '',
    heroBannerText: '',
  },
  socialLinks: {},
  channelLinks: {},
  productAttributes: [
    { key: 'color', label: 'Cor', enabled: true, required: false },
    { key: 'size', label: 'Tamanho', enabled: true, required: false },
    { key: 'weight', label: 'Peso', enabled: false, required: false },
  ],
  customProductAttributes: [],
});

const NICHE_OPTIONS = [
  { value: 'fashion', label: 'Roupa / Moda' },
  { value: 'sport-nutrition', label: 'Sport Nutrition' },
  { value: 'beauty', label: 'Maquiagem / Beleza' },
  { value: 'cosmetics', label: 'Cosméticos / Skincare' },
  { value: 'watches-accessories', label: 'Relógio e Acessórios' },
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'wellness', label: 'Bem-estar / Wellness' },
];

const DEFAULT_ATTRIBUTES_BY_NICHE: Record<string, ProductAttributeSetting[]> = {
  fashion: [
    { key: 'color', label: 'Cor', enabled: true, required: false },
    { key: 'size', label: 'Tamanho', enabled: true, required: true },
    { key: 'weight', label: 'Peso', enabled: false, required: false },
  ],
  'sport-nutrition': [
    { key: 'color', label: 'Cor', enabled: false, required: false },
    { key: 'size', label: 'Tamanho', enabled: false, required: false },
    { key: 'weight', label: 'Peso', enabled: true, required: true },
  ],
  beauty: [
    { key: 'color', label: 'Cor', enabled: true, required: false },
    { key: 'size', label: 'Tamanho', enabled: false, required: false },
    { key: 'weight', label: 'Peso', enabled: false, required: false },
  ],
  'watches-accessories': [
    { key: 'color', label: 'Cor', enabled: true, required: false },
    { key: 'size', label: 'Tamanho', enabled: false, required: false },
    { key: 'weight', label: 'Peso', enabled: false, required: false },
  ],
  electronics: [
    { key: 'color', label: 'Cor', enabled: false, required: false },
    { key: 'size', label: 'Tamanho', enabled: false, required: false },
    { key: 'weight', label: 'Peso', enabled: true, required: false },
  ],
  cosmetics: [
    { key: 'color', label: 'Cor/Tom', enabled: true, required: true },
    { key: 'size', label: 'Tamanho', enabled: true, required: false },
    { key: 'weight', label: 'Peso', enabled: false, required: false },
  ],
  wellness: [
    { key: 'color', label: 'Cor', enabled: false, required: false },
    { key: 'size', label: 'Tamanho', enabled: true, required: false },
    { key: 'weight', label: 'Peso', enabled: true, required: false },
  ],
};

const THEME_PRESETS = [
  {
    id: 'morelia',
    name: 'Morelia',
    templateId: 'template-1',
    storeNiche: 'fashion',
    layoutPreset: 'fashion-classic',
    status: 'live' as const,
  },
  {
    id: 'patagonia',
    name: 'Patagonia',
    templateId: 'template-2',
    storeNiche: 'fashion',
    layoutPreset: 'fashion-editorial',
    status: 'draft' as const,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    templateId: 'template-3',
    storeNiche: 'electronics',
    layoutPreset: 'tech-modern',
    status: 'live' as const,
  },
  {
    id: 'glamour',
    name: 'Glamour',
    templateId: 'template-4',
    storeNiche: 'beauty',
    layoutPreset: 'beauty-luxury',
    status: 'live' as const,
  },
];

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter (moderna)' },
  { value: 'georgia', label: 'Georgia (editorial)' },
  { value: 'system', label: 'System UI (clean)' },
];

const PRIMARY_COLOR_OPTIONS = [
  { value: '0 0% 9%', label: 'Preto clássico' },
  { value: '248 45% 38%', label: 'Roxo editorial' },
  { value: '165 85% 32%', label: 'Verde essentials' },
  { value: '196 85% 36%', label: 'Azul clean' },
  { value: '340 82% 52%', label: 'Rosa beauty' },
  { value: '350 60% 45%', label: 'Rose gold' },
];

function useSalesChannelSettings() {
  const queryClient = useQueryClient();

  const query = useQuery<SalesChannelSettings>({
    queryKey: QUERY_KEY,
    queryFn: () => salesChannelsService.getSettings(),
  });

  const mutation = useMutation({
    mutationFn: (payload: UpdateSalesChannelSettingsRequest) => salesChannelsService.updateSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
      toast.success('Configurações salvas');
    },
    onError: () => {
      toast.error('Não foi possível salvar as configurações');
    },
  });

  return {
    settings: query.data ?? defaultSettings(),
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    save: (payload: UpdateSalesChannelSettingsRequest) => mutation.mutate(payload),
  };
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function OnlineStoreLayoutClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <OnlineStoreLayoutEditor
      key={settings.templateId || 'template-1'}
      initialTemplateId={settings.templateId || 'template-1'}
      initialStoreNiche={settings.storeNiche || 'fashion'}
      initialLayoutPreset={settings.layoutPreset || 'fashion-classic'}
      initialAppearanceSettings={
        settings.appearanceSettings || {
          fontFamily: 'inter',
          primaryColor: '0 0% 9%',
          heroBannerUrl: '',
          heroBannerText: '',
        }
      }
      initialProductAttributes={settings.productAttributes || defaultSettings().productAttributes}
      initialCustomProductAttributes={settings.customProductAttributes || []}
      isSaving={isSaving}
      onSave={(payload) => save(payload)}
    />
  );
}

function OnlineStoreLayoutEditor({
  initialTemplateId,
  initialStoreNiche,
  initialLayoutPreset,
  initialAppearanceSettings,
  initialProductAttributes,
  initialCustomProductAttributes,
  isSaving,
  onSave,
}: {
  initialTemplateId: string;
  initialStoreNiche: string;
  initialLayoutPreset: string;
  initialAppearanceSettings: AppearanceSettings;
  initialProductAttributes: ProductAttributeSetting[];
  initialCustomProductAttributes: CustomProductAttribute[];
  isSaving: boolean;
  onSave: (payload: UpdateSalesChannelSettingsRequest) => void;
}) {
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [storeNiche, setStoreNiche] = useState(initialStoreNiche);
  const [layoutPreset, setLayoutPreset] = useState(initialLayoutPreset);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(initialAppearanceSettings);
  const [productAttributes, setProductAttributes] = useState<ProductAttributeSetting[]>(initialProductAttributes);
  const [customAttributesText, setCustomAttributesText] = useState(
    initialCustomProductAttributes.map((item) => item.label).join(', ')
  );

  const applyNicheDefaults = (niche: string) => {
    setStoreNiche(niche);
    setProductAttributes(DEFAULT_ATTRIBUTES_BY_NICHE[niche] || defaultSettings().productAttributes);
  };

  const toggleAttribute = (key: string, field: 'enabled' | 'required') => {
    setProductAttributes((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        if (field === 'required' && !item.enabled) return item;
        const next = { ...item, [field]: !item[field] };
        if (!next.enabled) {
          next.required = false;
        }
        return next;
      })
    );
  };

  const buildCustomAttributes = (): CustomProductAttribute[] =>
    customAttributesText
      .split(',')
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({
        key: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        inputType: 'text',
        required: false,
        options: [],
      }));

  const applyThemePreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setTemplateId(preset.templateId);
    setStoreNiche(preset.storeNiche);
    setLayoutPreset(preset.layoutPreset);
    setProductAttributes(DEFAULT_ATTRIBUTES_BY_NICHE[preset.storeNiche] || defaultSettings().productAttributes);
  };

  const handleSaveLayout = () => {
    onSave({
      templateId,
      storeNiche,
      layoutPreset,
      appearanceSettings,
      productAttributes,
      customProductAttributes: buildCustomAttributes(),
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader title="Layout" description="Tema define a base visual. Layout ajusta fonte, cor principal e banner." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {THEME_PRESETS.map((preset) => {
            const isCurrent = templateId === preset.templateId && layoutPreset === preset.layoutPreset;
            return (
              <Card key={preset.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{preset.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${preset.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {preset.status === 'live' ? 'Layout atual' : 'Rascunho'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-40 rounded-md border border-border bg-linear-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
                  <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
                    <div>Template: <span className="font-medium text-foreground">{preset.templateId}</span></div>
                    <div>Nicho: <span className="font-medium text-foreground">{preset.storeNiche}</span></div>
                    <div>Preset: <span className="font-medium text-foreground">{preset.layoutPreset}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => applyThemePreset(preset.id)}>
                      {isCurrent ? 'Editando layout atual' : 'Usar tema'}
                    </Button>
                    {preset.status === 'draft' && (
                      <Button type="button" onClick={() => applyThemePreset(preset.id)}>
                        Publicar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração de tema/layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateId">Template ID</Label>
                <Input
                  id="templateId"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  placeholder="template-1"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="storeNiche">Nicho da loja</Label>
                <select
                  id="storeNiche"
                  value={storeNiche}
                  onChange={(event) => applyNicheDefaults(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {NICHE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="layoutPreset">Preset de layout</Label>
                <Input
                  id="layoutPreset"
                  value={layoutPreset}
                  onChange={(event) => setLayoutPreset(event.target.value)}
                  placeholder="fashion-classic"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fontFamily">Fonte da loja</Label>
                  <select
                    id="fontFamily"
                    value={appearanceSettings.fontFamily}
                    onChange={(event) =>
                      setAppearanceSettings((prev) => ({ ...prev, fontFamily: event.target.value }))
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {FONT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="primaryColor">Cor principal</Label>
                  <select
                    id="primaryColor"
                    value={appearanceSettings.primaryColor}
                    onChange={(event) =>
                      setAppearanceSettings((prev) => ({ ...prev, primaryColor: event.target.value }))
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {PRIMARY_COLOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="heroBannerUrl">Banner principal (URL)</Label>
                <Input
                  id="heroBannerUrl"
                  value={appearanceSettings.heroBannerUrl || ''}
                  onChange={(event) =>
                    setAppearanceSettings((prev) => ({ ...prev, heroBannerUrl: event.target.value }))
                  }
                  placeholder="https://cdn....jpg"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="heroBannerText">Texto do banner</Label>
                <Input
                  id="heroBannerText"
                  value={appearanceSettings.heroBannerText || ''}
                  onChange={(event) =>
                    setAppearanceSettings((prev) => ({ ...prev, heroBannerText: event.target.value }))
                  }
                  placeholder="Ex.: Frete grátis acima de R$199"
                  className="mt-1.5"
                />
              </div>

              <div className="space-y-2">
                <Label>Características padrão</Label>
                {productAttributes.map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-md border border-border p-3">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleAttribute(item.key, 'enabled')}
                        />
                        Exibir
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.required}
                          disabled={!item.enabled}
                          onChange={() => toggleAttribute(item.key, 'required')}
                        />
                        Obrigatório
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="customAttributes">Características customizadas (separadas por vírgula)</Label>
                <Input
                  id="customAttributes"
                  value={customAttributesText}
                  onChange={(event) => setCustomAttributesText(event.target.value)}
                  placeholder="Sabor, Voltagem, Capacidade"
                  className="mt-1.5"
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={handleSaveLayout} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar layout'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logotipo da sua marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Suba o logotipo e mantenha a identidade visual da sua loja.</p>
              <Button type="button" variant="outline" disabled>
                Subir logotipo (em breve)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da publicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Template: <span className="font-medium text-foreground">{templateId}</span></p>
              <p>Nicho: <span className="font-medium text-foreground">{storeNiche}</span></p>
              <p>Preset: <span className="font-medium text-foreground">{layoutPreset}</span></p>
              <p>Fonte: <span className="font-medium text-foreground">{appearanceSettings.fontFamily}</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function OnlineStorePagesClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <OnlineStorePagesEditor
      initialPages={settings.pages}
      isSaving={isSaving}
      onSave={(pages) => save({ pages })}
    />
  );
}

type PageTemplate = {
  key: string;
  title: string;
  description: string;
  slug: string;
  content: string;
};

const SIZE_GUIDE_CONTENT = `Informe as medidas dos seus produtos para seus clientes.

Camisetas
Tamanho  Peito    Cintura  Quadril
2PP      73-76    57-60    82-85
PP       77-82    61-66    86-91
P        83-88    67-72    92-97
M        89-94    73-78    98-103
G        95-101   79-85    104-110
GG       102-109  86-94    111-117
2GG      110-118  94-104   118-125
* Todas as medidas estão em centímetros.

Calças
Tamanho  Cintura  Quadril  Costura interna
2PP      57-60    82-85    77.5
PP       61-66    86-91    78
P        67-72    92-97    78.5
M        73-78    98-103   79
G        79-85    104-110  79.5
GG       86-94    111-117  80
2GG      94-104   118-125  80.5
* Todas as medidas estão em centímetros.`;

const PRIVACY_CONTENT = `Esta Política de Privacidade descreve como coletamos, usamos e protegemos as informações dos nossos clientes, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

1. DADOS COLETADOS
Coletamos dados como nome, e-mail, telefone, endereço e informações de pagamento para processar pedidos e melhorar sua experiência na loja.

2. USO DOS DADOS
Usamos seus dados para processar pedidos, enviar atualizações sobre compras, oferecer suporte e, mediante consentimento, enviar comunicações de marketing.

3. COMPARTILHAMENTO
Seus dados podem ser compartilhados com transportadoras e gateways de pagamento exclusivamente para execução dos pedidos.

4. SEUS DIREITOS
Você tem direito de acessar, corrigir, deletar e solicitar a portabilidade dos seus dados. Entre em contato conosco para exercer esses direitos.

5. CONTATO
Para dúvidas sobre esta política, entre em contato pelo e-mail da nossa loja.`;

const PAGE_TEMPLATES: PageTemplate[] = [
  { key: 'blank', title: 'Página em branco', description: 'Crie sua própria página do zero.', slug: 'pagina', content: '' },
  { key: 'about', title: 'Quem somos', description: 'Conte a história do seu negócio.', slug: 'quem-somos', content: '' },
  { key: 'how-to-buy', title: 'Como comprar', description: 'Passos claros do processo de compra.', slug: 'como-comprar', content: '' },
  { key: 'returns', title: 'Política de devolução', description: 'Tudo sobre trocas e devoluções.', slug: 'politica-de-devolucao', content: '' },
  { key: 'faq', title: 'Perguntas frequentes', description: 'Economize tempo com respostas rápidas.', slug: 'perguntas-frequentes', content: '' },
  { key: 'size-guide', title: 'Guia de tamanhos', description: 'Ajude clientes a escolher o tamanho.', slug: 'guia-de-tamanhos', content: SIZE_GUIDE_CONTENT },
  { key: 'privacy', title: 'Política de Privacidade', description: 'Transparência sobre uso de dados.', slug: 'politica-de-privacidade', content: PRIVACY_CONTENT },
];

type EditorForm = {
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  addToMenu: boolean;
  active: boolean;
};

function blankForm(): EditorForm {
  return { title: '', slug: 'pagina', content: '', seoTitle: '', seoDescription: '', addToMenu: true, active: true };
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'pagina'
  );
}

function OnlineStorePagesEditor({
  initialPages,
  isSaving,
  onSave,
}: {
  initialPages: OnlineStorePageItem[];
  isSaving: boolean;
  onSave: (pages: OnlineStorePageItem[]) => void;
}) {
  const [pages, setPages] = useState<OnlineStorePageItem[]>(initialPages);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<EditorForm>(blankForm());
  const [isTemplateStep, setIsTemplateStep] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const makeUniqueSlug = (baseSlug: string, excludeIndex: number | null) => {
    const normalized = slugify(baseSlug);
    const existing = new Set(
      pages
        .filter((_, i) => i !== excludeIndex)
        .map((p) => p.slug.trim().toLowerCase()),
    );
    if (!existing.has(normalized)) return normalized;
    let n = 2;
    while (existing.has(`${normalized}-${n}`)) n++;
    return `${normalized}-${n}`;
  };

  const openCreate = () => {
    setForm(blankForm());
    setEditingIndex(null);
    setIsTemplateStep(true);
    setShowSeo(false);
    setEditorOpen(true);
  };

  const openEdit = (index: number) => {
    const p = pages[index];
    setForm({
      title: p.title,
      slug: p.slug,
      content: p.content ?? '',
      seoTitle: p.seoTitle ?? '',
      seoDescription: p.seoDescription ?? '',
      addToMenu: p.addToMenu ?? false,
      active: p.active,
    });
    setEditingIndex(index);
    setIsTemplateStep(false);
    setShowSeo(false);
    setEditorOpen(true);
  };

  const applyTemplate = (tpl: PageTemplate) => {
    setForm({
      title: tpl.key === 'blank' ? '' : tpl.title,
      slug: tpl.slug,
      content: tpl.content,
      seoTitle: tpl.key === 'blank' ? '' : tpl.title,
      seoDescription: '',
      addToMenu: true,
      active: true,
    });
    setIsTemplateStep(false);
  };

  const updateField = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      seoTitle: prev.seoTitle && prev.seoTitle !== prev.title ? prev.seoTitle : value,
      slug:
        editingIndex === null && (prev.slug === 'pagina' || prev.slug === '')
          ? slugify(value)
          : prev.slug,
    }));
  };

  const handleSavePage = () => {
    const title = form.title.trim();
    if (!title) {
      toast.error('Informe o título da página.');
      return;
    }
    const resolvedSlug = makeUniqueSlug(form.slug || title, editingIndex);
    const updated: OnlineStorePageItem = {
      title,
      slug: resolvedSlug,
      content: form.content.trim(),
      seoTitle: (form.seoTitle || title).trim(),
      seoDescription: form.seoDescription.trim(),
      addToMenu: form.addToMenu,
      active: form.active,
    };

    const nextPages =
      editingIndex !== null
        ? pages.map((p, i) => (i === editingIndex ? updated : p))
        : [...pages, updated];

    setPages(nextPages);
    setEditorOpen(false);
    setHasUnsaved(true);
    toast.success(editingIndex !== null ? `Página "${title}" atualizada.` : `Página "${title}" criada.`);
  };

  const confirmRemove = (index: number) => setRemoveIndex(index);

  const handleRemove = () => {
    if (removeIndex === null) return;
    const title = pages[removeIndex].title;
    setPages((prev) => prev.filter((_, i) => i !== removeIndex));
    setRemoveIndex(null);
    setHasUnsaved(true);
    toast.success(`Página "${title}" removida.`);
  };

  const handleSaveAll = () => {
    onSave(pages);
    setHasUnsaved(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Páginas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fale sobre sua marca e compartilhe informações importantes com seus clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsaved && (
            <span className="text-xs text-amber-500">Alterações não salvas</span>
          )}
          <Button type="button" variant="outline" onClick={openCreate}>
            Criar página
          </Button>
          <Button type="button" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Page list */}
      <Card>
        {pages.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-foreground">Nenhuma página criada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie páginas para contar a história da sua marca.
              </p>
            </div>
            <Button type="button" onClick={openCreate}>
              Criar primeira página
            </Button>
          </CardContent>
        ) : (
          <div className="divide-y divide-border">
            {pages.map((page, index) => (
              <div
                key={`${page.slug}-${index}`}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">{page.title}</span>
                    <Badge
                      variant={page.active ? 'default' : 'secondary'}
                      className="shrink-0 text-xs"
                    >
                      {page.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {page.addToMenu && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        No menu
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    /pages/{page.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-3 text-xs"
                    onClick={() => openEdit(index)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => confirmRemove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end px-5 py-3">
              <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={openCreate}>
                + Adicionar página
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Remove confirmation */}
      <Dialog open={removeIndex !== null} onOpenChange={(open) => { if (!open) setRemoveIndex(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover página</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover a página{' '}
            <strong>{removeIndex !== null ? pages[removeIndex]?.title : ''}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRemoveIndex(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemove}>Remover</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent
          side="right"
          hideClose
          className="flex w-full max-w-140 flex-col gap-0 p-0"
        >
          {/* Header */}
          <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <SheetTitle className="text-base font-semibold">
              {isTemplateStep ? 'Escolher modelo' : editingIndex !== null ? 'Editar página' : 'Criar página'}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {!isTemplateStep && (
                <Button type="button" size="sm" onClick={handleSavePage}>
                  Salvar página
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setEditorOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {isTemplateStep ? (
              /* Template picker */
              <div className="space-y-3 px-6 py-5">
                <p className="text-sm text-muted-foreground">
                  Escolha um modelo para começar ou crie uma página em branco.
                </p>
                <div className="space-y-2">
                  {PAGE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted/50"
                      onClick={() => applyTemplate(tpl)}
                    >
                      <div>
                        <p className="font-medium text-foreground">{tpl.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{tpl.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Editor */
              <div className="space-y-6 px-6 py-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="page-title">
                    Título <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="page-title"
                    placeholder="Nome da sua página"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="page-content">Conteúdo</Label>
                  <textarea
                    id="page-content"
                    placeholder="Escreva o conteúdo da sua página aqui..."
                    className="min-h-60 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={form.content}
                    onChange={(e) => updateField('content', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.content.length} caracteres
                  </p>
                </div>

                <Separator />

                {/* Visibility */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Visibilidade</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Página ativa</p>
                      <p className="text-xs text-muted-foreground">
                        Quando ativa, a página fica visível na loja.
                      </p>
                    </div>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(v) => updateField('active', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Adicionar ao menu</p>
                      <p className="text-xs text-muted-foreground">
                        Exibe um link para esta página no menu de navegação.
                      </p>
                    </div>
                    <Switch
                      checked={form.addToMenu}
                      onCheckedChange={(v) => updateField('addToMenu', v)}
                    />
                  </div>
                </div>

                <Separator />

                {/* SEO & URL */}
                <div className="space-y-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => setShowSeo((prev) => !prev)}
                  >
                    <h3 className="font-medium text-foreground">SEO e URL</h3>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${showSeo ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {showSeo && (
                    <div className="space-y-4">
                      {/* URL preview */}
                      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                        <p className="text-xs font-medium text-muted-foreground">URL da página</p>
                        <div className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            sualore.com.br/pages/{form.slug || 'pagina'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="page-slug">Slug (URL)</Label>
                        <Input
                          id="page-slug"
                          placeholder="slug-da-pagina"
                          value={form.slug}
                          onChange={(e) => updateField('slug', slugify(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Apenas letras minúsculas, números e hífens.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="page-seo-title">Título SEO</Label>
                        <Input
                          id="page-seo-title"
                          placeholder={form.title || 'Título para mecanismos de busca'}
                          value={form.seoTitle}
                          onChange={(e) => updateField('seoTitle', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {form.seoTitle.length}/70 caracteres recomendados
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="page-seo-description">Descrição SEO</Label>
                        <textarea
                          id="page-seo-description"
                          placeholder="Descrição que aparece nos resultados de busca..."
                          className="min-h-24 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                          value={form.seoDescription}
                          onChange={(e) => updateField('seoDescription', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {form.seoDescription.length}/160 caracteres recomendados
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isTemplateStep && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <Button type="button" variant="ghost" onClick={() => setEditorOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSavePage}>
                Salvar página
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function OnlineStoreMenusClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <OnlineStoreMenusEditor
      key={JSON.stringify(settings.menus)}
      initialMenus={settings.menus}
      existingPages={settings.pages}
      isSaving={isSaving}
      onSave={(menus) => save({ menus })}
    />
  );
}

function OnlineStoreMenusEditor({
  initialMenus,
  existingPages,
  isSaving,
  onSave,
}: {
  initialMenus: OnlineStoreMenuItem[];
  existingPages: OnlineStorePageItem[];
  isSaving: boolean;
  onSave: (menus: OnlineStoreMenuItem[]) => void;
}) {
  type MenuTarget = 'home' | 'contact' | 'blog' | 'categories' | 'page' | 'product' | 'url';

  const FIXED_TARGET_URLS: Record<Exclude<MenuTarget, 'url' | 'page' | 'product'>, string> = {
    home: '/',
    contact: '/contact',
    blog: '/blog',
    categories: '/?view=categories',
  };

  const MENU_TARGET_OPTIONS: Array<{ value: MenuTarget; label: string }> = [
    { value: 'home', label: 'Home' },
    { value: 'page', label: 'Página da loja' },
    { value: 'categories', label: 'Categorias' },
    { value: 'product', label: 'Produto' },
    { value: 'blog', label: 'Blog' },
    { value: 'contact', label: 'Contato' },
    { value: 'url', label: 'URL externa' },
  ];

  const inferTargetFromUrl = (url: string): MenuTarget => {
    const normalized = url.trim().toLowerCase();
    if (normalized.startsWith('/pages/')) return 'page';
    if (normalized.startsWith('/produtos/') || normalized.startsWith('/products/')) return 'product';
    const fixed = (Object.entries(FIXED_TARGET_URLS) as Array<[Exclude<MenuTarget, 'url' | 'page' | 'product'>, string]>).find(
      ([, targetUrl]) => targetUrl.toLowerCase() === normalized
    );
    return fixed ? fixed[0] : 'url';
  };

  const resolveUrlByTarget = (target: MenuTarget, customUrl?: string, pageSlug?: string) => {
    if (target === 'url') return (customUrl || '').trim();
    if (target === 'page') return pageSlug ? `/pages/${pageSlug}` : '';
    if (target === 'product') return (customUrl || '').trim();
    return FIXED_TARGET_URLS[target as keyof typeof FIXED_TARGET_URLS] ?? '';
  };

  const extractPageSlugFromUrl = (url: string): string => {
    const match = url.match(/^\/pages\/(.+)$/i);
    return match ? match[1] : '';
  };

  const [menus, setMenus] = useState<OnlineStoreMenuItem[]>(initialMenus);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    label: string;
    target: MenuTarget;
    customUrl: string;
    pageSlug: string;
  }>({
    label: '',
    target: 'home',
    customUrl: '',
    pageSlug: '',
  });

  const activePages = useMemo(
    () => existingPages.filter((p) => p.active !== false && p.slug && p.title),
    [existingPages]
  );

  const buildPersistedMenus = (source: OnlineStoreMenuItem[]) =>
    source
      .map((item) => ({
        label: item.label.trim(),
        url: item.url.trim(),
        active: item.active !== false,
      }))
      .filter((item) => item.label.length > 0 && item.url.length > 0);

  const updateMenus = (updater: (previous: OnlineStoreMenuItem[]) => OnlineStoreMenuItem[], autoSave = false) => {
    setMenus((previous) => {
      const next = updater(previous);
      if (autoSave) {
        onSave(buildPersistedMenus(next));
      }
      return next;
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    updateMenus((prev) => {
      if (swapIndex < 0 || swapIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    }, true);
  };

  const resetCreateForm = () => {
    setCreateForm({ label: '', target: 'home', customUrl: '', pageSlug: '' });
  };

  const handleAddMenu = () => {
    const label = createForm.label.trim();
    const url = resolveUrlByTarget(createForm.target, createForm.customUrl, createForm.pageSlug);

    if (!label) {
      toast.error('Informe o nome do link');
      return;
    }
    if (!url) {
      toast.error('Informe para onde o link deve levar');
      return;
    }

    updateMenus((previous) => [...previous, { label, url, active: true }], true);
    setIsCreateDialogOpen(false);
    resetCreateForm();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader title="Menus" description="Defina os links de navegação da sua loja online." />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Menu principal</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" onClick={resetCreateForm}>
                + Novo link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo link de menu</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div>
                  <Label>Nome exibido</Label>
                  <Input
                    className="mt-1.5"
                    value={createForm.label}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, label: event.target.value }))}
                    placeholder="Ex.: Início"
                    autoFocus
                  />
                </div>

                <div>
                  <Label>Destino</Label>
                  <select
                    className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={createForm.target}
                    onChange={(event) => {
                      const target = event.target.value as MenuTarget;
                      setCreateForm((prev) => ({ ...prev, target, customUrl: '', pageSlug: '' }));
                    }}
                  >
                    {MENU_TARGET_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {createForm.target === 'page' && (
                  <div>
                    <Label>Escolher página</Label>
                    {activePages.length === 0 ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Nenhuma página ativa cadastrada. Crie páginas na aba <strong>Páginas</strong>.
                      </p>
                    ) : (
                      <select
                        className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={createForm.pageSlug}
                        onChange={(event) => {
                          const slug = event.target.value;
                          const page = activePages.find((p) => p.slug === slug);
                          setCreateForm((prev) => ({
                            ...prev,
                            pageSlug: slug,
                            label: prev.label || (page?.title ?? ''),
                          }));
                        }}
                      >
                        <option value="">Selecione uma página...</option>
                        {activePages.map((page) => (
                          <option key={page.slug} value={page.slug}>
                            {page.title}
                          </option>
                        ))}
                      </select>
                    )}
                    {createForm.pageSlug && (
                      <p className="mt-1 text-xs text-muted-foreground">URL: /pages/{createForm.pageSlug}</p>
                    )}
                  </div>
                )}

                {createForm.target === 'product' && (
                  <div>
                    <Label>URL do produto</Label>
                    <Input
                      className="mt-1.5"
                      value={createForm.customUrl}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, customUrl: event.target.value }))}
                      placeholder="/produtos/meu-produto"
                    />
                  </div>
                )}

                {createForm.target === 'url' && (
                  <div>
                    <Label>URL</Label>
                    <Input
                      className="mt-1.5"
                      value={createForm.customUrl}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, customUrl: event.target.value }))}
                      placeholder="https://... ou /pagina-custom"
                    />
                  </div>
                )}

                {!['url', 'page', 'product'].includes(createForm.target) && (
                  <p className="text-xs text-muted-foreground">
                    URL: {resolveUrlByTarget(createForm.target)}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleAddMenu} disabled={isSaving}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {menus.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <GripVertical className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Nenhum link no menu</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adicione links para Home, páginas, categorias, produtos ou URLs externas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {menus.map((menu, index) => {
                const target = inferTargetFromUrl(menu.url);
                const isEditable = target === 'url' || target === 'product';

                return (
                  <div
                    key={`${menu.label}-${index}`}
                    className="flex items-center gap-2 rounded-md border border-border bg-card p-2.5"
                  >
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(index, 'up')}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Mover para cima"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === menus.length - 1}
                        onClick={() => moveItem(index, 'down')}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Mover para baixo"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Label */}
                    <Input
                      className="h-8 min-w-0 flex-1 text-sm"
                      placeholder="Nome"
                      value={menu.label}
                      onChange={(event) =>
                        updateMenus((prev) => prev.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                      }
                      onBlur={() => onSave(buildPersistedMenus(menus))}
                    />

                    {/* Target selector */}
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={target}
                      onChange={(event) => {
                        const newTarget = event.target.value as MenuTarget;
                        const nextUrl = newTarget === 'url' || newTarget === 'product' ? '' : resolveUrlByTarget(newTarget);
                        updateMenus(
                          (prev) => prev.map((item, i) => (i === index ? { ...item, url: nextUrl } : item)),
                          newTarget !== 'url' && newTarget !== 'product' && newTarget !== 'page'
                        );
                      }}
                    >
                      {MENU_TARGET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* URL/Page/Product field */}
                    {target === 'page' ? (
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={extractPageSlugFromUrl(menu.url)}
                        onChange={(event) => {
                          const slug = event.target.value;
                          updateMenus(
                            (prev) => prev.map((item, i) => (i === index ? { ...item, url: slug ? `/pages/${slug}` : '' } : item)),
                            true
                          );
                        }}
                      >
                        <option value="">Selecione...</option>
                        {activePages.map((page) => (
                          <option key={page.slug} value={page.slug}>
                            {page.title}
                          </option>
                        ))}
                      </select>
                    ) : isEditable ? (
                      <Input
                        className="h-8 min-w-0 flex-1 text-xs"
                        placeholder={target === 'product' ? '/produtos/slug' : 'https://...'}
                        value={menu.url}
                        onChange={(event) =>
                          updateMenus((prev) => prev.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))
                        }
                        onBlur={() => onSave(buildPersistedMenus(menus))}
                      />
                    ) : (
                      <span className="flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {menu.url}
                      </span>
                    )}

                    {/* Active toggle */}
                    <label className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5"
                        checked={menu.active !== false}
                        onChange={(event) =>
                          updateMenus(
                            (prev) => prev.map((item, i) => (i === index ? { ...item, active: event.target.checked } : item)),
                            true
                          )
                        }
                      />
                      Exibir
                    </label>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => updateMenus((prev) => prev.filter((_, i) => i !== index), true)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remover link"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={() => onSave(buildPersistedMenus(menus))} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar menus'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnlineStoreFiltersClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <OnlineStoreFiltersEditor
      key={JSON.stringify(settings.filters)}
      initialFilters={settings.filters}
      isSaving={isSaving}
      onSave={(filters) => save({ filters })}
    />
  );
}

function OnlineStoreFiltersEditor({
  initialFilters,
  isSaving,
  onSave,
}: {
  initialFilters: OnlineStoreFilterItem[];
  isSaving: boolean;
  onSave: (filters: OnlineStoreFilterItem[]) => void;
}) {
  const MAIN_FILTERS = [
    { id: 'category', label: 'Categoria', description: 'Filtra por categoria de produto', defaultActive: true },
    { id: 'brand', label: 'Marca', description: 'Filtra por marca', defaultActive: true },
    { id: 'price', label: 'Preço', description: 'Filtra por faixa de preço', defaultActive: true },
    { id: 'color', label: 'Cor', description: 'Filtra por cor', defaultActive: true },
    { id: 'size', label: 'Tamanho', description: 'Filtra por tamanho/variação', defaultActive: true },
    { id: 'gender', label: 'Gênero', description: 'Filtra por gênero', defaultActive: false },
    { id: 'sale', label: 'Promoção', description: 'Filtra por produtos em oferta', defaultActive: false },
  ] as const;

  const UPCOMING_FILTERS = [
    { id: 'rating', label: 'Avaliação', description: 'Filtrar por estrelas (em breve)' },
    { id: 'material', label: 'Material', description: 'Filtrar por composição (em breve)' },
  ] as const;

  const [filters, setFilters] = useState<OnlineStoreFilterItem[]>(initialFilters);

  const normalize = (value: string) => value.trim().toLowerCase();

  const isMainFilter = (label: string) => MAIN_FILTERS.some((item) => normalize(item.label) === normalize(label));

  const getMainFilterState = (label: string, fallback: boolean) => {
    const found = filters.find((item) => normalize(item.label) === normalize(label));
    return found ? !!found.active : fallback;
  };

  const buildPersistedFilters = (source: OnlineStoreFilterItem[]) => {
    const normalizedMain = MAIN_FILTERS.map((item) => {
      const found = source.find((current) => normalize(current.label) === normalize(item.label));
      return {
        label: item.label,
        active: found ? !!found.active : item.defaultActive,
      };
    });

    const customOnly = source
      .filter((item) => !isMainFilter(item.label))
      .map((item) => ({ ...item, label: item.label.trim() }))
      .filter((item) => item.label.length > 0);

    return [...normalizedMain, ...customOnly];
  };

  const updateFilters = (updater: (previous: OnlineStoreFilterItem[]) => OnlineStoreFilterItem[], autoSave = false) => {
    setFilters((previous) => {
      const next = updater(previous);
      if (autoSave) {
        onSave(buildPersistedFilters(next));
      }
      return next;
    });
  };

  const toggleMainFilter = (label: string, fallback: boolean) => {
    updateFilters((previous) => {
      const exists = previous.some((item) => normalize(item.label) === normalize(label));

      if (!exists) {
        return [...previous, { label, active: !fallback }];
      }

      return previous.map((item) =>
        normalize(item.label) === normalize(label)
          ? { ...item, active: !item.active }
          : item
      );
    }, true);
  };

  const handleSave = () => {
    onSave(buildPersistedFilters(filters));
  };

  const customFilters = filters
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isMainFilter(item.label));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader title="Filtros" description="Defina quais filtros a vitrine usa e quais estão em roadmap." />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MAIN_FILTERS.map((filter) => {
            const active = getMainFilterState(filter.label, filter.defaultActive);

            return (
              <div key={filter.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{filter.label}</p>
                  <p className="text-xs text-muted-foreground">{filter.description}</p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                    Implementado na store
                  </span>
                </div>
                <Button
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  onClick={() => toggleMainFilter(filter.label, filter.defaultActive)}
                >
                  {active ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            );
          })}

          <div className="rounded-md border border-border p-3">
            <p className="mb-2 text-sm font-medium text-foreground">Filtros customizados</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Você pode adicionar filtros extras para organizar o roadmap do lojista. Eles só aparecem na loja após implementação.
            </p>

            {customFilters.map(({ item, index }) => (
              <div key={`${item.label}-${index}`} className="mb-2 flex items-center justify-between gap-2">
                <Input
                  className="max-w-sm"
                  value={item.label}
                  onChange={(event) =>
                    updateFilters((prev) => prev.map((current, i) => (i === index ? { ...current, label: event.target.value } : current)))
                  }
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={item.active ? 'default' : 'outline'}
                    onClick={() =>
                      updateFilters(
                        (prev) => prev.map((current, i) => (i === index ? { ...current, active: !current.active } : current)),
                        true
                      )
                    }
                  >
                    {item.active ? 'Ativo' : 'Inativo'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => updateFilters((prev) => prev.filter((_, i) => i !== index), true)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => updateFilters((prev) => [...prev, { label: '', active: true }], true)}
            >
              Adicionar filtro customizado
            </Button>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="mb-2 text-sm font-medium text-foreground">Em breve</p>
            <div className="space-y-2">
              {UPCOMING_FILTERS.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">Em desenvolvimento</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Quanto mais filtros ativos o cliente combinar, mais restrita fica a lista de produtos.
          </p>

          <div className="flex justify-between pt-2">
            <span />
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              Salvar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SocialLinksClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <SocialLinksEditor
      key={JSON.stringify(settings.socialLinks)}
      initialSocialLinks={settings.socialLinks}
      isSaving={isSaving}
      onSave={(socialLinks) => save({ socialLinks })}
    />
  );
}

function SocialLinksEditor({
  initialSocialLinks,
  isSaving,
  onSave,
}: {
  initialSocialLinks: SocialLinks;
  isSaving: boolean;
  onSave: (socialLinks: SocialLinks) => void;
}) {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(initialSocialLinks);

  const fields: Array<{ key: keyof SocialLinks; label: string; placeholder?: string }> = [
    { key: 'instagram', label: 'Instagram Username' },
    { key: 'instagramToken', label: 'Instagram Token' },
    { key: 'facebook', label: 'Facebook Page Link' },
    { key: 'youtube', label: 'YouTube Channel Link' },
    { key: 'tiktok', label: 'TikTok Username' },
    { key: 'twitter', label: 'Twitter Username' },
    { key: 'pinterest', label: 'Pinterest Page Link' },
    { key: 'pinterestTag', label: 'Pinterest Tag' },
    { key: 'blog', label: 'Blog Link' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader
        title="Social Media Links"
        description="Adicione os links/redes sociais para exibição no rodapé da loja."
      />
      <Card>
        <CardContent className="space-y-4 p-6">
          {fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                className="mt-1.5"
                placeholder={field.placeholder}
                value={socialLinks[field.key] ?? ''}
                onChange={(event) => setSocialLinks((prev) => ({ ...prev, [field.key]: event.target.value }))}
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={() => onSave(socialLinks)} disabled={isSaving}>
              Salvar links sociais
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ChannelKey = keyof ChannelLinks;

export function ChannelLinkClient({
  title,
  description,
  channelKey,
}: {
  title: string;
  description: string;
  channelKey: ChannelKey;
}) {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <ChannelLinkEditor
      key={`${channelKey}-${settings.channelLinks[channelKey] ?? ''}`}
      title={title}
      description={description}
      channelKey={channelKey}
      initialValue={settings.channelLinks[channelKey] ?? ''}
      currentLinks={settings.channelLinks}
      isSaving={isSaving}
      onSave={(channelLinks) => save({ channelLinks })}
    />
  );
}

function ChannelLinkEditor({
  title,
  description,
  channelKey,
  initialValue,
  currentLinks,
  isSaving,
  onSave,
}: {
  title: string;
  description: string;
  channelKey: ChannelKey;
  initialValue: string;
  currentLinks: ChannelLinks;
  isSaving: boolean;
  onSave: (channelLinks: ChannelLinks) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const currentValue = useMemo(() => (value ?? '').trim(), [value]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuração do canal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`channel-${channelKey}`}>URL</Label>
            <Input
              id={`channel-${channelKey}`}
              className="mt-1.5"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center justify-between">
            <a
              href={currentValue || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Abrir link atual
            </a>
            <Button
              type="button"
              onClick={() => onSave({ ...currentLinks, [channelKey]: value })}
              disabled={isSaving}
            >
              Salvar canal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UnderConstructionClient() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader title="Em construção" description="Esta seção ainda está em desenvolvimento." />
      <Card>
        <CardContent className="p-4 md:p-8 text-sm text-muted-foreground">
          Em breve você poderá configurar este recurso diretamente por aqui.
        </CardContent>
      </Card>
    </div>
  );
}
