'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Facebook,
  Loader2,
  Unplug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  ShoppingBag,
  Target,
  AlertTriangle,
  Clock,
  Trash2,
  Plus,
  Play,
  Pause,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import metaAdsService from '@/services/metaAdsService';
import type {
  MetaAdsConnection,
  MetaCatalogSync,
  MetaCatalogProduct,
  MetaCampaign,
  MetaCampaignDraft,
  MetaProductSet,
  PageResponse,
} from '@/types/meta-ads';
import { CampaignWizard } from './CampaignWizard';

// ── Status Badges ────────────────────────────────────────

function ConnectionStatusBadge({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
        <CheckCircle2 className="h-3 w-3" /> Conectado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
      <XCircle className="h-3 w-3" /> Desconectado
    </span>
  );
}

function SyncStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Sincronizado
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Sincronizando
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" /> Erro
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" /> Nunca sincronizado
        </Badge>
      );
  }
}

function CampaignStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PUBLISHED':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100"><Play className="h-3 w-3 mr-1" />Publicada</Badge>;
    case 'PAUSED':
      return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Pausada</Badge>;
    case 'DRAFT':
      return <Badge variant="outline" className="text-muted-foreground"><Pencil className="h-3 w-3 mr-1" />Rascunho</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ── Main Component ──────────────────────────────────────

export function MetaAdsClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('connection');
  const [assetsDialog, setAssetsDialog] = useState(false);
  const [disconnectDialog, setDisconnectDialog] = useState(false);
  const [domainTag, setDomainTag] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<string>('');
  const [catalogPage, setCatalogPage] = useState(0);
  const [campaignPage, setCampaignPage] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<MetaCampaignDraft | null>(null);

  // Assets form
  const [adAccountId, setAdAccountId] = useState('');
  const [pageId, setPageId] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [catalogId, setCatalogId] = useState('');
  const [instagramActorId, setInstagramActorId] = useState('');

  // ── Queries ──────────────────────────────────────────

  const { data: connection, isLoading: loadingConn } = useQuery<MetaAdsConnection>({
    queryKey: ['meta-ads-connection'],
    queryFn: metaAdsService.getConnectionStatus,
    retry: false,
  });

  const { data: catalogSync } = useQuery<MetaCatalogSync>({
    queryKey: ['meta-ads-catalog-sync'],
    queryFn: metaAdsService.getCatalogSyncStatus,
    enabled: connection?.status === 'CONNECTED',
  });

  const { data: catalogProducts } = useQuery<PageResponse<MetaCatalogProduct>>({
    queryKey: ['meta-ads-catalog-products', catalogFilter, catalogPage],
    queryFn: () => metaAdsService.listCatalogProducts(catalogFilter || undefined, catalogPage),
    enabled: connection?.status === 'CONNECTED',
  });

  const { data: productSets = [] } = useQuery<MetaProductSet[]>({
    queryKey: ['meta-ads-product-sets'],
    queryFn: metaAdsService.listProductSets,
    enabled: connection?.status === 'CONNECTED',
  });

  const { data: campaigns } = useQuery<PageResponse<MetaCampaign>>({
    queryKey: ['meta-ads-campaigns', campaignPage],
    queryFn: () => metaAdsService.listCampaigns(campaignPage),
    enabled: connection?.status === 'CONNECTED',
  });

  const { data: drafts = [] } = useQuery<MetaCampaignDraft[]>({
    queryKey: ['meta-ads-drafts'],
    queryFn: metaAdsService.listDrafts,
    enabled: connection?.status === 'CONNECTED',
  });

  // ── Mutations ────────────────────────────────────────

  const connectMut = useMutation({
    mutationFn: metaAdsService.getAuthorizeUrl,
    onSuccess: (data) => {
      window.location.href = data.authorizeUrl;
    },
    onError: () => toast.error('Erro ao gerar URL de conexão.'),
  });

  const updateAssetsMut = useMutation({
    mutationFn: metaAdsService.updateAssets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-connection'] });
      toast.success('Assets atualizados com sucesso!');
      setAssetsDialog(false);
    },
    onError: () => toast.error('Erro ao atualizar assets.'),
  });

  const disconnectMut = useMutation({
    mutationFn: metaAdsService.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-connection'] });
      toast.success('Conexão removida.');
      setDisconnectDialog(false);
    },
    onError: () => toast.error('Erro ao desconectar.'),
  });

  const saveDomainTagMut = useMutation({
    mutationFn: (tag: string) => metaAdsService.saveDomainVerificationTag(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-connection'] });
      toast.success('Tag de verificação salva!');
    },
    onError: () => toast.error('Erro ao salvar tag.'),
  });

  const confirmDomainMut = useMutation({
    mutationFn: metaAdsService.confirmDomainVerified,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-connection'] });
      toast.success('Domínio confirmado como verificado!');
    },
    onError: () => toast.error('Erro ao confirmar domínio.'),
  });

  const syncCatalogMut = useMutation({
    mutationFn: metaAdsService.syncCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-catalog-sync', 'meta-ads-catalog-products'] });
      toast.success('Sincronização do catálogo iniciada!');
    },
    onError: () => toast.error('Erro ao sincronizar catálogo.'),
  });

  const publishCampaignMut = useMutation({
    mutationFn: (id: number) => metaAdsService.publishCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-campaigns'] });
      toast.success('Campanha publicada na Meta!');
    },
    onError: () => toast.error('Erro ao publicar campanha.'),
  });

  const deleteCampaignMut = useMutation({
    mutationFn: (id: number) => metaAdsService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-campaigns'] });
      toast.success('Campanha excluída.');
    },
    onError: () => toast.error('Erro ao excluir campanha.'),
  });

  const deleteDraftMut = useMutation({
    mutationFn: (id: number) => metaAdsService.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-drafts'] });
      toast.success('Rascunho excluído.');
    },
    onError: () => toast.error('Erro ao excluir rascunho.'),
  });

  // Init assets form from connection
  useEffect(() => {
    if (connection) {
      setAdAccountId(connection.adAccountId ?? '');
      setPageId(connection.pageId ?? '');
      setPixelId(connection.pixelId ?? '');
      setCatalogId(connection.catalogId ?? '');
      setInstagramActorId(connection.instagramActorId ?? '');
      setDomainTag(connection.domainVerificationTag ?? '');
    }
  }, [connection]);

  if (loadingConn) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConnected = connection?.status === 'CONNECTED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Facebook className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Meta Ads & Catálogo</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie sua conexão com Facebook/Instagram, catálogo de produtos e campanhas.
            </p>
          </div>
        </div>
        {isConnected && <ConnectionStatusBadge connected />}
        {!isConnected && <ConnectionStatusBadge connected={false} />}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connection" className="gap-1.5">
            <Facebook className="h-3.5 w-3.5" /> Conexão
          </TabsTrigger>
          <TabsTrigger value="domain" className="gap-1.5" disabled={!isConnected}>
            <Globe className="h-3.5 w-3.5" /> Domínio
          </TabsTrigger>
          <TabsTrigger value="catalog" className="gap-1.5" disabled={!isConnected}>
            <ShoppingBag className="h-3.5 w-3.5" /> Catálogo
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5" disabled={!isConnected}>
            <Target className="h-3.5 w-3.5" /> Campanhas
          </TabsTrigger>
        </TabsList>

        {/* ──────────────── Connection Tab ─────────────── */}
        <TabsContent value="connection" className="mt-6 space-y-6">
          {!isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Conectar com o Meta
                </CardTitle>
                <CardDescription>
                  Conecte sua conta do Facebook/Instagram para gerenciar anúncios, sincronizar catálogos e rastrear conversões.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => connectMut.mutate()}
                  disabled={connectMut.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {connectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Facebook className="h-4 w-4" />}
                  Conectar com Facebook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Connection Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conta Conectada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Usuário Meta</Label>
                      <p className="text-sm font-medium">{connection.metaUserId ?? '—'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Conectado em</Label>
                      <p className="text-sm font-medium">
                        {connection.connectedAt ? new Date(connection.connectedAt).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setAssetsDialog(true)}>
                      Configurar Assets
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => setDisconnectDialog(true)}
                    >
                      <Unplug className="h-3.5 w-3.5" /> Desconectar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Assets Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assets Configurados</CardTitle>
                  <CardDescription>IDs do Facebook Business como conta de anúncios, página, pixel e catálogo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: 'Ad Account ID', value: connection.adAccountId },
                      { label: 'Page ID', value: connection.pageId },
                      { label: 'Pixel ID', value: connection.pixelId },
                      { label: 'Catalog ID', value: connection.catalogId },
                      { label: 'Instagram Actor ID', value: connection.instagramActorId },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border p-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-mono mt-0.5">{item.value || <span className="text-muted-foreground italic">Não configurado</span>}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ──────────────── Domain Tab ─────────────────── */}
        <TabsContent value="domain" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Verificação de Domínio
              </CardTitle>
              <CardDescription>
                Verifique seu domínio no Meta Business para usufruir de recursos avançados como
                Conversions API e rastreamento entre domínios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Status:</Label>
                {connection?.domainVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verificado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Pendente
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domainTag">Meta Tag de Verificação</Label>
                <div className="flex gap-2">
                  <Input
                    id="domainTag"
                    value={domainTag}
                    onChange={(e) => setDomainTag(e.target.value)}
                    placeholder='<meta name="facebook-domain-verification" content="..." />'
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveDomainTagMut.mutate(domainTag)}
                    disabled={saveDomainTagMut.isPending || !domainTag}
                  >
                    {saveDomainTagMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cole aqui a meta tag fornecida pelo Meta Business Suite. Ela será injetada automaticamente no cabeçalho da sua loja.
                </p>
              </div>

              {connection?.domainVerificationTag && !connection?.domainVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => confirmDomainMut.mutate()}
                  disabled={confirmDomainMut.isPending}
                >
                  {confirmDomainMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Confirmar Verificação
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────────────── Catalog Tab ────────────────── */}
        <TabsContent value="catalog" className="mt-6 space-y-6">
          {/* Sync status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Status do Catálogo</CardTitle>
                  <CardDescription>Sincronização de produtos com o Meta Commerce Manager</CardDescription>
                </div>
                <SyncStatusBadge status={catalogSync?.syncStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {catalogSync && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{catalogSync.totalProducts ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Produtos Totais</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{catalogSync.approvedCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Sincronizados</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{catalogSync.rejectedCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Com Erro</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => syncCatalogMut.mutate()}
                disabled={syncCatalogMut.isPending}
                className="gap-1.5"
              >
                {syncCatalogMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sincronizar Agora
              </Button>

              {catalogSync?.lastSyncedAt && (
                <p className="text-xs text-muted-foreground">
                  Última sincronização: {new Date(catalogSync.lastSyncedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Products table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Produtos no Catálogo</CardTitle>
                <Select value={catalogFilter} onValueChange={(v) => { setCatalogFilter(v === 'ALL' ? '' : v); setCatalogPage(0); }}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="SYNCED">Sincronizados</SelectItem>
                    <SelectItem value="PENDING">Pendentes</SelectItem>
                    <SelectItem value="ERROR">Com Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Meta Product ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalogProducts?.content?.length ? (
                    catalogProducts.content.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell className="font-mono text-xs">{p.metaProductId || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'APPROVED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.lastSentAt ? new Date(p.lastSentAt).toLocaleString('pt-BR') : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                        Nenhum produto sincronizado. Clique em &quot;Sincronizar Agora&quot; para iniciar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {catalogProducts && catalogProducts.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Página {catalogProducts.number + 1} de {catalogProducts.totalPages} ({catalogProducts.totalElements} itens)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={catalogProducts.number === 0}
                      onClick={() => setCatalogPage((p) => Math.max(0, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={catalogProducts.number + 1 >= catalogProducts.totalPages}
                      onClick={() => setCatalogPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Sets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Conjuntos de Produtos</CardTitle>
                  <CardDescription>Use conjuntos para segmentar produtos em campanhas diferentes.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productSets.length > 0 ? (
                <div className="space-y-2">
                  {productSets.map((ps) => (
                    <div key={ps.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{ps.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{ps.metaSetId || 'Pendente'}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => metaAdsService.deleteProductSet(ps.id).then(() => {
                          queryClient.invalidateQueries({ queryKey: ['meta-ads-product-sets'] });
                          toast.success('Conjunto excluído.');
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum conjunto de produtos criado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────────────── Campaigns Tab ──────────────── */}
        <TabsContent value="campaigns" className="mt-6 space-y-6">
          {/* Drafts */}
          {drafts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Pencil className="h-4 w-4" /> Rascunhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {drafts.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{d.name || 'Rascunho sem nome'}</p>
                        <p className="text-xs text-muted-foreground">Passo {d.wizardStep} · Atualizado em {d.updatedAt ? new Date(d.updatedAt).toLocaleString('pt-BR') : '—'}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDraft(d);
                            setWizardOpen(true);
                          }}
                        >
                          Continuar
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDraftMut.mutate(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign list */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Campanhas</CardTitle>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setEditingDraft(null);
                    setWizardOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" /> Nova Campanha
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns?.content?.length ? (
                    campaigns.content.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-xs">{c.objective}</TableCell>
                        <TableCell className="text-sm">
                          R$ {((c.dailyBudget ?? 0) / 100).toFixed(2)}/dia
                        </TableCell>
                        <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {c.status === 'DRAFT' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                title="Publicar"
                                onClick={() => publishCampaignMut.mutate(c.id)}
                                disabled={publishCampaignMut.isPending}
                              >
                                <Play className="h-4 w-4 text-emerald-600" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteCampaignMut.mutate(c.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        Nenhuma campanha criada. Clique em &quot;Nova Campanha&quot; para começar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {campaigns && campaigns.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Página {campaigns.number + 1} de {campaigns.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={campaigns.number === 0}
                      onClick={() => setCampaignPage((p) => Math.max(0, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={campaigns.number + 1 >= campaigns.totalPages}
                      onClick={() => setCampaignPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ──────────────── Dialogs ──────────────────────── */}

      {/* Update Assets Dialog */}
      <Dialog open={assetsDialog} onOpenChange={setAssetsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar Assets do Meta</DialogTitle>
            <DialogDescription>
              Informe os IDs da sua conta de anúncios, página, pixel e catálogo no Meta Business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adAccountId">Ad Account ID</Label>
              <Input id="adAccountId" value={adAccountId} onChange={(e) => setAdAccountId(e.target.value)} placeholder="act_123456789" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="pageId">Page ID</Label>
              <Input id="pageId" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="123456789" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="pixelId">Pixel ID</Label>
              <Input id="pixelId" value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder="123456789012345" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="catalogId">Catalog ID</Label>
              <Input id="catalogId" value={catalogId} onChange={(e) => setCatalogId(e.target.value)} placeholder="987654321098765" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="instagramActorId">Instagram Actor ID</Label>
              <Input id="instagramActorId" value={instagramActorId} onChange={(e) => setInstagramActorId(e.target.value)} placeholder="17841412345678" className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetsDialog(false)}>Cancelar</Button>
            <Button
              onClick={() =>
                updateAssetsMut.mutate({ adAccountId, pageId, pixelId, catalogId, instagramActorId })
              }
              disabled={updateAssetsMut.isPending}
            >
              {updateAssetsMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Alert */}
      <AlertDialog open={disconnectDialog} onOpenChange={setDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar do Meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá a conexão OAuth e todos os dados de sincronização serão perdidos.
              Os anúncios já publicados continuarão ativos na Meta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnectMut.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Campaign Wizard */}
      <CampaignWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        draft={editingDraft}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['meta-ads-campaigns', 'meta-ads-drafts'] });
          setWizardOpen(false);
          setEditingDraft(null);
        }}
      />
    </div>
  );
}
