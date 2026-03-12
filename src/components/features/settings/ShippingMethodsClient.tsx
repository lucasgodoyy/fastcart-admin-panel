'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Package,
  Plus,
  Info,
  ArrowRight,
  MapPin,
  Pencil,
  Trash2,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ShippingTab = 'national' | 'international' | 'pickup';
type CustomShippingType = 'flat' | 'free' | 'min_order' | 'on_contact';

interface CustomShippingRule {
  id: string;
  name: string;
  type: CustomShippingType;
  price?: number;
  minOrderValue?: number;
  minDays: number;
  maxDays: number;
  active: boolean;
}

interface PickupLocation {
  id: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  hours?: string;
  instructions?: string;
  active: boolean;
}

interface PickupSettings {
  enabled: boolean;
  cost: number;
  prepDays: number;
  checkoutMessage: string;
  locations: PickupLocation[];
}

interface CustomShippingSettings {
  enabled: boolean;
  rules: CustomShippingRule[];
}

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const getStoreId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('storeId');
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
};

const EMPTY_PICKUP: PickupSettings = {
  enabled: false,
  cost: 0,
  prepDays: 1,
  checkoutMessage: 'Retire seu pedido em nossa loja. Aguarde a confirmacao antes de buscar.',
  locations: [],
};

const EMPTY_CUSTOM: CustomShippingSettings = { enabled: false, rules: [] };

const RULE_TYPE_LABELS: Record<CustomShippingType, string> = {
  flat: 'Tarifa fixa',
  free: 'Frete gratis',
  min_order: 'Gratis a partir de',
  on_contact: 'A combinar',
};

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const EMPTY_LOCATION: Omit<PickupLocation, 'id'> = {
  name: '', street: '', number: '', complement: '',
  city: '', state: '', zipCode: '', hours: '', instructions: '', active: true,
};

const EMPTY_RULE: Omit<CustomShippingRule, 'id'> = {
  name: '', type: 'flat', price: 0, minOrderValue: 0, minDays: 3, maxDays: 7, active: true,
};

export function ShippingMethodsClient() {
  const storeId = getStoreId();
  const [activeTab, setActiveTab] = useState<ShippingTab>('national');

  const [pickup, setPickup] = useState<PickupSettings>(EMPTY_PICKUP);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);
  const [locationForm, setLocationForm] = useState<Omit<PickupLocation, 'id'>>(EMPTY_LOCATION);

  const [custom, setCustom] = useState<CustomShippingSettings>(EMPTY_CUSTOM);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomShippingRule | null>(null);
  const [ruleForm, setRuleForm] = useState<Omit<CustomShippingRule, 'id'>>(EMPTY_RULE);

  const pickupKey = storeId ? `pickup_settings_${storeId}` : null;
  const customKey = storeId ? `custom_shipping_${storeId}` : null;

  useEffect(() => {
    if (!pickupKey) return;
    try { const s = localStorage.getItem(pickupKey); if (s) setPickup(JSON.parse(s)); } catch {}
  }, [pickupKey]);

  useEffect(() => {
    if (!customKey) return;
    try { const s = localStorage.getItem(customKey); if (s) setCustom(JSON.parse(s)); } catch {}
  }, [customKey]);

  const savePickup = useCallback((next: PickupSettings) => {
    setPickup(next);
    if (pickupKey) localStorage.setItem(pickupKey, JSON.stringify(next));
  }, [pickupKey]);

  const saveCustom = useCallback((next: CustomShippingSettings) => {
    setCustom(next);
    if (customKey) localStorage.setItem(customKey, JSON.stringify(next));
  }, [customKey]);

  const togglePickup = (v: boolean) => {
    savePickup({ ...pickup, enabled: v });
    toast.success(v ? 'Retirada ativada no checkout.' : 'Retirada desativada.');
  };

  const toggleLocation = (id: string) =>
    savePickup({ ...pickup, locations: pickup.locations.map(l => l.id === id ? { ...l, active: !l.active } : l) });

  const openAddLocation = () => {
    setEditingLocation(null);
    setLocationForm(EMPTY_LOCATION);
    setLocationDialogOpen(true);
  };

  const openEditLocation = (loc: PickupLocation) => {
    setEditingLocation(loc);
    setLocationForm({ name: loc.name, street: loc.street, number: loc.number, complement: loc.complement ?? '', city: loc.city, state: loc.state, zipCode: loc.zipCode, hours: loc.hours ?? '', instructions: loc.instructions ?? '', active: loc.active });
    setLocationDialogOpen(true);
  };

  const saveLocation = () => {
    if (!locationForm.name.trim()) return toast.error('Nome e obrigatorio.');
    if (!locationForm.street.trim()) return toast.error('Endereco e obrigatorio.');
    if (!locationForm.city.trim() || !locationForm.state.trim()) return toast.error('Cidade e estado sao obrigatorios.');
    const locations = editingLocation
      ? pickup.locations.map(l => l.id === editingLocation.id ? { ...locationForm, id: l.id } : l)
      : [...pickup.locations, { ...locationForm, id: genId() }];
    savePickup({ ...pickup, locations });
    toast.success(editingLocation ? 'Local atualizado!' : 'Local adicionado!');
    setLocationDialogOpen(false);
  };

  const deleteLocation = (id: string) => {
    savePickup({ ...pickup, locations: pickup.locations.filter(l => l.id !== id) });
    toast.success('Local removido.');
  };

  const toggleCustom = (v: boolean) => {
    saveCustom({ ...custom, enabled: v });
    toast.success(v ? 'Frete personalizado ativado.' : 'Frete personalizado desativado.');
  };

  const toggleRule = (id: string) =>
    saveCustom({ ...custom, rules: custom.rules.map(r => r.id === id ? { ...r, active: !r.active } : r) });

  const openAddRule = () => {
    setEditingRule(null);
    setRuleForm(EMPTY_RULE);
    setRuleDialogOpen(true);
  };

  const openEditRule = (rule: CustomShippingRule) => {
    setEditingRule(rule);
    setRuleForm({ name: rule.name, type: rule.type, price: rule.price ?? 0, minOrderValue: rule.minOrderValue ?? 0, minDays: rule.minDays, maxDays: rule.maxDays, active: rule.active });
    setRuleDialogOpen(true);
  };

  const saveRule = () => {
    if (!ruleForm.name.trim()) return toast.error('Nome e obrigatorio.');
    if (ruleForm.minDays > ruleForm.maxDays) return toast.error('Prazo minimo nao pode ser maior que o maximo.');
    const rules = editingRule
      ? custom.rules.map(r => r.id === editingRule.id ? { ...ruleForm, id: r.id } : r)
      : [...custom.rules, { ...ruleForm, id: genId() }];
    saveCustom({ ...custom, rules });
    toast.success(editingRule ? 'Regra atualizada!' : 'Regra adicionada!');
    setRuleDialogOpen(false);
  };

  const deleteRule = (id: string) => {
    saveCustom({ ...custom, rules: custom.rules.filter(r => r.id !== id) });
    toast.success('Regra removida.');
  };

  const tabs: { value: ShippingTab; label: string; activeBadge?: number }[] = [
    { value: 'national', label: 'Nacionais' },
    { value: 'international', label: 'Internacionais' },
    { value: 'pickup', label: 'Retiradas', activeBadge: pickup.enabled ? pickup.locations.filter(l => l.active).length : undefined },
  ];

  const allLocationsInactive = pickup.locations.length > 0 && pickup.locations.every(l => !l.active);

  return (
    <SettingsPageLayout title="Meios de envio" helpText="Mais sobre meios de envio">

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'pb-2 text-sm font-medium transition-colors flex items-center gap-1.5',
              activeTab === tab.value
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.activeBadge !== undefined && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium px-1">
                {tab.activeBadge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Nacional ── */}
      {activeTab === 'national' && (
        <>
          {/* Melhor Envio */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Melhor Envio</p>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Integracao</Badge>
                </div>
                <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                  <li>Transportadoras integradas: Correios, Jadlog, Loggi e mais.</li>
                  <li>Cotacao automatica de frete em tempo real.</li>
                  <li>Emissao de etiquetas integrada as suas vendas.</li>
                  <li>Rastreamento automatico de envios.</li>
                </ul>
                <Link href="/admin/shipping">
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                    Configurar Melhor Envio
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Frete Personalizado */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Frete personalizado</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Crie suas proprias regras de frete. Voce gerencia os envios manualmente.
                      </p>
                    </div>
                    <Switch
                      checked={custom.enabled}
                      onCheckedChange={toggleCustom}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {custom.enabled && (
              <>
                <Separator />
                <div className="p-5 space-y-3">
                  {custom.rules.length > 0 ? (
                    <div className="space-y-2">
                      {custom.rules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border p-3.5">
                          <div className="flex items-center gap-3">
                            <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} size="sm" />
                            <div>
                              <p className="text-sm font-medium">{rule.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {RULE_TYPE_LABELS[rule.type]}
                                {rule.type === 'flat' && ' - ' + fmtCurrency(rule.price ?? 0)}
                                {rule.type === 'min_order' && ' a partir de ' + fmtCurrency(rule.minOrderValue ?? 0)}
                                {' - '}{rule.minDays}–{rule.maxDays} dias uteis
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditRule(rule)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRule(rule.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">Nenhuma regra criada ainda.</p>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={openAddRule}>
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar regra de frete
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Info banner */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Configure a integracao com o Melhor Envio na pagina de{' '}
              <Link href="/admin/shipping" className="font-medium underline">Logistica</Link>
              {' '}para ativar cotacao automatica e emissao de etiquetas.
            </p>
          </div>
        </>
      )}

      {/* ── Internacional ── */}
      {activeTab === 'international' && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Envios internacionais</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Em breve voce podera configurar transportadoras internacionais para enviar seus produtos para outros paises.
          </p>
        </div>
      )}

      {/* ── Retiradas ── */}
      {activeTab === 'pickup' && (
        <>
          {/* Enable toggle */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Store className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Retirada em loja</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Permita que seus clientes retirem os pedidos em um ponto de retirada. Aparece no checkout quando ativado.
                    </p>
                  </div>
                  <Switch checked={pickup.enabled} onCheckedChange={togglePickup} />
                </div>
              </div>
            </div>
          </div>

          {pickup.enabled && (
            <>
              {/* Config */}
              <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Configuracoes de retirada
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Custo da retirada (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={pickup.cost}
                      onChange={e => setPickup(p => ({ ...p, cost: Number(e.target.value) }))}
                      onBlur={() => savePickup(pickup)}
                    />
                    <p className="text-[11px] text-muted-foreground">0,00 = retirada gratuita</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Prazo de preparo (dias uteis)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={pickup.prepDays}
                      onChange={e => setPickup(p => ({ ...p, prepDays: Number(e.target.value) }))}
                      onBlur={() => savePickup(pickup)}
                    />
                    <p className="text-[11px] text-muted-foreground">Dias para separar o pedido</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Mensagem exibida no checkout</Label>
                  <Textarea
                    value={pickup.checkoutMessage}
                    onChange={e => setPickup(p => ({ ...p, checkoutMessage: e.target.value }))}
                    onBlur={() => savePickup(pickup)}
                    placeholder="Ex.: Retire seu pedido em nossa loja. Aguarde a confirmacao."
                    rows={2}
                    className="resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Mostrada ao cliente ao escolher retirada no checkout.
                  </p>
                </div>
              </div>

              {/* Locations */}
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                <div className="px-5 py-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Pontos de retirada ({pickup.locations.length})
                  </p>
                  <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={openAddLocation}>
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar local
                  </Button>
                </div>

                {pickup.locations.length === 0 ? (
                  <div className="py-8 text-center">
                    <MapPin className="mx-auto h-7 w-7 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum ponto de retirada cadastrado.</p>
                    <Button size="sm" variant="outline" className="gap-1.5 mt-3" onClick={openAddLocation}>
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar primeiro local
                    </Button>
                  </div>
                ) : (
                  pickup.locations.map(loc => (
                    <div key={loc.id} className="flex items-start gap-3 px-5 py-4">
                      <Switch
                        checked={loc.active}
                        onCheckedChange={() => toggleLocation(loc.id)}
                        size="sm"
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{loc.name}</p>
                          {!loc.active && (
                            <Badge variant="outline" className="text-[10px] h-4">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {loc.street}, {loc.number}{loc.complement ? ', ' + loc.complement : ''} — {loc.city}/{loc.state}
                          {loc.zipCode ? ' · CEP ' + loc.zipCode : ''}
                        </p>
                        {loc.hours && <p className="text-xs text-muted-foreground">{loc.hours}</p>}
                        {loc.instructions && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">{loc.instructions}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditLocation(loc)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLocation(loc.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {allLocationsInactive && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 flex items-start gap-3">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Todos os pontos de retirada estao inativos. O checkout nao exibira a opcao de retirada mesmo com ela ativada.
                  </p>
                </div>
              )}
            </>
          )}

          {!pickup.enabled && (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Ative a retirada em loja acima para configurar os pontos de retirada.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Location Dialog ── */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Editar local de retirada' : 'Adicionar local de retirada'}</DialogTitle>
            <DialogDescription>Preencha os dados do ponto de retirada para exibir ao cliente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Nome do local *</Label>
              <Input
                value={locationForm.name}
                onChange={e => setLocationForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex.: Loja Centro, Deposito Principal"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Rua / Avenida *</Label>
                <Input
                  value={locationForm.street}
                  onChange={e => setLocationForm(p => ({ ...p, street: e.target.value }))}
                  placeholder="Rua das Flores"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Numero *</Label>
                <Input
                  value={locationForm.number}
                  onChange={e => setLocationForm(p => ({ ...p, number: e.target.value }))}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Complemento</Label>
              <Input
                value={locationForm.complement}
                onChange={e => setLocationForm(p => ({ ...p, complement: e.target.value }))}
                placeholder="Sala 2, Bloco B"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cidade *</Label>
                <Input
                  value={locationForm.city}
                  onChange={e => setLocationForm(p => ({ ...p, city: e.target.value }))}
                  placeholder="Sao Paulo"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Estado *</Label>
                <Input
                  value={locationForm.state}
                  onChange={e => setLocationForm(p => ({ ...p, state: e.target.value.toUpperCase() }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>CEP</Label>
              <Input
                value={locationForm.zipCode}
                onChange={e => setLocationForm(p => ({ ...p, zipCode: e.target.value }))}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Horario de funcionamento</Label>
              <Input
                value={locationForm.hours}
                onChange={e => setLocationForm(p => ({ ...p, hours: e.target.value }))}
                placeholder="Seg-Sex 9h-18h, Sab 9h-13h"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Instrucoes ao cliente</Label>
              <Textarea
                value={locationForm.instructions}
                onChange={e => setLocationForm(p => ({ ...p, instructions: e.target.value }))}
                placeholder="Ex.: Traga documento com foto e o numero do pedido."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveLocation}>
              {editingLocation ? 'Salvar alteracoes' : 'Adicionar local'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Shipping Rule Dialog ── */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Editar regra de frete' : 'Adicionar regra de frete'}</DialogTitle>
            <DialogDescription>Configure como sera cobrado o frete desta regra no checkout.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome da regra *</Label>
              <Input
                value={ruleForm.name}
                onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex.: Frete Padrao, Envio Expresso"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de cobranca</Label>
              <Select value={ruleForm.type} onValueChange={v => setRuleForm(p => ({ ...p, type: v as CustomShippingType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Tarifa fixa — valor fixo para todos os pedidos</SelectItem>
                  <SelectItem value="free">Frete gratis — sempre R$ 0,00</SelectItem>
                  <SelectItem value="min_order">Gratis a partir de — valor minimo para isencao</SelectItem>
                  <SelectItem value="on_contact">A combinar — o lojista entra em contato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ruleForm.type === 'flat' && (
              <div className="space-y-1.5">
                <Label>Valor do frete (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={ruleForm.price}
                  onChange={e => setRuleForm(p => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
            )}
            {ruleForm.type === 'min_order' && (
              <div className="space-y-1.5">
                <Label>Valor minimo do pedido para frete gratis (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={ruleForm.minOrderValue}
                  onChange={e => setRuleForm(p => ({ ...p, minOrderValue: Number(e.target.value) }))}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prazo minimo (dias uteis)</Label>
                <Input
                  type="number"
                  min={1}
                  value={ruleForm.minDays}
                  onChange={e => setRuleForm(p => ({ ...p, minDays: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prazo maximo (dias uteis)</Label>
                <Input
                  type="number"
                  min={1}
                  value={ruleForm.maxDays}
                  onChange={e => setRuleForm(p => ({ ...p, maxDays: Number(e.target.value) }))}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-1">
              Estes prazos sao exibidos como estimativa de entrega para o cliente no checkout.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveRule}>{editingRule ? 'Salvar' : 'Adicionar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </SettingsPageLayout>
  );
}
