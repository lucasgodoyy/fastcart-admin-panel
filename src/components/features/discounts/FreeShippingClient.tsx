'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shippingOfferService, { ShippingOffer } from '@/services/shippingOfferService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, Plus, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

function formatCurrency(value: number | null) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function FreeShippingClient() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: offers = [], isLoading } = useQuery<ShippingOffer[]>({
    queryKey: ['shipping-offers'],
    queryFn: shippingOfferService.list,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      shippingOfferService.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-offers'] });
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao alterar status.'),
  });

  // Create form state
  const [form, setForm] = useState({
    name: '',
    minCartAmount: '',
    deliveryZoneType: 'ALL' as string,
    applyScopeType: 'ALL_PRODUCTS' as string,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      shippingOfferService.create({
        name: form.name,
        shippingMethodCodes: ['ALL'],
        applyScopeType: form.applyScopeType,
        deliveryZoneType: form.deliveryZoneType,
        minCartAmount: form.minCartAmount ? Number(form.minCartAmount) : undefined,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-offers'] });
      toast.success('Oferta de frete grátis criada!');
      setDialogOpen(false);
      setForm({ name: '', minCartAmount: '', deliveryZoneType: 'ALL', applyScopeType: 'ALL_PRODUCTS' });
    },
    onError: () => toast.error('Erro ao criar oferta.'),
  });

  const activeOffers = offers.filter((o) => o.active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Frete Grátis</h1>
          <p className="text-sm text-muted-foreground">
            Configure regras de frete grátis para suas vendas.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova oferta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar oferta de frete grátis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nome da oferta</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Frete grátis acima de R$ 199"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor mínimo do carrinho (opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.minCartAmount}
                  onChange={(e) => setForm((p) => ({ ...p, minCartAmount: e.target.value }))}
                  placeholder="ex: 199.90"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Zona de entrega</Label>
                <Select
                  value={form.deliveryZoneType}
                  onValueChange={(v) => setForm((p) => ({ ...p, deliveryZoneType: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todo o Brasil</SelectItem>
                    <SelectItem value="STATES">Apenas alguns estados</SelectItem>
                    <SelectItem value="CITIES">Apenas algumas cidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Aplicar a</Label>
                <Select
                  value={form.applyScopeType}
                  onValueChange={(v) => setForm((p) => ({ ...p, applyScopeType: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_PRODUCTS">Todos os produtos</SelectItem>
                    <SelectItem value="SPECIFIC_CATEGORIES">Categorias específicas</SelectItem>
                    <SelectItem value="SPECIFIC_PRODUCTS">Produtos específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate()}
                disabled={!form.name || createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar oferta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ofertas ativas</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOffers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total de ofertas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhuma oferta de frete grátis</p>
            <p className="text-xs text-muted-foreground mt-1">
              Crie sua primeira oferta para incentivar vendas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{offer.name}</p>
                    {offer.active ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">Ativa</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Inativa</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Mínimo: {formatCurrency(offer.minCartAmount)}</span>
                    <span>Zona: {offer.deliveryZoneType}</span>
                    <span>Início: {formatDate(offer.startsAt)}</span>
                    <span>Fim: {formatDate(offer.expiresAt)}</span>
                  </div>
                </div>
                <Switch
                  checked={offer.active}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: offer.id, active: checked })
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
