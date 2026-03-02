'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Pencil,
  Check,
  Layers,
  ToggleLeft,
  ToggleRight,
  Hash,
  CircleDollarSign,
  Boxes,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type VariantOption = {
  id: string;
  name: string;
  values: string[];
};

export type GeneratedVariant = {
  id: string;
  combination: Record<string, string>;
  sku: string;
  stock: number;
  priceAdjustment: number;
  available: boolean;
};

type ProductVariationsProps = {
  onChange?: (variants: GeneratedVariant[], options: VariantOption[]) => void;
  initialOptions?: VariantOption[];
};

/* ------------------------------------------------------------------ */
/*  Preset property suggestions                                        */
/* ------------------------------------------------------------------ */

const PROPERTY_PRESETS = [
  {
    name: 'Cor',
    icon: '🎨',
    placeholder: 'Ex: Vermelho, Azul, Preto',
    suggestions: ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Cinza', 'Marrom', 'Bege'],
  },
  {
    name: 'Tamanho',
    icon: '📐',
    placeholder: 'Ex: P, M, G, GG',
    suggestions: ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  },
  {
    name: 'Material',
    icon: '🧵',
    placeholder: 'Ex: Algodão, Poliéster',
    suggestions: ['Algodão', 'Poliéster', 'Couro', 'Linho', 'Seda', 'Nylon', 'Jeans'],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _uid = 0;
const uid = () => `vo_${++_uid}_${Date.now()}`;

function cartesian(options: VariantOption[]): Record<string, string>[] {
  if (options.length === 0) return [];
  const filtered = options.filter((o) => o.values.length > 0);
  if (filtered.length === 0) return [];

  return filtered.reduce<Record<string, string>[]>((acc, option) => {
    if (acc.length === 0) return option.values.map((v) => ({ [option.name]: v }));
    const next: Record<string, string>[] = [];
    for (const existing of acc) {
      for (const value of option.values) {
        next.push({ ...existing, [option.name]: value });
      }
    }
    return next;
  }, []);
}

function combinationKey(combo: Record<string, string>): string {
  return Object.entries(combo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
}

function comboLabel(combo: Record<string, string>): string {
  return Object.values(combo).join(' / ');
}

/* ------------------------------------------------------------------ */
/*  ValueTag                                                           */
/* ------------------------------------------------------------------ */

function ValueTag({ value, onRemove }: { value: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pl-2.5 pr-1 py-1 text-xs font-medium select-none">
      {value}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  OptionEditor — one property card (Cor, Tamanho, etc.)              */
/* ------------------------------------------------------------------ */

function OptionEditor({
  option,
  onUpdate,
  onRemove,
  presetSuggestions,
  isActive,
  onActivate,
}: {
  option: VariantOption;
  onUpdate: (opt: VariantOption) => void;
  onRemove: () => void;
  presetSuggestions: string[];
  isActive: boolean;
  onActivate: () => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addValue = useCallback(
    (raw: string) => {
      const val = raw.trim();
      if (!val || option.values.includes(val)) return;
      onUpdate({ ...option, values: [...option.values, val] });
    },
    [option, onUpdate],
  );

  const removeValue = useCallback(
    (val: string) => {
      onUpdate({ ...option, values: option.values.filter((v) => v !== val) });
    },
    [option, onUpdate],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addValue(inputValue);
        setInputValue('');
      }
    }
    if (e.key === 'Backspace' && inputValue === '' && option.values.length > 0) {
      removeValue(option.values[option.values.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addValue(inputValue);
      setInputValue('');
    }
  };

  // Focus the input when this card becomes active
  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  const unusedSuggestions = presetSuggestions.filter((s) => !option.values.includes(s));
  const preset = PROPERTY_PRESETS.find((p) => p.name === option.name);

  return (
    <div
      className={cn(
        'rounded-lg border-2 transition-all duration-200',
        isActive
          ? 'border-primary/60 bg-primary/3 shadow-sm shadow-primary/10'
          : 'border-border bg-card hover:border-border/80',
      )}
    >
      {/* Collapsed header — click to expand */}
      <button
        type="button"
        onClick={onActivate}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-base">{preset?.icon ?? '🏷️'}</span>
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">{option.name}</span>
          {option.values.length > 0 && (
            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
              {option.values.slice(0, 3).map((v) => (
                <Badge key={v} variant="outline" className="text-[10px] shrink-0">
                  {v}
                </Badge>
              ))}
              {option.values.length > 3 && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  +{option.values.length - 3}
                </span>
              )}
            </div>
          )}
          {option.values.length === 0 && (
            <span className="text-xs text-muted-foreground italic">Nenhum valor adicionado</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="secondary" className="text-[10px] tabular-nums">
            {option.values.length}
          </Badge>
          {isActive ? (
            <ChevronUp className="h-4 w-4 text-primary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded editing body */}
      {isActive && (
        <div className="border-t border-primary/20 px-4 py-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
          {/* Active editing indicator */}
          <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
            <Pencil className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Editando valores de <strong>{option.name}</strong>
            </span>
          </div>

          {/* Tag input field */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Valores da propriedade
            </label>
            <div
              className={cn(
                'flex flex-wrap items-center gap-1.5 rounded-md border-2 bg-background px-3 py-2.5 transition-all min-h-11',
                'border-primary/40 ring-2 ring-primary/20',
              )}
              onClick={() => inputRef.current?.focus()}
            >
              {option.values.map((val) => (
                <ValueTag key={val} value={val} onRemove={() => removeValue(val)} />
              ))}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={
                  option.values.length === 0
                    ? (preset?.placeholder ?? 'Digite e pressione Enter')
                    : 'Adicionar mais...'
                }
                className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Pressione{' '}
              <kbd className="rounded border border-border bg-muted px-1 py-px text-[10px] font-mono">
                Enter
              </kbd>{' '}
              ou{' '}
              <kbd className="rounded border border-border bg-muted px-1 py-px text-[10px] font-mono">
                ,
              </kbd>{' '}
              para adicionar &bull;{' '}
              <kbd className="rounded border border-border bg-muted px-1 py-px text-[10px] font-mono">
                Backspace
              </kbd>{' '}
              para remover o último
            </p>
          </div>

          {/* Quick suggestions */}
          {unusedSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Sugestões rápidas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unusedSuggestions.slice(0, 10).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addValue(s)}
                    className="rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15 hover:border-primary/60 active:scale-95 transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Remover propriedade
            </button>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {option.values.length} {option.values.length === 1 ? 'valor' : 'valores'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VariantCard — one card per generated variant                       */
/* ------------------------------------------------------------------ */

function VariantCard({
  variant,
  index,
  optionNames,
  isEditing,
  onStartEdit,
  onStopEdit,
  onUpdate,
}: {
  variant: GeneratedVariant;
  index: number;
  optionNames: string[];
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (patch: Partial<GeneratedVariant>) => void;
}) {
  // Local draft state for editing
  const [draft, setDraft] = useState({
    sku: variant.sku,
    stock: variant.stock,
    priceAdjustment: variant.priceAdjustment,
    available: variant.available,
  });

  // Sync draft when switching to edit mode
  useEffect(() => {
    if (isEditing) {
      setDraft({
        sku: variant.sku,
        stock: variant.stock,
        priceAdjustment: variant.priceAdjustment,
        available: variant.available,
      });
    }
  }, [isEditing, variant.sku, variant.stock, variant.priceAdjustment, variant.available]);

  const handleSave = () => {
    onUpdate({
      sku: draft.sku,
      stock: Math.max(0, Math.trunc(Number(draft.stock || 0))),
      priceAdjustment: Number(draft.priceAdjustment || 0),
      available: draft.available,
    });
    onStopEdit();
  };

  const handleCancel = () => {
    onStopEdit();
  };

  return (
    <div
      className={cn(
        'rounded-lg border-2 transition-all duration-200',
        isEditing
          ? 'border-primary/50 bg-primary/2 shadow-md shadow-primary/5'
          : 'border-border bg-card',
        !isEditing && !variant.available && 'opacity-60',
      )}
    >
      {/* Summary row — always visible */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
          !isEditing && 'hover:bg-muted/40',
        )}
        onClick={!isEditing ? onStartEdit : undefined}
      >
        {/* Index number */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground tabular-nums">
          {index + 1}
        </span>

        {/* Combination badges */}
        <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
          {optionNames.map((name, i) => (
            <span key={name} className="inline-flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground/40">/</span>}
              <Badge variant="outline" className="text-xs font-normal">
                {variant.combination[name]}
              </Badge>
            </span>
          ))}
        </div>

        {/* Quick info */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
          {variant.sku && (
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {variant.sku}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Boxes className="h-3 w-3" />
            {variant.stock}
          </span>
          {variant.priceAdjustment > 0 && (
            <span className="flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3" />
              +R$ {Number(variant.priceAdjustment).toFixed(2)}
            </span>
          )}
        </div>

        {/* Status + edit trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {variant.available ? (
            <Badge variant="default" className="text-[10px] px-1.5 py-0.5">Ativo</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Inativo</Badge>
          )}
          {!isEditing && (
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded draft editor */}
      {isEditing && (
        <div className="border-t border-primary/20 px-4 py-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
          {/* Draft indicator */}
          <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
            <Pencil className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Editando variante:{' '}
              <strong>{comboLabel(variant.combination)}</strong>
            </span>
          </div>

          {/* Draft fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Hash className="h-3 w-3 text-muted-foreground" />
                SKU
              </label>
              <Input
                value={draft.sku}
                onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
                placeholder={`SKU-${String(index + 1).padStart(3, '0')}`}
                className="text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Código único desta variante
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Boxes className="h-3 w-3 text-muted-foreground" />
                Estoque
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={draft.stock}
                onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value || 0) }))}
                className="text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Quantidade disponível
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <CircleDollarSign className="h-3 w-3 text-muted-foreground" />
                Ajuste de preço
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.priceAdjustment || ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, priceAdjustment: Number(e.target.value || 0) }))
                  }
                  className="text-sm"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Valor adicional sobre o preço base
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                {draft.available ? (
                  <ToggleRight className="h-3 w-3 text-primary" />
                ) : (
                  <ToggleLeft className="h-3 w-3 text-muted-foreground" />
                )}
                Status
              </label>
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, available: !d.available }))}
                className={cn(
                  'flex w-full items-center justify-between rounded-md border-2 px-3 py-2.5 text-sm transition-all',
                  draft.available
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-border bg-muted/50 text-muted-foreground',
                )}
              >
                <span>{draft.available ? 'Ativo — disponível na loja' : 'Inativo — oculto na loja'}</span>
                {draft.available ? (
                  <ToggleRight className="h-5 w-5" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Draft actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleSave} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Salvar variante
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant list                                                       */
/* ------------------------------------------------------------------ */

function VariantList({
  variants,
  options,
  onUpdateVariant,
}: {
  variants: GeneratedVariant[];
  options: VariantOption[];
  onUpdateVariant: (id: string, patch: Partial<GeneratedVariant>) => void;
}) {
  const optionNames = options.filter((o) => o.values.length > 0).map((o) => o.name);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            {variants.length} {variants.length === 1 ? 'variante gerada' : 'variantes geradas'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {collapsed ? (
            <>
              <ChevronDown className="h-3 w-3" /> Expandir lista
            </>
          ) : (
            <>
              <ChevronUp className="h-3 w-3" /> Recolher
            </>
          )}
        </button>
      </div>

      {/* Hint */}
      {!collapsed && editingId === null && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Pencil className="h-3 w-3" />
          Clique em uma variante para editar SKU, estoque e preço
        </p>
      )}

      {/* Cards */}
      {!collapsed && (
        <div className="space-y-2">
          {variants.map((variant, idx) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              index={idx}
              optionNames={optionNames}
              isEditing={editingId === variant.id}
              onStartEdit={() => setEditingId(variant.id)}
              onStopEdit={() => setEditingId(null)}
              onUpdate={(patch) => onUpdateVariant(variant.id, patch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ProductVariations({ onChange, initialOptions }: ProductVariationsProps) {
  const [options, setOptions] = useState<VariantOption[]>(initialOptions ?? []);
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [customPropertyName, setCustomPropertyName] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  const usedNames = useMemo(() => new Set(options.map((o) => o.name)), [options]);

  // Regenerate variants when options change
  const generatedCombos = useMemo(() => cartesian(options), [options]);

  useEffect(() => {
    const combos = generatedCombos;
    const prevMap = new Map(variants.map((v) => [combinationKey(v.combination), v]));
    const next = combos.map((combo) => {
      const key = combinationKey(combo);
      const existing = prevMap.get(key);
      if (existing) return { ...existing, combination: combo };
      return {
        id: uid(),
        combination: combo,
        sku: '',
        stock: 0,
        priceAdjustment: 0,
        available: true,
      };
    });
    const prevKeys = variants.map((v) => combinationKey(v.combination)).join(',');
    const nextKeys = next.map((v) => combinationKey(v.combination)).join(',');
    if (prevKeys !== nextKeys) {
      setVariants(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedCombos]);

  // Notify parent
  useEffect(() => {
    onChange?.(variants, options);
  }, [variants, options, onChange]);

  const addOption = useCallback((name: string) => {
    const id = uid();
    setOptions((prev) => [...prev, { id, name, values: [] }]);
    setActiveOptionId(id);
    setShowPropertyPicker(false);
    setIsCreatingCustom(false);
    setCustomPropertyName('');
  }, []);

  const updateOption = useCallback((updated: VariantOption) => {
    setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const removeOption = useCallback(
    (id: string) => {
      setOptions((prev) => prev.filter((o) => o.id !== id));
      if (activeOptionId === id) setActiveOptionId(null);
    },
    [activeOptionId],
  );

  const handleUpdateVariant = useCallback((id: string, patch: Partial<GeneratedVariant>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const handleAddCustomProperty = () => {
    const name = customPropertyName.trim();
    if (!name || usedNames.has(name)) return;
    addOption(name);
  };

  /* ---------- Empty state ---------- */
  if (options.length === 0 && !showPropertyPicker) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Package className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm text-foreground font-medium mb-1">Nenhuma variação cadastrada</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
          Adicione propriedades como <strong>Cor</strong>, <strong>Tamanho</strong> ou{' '}
          <strong>Material</strong> para gerar variações do produto automaticamente.
        </p>
        <Button type="button" variant="outline" onClick={() => setShowPropertyPicker(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar variações
        </Button>
      </div>
    );
  }

  /* ---------- Main UI ---------- */
  return (
    <div className="space-y-5">
      {/* ---- Option editors ---- */}
      {options.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Propriedades
          </p>
          {options.map((option) => {
            const preset = PROPERTY_PRESETS.find((p) => p.name === option.name);
            return (
              <OptionEditor
                key={option.id}
                option={option}
                onUpdate={updateOption}
                onRemove={() => removeOption(option.id)}
                presetSuggestions={preset ? [...preset.suggestions] : []}
                isActive={activeOptionId === option.id}
                onActivate={() =>
                  setActiveOptionId((prev) => (prev === option.id ? null : option.id))
                }
              />
            );
          })}
        </div>
      )}

      {/* ---- Add property picker ---- */}
      {showPropertyPicker ? (
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/3 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Adicionar nova propriedade</p>

          <div className="flex flex-wrap gap-2">
            {PROPERTY_PRESETS.filter((p) => !usedNames.has(p.name)).map((preset) => (
              <Button
                key={preset.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(preset.name)}
                className="gap-1.5"
              >
                <span>{preset.icon}</span>
                {preset.name}
              </Button>
            ))}
          </div>

          {/* Custom property */}
          {!isCreatingCustom ? (
            <button
              type="button"
              onClick={() => setIsCreatingCustom(true)}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Nova propriedade personalizada
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                value={customPropertyName}
                onChange={(e) => setCustomPropertyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomProperty();
                  }
                }}
                placeholder="Nome da propriedade (ex: Estampa)"
                className="text-sm sm:max-w-60"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomProperty}
                  disabled={!customPropertyName.trim() || usedNames.has(customPropertyName.trim())}
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingCustom(false);
                    setCustomPropertyName('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPropertyPicker(false);
                setIsCreatingCustom(false);
                setCustomPropertyName('');
              }}
              className="text-xs"
            >
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPropertyPicker(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Adicionar propriedade
        </Button>
      )}

      {/* ---- Generated variants ---- */}
      <VariantList variants={variants} options={options} onUpdateVariant={handleUpdateVariant} />
    </div>
  );
}
