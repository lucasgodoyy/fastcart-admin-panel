'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Package, Plus, Pencil, Trash2, Loader2, GripVertical, Type, Hash, ListChecks, ToggleLeft, AlignLeft } from 'lucide-react';
import storeSettingsService from '@/services/storeSettingsService';
import { toast } from 'sonner';

type FieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'CHECKBOX';

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  appliesTo: 'PRODUCT' | 'CATEGORY' | 'ORDER';
  options?: string[]; // for SELECT type
  placeholder?: string;
  active: boolean;
  order: number;
}

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ElementType }[] = [
  { value: 'TEXT', label: 'Texto curto', icon: Type },
  { value: 'TEXTAREA', label: 'Texto longo', icon: AlignLeft },
  { value: 'NUMBER', label: 'Numérico', icon: Hash },
  { value: 'SELECT', label: 'Seleção', icon: ListChecks },
  { value: 'CHECKBOX', label: 'Checkbox', icon: ToggleLeft },
];

const APPLIES_TO_OPTIONS = [
  { value: 'PRODUCT', label: 'Produtos' },
  { value: 'CATEGORY', label: 'Categorias' },
  { value: 'ORDER', label: 'Pedidos' },
];

const emptyField: CustomField = {
  id: '',
  name: '',
  label: '',
  type: 'TEXT',
  required: false,
  appliesTo: 'PRODUCT',
  options: [],
  placeholder: '',
  active: true,
  order: 0,
};

// Store custom fields in store settings JSON until a dedicated backend endpoint is created
const STORAGE_KEY = 'customFieldsJson';

export function CustomFieldsClient() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [form, setForm] = useState<CustomField>({ ...emptyField });
  const [optionsText, setOptionsText] = useState('');

  // Load custom fields from store settings
  const { data: storeData, isLoading } = useQuery({
    queryKey: ['store-settings-cf'],
    queryFn: storeSettingsService.getMyStore,
  });

  const fields: CustomField[] = (() => {
    if (!storeData) return [];
    try {
      // Try parsing from the description field which we'll use as a JSON storage
      const meta = JSON.parse(storeData.description || '{}');
      if (meta.customFields && Array.isArray(meta.customFields)) return meta.customFields;
    } catch { /* ignore */ }
    return [];
  })();

  const saveMutation = useMutation({
    mutationFn: async (updatedFields: CustomField[]) => {
      let meta: Record<string, unknown> = {};
      try { meta = JSON.parse(storeData?.description || '{}'); } catch { /* ignore */ }
      meta.customFields = updatedFields;
      return storeSettingsService.updateMyStore({
        description: JSON.stringify(meta),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings-cf'] });
      toast.success('Campos personalizados salvos!');
      setDialogOpen(false);
      setEditingField(null);
    },
    onError: () => {
      toast.error('Erro ao salvar campos personalizados.');
    },
  });

  const openCreate = () => {
    setEditingField(null);
    setForm({ ...emptyField, id: crypto.randomUUID(), order: fields.length });
    setOptionsText('');
    setDialogOpen(true);
  };

  const openEdit = (field: CustomField) => {
    setEditingField(field);
    setForm({ ...field });
    setOptionsText((field.options || []).join('\n'));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim()) {
      toast.error('O nome do campo é obrigatório.');
      return;
    }
    const finalForm = {
      ...form,
      name: form.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      options: form.type === 'SELECT' ? optionsText.split('\n').map(o => o.trim()).filter(Boolean) : [],
    };

    let updated: CustomField[];
    if (editingField) {
      updated = fields.map(f => f.id === editingField.id ? finalForm : f);
    } else {
      updated = [...fields, finalForm];
    }
    saveMutation.mutate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = fields.filter(f => f.id !== id);
    saveMutation.mutate(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = fields.map(f => f.id === id ? { ...f, active: !f.active } : f);
    saveMutation.mutate(updated);
  };

  const getFieldIcon = (type: FieldType) => {
    const found = FIELD_TYPES.find(t => t.value === type);
    return found ? found.icon : Type;
  };

  const getAppliesToLabel = (val: string) =>
    APPLIES_TO_OPTIONS.find(o => o.value === val)?.label || val;

  return (
    <SettingsPageLayout
      title="Campos personalizados"
      description="Adicione informação exclusiva e personalize a gestão de sua loja."
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 md:p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Nenhum campo personalizado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
              Campos personalizados permitem adicionar informações extras aos seus produtos, categorias e pedidos,
              como gravação, personalização, tamanho sob medida e mais.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {FIELD_TYPES.map(({ value, label }) => (
              <span
                key={value}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
          <Button onClick={openCreate} className="gap-2 mt-2">
            <Plus className="h-4 w-4" />
            Criar campo personalizado
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            <div className="px-5 py-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {fields.length} campo{fields.length !== 1 ? 's' : ''} personalizado{fields.length !== 1 ? 's' : ''}
              </p>
            </div>
            {fields.map((field) => {
              const Icon = getFieldIcon(field.type);
              return (
                <div key={field.id} className="flex items-center gap-4 px-5 py-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{field.label}</p>
                      {field.required && <Badge variant="secondary" className="text-[10px]">Obrigatório</Badge>}
                      {!field.active && <Badge variant="outline" className="text-[10px] text-muted-foreground">Inativo</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {FIELD_TYPES.find(t => t.value === field.type)?.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">•</span>
                      <span className="text-[11px] text-muted-foreground">
                        {getAppliesToLabel(field.appliesTo)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={field.active}
                      onCheckedChange={() => handleToggleActive(field.id)}
                      className="scale-75"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(field)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(field.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end">
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo campo
            </Button>
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Editar campo' : 'Novo campo personalizado'}</DialogTitle>
            <DialogDescription>
              {editingField
                ? 'Atualize as configurações do campo personalizado.'
                : 'Defina um campo extra para adicionar informações exclusivas.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nome do campo *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Cor personalizada"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tipo do campo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm(prev => ({ ...prev, type: v as FieldType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Aplicar em</Label>
                <Select
                  value={form.appliesTo}
                  onValueChange={(v) => setForm(prev => ({ ...prev, appliesTo: v as CustomField['appliesTo'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLIES_TO_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Placeholder</Label>
              <Input
                value={form.placeholder || ''}
                onChange={(e) => setForm(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Texto de exemplo dentro do campo"
              />
            </div>

            {form.type === 'SELECT' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Opções (uma por linha)</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder={"Opção 1\nOpção 2\nOpção 3"}
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Obrigatório</p>
                <p className="text-xs text-muted-foreground">O campo deve ser preenchido obrigatoriamente</p>
              </div>
              <Switch
                checked={form.required}
                onCheckedChange={(v) => setForm(prev => ({ ...prev, required: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingField ? 'Salvar' : 'Criar campo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsPageLayout>
  );
}
