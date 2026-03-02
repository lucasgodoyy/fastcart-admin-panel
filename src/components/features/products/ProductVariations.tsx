'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, X, GripVertical, ChevronDown, ChevronUp, Package } from 'lucide-react';
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
  { name: 'Cor', placeholder: 'Ex: Vermelho, Azul, Preto', suggestions: ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Cinza', 'Marrom', 'Bege'] },
  { name: 'Tamanho', placeholder: 'Ex: P, M, G, GG', suggestions: ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
  { name: 'Material', placeholder: 'Ex: Algodão, Poliéster', suggestions: ['Algodão', 'Poliéster', 'Couro', 'Linho', 'Seda', 'Nylon', 'Jeans'] },
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _uid = 0;
const uid = () => `vo_${++_uid}_${Date.now()}`;

/** Cartesian product of value arrays */
function cartesian(options: VariantOption[]): Record<string, string>[] {
  if (options.length === 0) return [];
  const filtered = options.filter((o) => o.values.length > 0);
  if (filtered.length === 0) return [];

  return filtered.reduce<Record<string, string>[]>(
    (acc, option) => {
      if (acc.length === 0) {
        return option.values.map((v) => ({ [option.name]: v }));
      }
      const next: Record<string, string>[] = [];
      for (const existing of acc) {
        for (const value of option.values) {
          next.push({ ...existing, [option.name]: value });
        }
      }
      return next;
    },
    [],
  );
}

function combinationKey(combo: Record<string, string>): string {
  return Object.entries(combo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|');
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ValueTag({ value, onRemove }: { value: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pl-2.5 pr-1 py-1 text-xs font-medium">
      {value}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

function PropertySuggestionChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  OptionEditor — one row per property                                */
/* ------------------------------------------------------------------ */

function OptionEditor({
  option,
  onUpdate,
  onRemove,
  presetSuggestions,
}: {
  option: VariantOption;
  onUpdate: (opt: VariantOption) => void;
  onRemove: () => void;
  presetSuggestions: string[];
}) {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const addValue = useCallback(
    (raw: string) => {
      const val = raw.trim();
      if (!val) return;
      if (option.values.includes(val)) return;
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
      addValue(inputValue);
      setInputValue('');
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

  const unusedSuggestions = presetSuggestions.filter((s) => !option.values.includes(s));

  return (
    <div className="group rounded-lg border border-border bg-muted/30 transition-colors hover:border-border/80">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50 cursor-grab" />
        <div className="flex flex-1 items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{option.name}</span>
          <Badge variant="outline" className="text-[10px] tabular-nums">
            {option.values.length} {option.values.length === 1 ? 'valor' : 'valores'}
          </Badge>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((p) => !p)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {/* Tag input */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-shadow">
            {option.values.map((val) => (
              <ValueTag key={val} value={val} onRemove={() => removeValue(val)} />
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={option.values.length === 0 ? (PROPERTY_PRESETS.find(p => p.name === option.name)?.placeholder ?? 'Digite e pressione Enter') : 'Adicionar mais...'}
              className="flex-1 min-w-30 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Digite um valor e pressione <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">Enter</kbd> ou <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">,</kbd> para adicionar
          </p>

          {/* Quick suggestions */}
          {unusedSuggestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground">Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-1.5">
                {unusedSuggestions.slice(0, 8).map((s) => (
                  <PropertySuggestionChip key={s} label={s} onClick={() => addValue(s)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant table                                                      */
/* ------------------------------------------------------------------ */

function VariantTable({
  variants,
  options,
  onUpdateVariant,
}: {
  variants: GeneratedVariant[];
  options: VariantOption[];
  onUpdateVariant: (id: string, patch: Partial<GeneratedVariant>) => void;
}) {
  const optionNames = options.filter((o) => o.values.length > 0).map((o) => o.name);
  const [expandedTable, setExpandedTable] = useState(true);

  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            {variants.length} {variants.length === 1 ? 'variante gerada' : 'variantes geradas'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setExpandedTable((p) => !p)}
          className="text-xs text-primary hover:underline"
        >
          {expandedTable ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      {expandedTable && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {optionNames.map((name) => (
                  <th key={name} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {name}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  SKU
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Estoque
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ajuste de preço
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ativo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((variant, idx) => (
                <tr
                  key={variant.id}
                  className={cn(
                    'transition-colors hover:bg-muted/30',
                    !variant.available && 'opacity-50',
                  )}
                >
                  {optionNames.map((name) => (
                    <td key={name} className="px-3 py-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {variant.combination[name]}
                      </Badge>
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <Input
                      value={variant.sku}
                      onChange={(e) => onUpdateVariant(variant.id, { sku: e.target.value })}
                      placeholder={`SKU-${String(idx + 1).padStart(3, '0')}`}
                      className="h-8 text-xs max-w-35"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock}
                      onChange={(e) =>
                        onUpdateVariant(variant.id, {
                          stock: Math.max(0, Math.trunc(Number(e.target.value || 0))),
                        })
                      }
                      className="h-8 text-xs max-w-22.5"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 max-w-30">
                      <span className="text-xs text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.priceAdjustment || ''}
                        onChange={(e) =>
                          onUpdateVariant(variant.id, {
                            priceAdjustment: Number(e.target.value || 0),
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={variant.available}
                      onChange={(e) =>
                        onUpdateVariant(variant.id, { available: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    // Only update if the set of combinations actually changed
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
    setOptions((prev) => [...prev, { id: uid(), name, values: [] }]);
    setShowPropertyPicker(false);
    setIsCreatingCustom(false);
    setCustomPropertyName('');
  }, []);

  const updateOption = useCallback((updated: VariantOption) => {
    setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const removeOption = useCallback((id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const handleUpdateVariant = useCallback((id: string, patch: Partial<GeneratedVariant>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const handleAddCustomProperty = () => {
    const name = customPropertyName.trim();
    if (!name) return;
    if (usedNames.has(name)) return;
    addOption(name);
  };

  // Empty state — no options yet
  if (options.length === 0 && !showPropertyPicker) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Combine diferentes propriedades do seu produto.<br />
            Exemplo: <strong>cor</strong> + <strong>tamanho</strong>.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPropertyPicker(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar variações
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Option editors */}
      <div className="space-y-3">
        {options.map((option) => {
          const preset = PROPERTY_PRESETS.find((p) => p.name === option.name);
          return (
            <OptionEditor
              key={option.id}
              option={option}
              onUpdate={updateOption}
              onRemove={() => removeOption(option.id)}
              presetSuggestions={preset ? [...preset.suggestions] : []}
            />
          );
        })}
      </div>

      {/* Add property picker */}
      {showPropertyPicker ? (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Selecione uma propriedade</p>

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
                <Plus className="h-3 w-3" />
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
            <div className="flex items-center gap-2">
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
                className="h-8 text-sm max-w-60"
                autoFocus
              />
              <Button type="button" size="sm" onClick={handleAddCustomProperty} disabled={!customPropertyName.trim() || usedNames.has(customPropertyName.trim())}>
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

      {/* Generated variants table */}
      <VariantTable
        variants={variants}
        options={options}
        onUpdateVariant={handleUpdateVariant}
      />
    </div>
  );
}
