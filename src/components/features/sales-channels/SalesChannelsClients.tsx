'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import salesChannelsService from '@/services/salesChannels';
import {
  ChannelLinks,
  OnlineStoreFilterItem,
  OnlineStoreMenuItem,
  OnlineStorePageItem,
  SalesChannelSettings,
  SocialLinks,
  UpdateSalesChannelSettingsRequest,
} from '@/types/salesChannel';

const QUERY_KEY = ['sales-channel-settings'];

const defaultSettings = (): SalesChannelSettings => ({
  storeId: 0,
  templateId: 'template-1',
  pages: [
    { title: 'Home', slug: 'home', active: true },
    { title: 'Products', slug: 'products', active: true },
    { title: 'Contact', slug: 'contact', active: true },
  ],
  menus: [
    { label: 'Home', url: '/' },
    { label: 'Products', url: '/products' },
    { label: 'Contact', url: '/contact' },
  ],
  filters: [
    { label: 'Product Variations', active: true },
    { label: 'Brand', active: true },
    { label: 'Price', active: true },
  ],
  socialLinks: {},
  channelLinks: {},
});

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
      isSaving={isSaving}
      onSave={(templateId) => save({ templateId })}
    />
  );
}

function OnlineStoreLayoutEditor({
  initialTemplateId,
  isSaving,
  onSave,
}: {
  initialTemplateId: string;
  isSaving: boolean;
  onSave: (templateId: string) => void;
}) {
  const [templateId, setTemplateId] = useState(initialTemplateId);

  return (
    <div className="p-8">
      <SectionHeader title="Layout" description="Defina o tema/layout ativo da sua loja online." />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tema atual</CardTitle>
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
          <div className="flex justify-end">
            <Button onClick={() => onSave(templateId)} disabled={isSaving}>
              Salvar layout
            </Button>
          </div>
        </CardContent>
      </Card>
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
      key={JSON.stringify(settings.pages)}
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

  const addPage = () => setPages((prev) => [...prev, { title: '', slug: '', active: true }]);

  return (
    <div className="p-8">
      <SectionHeader title="Páginas" description="Gerencie as páginas customizadas da loja." />
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
            <Button type="button" variant="outline" onClick={addPage}>
              Adicionar página
            </Button>
            <Button type="button" onClick={() => onSave(pages)} disabled={isSaving}>
              Salvar páginas
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
  const [menus, setMenus] = useState<OnlineStoreMenuItem[]>(initialMenus);

  const addMenu = () => setMenus((prev) => [...prev, { label: '', url: '' }]);

  return (
    <div className="p-8">
      <SectionHeader title="Menus" description="Defina os links de navegação da sua loja online." />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {menus.map((menu, index) => (
            <div key={`${menu.label}-${index}`} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 md:grid-cols-3">
              <Input
                placeholder="Rótulo"
                value={menu.label}
                onChange={(event) =>
                  setMenus((prev) => prev.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                }
              />
              <Input
                placeholder="URL"
                value={menu.url}
                onChange={(event) =>
                  setMenus((prev) => prev.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))
                }
              />
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={() => setMenus((prev) => prev.filter((_, i) => i !== index))}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={addMenu}>
              Adicionar link
            </Button>
            <Button type="button" onClick={() => onSave(menus)} disabled={isSaving}>
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
  const [filters, setFilters] = useState<OnlineStoreFilterItem[]>(initialFilters);

  return (
    <div className="p-8">
      <SectionHeader title="Filtros" description="Escolha quais filtros serão exibidos na listagem de produtos." />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros ativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filters.map((filter, index) => (
            <div key={`${filter.label}-${index}`} className="flex items-center justify-between rounded-md border border-border p-3">
              <Input
                className="max-w-sm"
                value={filter.label}
                onChange={(event) =>
                  setFilters((prev) => prev.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))
                }
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={filter.active ? 'default' : 'outline'}
                  onClick={() =>
                    setFilters((prev) => prev.map((item, i) => (i === index ? { ...item, active: !item.active } : item)))
                  }
                >
                  {filter.active ? 'Ativo' : 'Inativo'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFilters((prev) => prev.filter((_, i) => i !== index))}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => setFilters((prev) => [...prev, { label: '', active: true }])}>
              Adicionar filtro
            </Button>
            <Button type="button" onClick={() => onSave(filters)} disabled={isSaving}>
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
