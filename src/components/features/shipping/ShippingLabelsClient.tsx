'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import integrationService from '@/services/integrationService';
import shippingLabelsService from '@/services/shippingLabelsService';
import { MelhorEnvioConnectionStatus } from '@/types/integration';
import { ShippingLabelListResponse, ShippingLabelSummary } from '@/types/shippingLabel';

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

export function ShippingLabelsClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [detailsId, setDetailsId] = useState('');
  const [selectedOrdersText, setSelectedOrdersText] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState('');
  const [printFileType, setPrintFileType] = useState('pdf');
  const [printFileId, setPrintFileId] = useState('');
  const [lastResult, setLastResult] = useState<unknown>(null);

  const selectedOrders = useMemo(
    () =>
      selectedOrdersText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [selectedOrdersText]
  );

  const { data: melhorEnvioStatus } = useQuery<MelhorEnvioConnectionStatus>({
    queryKey: ['integration', 'melhor-envio'],
    queryFn: integrationService.getMelhorEnvioStatus,
    retry: false,
    throwOnError: false,
  });

  const labelsQuery = useQuery({
    queryKey: [...LABELS_QUERY_KEY, statusFilter],
    queryFn: () => shippingLabelsService.list(statusFilter || undefined),
    enabled: !!melhorEnvioStatus?.connected,
  });

  const runAndStore = async <T,>(operation: () => Promise<T>, successMessage: string) => {
    try {
      const response = await operation();
      setLastResult(response);
      toast.success(successMessage);
      return response;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Operação falhou'));
      throw error;
    }
  };

  const searchMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.search(searchInput), 'Pesquisa concluída'),
  });

  const detailsMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.details(detailsId), 'Detalhes carregados'),
  });

  const statusMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.status(selectedOrders), 'Status atualizado'),
  });

  const cancellableMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.cancellable(selectedOrders), 'Verificação concluída'),
  });

  const generateMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.generate(selectedOrders), 'Etiquetas geradas'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY }),
  });

  const printMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.print(selectedOrders), 'Impressão solicitada'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => runAndStore(() => shippingLabelsService.cancel({ id: cancelOrderId }), 'Etiqueta cancelada'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY }),
  });

  const labels = parseLabels(labelsQuery.data);

  if (!melhorEnvioStatus?.connected) {
    return (
      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Etiquetas Melhor Envio</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Conecte o Melhor Envio para habilitar listagem, status, cancelamento, geração e impressão de etiquetas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Etiquetas Melhor Envio</h2>
          <Button variant="outline" onClick={() => labelsQuery.refetch()} disabled={labelsQuery.isFetching}>
            {labelsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} Recarregar
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Input id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} placeholder="posted, shipped..." className="mt-1.5 w-55" />
          </div>
          <Button variant="outline" onClick={() => labelsQuery.refetch()}>Aplicar filtro</Button>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID</th>
                <th className="px-3 py-2 text-left font-medium">Protocolo</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Rastreio</th>
                <th className="px-3 py-2 text-left font-medium">Criado</th>
              </tr>
            </thead>
            <tbody>
              {labelsQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={5}>Carregando etiquetas...</td>
                </tr>
              ) : labels.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={5}>Nenhuma etiqueta encontrada.</td>
                </tr>
              ) : (
                labels.slice(0, 50).map((item) => (
                  <tr key={`${item.id}`} className="border-t border-border">
                    <td className="px-3 py-2">{item.id}</td>
                    <td className="px-3 py-2">{item.protocol || '-'}</td>
                    <td className="px-3 py-2">{item.status || '-'}</td>
                    <td className="px-3 py-2">{item.tracking || '-'}</td>
                    <td className="px-3 py-2">{item.created_at || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Operações de pesquisa</h3>
          <div>
            <Label htmlFor="label-search">Pesquisar etiqueta</Label>
            <div className="mt-1.5 flex gap-2">
              <Input id="label-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Código ou trecho" />
              <Button onClick={() => searchMutation.mutate()} disabled={!searchInput.trim() || searchMutation.isPending}>Buscar</Button>
            </div>
          </div>

          <div>
            <Label htmlFor="label-details">Detalhes por ID</Label>
            <div className="mt-1.5 flex gap-2">
              <Input id="label-details" value={detailsId} onChange={(event) => setDetailsId(event.target.value)} placeholder="ID da etiqueta" />
              <Button variant="outline" onClick={() => detailsMutation.mutate()} disabled={!detailsId.trim() || detailsMutation.isPending}>Detalhes</Button>
            </div>
          </div>

          <div>
            <Label htmlFor="print-file-id">Abrir arquivo impresso</Label>
            <div className="mt-1.5 flex gap-2">
              <Input id="print-file-type" value={printFileType} onChange={(event) => setPrintFileType(event.target.value)} placeholder="pdf" className="w-24" />
              <Input id="print-file-id" value={printFileId} onChange={(event) => setPrintFileId(event.target.value)} placeholder="ID arquivo" />
              <Button
                variant="outline"
                onClick={() => {
                  const url = shippingLabelsService.getPrintFileUrl(printFileType, printFileId);
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                disabled={!printFileType.trim() || !printFileId.trim()}
              >
                Abrir
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Operações em lote</h3>
          <div>
            <Label htmlFor="selected-orders">IDs das etiquetas (separadas por vírgula)</Label>
            <Input id="selected-orders" value={selectedOrdersText} onChange={(event) => setSelectedOrdersText(event.target.value)} className="mt-1.5" placeholder="123, 456, 789" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => statusMutation.mutate()} disabled={selectedOrders.length === 0 || statusMutation.isPending}>Status</Button>
            <Button variant="outline" onClick={() => cancellableMutation.mutate()} disabled={selectedOrders.length === 0 || cancellableMutation.isPending}>Pode cancelar?</Button>
            <Button variant="outline" onClick={() => generateMutation.mutate()} disabled={selectedOrders.length === 0 || generateMutation.isPending}>Gerar etiqueta</Button>
            <Button variant="outline" onClick={() => printMutation.mutate()} disabled={selectedOrders.length === 0 || printMutation.isPending}>Imprimir</Button>
          </div>

          <div>
            <Label htmlFor="cancel-order-id">Cancelar etiqueta por ID</Label>
            <div className="mt-1.5 flex gap-2">
              <Input id="cancel-order-id" value={cancelOrderId} onChange={(event) => setCancelOrderId(event.target.value)} placeholder="ID da etiqueta" />
              <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={!cancelOrderId.trim() || cancelMutation.isPending}>Cancelar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Último retorno da API</h3>
        <pre className="max-h-70 overflow-auto rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
          {lastResult ? JSON.stringify(lastResult, null, 2) : 'Nenhuma operação executada ainda.'}
        </pre>
      </div>
    </div>
  );
}
