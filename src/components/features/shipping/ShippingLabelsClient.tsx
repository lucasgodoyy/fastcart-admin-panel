'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  RefreshCcw,
  Search,
  Truck,
  Package,
  Printer,
  XCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Tag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import integrationService from '@/services/integrationService';
import shippingLabelsService from '@/services/shippingLabelsService';
import { MelhorEnvioConnectionStatus } from '@/types/integration';
import { ShippingLabelListResponse, ShippingLabelSummary } from '@/types/shippingLabel';
import { t } from '@/lib/admin-language';

const LABELS_QUERY_KEY = ['shipping-labels'];

const parseLabels = (payload: unknown): ShippingLabelSummary[] => {
  if (Array.isArray(payload)) return payload as ShippingLabelSummary[];
  if (payload && typeof payload === 'object') {
    const maybeData = (payload as ShippingLabelListResponse).data;
    if (Array.isArray(maybeData)) return maybeData;
  }
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
  (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
  fallback;

type StatusFilter = 'all' | 'released' | 'posted' | 'delivered' | 'canceled';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  released: { label: t('Liberado', 'Released'), variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  posted: { label: t('Postado', 'Posted'), variant: 'default', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: t('Entregue', 'Delivered'), variant: 'default', icon: <Package className="h-3 w-3" /> },
  canceled: { label: t('Cancelado', 'Canceled'), variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  generated: { label: t('Gerado', 'Generated'), variant: 'secondary', icon: <Tag className="h-3 w-3" /> },
  pending: { label: t('Pendente', 'Pending'), variant: 'outline', icon: <Clock className="h-3 w-3" /> },
  expired: { label: t('Expirado', 'Expired'), variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
};

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getServiceName(serviceId?: number | null): string {
  const services: Record<number, string> = {
    1: 'Correios - PAC',
    2: 'Correios - SEDEX',
    3: 'Jadlog - .Package',
    4: 'Jadlog - .Com',
    17: 'Correios - Mini Envios',
  };
  return serviceId ? services[serviceId] || `Serviço ${serviceId}` : '-';
}

export function ShippingLabelsClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [detailsData, setDetailsData] = useState<Record<string, unknown> | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);

  const { data: melhorEnvioStatus } = useQuery<MelhorEnvioConnectionStatus>({
    queryKey: ['integration', 'melhor-envio'],
    queryFn: integrationService.getMelhorEnvioStatus,
    retry: false,
    throwOnError: false,
  });

  const labelsQuery = useQuery({
    queryKey: [...LABELS_QUERY_KEY, activeTab === 'all' ? '' : activeTab],
    queryFn: () => shippingLabelsService.list(activeTab === 'all' ? undefined : activeTab),
    enabled: !!melhorEnvioStatus?.connected,
  });

  const printMutation = useMutation({
    mutationFn: (ids: string[]) => shippingLabelsService.print(ids),
    onSuccess: (data) => {
      const url = (data as { url?: string })?.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(t('Etiqueta enviada para impressão!', 'Label sent to print!'));
    },
    onError: (error) => toast.error(getErrorMessage(error, t('Erro ao imprimir', 'Print error'))),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => shippingLabelsService.cancel({ id }),
    onSuccess: () => {
      toast.success(t('Etiqueta cancelada com sucesso!', 'Label cancelled successfully!'));
      setCancelDialogId(null);
      queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, t('Erro ao cancelar', 'Cancel error'))),
  });

  const labels = parseLabels(labelsQuery.data);

  const filteredLabels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return labels;
    return labels.filter((l) => {
      const raw = l as Record<string, unknown>;
      const toData = raw.to as Record<string, unknown> | undefined;
      const values = [l.id, l.protocol, l.tracking, l.status, toData?.name as string]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(term);
    });
  }, [labels, search]);

  const loadDetails = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setDetailsLoading(id);
    try {
      const data = await shippingLabelsService.details(id);
      setDetailsData(data as Record<string, unknown>);
      setExpandedId(id);
    } catch (error) {
      toast.error(getErrorMessage(error, t('Erro ao carregar detalhes', 'Error loading details')));
    } finally {
      setDetailsLoading(null);
    }
  };

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('Todos', 'All') },
    { key: 'released', label: t('Liberados', 'Released') },
    { key: 'posted', label: t('Postados', 'Posted') },
    { key: 'delivered', label: t('Entregues', 'Delivered') },
    { key: 'canceled', label: t('Cancelados', 'Canceled') },
  ];

  if (!melhorEnvioStatus?.connected) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <h3 className="text-sm font-semibold text-foreground">{t('Melhor Envio não conectado', 'Melhor Envio not connected')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Conecte sua conta Melhor Envio acima para gerenciar etiquetas de envio.', 'Connect your Melhor Envio account above to manage shipping labels.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('Etiquetas de Envio', 'Shipping Labels')}</h2>
          <p className="text-sm text-muted-foreground">{t('Gerencie e acompanhe todas as etiquetas Melhor Envio.', 'Manage and track all Melhor Envio labels.')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => labelsQuery.refetch()} disabled={labelsQuery.isFetching} className="gap-1.5">
          {labelsQuery.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          {t('Atualizar', 'Refresh')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Buscar por protocolo, rastreio ou destinatário...', 'Search by protocol, tracking or recipient...')}
          className="pl-9"
        />
      </div>

      {/* Count */}
      <div className="text-sm text-muted-foreground">
        {filteredLabels.length} {t('etiquetas', 'labels')}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="w-8 px-3 py-2.5"></th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Protocolo', 'Protocol')}</th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Transportadora', 'Carrier')}</th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Destinatário', 'Recipient')}</th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Rastreio', 'Tracking')}</th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Criado', 'Created')}</th>
                <th className="px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground text-right">{t('Ações', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {labelsQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-sm text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    {t('Carregando etiquetas...', 'Loading labels...')}
                  </td>
                </tr>
              ) : filteredLabels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-sm text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    {t('Nenhuma etiqueta encontrada.', 'No labels found.')}
                  </td>
                </tr>
              ) : (
                filteredLabels.slice(0, 100).map((item) => {
                  const sc = statusConfig[item.status || ''] || statusConfig.pending;
                  const raw = item as Record<string, unknown>;
                  const toData = raw.to as Record<string, unknown> | undefined;
                  const recipientName = (toData?.name as string) || '-';
                  const serviceId = raw.service_id as number | undefined;
                  const isExpanded = expandedId === item.id;

                  return (
                    <LabelRow
                      key={item.id}
                      item={item}
                      sc={sc}
                      recipientName={recipientName}
                      serviceId={serviceId}
                      isExpanded={isExpanded}
                      detailsLoading={detailsLoading}
                      detailsData={detailsData}
                      onToggleDetails={loadDetails}
                      onPrint={(id) => printMutation.mutate([id])}
                      isPrinting={printMutation.isPending}
                      onCancel={(id) => setCancelDialogId(id)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={!!cancelDialogId} onOpenChange={() => setCancelDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Cancelar Etiqueta', 'Cancel Label')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'O valor da etiqueta será estornado para sua carteira Melhor Envio. Esta ação não pode ser desfeita.',
                'The label value will be refunded to your Melhor Envio wallet. This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>{t('Voltar', 'Go Back')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (cancelDialogId) cancelMutation.mutate(cancelDialogId);
              }}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? t('Cancelando...', 'Cancelling...') : t('Confirmar Cancelamento', 'Confirm Cancellation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ───── Label table row (Fragment-free with separate detail row) ───── */

function LabelRow({
  item,
  sc,
  recipientName,
  serviceId,
  isExpanded,
  detailsLoading,
  detailsData,
  onToggleDetails,
  onPrint,
  isPrinting,
  onCancel,
}: {
  item: ShippingLabelSummary;
  sc: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode };
  recipientName: string;
  serviceId?: number | null;
  isExpanded: boolean;
  detailsLoading: string | null;
  detailsData: Record<string, unknown> | null;
  onToggleDetails: (id: string) => void;
  onPrint: (id: string) => void;
  isPrinting: boolean;
  onCancel: (id: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
        <td className="px-3 py-2.5">
          <button
            onClick={() => onToggleDetails(item.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {detailsLoading === item.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </td>
        <td className="px-3 py-2.5">
          <div className="text-sm font-medium text-foreground">{item.protocol || '-'}</div>
          <div className="text-xs text-muted-foreground font-mono">{item.id?.substring(0, 8)}...</div>
        </td>
        <td className="px-3 py-2.5 text-sm text-foreground">{getServiceName(serviceId)}</td>
        <td className="px-3 py-2.5 text-sm text-foreground">{recipientName}</td>
        <td className="px-3 py-2.5">
          {item.tracking ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-foreground">{item.tracking}</span>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(item.tracking || '');
                  toast.success(t('Código copiado!', 'Code copied!'));
                }}
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">{t('Sem rastreio', 'No tracking')}</span>
          )}
        </td>
        <td className="px-3 py-2.5">
          <Badge variant={sc.variant} className="gap-1 text-xs">
            {sc.icon}
            {sc.label}
          </Badge>
        </td>
        <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatDate(item.created_at)}</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title={t('Imprimir', 'Print')}
              disabled={isPrinting}
              onClick={() => onPrint(item.id)}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            {(item.status === 'released' || item.status === 'generated') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                title={t('Cancelar', 'Cancel')}
                onClick={() => onCancel(item.id)}
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && detailsData && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={8} className="px-6 py-4">
            <LabelDetailsPanel data={detailsData} />
          </td>
        </tr>
      )}
    </>
  );
}

/* ───── Expanded details panel ───── */

function LabelDetailsPanel({ data }: { data: Record<string, unknown> }) {
  const from = data.from as Record<string, unknown> | undefined;
  const to = data.to as Record<string, unknown> | undefined;
  const volumes = data.volumes as Record<string, unknown>[] | undefined;
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* From */}
        <div className="rounded-md border border-border bg-background p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t('Remetente', 'Sender')}</h4>
          {from ? (
            <div className="space-y-1 text-xs text-foreground">
              <div className="font-medium">{(from.name as string) || '-'}</div>
              <div>{(from.address as string) || ''}</div>
              <div>{[from.city, from.state_abbr, from.postal_code].filter(Boolean).join(', ')}</div>
              {from.phone ? <div>{t('Tel:', 'Phone:')} {String(from.phone)}</div> : null}
            </div>
          ) : <span className="text-xs text-muted-foreground">-</span>}
        </div>

        {/* To */}
        <div className="rounded-md border border-border bg-background p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t('Destinatário', 'Recipient')}</h4>
          {to ? (
            <div className="space-y-1 text-xs text-foreground">
              <div className="font-medium">{(to.name as string) || '-'}</div>
              <div>{(to.address as string) || ''}</div>
              <div>{[to.city, to.state_abbr, to.postal_code].filter(Boolean).join(', ')}</div>
              {to.phone ? <div>{t('Tel:', 'Phone:')} {String(to.phone)}</div> : null}
              {to.document ? <div>{t('CPF:', 'Doc:')} {String(to.document)}</div> : null}
            </div>
          ) : <span className="text-xs text-muted-foreground">-</span>}
        </div>

        {/* Package */}
        <div className="rounded-md border border-border bg-background p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t('Volume', 'Package')}</h4>
          {volumes && volumes.length > 0 ? (
            <div className="space-y-1 text-xs text-foreground">
              <div>{t('Peso:', 'Weight:')} {(volumes[0].weight as number)?.toFixed(2) || '-'} kg</div>
              <div>{t('Dimensões:', 'Dimensions:')} {String(volumes[0].width)}x{String(volumes[0].height)}x{String(volumes[0].length)} cm</div>
            </div>
          ) : (
            <div className="space-y-1 text-xs text-foreground">
              {data.weight ? <div>{t('Peso:', 'Weight:')} {String(data.weight)} kg</div> : null}
              {(data.width || data.height || data.length) ? (
                <div>{t('Dimensões:', 'Dimensions:')} {String(data.width || '-')}x{String(data.height || '-')}x{String(data.length || '-')} cm</div>
              ) : null}
            </div>
          )}
          {data.price ? <div className="mt-2 text-xs font-medium">{t('Valor:', 'Cost:')} R$ {Number(data.price).toFixed(2)}</div> : null}
          {data.insurance_value ? <div className="text-xs">{t('Seguro:', 'Insurance:')} R$ {Number(data.insurance_value).toFixed(2)}</div> : null}
        </div>
      </div>

      {/* Raw JSON toggle */}
      <div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showRaw ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {t('Ver resposta completa da API', 'View full API response')}
        </button>
        {showRaw && (
          <pre className="mt-2 max-h-60 overflow-auto rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
