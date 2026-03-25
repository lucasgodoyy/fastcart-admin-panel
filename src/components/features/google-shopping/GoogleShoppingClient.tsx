'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Globe,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Copy,
  Settings2,
  Rss,
  BarChart3,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Pause,
  Play,
  Eye,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import googleShoppingService, {
  type GoogleShoppingConfig,
  type Campaign,
  type CreateCampaignRequest,
} from '@/services/googleShoppingService';

// ── Constants ──────────────────────────────────────────────

const SYNC_FREQ_OPTIONS = [
  { value: 'HOURLY', label: 'A cada hora' },
  { value: 'DAILY', label: 'Diário' },
  { value: 'WEEKLY', label: 'Semanal' },
];

const COUNTRY_OPTIONS = [
  { value: 'BR', label: 'Brasil' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'PT', label: 'Portugal' },
];

const LANGUAGE_OPTIONS = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'PERFORMANCE_MAX', label: 'Performance Max' },
  { value: 'STANDARD_SHOPPING', label: 'Shopping Padrão' },
  { value: 'SMART_SHOPPING', label: 'Smart Shopping' },
];

// ── Badges ─────────────────────────────────────────────────

function SyncStatusBadge({ status }: { status: string }) {
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" /> Nunca sincronizado
        </span>
      );
  }
}

function CampaignStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100"><Play className="h-3 w-3 mr-1" />Ativa</Badge>;
    case 'PAUSED':
      return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Pausada</Badge>;
    case 'ENDED':
      return <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Encerrada</Badge>;
    case 'ERROR':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
    default:
      return <Badge variant="outline"><Settings2 className="h-3 w-3 mr-1" />Rascunho</Badge>;
  }
}

// ── Main component ─────────────────────────────────────────

export function GoogleShoppingClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('campanhas');

  // ── Config state ──
  const { data: config, isLoading: configLoading } = useQuery<GoogleShoppingConfig>({
    queryKey: ['google-shopping-config'],
    queryFn: googleShoppingService.getConfig,
  });

  const [merchantId, setMerchantId] = useState('');
  const [targetCountry, setTargetCountry] = useState('BR');
  const [contentLanguage, setContentLanguage] = useState('pt');
  const [syncFrequency, setSyncFrequency] = useState('DAILY');
  const [enabled, setEnabled] = useState(false);
  const [verificationTag, setVerificationTag] = useState('');
  const [configInit, setConfigInit] = useState(false);

  if (config && !configInit) {
    setMerchantId(config.merchantId || '');
    setTargetCountry(config.targetCountry || 'BR');
    setContentLanguage(config.contentLanguage || 'pt');
    setSyncFrequency(config.syncFrequency || 'DAILY');
    setEnabled(config.enabled);
    setVerificationTag(config.verificationTag || '');
    setConfigInit(true);
  }

  // ── Campaign state ──
  const { data: campaignsPage, isLoading: campaignsLoading } = useQuery({
    queryKey: ['google-shopping-campaigns'],
    queryFn: () => googleShoppingService.listCampaigns(0, 50),
  });

  const campaigns = campaignsPage?.content || [];

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<CreateCampaignRequest>({
    name: '',
    campaignType: 'PERFORMANCE_MAX',
    dailyBudget: 50,
  });

  // ── Mutations ──
  const updateConfigMutation = useMutation({
    mutationFn: googleShoppingService.updateConfig,
    onSuccess: () => {
      toast.success('Configuração salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-config'] });
    },
    onError: () => toast.error('Falha ao salvar configuração.'),
  });

  const syncMutation = useMutation({
    mutationFn: googleShoppingService.syncNow,
    onSuccess: () => {
      toast.success('Feed sincronizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-config'] });
    },
    onError: () => toast.error('Falha ao sincronizar feed.'),
  });

  const createCampaignMutation = useMutation({
    mutationFn: googleShoppingService.createCampaign,
    onSuccess: () => {
      toast.success('Campanha criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-campaigns'] });
      setShowCreateDialog(false);
      resetCampaignForm();
    },
    onError: () => toast.error('Falha ao criar campanha.'),
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof googleShoppingService.updateCampaign>[1] }) =>
      googleShoppingService.updateCampaign(id, data),
    onSuccess: () => {
      toast.success('Campanha atualizada!');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-campaigns'] });
      setEditingCampaign(null);
    },
    onError: () => toast.error('Falha ao atualizar campanha.'),
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: googleShoppingService.deleteCampaign,
    onSuccess: () => {
      toast.success('Campanha excluída.');
      queryClient.invalidateQueries({ queryKey: ['google-shopping-campaigns'] });
    },
    onError: () => toast.error('Falha ao excluir campanha.'),
  });

  // ── Helpers ──
  const resetCampaignForm = () => {
    setCampaignForm({ name: '', campaignType: 'PERFORMANCE_MAX', dailyBudget: 50 });
  };

  const handleSaveConfig = () => {
    updateConfigMutation.mutate({
      enabled,
      merchantId: merchantId.trim() || undefined,
      targetCountry,
      contentLanguage,
      syncFrequency,
      verificationTag: verificationTag.trim() || undefined,
    });
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.name.trim()) {
      toast.error('Nome da campanha é obrigatório.');
      return;
    }
    createCampaignMutation.mutate(campaignForm);
  };

  const handleToggleCampaignStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateCampaignMutation.mutate({ id: campaign.id, data: { status: newStatus } });
  };

  const handleDeleteCampaign = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      deleteCampaignMutation.mutate(id);
    }
  };

  const copyFeedUrl = () => {
    if (config?.feedUrl) {
      navigator.clipboard.writeText(window.location.origin + config.feedUrl);
      toast.success('URL do feed copiada!');
    }
  };

  const hasMerchantId = merchantId.trim().length > 0;
  const hasVerificationTag = verificationTag.trim().length > 0;
  const hasFeedUrl = Boolean(config?.feedUrl);
  const merchantConnected = hasMerchantId && config?.enabled;
  const pendingCount = (!hasVerificationTag ? 1 : 0) + (!hasMerchantId ? 1 : 0) + (!hasFeedUrl ? 1 : 0);

  if (configLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando Google Shopping...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
            <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Google Shopping</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie campanhas, catálogo e conexão com Google.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="gs-enabled" className="text-sm font-medium">
            {enabled ? 'Ativo' : 'Inativo'}
          </Label>
          <Switch id="gs-enabled" checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      {/* Connection status badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
          merchantConnected
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'border-border bg-muted/50 text-muted-foreground'
        }`}>
          <ShoppingBag className="h-4 w-4" />
          <span className="font-medium">Merchant Center</span>
          {merchantConnected ? (
            <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span className="text-xs">Conectado</span></>
          ) : (
            <span className="text-xs">Não conectado</span>
          )}
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span className="font-medium">Google Ads</span>
          <span className="text-xs">Vincule pelo Google Ads</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b bg-transparent p-0 rounded-none h-auto">
          <TabsTrigger
            value="campanhas"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
          >
            Campanhas
          </TabsTrigger>
          <TabsTrigger
            value="catalogo"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
          >
            Catálogo
          </TabsTrigger>
          <TabsTrigger
            value="minha-conta"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
          >
            Minha conta
          </TabsTrigger>
          <TabsTrigger
            value="pendente"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm"
          >
            Pendente {pendingCount > 0 && <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold dark:bg-amber-900/30 dark:text-amber-400">{pendingCount}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════
            TAB: Campanhas
           ═══════════════════════════════════════════════════ */}
        <TabsContent value="campanhas" className="mt-6 space-y-6">
          {/* Campaign stats cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium">Campanhas</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Impressões</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{campaigns.reduce((s, c) => s + c.impressions, 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointerClick className="h-4 w-4" />
                <span className="text-xs font-medium">Cliques</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{campaigns.reduce((s, c) => s + c.clicks, 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Investido</span>
              </div>
              <p className="text-2xl font-bold text-foreground">R$ {campaigns.reduce((s, c) => s + c.costSpent, 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Create campaign button */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Suas campanhas</h2>
            <Button size="sm" onClick={() => { resetCampaignForm(); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />
              Criar campanha
            </Button>
          </div>

          {/* Campaign list */}
          {campaignsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Nenhuma campanha</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Crie sua primeira campanha para começar a anunciar no Google Shopping.
              </p>
              <Button variant="outline" size="sm" onClick={() => { resetCampaignForm(); setShowCreateDialog(true); }}>
                <Plus className="h-4 w-4 mr-1.5" />
                Criar campanha
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground truncate">{campaign.name}</h3>
                        <CampaignStatusBadge status={campaign.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Tipo: {CAMPAIGN_TYPE_OPTIONS.find(t => t.value === campaign.campaignType)?.label || campaign.campaignType}</span>
                        <span>Budget: R$ {campaign.dailyBudget?.toFixed(2) || '0.00'}/dia</span>
                        {campaign.startDate && <span>Início: {new Date(campaign.startDate).toLocaleDateString('pt-BR')}</span>}
                        {campaign.endDate && <span>Fim: {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>}
                      </div>
                      {/* Metrics row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                        <span className="text-muted-foreground">{campaign.impressions.toLocaleString()} impressões</span>
                        <span className="text-muted-foreground">{campaign.clicks.toLocaleString()} cliques</span>
                        <span className="text-muted-foreground">{campaign.conversions} conversões</span>
                        <span className="font-medium text-foreground">R$ {campaign.costSpent.toFixed(2)} gasto</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={campaign.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                        onClick={() => handleToggleCampaignStatus(campaign)}
                        disabled={updateCampaignMutation.isPending}
                      >
                        {campaign.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar"
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setCampaignForm({
                            name: campaign.name,
                            campaignType: campaign.campaignType,
                            dailyBudget: campaign.dailyBudget || 50,
                            targetRoas: campaign.targetRoas ?? undefined,
                            startDate: campaign.startDate ?? undefined,
                            endDate: campaign.endDate ?? undefined,
                            productFilter: campaign.productFilter ?? undefined,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {campaign.googleCampaignId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Ver no Google Ads"
                          asChild
                        >
                          <a
                            href={`https://ads.google.com/aw/campaigns?campaignId=${campaign.googleCampaignId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Excluir"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        disabled={deleteCampaignMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tip */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Dica:</strong> Para campanhas pagas, vincule sua conta Google Ads ao Merchant Center.
              As campanhas criadas aqui são rascunhos — ative-as após configurar o pagamento no{' '}
              <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Google Ads <ExternalLink className="inline h-3 w-3" />
              </a>.
            </p>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB: Catálogo
           ═══════════════════════════════════════════════════ */}
        <TabsContent value="catalogo" className="mt-6 space-y-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">Catálogo de produtos</h2>
              <p className="text-xs text-muted-foreground mt-1">
                A geração do catálogo pode demorar até 24 horas. Uma vez concluído, você poderá ver o estado dos seus produtos.
              </p>
            </div>
            <div className="p-5 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs font-medium">Produtos no feed</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-foreground">{config?.productCount || 0}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium">Erros</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-foreground">{config?.errorCount || 0}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Status</span>
                  </div>
                  <div className="mt-1">
                    <SyncStatusBadge status={config?.syncStatus || 'NEVER'} />
                  </div>
                </div>
              </div>

              {/* Feed URL */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <Rss className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Feed de produtos</h3>
                </div>
                <div className="p-5 space-y-3">
                  {config?.feedUrl ? (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5">
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <code className="flex-1 text-xs text-foreground break-all">{config.feedUrl}</code>
                      <Button variant="ghost" size="sm" onClick={copyFeedUrl} className="shrink-0">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Salve a configuração na aba &quot;Minha conta&quot; para gerar a URL do feed.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncMutation.mutate()}
                      disabled={syncMutation.isPending || !config?.merchantId}
                    >
                      {syncMutation.isPending ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      )}
                      Sincronizar agora
                    </Button>
                    {config?.lastSyncedAt && (
                      <span className="inline-flex items-center text-xs text-muted-foreground">
                        Última sync: {new Date(config.lastSyncedAt).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Feed frequency */}
              <div className="space-y-2">
                <Label htmlFor="sync-freq-cat">Frequência de sincronização</Label>
                <select
                  id="sync-freq-cat"
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SYNC_FREQ_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
                  {updateConfigMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-foreground">Dicas para garantir a aprovação dos produtos do seu catálogo</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Verifique se todos os seus produtos têm preço</p>
                  <p>É obrigatório que todos os produtos tenham um preço para serem exibidos. Certifique-se de que nenhum aparece sem preço.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Use imagens claras, sem texto e de boa qualidade</p>
                  <p>Use fotos limpas, sem elementos adicionais, com pelo menos 250x250 pixels e até 16 MB.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Preencha um código GTIN válido (se aplicável)</p>
                  <p>O GTIN é um identificador único como código de barras. Se o produto tiver, é obrigatório que seja correto e válido.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Informe a disponibilidade do produto</p>
                  <p>É importante que cada produto informe se está em estoque ou não, facilitando a exibição correta no Google Shopping.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB: Minha conta
           ═══════════════════════════════════════════════════ */}
        <TabsContent value="minha-conta" className="mt-6 space-y-6">
          {/* Step-by-step setup */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">Google Shopping</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Siga o passo a passo para vincular sua conta do Google.
              </p>
            </div>
            <div className="p-5 space-y-6">
              {/* Step 1: Merchant Center */}
              <div className="flex items-start gap-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  hasMerchantId
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {hasMerchantId ? <CheckCircle2 className="h-4 w-4" /> : '1'}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Google Merchant Center</h3>
                    <p className="text-xs text-muted-foreground">
                      {hasMerchantId
                        ? `Conectado — Merchant ID: ${merchantId}`
                        : 'Faça o cadastro de verificação no seu domínio e sincronize todos os seus produtos.'
                      }
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="mc-id">Merchant Center ID</Label>
                      <Input
                        id="mc-id"
                        value={merchantId}
                        onChange={(e) => setMerchantId(e.target.value)}
                        placeholder="Ex: 123456789"
                        maxLength={50}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="mc-country">País alvo</Label>
                        <select
                          id="mc-country"
                          value={targetCountry}
                          onChange={(e) => setTargetCountry(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {COUNTRY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mc-lang">Idioma</Label>
                        <select
                          id="mc-lang"
                          value={contentLanguage}
                          onChange={(e) => setContentLanguage(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Verification tag */}
              <div className="flex items-start gap-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  hasVerificationTag
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {hasVerificationTag ? <CheckCircle2 className="h-4 w-4" /> : '2'}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Verificação do domínio</h3>
                    <p className="text-xs text-muted-foreground">
                      Cole o token de verificação do Google Merchant Center abaixo.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mc-tag">Tag de verificação</Label>
                    <Input
                      id="mc-tag"
                      value={verificationTag}
                      onChange={(e) => setVerificationTag(e.target.value)}
                      placeholder="Ex: google1234567890abcdef"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      No Merchant Center, acesse <strong>Configurações &gt; Verificação e reivindicação do site</strong>
                      e copie somente o valor do atributo <code>content</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Google Ads */}
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                  3
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Google Ads</h3>
                    <p className="text-xs text-muted-foreground">
                      Acesse o Google Ads e vincule ao Merchant Center para criar campanhas pagas.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
                      Acessar Google Ads <ExternalLink className="ml-1.5 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
              {updateConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar configuração
            </Button>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB: Pendente
           ═══════════════════════════════════════════════════ */}
        <TabsContent value="pendente" className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">Itens pendentes</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Conclua estas etapas para ativar totalmente o Google Shopping.
              </p>
            </div>
            <div className="divide-y divide-border">
              {/* Item 1 */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  {hasVerificationTag ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">Tag de verificação do domínio</p>
                    <p className="text-xs text-muted-foreground">Necessário para verificar o domínio no Google Merchant Center.</p>
                  </div>
                </div>
                {!hasVerificationTag && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('minha-conta')}>
                    Configurar
                  </Button>
                )}
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  {hasMerchantId ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">Merchant Center ID</p>
                    <p className="text-xs text-muted-foreground">ID da sua conta no Google Merchant Center.</p>
                  </div>
                </div>
                {!hasMerchantId && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('minha-conta')}>
                    Configurar
                  </Button>
                )}
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  {hasFeedUrl ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">Feed de produtos cadastrado</p>
                    <p className="text-xs text-muted-foreground">Cadastre a URL do feed no Merchant Center como fonte de dados.</p>
                  </div>
                </div>
                {hasFeedUrl ? (
                  <Button variant="outline" size="sm" onClick={copyFeedUrl}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copiar URL
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('minha-conta')}>
                    Configurar
                  </Button>
                )}
              </div>

              {/* Item 4: Google Ads */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Google Ads (opcional)</p>
                    <p className="text-xs text-muted-foreground">Vincule para criar campanhas pagas de Shopping.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
                    Acessar <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {pendingCount === 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/10 dark:border-emerald-800 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Tudo configurado!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                Seu Google Shopping está pronto. Crie campanhas para começar a anunciar.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════
          DIALOG: Create / Edit Campaign
         ═══════════════════════════════════════════════════ */}
      <Dialog open={showCreateDialog || !!editingCampaign} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingCampaign(null);
          resetCampaignForm();
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Editar campanha' : 'Criar campanha'}</DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? 'Altere os dados da campanha.'
                : 'Preencha os dados para criar uma nova campanha no Google Shopping.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="camp-name">Nome da campanha *</Label>
              <Input
                id="camp-name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="Ex: Campanha Black Friday"
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-type">Tipo de campanha</Label>
              <select
                id="camp-type"
                value={campaignForm.campaignType}
                onChange={(e) => setCampaignForm({ ...campaignForm, campaignType: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CAMPAIGN_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="camp-budget">Orçamento diário (R$)</Label>
                <Input
                  id="camp-budget"
                  type="number"
                  min="1"
                  step="0.01"
                  value={campaignForm.dailyBudget}
                  onChange={(e) => setCampaignForm({ ...campaignForm, dailyBudget: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp-roas">Target ROAS (opcional)</Label>
                <Input
                  id="camp-roas"
                  type="number"
                  min="0"
                  step="0.01"
                  value={campaignForm.targetRoas ?? ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targetRoas: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Ex: 4.00"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="camp-start">Data início</Label>
                <Input
                  id="camp-start"
                  type="date"
                  value={campaignForm.startDate ?? ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp-end">Data fim</Label>
                <Input
                  id="camp-end"
                  type="date"
                  value={campaignForm.endDate ?? ''}
                  onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value || undefined })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingCampaign(null); resetCampaignForm(); }}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editingCampaign) {
                  updateCampaignMutation.mutate({
                    id: editingCampaign.id,
                    data: {
                      name: campaignForm.name,
                      dailyBudget: campaignForm.dailyBudget,
                      targetRoas: campaignForm.targetRoas ?? undefined,
                      startDate: campaignForm.startDate ?? undefined,
                      endDate: campaignForm.endDate ?? undefined,
                    },
                  });
                } else {
                  handleCreateCampaign();
                }
              }}
              disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
            >
              {(createCampaignMutation.isPending || updateCampaignMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingCampaign ? 'Salvar alterações' : 'Criar campanha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
