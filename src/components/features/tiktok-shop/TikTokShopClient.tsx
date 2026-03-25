'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  ExternalLink,
  Unplug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShoppingBag,
  Copy,
  AlertTriangle,
  Clock,
  Settings2,
  Rss,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import tiktokAdsService, {
  type TikTokConnection,
  type UpdateTikTokConnectionRequest,
} from '@/services/tiktokAdsService';

// ── Constants ──────────────────────────────────────────────

const SYNC_FREQ_OPTIONS = [
  { value: 'HOURLY', label: 'A cada hora' },
  { value: 'DAILY', label: 'Diário' },
  { value: 'WEEKLY', label: 'Semanal' },
];

// ── Status Badges ──────────────────────────────────────────

function ConnectionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'CONNECTED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle2 className="h-3 w-3" /> Conectado
        </span>
      );
    case 'ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
          <XCircle className="h-3 w-3" /> Erro
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800/30 dark:text-zinc-400 dark:border-zinc-700">
          <XCircle className="h-3 w-3" /> Desconectado
        </span>
      );
  }
}

function SyncStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case 'SYNCED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle2 className="h-3 w-3" /> Sincronizado
        </span>
      );
    case 'ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
          <XCircle className="h-3 w-3" /> Erro
        </span>
      );
    case 'SYNCING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
          <Loader2 className="h-3 w-3 animate-spin" /> Sincronizando
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800/30 dark:text-zinc-400 dark:border-zinc-700">
          <AlertTriangle className="h-3 w-3" /> Pendente
        </span>
      );
  }
}

// ── Main Component ─────────────────────────────────────────

export function TikTokShopClient() {
  const queryClient = useQueryClient();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTikTokConnectionRequest>({});

  // ── Queries & Mutations ──────────────────────────────
  const { data: connection, isLoading } = useQuery<TikTokConnection>({
    queryKey: ['tiktok-connection'],
    queryFn: tiktokAdsService.getConnection,
    retry: false,
  });

  const isConnected = connection?.status === 'CONNECTED';

  const oauthMut = useMutation({
    mutationFn: tiktokAdsService.getOAuthUrl,
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
    onError: () => toast.error('Erro ao gerar URL de autorização. Verifique a configuração da plataforma.'),
  });

  const updateMut = useMutation({
    mutationFn: (req: UpdateTikTokConnectionRequest) => tiktokAdsService.updateConnection(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiktok-connection'] });
      toast.success('Conexão atualizada!');
    },
    onError: () => toast.error('Erro ao atualizar conexão.'),
  });

  const syncMut = useMutation({
    mutationFn: tiktokAdsService.syncCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiktok-connection'] });
      toast.success('Sincronização iniciada!');
    },
    onError: () => toast.error('Erro ao sincronizar catálogo.'),
  });

  const disconnectMut = useMutation({
    mutationFn: tiktokAdsService.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiktok-connection'] });
      toast.success('TikTok desconectado.');
      setShowDisconnect(false);
    },
    onError: () => toast.error('Erro ao desconectar.'),
  });

  // ── Loading State ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">TikTok Shop</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte sua loja ao TikTok for Business para sincronizar catálogo e vender via TikTok Shop.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDisconnect(true)}
            >
              <Unplug className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          )}
        </div>
      </div>

      {/* Connection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white text-lg font-bold">
                T
              </div>
              <div>
                <CardTitle className="text-lg">TikTok for Business</CardTitle>
                <CardDescription>
                  {isConnected
                    ? `Conectado como ${connection?.advertiserName || connection?.advertiserId || 'Conta TikTok'}`
                    : 'Conecte sua conta TikTok for Business via OAuth.'}
                </CardDescription>
              </div>
            </div>
            <ConnectionStatusBadge status={connection?.status || 'DISCONNECTED'} />
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-black/5 dark:bg-white/5 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Conectar ao TikTok</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Autorize o acesso à sua conta TikTok for Business para sincronizar produtos,
                configurar pixel de rastreamento e gerenciar o catálogo da TikTok Shop.
              </p>
              <Button
                onClick={() => oauthMut.mutate()}
                disabled={oauthMut.isPending}
                className="bg-black text-white hover:bg-black/90"
              >
                {oauthMut.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Conectar com TikTok
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="catalog">
                  <Rss className="mr-2 h-4 w-4" />
                  Catálogo
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Produtos Sincronizados</p>
                          <p className="text-2xl font-bold">{connection?.productCount ?? 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Erros</p>
                          <p className="text-2xl font-bold">{connection?.errorCount ?? 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Última Sincronização</p>
                          <p className="text-sm font-medium">
                            {connection?.lastSyncedAt
                              ? new Date(connection.lastSyncedAt).toLocaleString('pt-BR')
                              : 'Nunca'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex items-center gap-4">
                  <SyncStatusBadge status={connection?.syncStatus} />
                  {connection?.feedUrl && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(connection.feedUrl!);
                        toast.success('Feed URL copiado!');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar Feed URL
                    </button>
                  )}
                </div>
              </TabsContent>

              {/* Catalog Tab */}
              <TabsContent value="catalog" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Sincronização de Catálogo</h3>
                    <p className="text-sm text-muted-foreground">
                      Sincronize seus produtos com o TikTok Catalog para anúncios e TikTok Shop.
                    </p>
                  </div>
                  <Button
                    onClick={() => syncMut.mutate()}
                    disabled={syncMut.isPending}
                    size="sm"
                  >
                    {syncMut.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Sincronizar Agora
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Catalog ID</Label>
                        <p className="font-mono text-sm">{connection?.catalogId || '—'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Catalog Name</Label>
                        <p className="text-sm">{connection?.catalogName || '—'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Shop ID</Label>
                        <p className="font-mono text-sm">{connection?.shopId || '—'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Shop Name</Label>
                        <p className="text-sm">{connection?.shopName || '—'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configurações da Conexão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Advertiser ID</Label>
                        <Input
                          placeholder="Ex: 7123456789"
                          defaultValue={connection?.advertiserId || ''}
                          onChange={(e) => setEditForm(f => ({ ...f, advertiserId: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Advertiser Name</Label>
                        <Input
                          placeholder="Nome do anunciante"
                          defaultValue={connection?.advertiserName || ''}
                          onChange={(e) => setEditForm(f => ({ ...f, advertiserName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pixel ID</Label>
                        <Input
                          placeholder="Ex: CXXXXXXX"
                          defaultValue={connection?.pixelId || ''}
                          onChange={(e) => setEditForm(f => ({ ...f, pixelId: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequência de Sincronização</Label>
                        <Select
                          defaultValue={connection?.syncFrequency || 'DAILY'}
                          onValueChange={(v) => setEditForm(f => ({ ...f, syncFrequency: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SYNC_FREQ_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Catalog ID</Label>
                        <Input
                          placeholder="ID do catálogo TikTok"
                          defaultValue={connection?.catalogId || ''}
                          onChange={(e) => setEditForm(f => ({ ...f, catalogId: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Catalog Name</Label>
                        <Input
                          placeholder="Nome do catálogo"
                          defaultValue={connection?.catalogName || ''}
                          onChange={(e) => setEditForm(f => ({ ...f, catalogName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => updateMut.mutate(editForm)}
                        disabled={updateMut.isPending}
                      >
                        {updateMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Configurações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar TikTok?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação irá desconectar sua conta TikTok for Business. Os dados de sincronização
              serão removidos e o catálogo não será mais atualizado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnectMut.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
