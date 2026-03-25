'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, FileText, Settings, Eye, Ban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import nfeService from '@/services/admin/nfeService';
import { NfeConfig, NfeInvoice, NfeProvider, NfeStatus } from '@/types/nfe';
import { t } from '@/lib/admin-language';

const PROVIDER_LABELS: Record<NfeProvider, string> = {
  NFEIO: 'NFe.io',
  TINY: 'Tiny ERP',
  BLING: 'Bling',
  MANUAL: 'Manual',
};

const STATUS_CONFIG: Record<NfeStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendente', variant: 'outline' },
  PROCESSING: { label: 'Processando', variant: 'secondary' },
  ISSUED: { label: 'Emitida', variant: 'default' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
  ERROR: { label: 'Erro', variant: 'destructive' },
};

export function NfeClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('invoices');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailDialog, setDetailDialog] = useState<NfeInvoice | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const { data: config, isLoading: loadingConfig } = useQuery<NfeConfig | null>({
    queryKey: ['nfe-config'],
    queryFn: nfeService.getConfig,
  });

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery<{ content: NfeInvoice[] }>({
    queryKey: ['nfe-invoices', statusFilter],
    queryFn: () => nfeService.listInvoices(statusFilter || undefined),
    enabled: activeTab === 'invoices',
  });

  const [configForm, setConfigForm] = useState<Partial<NfeConfig> & { apiKey?: string }>({});
  const merged = { ...config, ...configForm } as NfeConfig;

  const saveConfigMutation = useMutation({
    mutationFn: () => nfeService.upsertConfig({ ...config, ...configForm } as NfeConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe-config'] });
      toast.success(t('Configuração salva!', 'Config saved!'));
    },
    onError: () => toast.error(t('Erro', 'Error')),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: () => nfeService.createInvoice(Number(orderId), Number(totalAmount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe-invoices'] });
      setCreateDialog(false);
      setOrderId('');
      setTotalAmount('');
      toast.success(t('Nota criada! Aguardando processamento.', 'Invoice created! Awaiting processing.'));
    },
    onError: () => toast.error(t('Erro ao criar nota', 'Error creating invoice')),
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: (id: number) => nfeService.cancelInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe-invoices'] });
      setDetailDialog(null);
      toast.success(t('Nota cancelada!', 'Invoice cancelled!'));
    },
    onError: () => toast.error(t('Erro ao cancelar', 'Error cancelling')),
  });

  const invoices = invoicesData?.content ?? [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Notas Fiscais (NF-e)', 'Tax Invoices (NF-e)')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Configure a emissão e gerencie notas fiscais.', 'Configure issuance and manage tax invoices.')}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices"><FileText className="mr-1.5 h-4 w-4" />{t('Notas Fiscais', 'Invoices')}</TabsTrigger>
          <TabsTrigger value="config"><Settings className="mr-1.5 h-4 w-4" />{t('Configuração', 'Configuration')}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('Todos', 'All')}</option>
              {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            <Button size="sm" onClick={() => setCreateDialog(true)}>
              <Plus className="mr-1.5 h-4 w-4" />{t('Emitir Nota', 'Issue Invoice')}
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">#</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Pedido', 'Order')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Número NF-e', 'NF-e Number')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Status', 'Status')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Valor', 'Value')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
                  <th className="px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {loadingInvoices && <tr><td colSpan={7} className="px-4 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>}
                {invoices.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={inv.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono">#{inv.id}</td>
                      <td className="px-4 py-3 text-sm">#{inv.orderId}</td>
                      <td className="px-4 py-3 text-sm font-mono">{inv.nfeNumber || '—'}</td>
                      <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="px-4 py-3 text-sm">{inv.totalAmount ? `R$ ${inv.totalAmount.toFixed(2)}` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{inv.createdAt ? new Intl.DateTimeFormat('pt-BR').format(new Date(inv.createdAt)) : '—'}</td>
                      <td className="px-4 py-3 flex gap-1">
                        <Button size="icon-xs" variant="ghost" onClick={() => setDetailDialog(inv)}><Eye className="h-4 w-4" /></Button>
                        {(inv.status === 'ISSUED') && (
                          <Button size="icon-xs" variant="ghost" onClick={() => { if (confirm(t('Cancelar nota?', 'Cancel invoice?'))) cancelInvoiceMutation.mutate(inv.id); }}>
                            <Ban className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loadingInvoices && invoices.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('Nenhuma nota fiscal.', 'No invoices.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          {loadingConfig ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">{t('Provedor', 'Provider')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>{t('Provedor NF-e', 'NF-e Provider')}</Label>
                    <select value={merged.provider || 'MANUAL'} onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value as NfeProvider })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      {Object.entries(PROVIDER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>{t('Chave da API', 'API Key')}</Label>
                    <Input type="password" placeholder={config?.hasApiKey ? '••••••••' : t('Informe a chave', 'Enter API key')} onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('Emissão automática', 'Auto-issue')}</Label>
                    <Switch checked={merged.autoIssue ?? false} onCheckedChange={(v) => setConfigForm({ ...configForm, autoIssue: v })} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">{t('Dados Fiscais', 'Tax Data')}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><Label>CNPJ</Label><Input value={merged.cnpj || ''} onChange={(e) => setConfigForm({ ...configForm, cnpj: e.target.value })} placeholder="00.000.000/0001-00" /></div>
                  <div><Label>{t('Inscrição Estadual', 'State Registration')}</Label><Input value={merged.stateRegistration || ''} onChange={(e) => setConfigForm({ ...configForm, stateRegistration: e.target.value })} /></div>
                  <div><Label>{t('CFOP Padrão', 'Default CFOP')}</Label><Input value={merged.defaultCfop || ''} onChange={(e) => setConfigForm({ ...configForm, defaultCfop: e.target.value })} placeholder="5102" /></div>
                </CardContent>
              </Card>
              <div className="md:col-span-2">
                <Button onClick={() => saveConfigMutation.mutate()} disabled={saveConfigMutation.isPending}>
                  {t('Salvar Configuração', 'Save Configuration')}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Nota Fiscal', 'Invoice')} #{detailDialog?.id}</DialogTitle>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">{t('Pedido:', 'Order:')}</span> #{detailDialog.orderId}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={STATUS_CONFIG[detailDialog.status]?.variant ?? 'outline'}>{STATUS_CONFIG[detailDialog.status]?.label ?? detailDialog.status}</Badge></div>
                {detailDialog.nfeNumber && <div><span className="text-muted-foreground">{t('Número:', 'Number:')}</span> {detailDialog.nfeNumber}</div>}
                {detailDialog.nfeKey && <div className="col-span-2"><span className="text-muted-foreground">{t('Chave:', 'Key:')}</span> <span className="font-mono text-xs break-all">{detailDialog.nfeKey}</span></div>}
                {detailDialog.totalAmount && <div><span className="text-muted-foreground">{t('Valor:', 'Value:')}</span> R$ {detailDialog.totalAmount.toFixed(2)}</div>}
              </div>
              {detailDialog.pdfUrl && <a href={detailDialog.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">PDF</a>}
              {detailDialog.xmlUrl && <a href={detailDialog.xmlUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs ml-3">XML</a>}
              {detailDialog.errorMessage && <p className="text-xs text-destructive">{t('Erro:', 'Error:')} {detailDialog.errorMessage}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog(null)}>{t('Fechar', 'Close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Emitir Nota Fiscal', 'Issue Invoice')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t('ID do Pedido', 'Order ID')}</Label>
              <Input type="number" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder={t('Informe o ID do pedido', 'Enter order ID')} />
            </div>
            <div>
              <Label>{t('Valor Total (R$)', 'Total Amount')}</Label>
              <Input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('A nota será criada com status "Pendente". A integração com o provedor fará a emissão.', 'Invoice will be created as "Pending". Provider integration will handle issuance.')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>{t('Cancelar', 'Cancel')}</Button>
            <Button onClick={() => createInvoiceMutation.mutate()} disabled={createInvoiceMutation.isPending || !orderId || !totalAmount}>
              {t('Emitir', 'Issue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
