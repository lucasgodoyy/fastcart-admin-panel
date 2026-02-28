'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  { value: 'watches-accessories', label: 'Relógio e Acessórios' },
  { value: 'electronics', label: 'Eletrônicos' },
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
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function OnlineStoreLayoutClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
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
    <div className="p-8">
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
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <OnlineStorePagesEditor
      initialPages={settings.pages}
      isSaving={isSaving}
      onSave={(pages) => save({ pages })}
    />
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);

  const SIZE_GUIDE_CONTENT = `Informe as medidas dos seus produtos para seus clientes. Você pode usar uma tabela, por exemplo.

As medidas incluídas são de referência, a ideia é que você possa personalizar com informações dos seus produtos.

Camisetas
Tamanho\tPeito\tCintura\tQuadril
2PP\t73-76\t57-60\t82-85
PP\t77-82\t61-66\t86-91
P\t83-88\t67-72\t92-97
M\t89-94\t73-78\t98-103
G\t95-101\t79-85\t104-110
GG\t102-109\t86-94\t111-117
2GG\t110-118\t94-104\t118-125
* Todas as medidas estão em centímetros.

Calças
Tamanho\tCintura\tQuadril\tCostura interna
2PP\t57-60\t82-85\t77.5
PP\t61-66\t86-91\t78
P\t67-72\t92-97\t78.5
M\t73-78\t98-103\t79
G\t79-85\t104-110\t79.5
GG\t86-94\t111-117\t80
2GG\t94-104\t118-125\t80.5
* Todas as medidas estão em centímetros.

Calçados
Medição do pé\tBR\tUS
22.1 cm\t34.5\t5
22.5 cm\t35.5\t5.5
22.9 cm\t36\t6
23.3 cm\t36.5\t6.5
23.8 cm\t37.5\t7
24.2 cm\t38\t7.5
24.6 cm\t38.5\t8
25.0 cm\t39\t8.5
25.5 cm\t39.5\t9
25.9 cm\t40\t9.5
26.3 cm\t41\t10
26.7 cm\t41.5\t10.5
27.1 cm\t42\t11
27.6 cm\t43\t11.5
28.0 cm\t43.5\t12
28.4 cm\t44\t12.5`;

  const PRIVACY_CONTENT = `É sua responsabilidade exclusiva confirmar que a sua Política de Privacidade esteja em conformidade com a LGPD. Os itens inseridos neste modelo de Política de Privacidade são apenas exemplos. É sua responsabilidade exclusiva a definição e a inclusão de todas as finalidades de tratamento, bem como da inclusão de todos os dados que serão coletados do titular, sendo o único responsável em caso de descumprimento das obrigações e dos princípios previstos na LGPD e legislação de proteção de dados aplicável.`;

  type PageTemplate = {
    key: string;
    title: string;
    description: string;
    slug: string;
    content: string;
  };

  const PAGE_TEMPLATES: PageTemplate[] = [
    {
      key: 'blank',
      title: 'Página em branco',
      description: 'Crie sua própria página do zero.',
      slug: 'pagina',
      content: '',
    },
    {
      key: 'about',
      title: 'Quem somos',
      description: 'Conte a história do seu negócio e seus protagonistas.',
      slug: 'quem-somos',
      content: '',
    },
    {
      key: 'how-to-buy',
      title: 'Como comprar',
      description: 'Passos claros e simples do processo de compra.',
      slug: 'como-comprar',
      content: '',
    },
    {
      key: 'returns',
      title: 'Política de devolução',
      description: 'Tudo sobre trocas e devoluções.',
      slug: 'politica-de-devolucao',
      content: '',
    },
    {
      key: 'faq',
      title: 'Perguntas frequentes',
      description: 'Economize tempo com respostas rápidas.',
      slug: 'perguntas-frequentes',
      content: '',
    },
    {
      key: 'size-guide',
      title: 'Guia de tamanhos',
      description: 'Ajude seus clientes a encontrar o tamanho correto.',
      slug: 'guia-de-tamanhos',
      content: SIZE_GUIDE_CONTENT,
    },
    {
      key: 'privacy',
      title: 'Política de Privacidade',
      description: 'Ajude seus clientes com sua política de privacidade.',
      slug: 'politica-de-privacidade',
      content: PRIVACY_CONTENT,
    },
  ];

  const [createForm, setCreateForm] = useState<{
    templateKey: string;
    title: string;
    content: string;
    seoTitle: string;
    seoDescription: string;
    slug: string;
    addToMenu: boolean;
  }>({
    templateKey: 'blank',
    title: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    slug: 'pagina',
    addToMenu: true,
  });

  const slugify = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'pagina';

  const makeUniqueSlug = (baseSlug: string) => {
    const normalizedBase = slugify(baseSlug);
    const existing = new Set(pages.map((page) => page.slug.trim().toLowerCase()));
    if (!existing.has(normalizedBase)) return normalizedBase;

    let index = 2;
    while (existing.has(`${normalizedBase}-${index}`)) {
      index += 1;
    }
    return `${normalizedBase}-${index}`;
  };

  const applyTemplate = (template: PageTemplate) => {
    setCreateForm({
      templateKey: template.key,
      title: template.title === 'Página em branco' ? '' : template.title,
      content: template.content,
      seoTitle: template.title === 'Página em branco' ? '' : template.title,
      seoDescription: '',
      slug: template.slug,
      addToMenu: true,
    });
  };

  const openCreateDialog = (templateKey = 'blank') => {
    const template = PAGE_TEMPLATES.find((item) => item.key === templateKey) ?? PAGE_TEMPLATES[0];
    applyTemplate(template);
    setIsCreateDialogOpen(true);
  };

  const handleCreatePage = () => {
    const title = createForm.title.trim();
    if (!title) {
      toast.error('Informe o título da página.');
      return;
    }

    const resolvedSlug = makeUniqueSlug(createForm.slug || title);
    const nextPage: OnlineStorePageItem = {
      title,
      slug: resolvedSlug,
      content: createForm.content.trim(),
      seoTitle: createForm.seoTitle.trim(),
      seoDescription: createForm.seoDescription.trim(),
      addToMenu: createForm.addToMenu,
      active: true,
    };

    setPages((prev) => [...prev, nextPage]);
    setIsCreateDialogOpen(false);
    toast.success(`Página "${title}" criada.`);
  };

  return (
    <div className="p-8">
      <SectionHeader title="Páginas" description="Fale sobre sua marca e compartilhe informações importantes com seus clientes." />

      <Card className="mb-6">
        <CardContent className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Fale sobre sua marca</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie páginas de conteúdo para contar sua história, benefícios da marca e como os clientes podem comprar.
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" onClick={() => openCreateDialog('blank')}>Criar página</Button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="left-auto right-0 top-0 h-screen max-w-[560px] translate-x-0 translate-y-0 rounded-none border-l p-0"
            >
              <DialogHeader className="border-b px-6 py-4">
                <DialogTitle className="text-4 font-semibold">Criar página</DialogTitle>
              </DialogHeader>

              <div className="max-h-[calc(100vh-84px)] space-y-4 overflow-y-auto px-6 py-5">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PAGE_TEMPLATES.map((template) => (
                      <Button
                        key={template.key}
                        type="button"
                        variant={createForm.templateKey === template.key ? 'default' : 'outline'}
                        className="justify-between"
                        onClick={() => applyTemplate(template)}
                      >
                        <span className="truncate">{template.title}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-page-title">Título</Label>
                  <Input
                    id="new-page-title"
                    placeholder="Nome da sua página"
                    value={createForm.title}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                        seoTitle: prev.seoTitle ? prev.seoTitle : event.target.value,
                        slug: prev.slug === 'pagina' || prev.slug === '' ? slugify(event.target.value) : prev.slug,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-page-content">Conteúdo</Label>
                    <Button type="button" variant="ghost" size="sm" className="text-xs" disabled>
                      Gerar com IA
                    </Button>
                  </div>
                  <textarea
                    id="new-page-content"
                    className="min-h-[180px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    value={createForm.content}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        content: event.target.value,
                      }))
                    }
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Adicione seções adicionais do editor de design para dar mais personalização à sua página.</p>
                    <div className="rounded-md border bg-muted/40 p-5 text-center">
                      <Button type="button" variant="outline" disabled>
                        Editar o design
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="cursor-pointer" onClick={() => setShowAdvancedOptions((prev) => !prev)}>
                    <CardTitle className="flex items-center justify-between text-base">
                      Opções avançadas
                      <ChevronRight className={`h-4 w-4 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} />
                    </CardTitle>
                  </CardHeader>

                  {showAdvancedOptions && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-page-seo-title">Título SEO</Label>
                        <Input
                          id="new-page-seo-title"
                          placeholder="Título SEO"
                          value={createForm.seoTitle}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, seoTitle: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-page-seo-description">Descrição SEO</Label>
                        <textarea
                          id="new-page-seo-description"
                          className="min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                          value={createForm.seoDescription}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-page-slug">URL da página</Label>
                        <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                          ...ualnuvem.com.br/{createForm.slug || 'pagina'}
                        </div>
                        <Input
                          id="new-page-slug"
                          placeholder="slug-da-pagina"
                          value={createForm.slug}
                          onChange={(event) =>
                            setCreateForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))
                          }
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={createForm.addToMenu}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, addToMenu: event.target.checked }))
                    }
                  />
                  Criar um link para esta página no menu de navegação da loja
                </label>

                <div className="flex items-center justify-between border-t pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleCreatePage}>
                    Criar
                  </Button>
                </div>

                <div className="pb-2 text-center text-sm text-muted-foreground">
                  Como criar páginas de conteúdo?
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Páginas da loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pages.map((page, index) => (
            <div key={`${page.slug}-${index}`} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-3">
              <Input
                placeholder="Título"
                value={page.title}
                onChange={(event) =>
                  setPages((prev) => prev.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)))
                }
              />
              <Input
                placeholder="Slug"
                value={page.slug}
                onChange={(event) =>
                  setPages((prev) => prev.map((item, i) => (i === index ? { ...item, slug: event.target.value } : item)))
                }
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant={page.active ? 'default' : 'outline'}
                  onClick={() =>
                    setPages((prev) => prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item)))
                  }
                >
                  {page.active ? 'Ativa' : 'Inativa'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setPages((prev) => prev.filter((_, i) => i !== index))}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => openCreateDialog('blank')}>
              Adicionar página
            </Button>
            <Button type="button" onClick={() => onSave(pages)} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar páginas'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnlineStoreMenusClient() {
  const { settings, isLoading, isSaving, save } = useSalesChannelSettings();

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <OnlineStoreMenusEditor
      key={JSON.stringify(settings.menus)}
      initialMenus={settings.menus}
      isSaving={isSaving}
      onSave={(menus) => save({ menus })}
    />
  );
}

function OnlineStoreMenusEditor({
  initialMenus,
  isSaving,
  onSave,
}: {
  initialMenus: OnlineStoreMenuItem[];
  isSaving: boolean;
  onSave: (menus: OnlineStoreMenuItem[]) => void;
}) {
  type MenuTarget = 'home' | 'contact' | 'blog' | 'categories' | 'url';

  const MENU_TARGET_URLS: Record<Exclude<MenuTarget, 'url'>, string> = {
    home: '/',
    contact: '/contact',
    blog: '/blog',
    categories: '/?view=categories',
  };

  const MENU_TARGET_OPTIONS: Array<{ value: MenuTarget; label: string }> = [
    { value: 'home', label: 'Home' },
    { value: 'contact', label: 'Contato' },
    { value: 'blog', label: 'Blog' },
    { value: 'categories', label: 'Categorias' },
    { value: 'url', label: 'URL' },
  ];

  const inferTargetFromUrl = (url: string): MenuTarget => {
    const normalized = url.trim().toLowerCase();
    const found = (Object.entries(MENU_TARGET_URLS) as Array<[Exclude<MenuTarget, 'url'>, string]>).find(
      ([, targetUrl]) => targetUrl.toLowerCase() === normalized
    );
    return found ? found[0] : 'url';
  };

  const resolveUrlByTarget = (target: MenuTarget, customUrl?: string) => {
    if (target === 'url') {
      return (customUrl || '').trim();
    }
    return MENU_TARGET_URLS[target];
  };

  const [menus, setMenus] = useState<OnlineStoreMenuItem[]>(initialMenus);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ label: string; target: MenuTarget; customUrl: string }>({
    label: '',
    target: 'home',
    customUrl: '',
  });

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

  const resetCreateForm = () => {
    setCreateForm({
      label: '',
      target: 'home',
      customUrl: '',
    });
  };

  const handleAddMenu = () => {
    const label = createForm.label.trim();
    const url = resolveUrlByTarget(createForm.target, createForm.customUrl);

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
    <div className="p-8">
      <SectionHeader title="Menus" description="Defina os links de navegação da sua loja online." />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {menus.map((menu, index) => (
            <div key={`${menu.label}-${index}`} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-5">
              <Input
                placeholder="Nome"
                value={menu.label}
                onChange={(event) =>
                  updateMenus((prev) => prev.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                }
                onBlur={() => onSave(buildPersistedMenus(menus))}
              />

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={inferTargetFromUrl(menu.url)}
                onChange={(event) => {
                  const target = event.target.value as MenuTarget;
                  const nextUrl = target === 'url' ? '' : resolveUrlByTarget(target);
                  updateMenus((prev) => prev.map((item, i) => (i === index ? { ...item, url: nextUrl } : item)), true);
                }}
              >
                {MENU_TARGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {inferTargetFromUrl(menu.url) === 'url' ? (
                <Input
                  placeholder="https://... ou /minha-pagina"
                  value={menu.url}
                  onChange={(event) =>
                    updateMenus((prev) => prev.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))
                  }
                  onBlur={() => onSave(buildPersistedMenus(menus))}
                />
              ) : (
                <Input value={menu.url} readOnly className="bg-muted text-muted-foreground" />
              )}

              <label className="inline-flex h-9 items-center gap-2 px-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={menu.active !== false}
                  onChange={(event) =>
                    updateMenus((prev) => prev.map((item, i) => (i === index ? { ...item, active: event.target.checked } : item)), true)
                  }
                />
                Exibir
              </label>

              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={() => updateMenus((prev) => prev.filter((_, i) => i !== index), true)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" onClick={resetCreateForm}>
                  Novo link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Novo link</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      className="mt-1.5"
                      value={createForm.label}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, label: event.target.value }))}
                      placeholder="Ex.: Início"
                    />
                  </div>

                  <div>
                    <Label>Leva a</Label>
                    <select
                      className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={createForm.target}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          target: event.target.value as MenuTarget,
                        }))
                      }
                    >
                      {MENU_TARGET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

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

                  <div className="flex justify-end gap-2">
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

            <Button type="button" onClick={() => onSave(buildPersistedMenus(menus))} disabled={isSaving}>
              Salvar menus
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
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
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
    <div className="p-8">
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
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
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
    <div className="p-8">
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
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
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
    <div className="p-8">
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
    <div className="p-8">
      <SectionHeader title="Em construção" description="Esta seção ainda está em desenvolvimento." />
      <Card>
        <CardContent className="p-8 text-sm text-muted-foreground">
          Em breve você poderá configurar este recurso diretamente por aqui.
        </CardContent>
      </Card>
    </div>
  );
}
