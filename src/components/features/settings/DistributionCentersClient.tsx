'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Trash2, Plus, Pencil } from 'lucide-react';
import storeSettingsService from '@/services/storeSettingsService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface DistributionCenter {
  id?: number;
  name: string;
  address: string;
  country: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  isPrimary: boolean;
}

const emptyCenter: DistributionCenter = {
  name: '',
  address: '',
  country: 'Brasil',
  cep: '',
  state: '',
  city: '',
  neighborhood: '',
  street: '',
  number: '',
  complement: '',
  isPrimary: false,
};

export function DistributionCentersClient() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<DistributionCenter | null>(null);
  const [form, setForm] = useState<DistributionCenter>({ ...emptyCenter });
  const [cepLoading, setCepLoading] = useState(false);

  // Load distribution centers from store settings
  const { data: storeData, isLoading } = useQuery({
    queryKey: ['store-settings-dc'],
    queryFn: storeSettingsService.getMyStore,
  });

  // Parse distribution centers from store addressStreet (JSON) or individual fields
  const centers: DistributionCenter[] = (() => {
    if (!storeData) return [];
    // If addressStreet contains JSON array, parse it; otherwise build from flat fields
    try {
      const parsed = JSON.parse(storeData.addressStreet || '[]');
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: build single center from flat store fields
    }
    if (storeData.addressStreet || storeData.addressCity) {
      return [{
        id: 1,
        name: 'Centro principal',
        address: storeData.addressStreet || '',
        country: storeData.addressCountry || 'Brasil',
        cep: storeData.addressZipCode || '',
        state: storeData.addressState || '',
        city: storeData.addressCity || '',
        neighborhood: '',
        street: storeData.addressStreet || '',
        number: '',
        complement: '',
        isPrimary: true,
      }];
    }
    return [];
  })();

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedCenters: DistributionCenter[]) => {
      const primary = updatedCenters.find(c => c.isPrimary) || updatedCenters[0];
      return storeSettingsService.updateMyStore({
        addressStreet: JSON.stringify(updatedCenters),
        addressCity: primary?.city || '',
        addressState: primary?.state || '',
        addressZipCode: primary?.cep || '',
        addressCountry: primary?.country || 'Brasil',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings-dc'] });
      toast.success('Centro de distribuição salvo com sucesso!');
      setDialogOpen(false);
      setEditingCenter(null);
    },
    onError: () => {
      toast.error('Erro ao salvar centro de distribuição.');
    },
  });

  // CEP auto-fill (ViaCEP)
  const fetchCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          address: `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`,
        }));
      }
    } catch { /* ignore */ }
    setCepLoading(false);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setEditingCenter(null);
    setForm({ ...emptyCenter, isPrimary: centers.length === 0 });
    setDialogOpen(true);
  };

  const openEdit = (center: DistributionCenter, index: number) => {
    setEditingCenter(center);
    setForm({ ...center });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Nome do local é obrigatório.');
      return;
    }
    if (!form.cep.trim()) {
      toast.error('CEP é obrigatório.');
      return;
    }

    let updated: DistributionCenter[];
    if (editingCenter) {
      updated = centers.map(c => c === editingCenter ? { ...form } : c);
    } else {
      updated = [...centers, { ...form, id: Date.now() }];
    }
    // Ensure only one primary
    if (form.isPrimary) {
      updated = updated.map(c => ({ ...c, isPrimary: c === updated.find(x => x.name === form.name && x.cep === form.cep) }));
    }
    saveMutation.mutate(updated);
  };

  const handleDelete = (index: number) => {
    const updated = centers.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    saveMutation.mutate(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = centers.map((c, i) => ({ ...c, isPrimary: i === index }));
    saveMutation.mutate(updated);
  };

  return (
    <SettingsPageLayout
      title="Centros de distribuição"
      description="Gerencie os locais de envio e armazenamento dos produtos da loja."
      helpText="Mais sobre centros de distribuição"
      helpHref="#"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : centers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 md:p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Nenhum centro cadastrado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Cadastre o local principal de onde seus produtos são enviados para calcular fretes com precisão.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar centro de distribuição
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {centers.map((center, i) => (
              <div key={center.id || i} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{center.name}</p>
                    {center.isPrimary && (
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {[center.street, center.number, center.neighborhood, center.city, center.state, center.cep]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!center.isPrimary && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(i)} className="text-xs h-8">
                      Definir principal
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(center, i)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end">
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar centro
            </Button>
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCenter ? 'Editar centro de distribuição' : 'Novo centro de distribuição'}</DialogTitle>
            <DialogDescription>
              {editingCenter
                ? 'Atualize as informações do centro de distribuição.'
                : 'Informe os dados do local de envio dos seus produtos.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="dc-name" className="text-sm font-medium text-foreground">Nome do local *</Label>
              <Input
                id="dc-name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Depósito principal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dc-country" className="text-sm font-medium text-foreground">País</Label>
              <Input id="dc-country" value={form.country} disabled />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dc-cep" className="text-sm font-medium text-foreground">CEP *</Label>
                <div className="relative">
                  <Input
                    id="dc-cep"
                    value={form.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    onBlur={(e) => fetchCep(e.target.value)}
                    placeholder="00000-000"
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dc-state" className="text-sm font-medium text-foreground">Estado</Label>
                <Input id="dc-state" value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dc-city" className="text-sm font-medium text-foreground">Cidade</Label>
                <Input id="dc-city" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dc-neighborhood" className="text-sm font-medium text-foreground">Bairro</Label>
                <Input id="dc-neighborhood" value={form.neighborhood} onChange={(e) => handleChange('neighborhood', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dc-street" className="text-sm font-medium text-foreground">Rua</Label>
              <Input id="dc-street" value={form.street} onChange={(e) => handleChange('street', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dc-number" className="text-sm font-medium text-foreground">Número</Label>
                <Input id="dc-number" value={form.number} onChange={(e) => handleChange('number', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dc-complement" className="text-sm font-medium text-foreground">Complemento</Label>
                <Input id="dc-complement" value={form.complement} onChange={(e) => handleChange('complement', e.target.value)} />
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-sm font-medium text-foreground">Estoque</Label>
              <p className="text-xs text-muted-foreground mt-1">O estoque deste centro estará disponível para todas as vendas</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCenter ? 'Salvar alterações' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsPageLayout>
  );
}
