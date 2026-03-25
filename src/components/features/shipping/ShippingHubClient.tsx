'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Box,
  Edit2,
  Eye,
  EyeOff,
  MapPin,
  Package,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ShippingLabelsClient } from '@/components/features/shipping/ShippingLabelsClient';
import integrationService from '@/services/integrationService';
import shippingConfigService from '@/services/shippingConfigService';
import {
  CustomShippingMethod,
  CustomShippingMethodRequest,
  CustomShippingMethodType,
  ShippingStoreConfigRequest,
} from '@/types/shippingConfig';

// ── Query keys ──────────────────────────────────────────────────────────────
const ME_STATUS_KEY = ['melhorenvio', 'status'];
const SHIPPING_CONFIG_KEY = ['shipping-config'];
const CUSTOM_METHODS_KEY = ['shipping-config', 'custom-methods'];

// ── Types ────────────────────────────────────────────────────────────────────
interface MeDialogState {
  open: boolean;
  token: string;
  showToken: boolean;
  originCep: string;
  extraDays: string;
  extraFee: string;
  extraFeeType: 'FIXED' | 'PERCENTAGE';
}

const DEFAULT_ME_DIALOG: MeDialogState = {
  open: false,
  token: '',
  showToken: false,
  originCep: '',
  extraDays: '0',
  extraFee: '0',
  extraFeeType: 'FIXED',
};

interface MethodDialogState {
  open: boolean;
  editing: CustomShippingMethod | null;
  name: string;
  type: CustomShippingMethodType;
  price: string;
  cepFrom: string;
  cepTo: string;
  pickupAddress: string;
  pickupInstructions: string;
  active: boolean;
  sortOrder: string;
}

const DEFAULT_METHOD_DIALOG: MethodDialogState = {
  open: false,
  editing: null,
  name: '',
  type: 'FLAT',
  price: '',
  cepFrom: '',
  cepTo: '',
  pickupAddress: '',
  pickupInstructions: '',
  active: true,
  sortOrder: '0',
};

// ── Component ────────────────────────────────────────────────────────────────
export function ShippingHubClient() {
  const qc = useQueryClient();

  const [meDialog, setMeDialog] = useState<MeDialogState>(DEFAULT_ME_DIALOG);
  const [methodDialog, setMethodDialog] = useState<MethodDialogState>(DEFAULT_METHOD_DIALOG);

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: meStatus } = useQuery({
    queryKey: ME_STATUS_KEY,
    queryFn: () => integrationService.getMelhorEnvioStatus(),
  });

  const { data: shippingConfig } = useQuery({
    queryKey: SHIPPING_CONFIG_KEY,
    queryFn: () => shippingConfigService.getConfig(),
  });

  const { data: customMethods = [] } = useQuery({
    queryKey: CUSTOM_METHODS_KEY,
    queryFn: () => shippingConfigService.listCustomMethods(),
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const connectTokenMutation = useMutation({
    mutationFn: (token: string) => integrationService.connectMelhorEnvioWithToken(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_STATUS_KEY }),
    onError: () => toast.error('Token inválido ou expirado.'),
  });

  const disconnectMeMutation = useMutation({
    mutationFn: () => integrationService.disconnectMelhorEnvio(),
    onSuccess: () => {
      toast.success('Melhor Envio desconectado.');
      qc.invalidateQueries({ queryKey: ME_STATUS_KEY });
    },
    onError: () => toast.error('Erro ao desconectar.'),
  });

  const saveConfigMutation = useMutation({
    mutationFn: (req: ShippingStoreConfigRequest) => shippingConfigService.saveConfig(req),
    onSuccess: () => {
      toast.success('Configuração de frete salva!');
      qc.invalidateQueries({ queryKey: SHIPPING_CONFIG_KEY });
    },
    onError: () => toast.error('Erro ao salvar configuração.'),
  });

  const createMethodMutation = useMutation({
    mutationFn: (req: CustomShippingMethodRequest) => shippingConfigService.createMethod(req),
    onSuccess: () => {
      toast.success('Método de envio criado!');
      qc.invalidateQueries({ queryKey: CUSTOM_METHODS_KEY });
      setMethodDialog(DEFAULT_METHOD_DIALOG);
    },
    onError: () => toast.error('Erro ao criar método.'),
  });

  const updateMethodMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: CustomShippingMethodRequest }) =>
      shippingConfigService.updateMethod(id, req),
    onSuccess: () => {
      toast.success('Método atualizado!');
      qc.invalidateQueries({ queryKey: CUSTOM_METHODS_KEY });
      setMethodDialog(DEFAULT_METHOD_DIALOG);
    },
    onError: () => toast.error('Erro ao atualizar método.'),
  });

  const toggleMethodMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      shippingConfigService.toggleMethod(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOM_METHODS_KEY }),
    onError: () => toast.error('Erro ao alterar status.'),
  });

  const deleteMethodMutation = useMutation({
    mutationFn: (id: number) => shippingConfigService.deleteMethod(id),
    onSuccess: () => {
      toast.success('Método removido.');
      qc.invalidateQueries({ queryKey: CUSTOM_METHODS_KEY });
    },
    onError: () => toast.error('Erro ao remover método.'),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  function openMeDialog() {
    setMeDialog({
      ...DEFAULT_ME_DIALOG,
      open: true,
      originCep: shippingConfig?.originCep ?? '',
      extraDays: String(shippingConfig?.extraDays ?? 0),
      extraFee: String(shippingConfig?.extraFee ?? 0),
      extraFeeType: shippingConfig?.extraFeeType ?? 'FIXED',
    });
  }

  async function handleSaveMeDialog() {
    // Connect token if provided
    if (meDialog.token.trim()) {
      await connectTokenMutation.mutateAsync(meDialog.token.trim());
    }
    // Save config
    await saveConfigMutation.mutateAsync({
      originCep: meDialog.originCep.replace(/\D/g, '') || null,
      extraDays: parseInt(meDialog.extraDays) || 0,
      extraFee: parseFloat(meDialog.extraFee) || 0,
      extraFeeType: meDialog.extraFeeType,
    });
    setMeDialog((prev) => ({ ...prev, open: false, token: '' }));
  }

  function openNewMethodDialog() {
    setMethodDialog(DEFAULT_METHOD_DIALOG);
    setMethodDialog((prev) => ({ ...prev, open: true }));
  }

  function openEditMethodDialog(m: CustomShippingMethod) {
    setMethodDialog({
      open: true,
      editing: m,
      name: m.name,
      type: m.type as CustomShippingMethodType,
      price: String(m.price ?? ''),
      cepFrom: m.cepFrom ?? '',
      cepTo: m.cepTo ?? '',
      pickupAddress: m.pickupAddress ?? '',
      pickupInstructions: m.pickupInstructions ?? '',
      active: m.active,
      sortOrder: String(m.sortOrder),
    });
  }

  function handleSaveMethod() {
    const req: CustomShippingMethodRequest = {
      name: methodDialog.name,
      type: methodDialog.type,
      price: methodDialog.type !== 'PICKUP' ? parseFloat(methodDialog.price) || 0 : 0,
      cepFrom: methodDialog.type === 'BY_CEP_RANGE' ? methodDialog.cepFrom || null : null,
      cepTo: methodDialog.type === 'BY_CEP_RANGE' ? methodDialog.cepTo || null : null,
      pickupAddress: methodDialog.type === 'PICKUP' ? methodDialog.pickupAddress || null : null,
      pickupInstructions: methodDialog.type === 'PICKUP' ? methodDialog.pickupInstructions || null : null,
      active: methodDialog.active,
      sortOrder: parseInt(methodDialog.sortOrder) || 0,
    };

    if (methodDialog.editing) {
      updateMethodMutation.mutate({ id: methodDialog.editing.id, req });
    } else {
      createMethodMutation.mutate(req);
    }
  }

  const isMeSaving =
    connectTokenMutation.isPending || saveConfigMutation.isPending;
  const isMethodSaving =
    createMethodMutation.isPending || updateMethodMutation.isPending;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ── Section: Provedores ──────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Provedores de Frete</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Melhor Envio card */}
          <div className="relative rounded-xl border-2 border-primary/30 bg-card p-5 flex flex-col gap-3 shadow-sm">
            <div className="absolute top-3 right-3">
              <Badge variant={meStatus?.connected ? 'default' : 'secondary'} className="text-xs">
                {meStatus?.connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Melhor Envio</p>
                <p className="text-xs text-muted-foreground">Calculadora + Etiquetas</p>
              </div>
            </div>
            {meStatus?.connected && (
              <p className="text-xs text-muted-foreground">
                Conectado desde{' '}
                {meStatus.connectedAt
                  ? new Date(meStatus.connectedAt).toLocaleDateString('pt-BR')
                  : '—'}
              </p>
            )}
            <div className="flex gap-2 mt-auto flex-wrap">
              <Button size="sm" variant="outline" onClick={openMeDialog} className="flex-1">
                Configurar
              </Button>
              {meStatus?.connected && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => disconnectMeMutation.mutate()}
                  disabled={disconnectMeMutation.isPending}
                >
                  Desconectar
                </Button>
              )}
            </div>
          </div>

          {/* Correios — em breve */}
          <ProviderComingSoonCard
            icon={<Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            name="Correios"
            description="PAC, SEDEX e mais"
          />

          {/* Jadlog — em breve */}
          <ProviderComingSoonCard
            icon={<Box className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            name="Jadlog"
            description=".Package, .COM e mais"
          />
        </div>
      </div>

      <Separator />

      {/* ── Section: Métodos Personalizados ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Métodos de Envio Personalizados</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Motoboy, entrega própria, retirada na loja e outros.
            </p>
          </div>
          <Button size="sm" onClick={openNewMethodDialog}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {customMethods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum método personalizado cadastrado.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={openNewMethodDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Criar primeiro método
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {customMethods.map((m) => (
              <CustomMethodRow
                key={m.id}
                method={m}
                onToggle={(active) => toggleMethodMutation.mutate({ id: m.id, active })}
                onEdit={() => openEditMethodDialog(m)}
                onDelete={() => deleteMethodMutation.mutate(m.id)}
                isLoadingToggle={toggleMethodMutation.isPending}
                isLoadingDelete={deleteMethodMutation.isPending && deleteMethodMutation.variables === m.id}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* ── Section: Etiquetas ───────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Etiquetas de Envio</h2>
        <ShippingLabelsClient />
      </div>

      {/* ── Dialog: Configurar Melhor Envio ──────────────────────────── */}
      <Dialog
        open={meDialog.open}
        onOpenChange={(o) => setMeDialog((prev) => ({ ...prev, open: o }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Melhor Envio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Token */}
            <div className="space-y-1.5">
              <Label htmlFor="me-token">
                Token de API{' '}
                {meStatus?.connected && (
                  <span className="text-xs text-muted-foreground font-normal">
                    (deixe em branco para manter o atual)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="me-token"
                  type={meDialog.showToken ? 'text' : 'password'}
                  placeholder={meStatus?.connected ? '••••••••••••' : 'Cole seu token aqui'}
                  value={meDialog.token}
                  onChange={(e) => setMeDialog((p) => ({ ...p, token: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setMeDialog((p) => ({ ...p, showToken: !p.showToken }))}
                  tabIndex={-1}
                >
                  {meDialog.showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Separator />

            {/* Origin CEP */}
            <div className="space-y-1.5">
              <Label htmlFor="origin-cep">CEP de Origem</Label>
              <Input
                id="origin-cep"
                placeholder="00000-000"
                maxLength={9}
                value={meDialog.originCep}
                onChange={(e) => setMeDialog((p) => ({ ...p, originCep: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                CEP de onde os pedidos são despachados. Se vazio, usa o endereço da loja.
              </p>
            </div>

            {/* Extra days */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="extra-days">Dias extras no prazo</Label>
                <Input
                  id="extra-days"
                  type="number"
                  min={0}
                  max={30}
                  value={meDialog.extraDays}
                  onChange={(e) => setMeDialog((p) => ({ ...p, extraDays: e.target.value }))}
                />
              </div>

              {/* Extra fee */}
              <div className="space-y-1.5">
                <Label htmlFor="extra-fee">Taxa extra</Label>
                <div className="flex gap-2">
                  <Input
                    id="extra-fee"
                    type="number"
                    min={0}
                    step="0.01"
                    value={meDialog.extraFee}
                    onChange={(e) => setMeDialog((p) => ({ ...p, extraFee: e.target.value }))}
                    className="flex-1"
                  />
                  <Select
                    value={meDialog.extraFeeType}
                    onValueChange={(v) =>
                      setMeDialog((p) => ({ ...p, extraFeeType: v as 'FIXED' | 'PERCENTAGE' }))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">R$</SelectItem>
                      <SelectItem value="PERCENTAGE">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setMeDialog((p) => ({ ...p, open: false }))}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveMeDialog} disabled={isMeSaving}>
              {isMeSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Método personalizado ─────────────────────────────── */}
      <Dialog
        open={methodDialog.open}
        onOpenChange={(o) => {
          if (!o) setMethodDialog(DEFAULT_METHOD_DIALOG);
          else setMethodDialog((p) => ({ ...p, open: true }));
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {methodDialog.editing ? 'Editar Método de Envio' : 'Novo Método de Envio'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="method-name">Nome</Label>
              <Input
                id="method-name"
                placeholder="ex: Motoboy, Retirada na Loja..."
                value={methodDialog.name}
                onChange={(e) => setMethodDialog((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={methodDialog.type}
                onValueChange={(v) =>
                  setMethodDialog((p) => ({ ...p, type: v as CustomShippingMethodType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Preço fixo (entrega em domicílio)</SelectItem>
                  <SelectItem value="BY_CEP_RANGE">Preço fixo por faixa de CEP</SelectItem>
                  <SelectItem value="PICKUP">Retirada no local (grátis)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price — hide for PICKUP */}
            {methodDialog.type !== 'PICKUP' && (
              <div className="space-y-1.5">
                <Label htmlFor="method-price">Preço (R$)</Label>
                <Input
                  id="method-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  value={methodDialog.price}
                  onChange={(e) => setMethodDialog((p) => ({ ...p, price: e.target.value }))}
                />
              </div>
            )}

            {/* CEP range — only for BY_CEP_RANGE */}
            {methodDialog.type === 'BY_CEP_RANGE' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cep-from">CEP inicial</Label>
                  <Input
                    id="cep-from"
                    placeholder="01000-000"
                    maxLength={9}
                    value={methodDialog.cepFrom}
                    onChange={(e) => setMethodDialog((p) => ({ ...p, cepFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cep-to">CEP final</Label>
                  <Input
                    id="cep-to"
                    placeholder="09999-999"
                    maxLength={9}
                    value={methodDialog.cepTo}
                    onChange={(e) => setMethodDialog((p) => ({ ...p, cepTo: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Pickup details */}
            {methodDialog.type === 'PICKUP' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="pickup-address">Endereço de retirada</Label>
                  <Input
                    id="pickup-address"
                    placeholder="Rua Exemplo, 100 — Bairro, Cidade/UF"
                    value={methodDialog.pickupAddress}
                    onChange={(e) => setMethodDialog((p) => ({ ...p, pickupAddress: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pickup-instructions">Instruções ao cliente</Label>
                  <Textarea
                    id="pickup-instructions"
                    rows={3}
                    placeholder="Ex: Atendimento seg-sex das 9h às 18h..."
                    value={methodDialog.pickupInstructions}
                    onChange={(e) =>
                      setMethodDialog((p) => ({ ...p, pickupInstructions: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {/* Active + Sort order */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="method-active"
                  checked={methodDialog.active}
                  onCheckedChange={(v) => setMethodDialog((p) => ({ ...p, active: v }))}
                />
                <Label htmlFor="method-active" className="cursor-pointer">
                  Ativo
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-order" className="text-sm text-muted-foreground shrink-0">
                  Ordem
                </Label>
                <Input
                  id="sort-order"
                  type="number"
                  min={0}
                  value={methodDialog.sortOrder}
                  onChange={(e) => setMethodDialog((p) => ({ ...p, sortOrder: e.target.value }))}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setMethodDialog(DEFAULT_METHOD_DIALOG)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveMethod}
              disabled={isMethodSaving || !methodDialog.name.trim()}
            >
              {isMethodSaving ? 'Salvando...' : methodDialog.editing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProviderComingSoonCard({
  icon,
  iconBg,
  name,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 opacity-60">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Badge variant="secondary" className="w-fit text-xs">
        Em breve
      </Badge>
    </div>
  );
}

function CustomMethodRow({
  method,
  onToggle,
  onEdit,
  onDelete,
  isLoadingToggle,
  isLoadingDelete,
}: {
  method: CustomShippingMethod;
  onToggle: (active: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoadingToggle: boolean;
  isLoadingDelete: boolean;
}) {
  const typeLabels: Record<string, string> = {
    FLAT: 'Preço fixo',
    BY_CEP_RANGE: 'Por CEP',
    PICKUP: 'Retirada',
  };

  const priceLabel =
    method.type === 'PICKUP'
      ? 'Grátis'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          method.price ?? 0,
        );

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Switch
          checked={method.active}
          onCheckedChange={onToggle}
          disabled={isLoadingToggle}
          aria-label={method.active ? 'Desativar' : 'Ativar'}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{method.name}</p>
          <p className="text-xs text-muted-foreground">
            {typeLabels[method.type] ?? method.type} · {priceLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onEdit}
          title="Editar"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isLoadingDelete}
          title="Remover"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
