'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, GripVertical, Trash2, ChevronDown } from 'lucide-react';
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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PROPERTY_PRESETS: { name: string; suggestions: string[] }[] = [
  {
    name: 'Cor',
    suggestions: ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Cinza', 'Marrom', 'Bege'],
  },
  {
    name: 'Tamanho',
    suggestions: ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
  },
  {
    name: 'Material',
    suggestions: ['Algodão', 'Poliéster', 'Couro', 'Linho', 'Seda', 'Nylon', 'Jeans'],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _uid = 0;
const uid = () => `vo_${++_uid}_${Date.now()}`;

function cartesian(options: VariantOption[]): Record<string, string>[] {
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

/* ------------------------------------------------------------------ */
/*  TagInput — inline tag editor like Nuvemshop                        */
/* ------------------------------------------------------------------ */

function TagInput({
  values,
  suggestions,
  placeholder,
  onAdd,
  onRemove,
}: {
  values: string[];
  suggestions: string[];
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const unusedSuggestions = suggestions.filter((s) => !values.includes(s));
  const filteredSuggestions = input.trim()
    ? unusedSuggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase()))
    : unusedSuggestions;

  const addValue = (raw: string) => {
    const val = raw.trim();
    if (!val || values.includes(val)) return;
    onAdd(val);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addValue(input);
    }
    if (e.key === 'Backspace' && input === '' && values.length > 0) {
      onRemove(values[values.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 min-h-10 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pl-2.5 pr-1 py-0.5 text-xs font-medium">
            {v}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(v); }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
            if (input.trim()) addValue(input);
          }}
          placeholder={values.length === 0 ? placeholder : 'Adicionar...'}
          className="flex-1 min-w-20 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Quick suggestion chips */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filteredSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { addValue(s); inputRef.current?.focus(); }}
              className="rounded-full border border-dashed border-muted-foreground/30 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PropertyRow — a single property (Cor, Tamanho, etc.)               */
/* ------------------------------------------------------------------ */

function PropertyRow({
  option,
  availablePresets,
  onUpdate,
  onRemove,
  onNameChange,
}: {
  option: VariantOption;
  availablePresets: string[];
  onUpdate: (opt: VariantOption) => void;
  onRemove: () => void;
  onNameChange: (id: string, name: string) => void;
}) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const preset = PROPERTY_PRESETS.find((p) => p.name === option.name);
  const isPreset = !!preset;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header row: property name selector + delete */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">Nome da propriedade</label>
          {isPreset ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <span>{option.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {isSelectOpen && (
                <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                  {availablePresets.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onNameChange(option.id, name);
                        setIsSelectOpen(false);
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors',
                        name === option.name && 'font-semibold bg-accent/50',
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Input
              value={option.name}
              onChange={(e) => onNameChange(option.id, e.target.value)}
              placeholder="Nome da propriedade"
              className="text-sm"
            />
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="mt-5 shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Values section */}
      <div className="px-4 py-3">
        <label className="mb-1.5 block text-xs text-muted-foreground">
          Valores da propriedade
        </label>
        <TagInput
          values={option.values}
          suggestions={preset?.suggestions ?? []}
          placeholder={
            preset
              ? `Ex: ${preset.suggestions.slice(0, 3).join(', ')}`
              : 'Digite e pressione Enter'
          }
          onAdd={(val) => onUpdate({ ...option, values: [...option.values, val] })}
          onRemove={(val) =>
            onUpdate({ ...option, values: option.values.filter((v) => v !== val) })
          }
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Pressione <kbd className="rounded border bg-muted px-1 py-px text-[10px] font-mono">Enter</kbd> ou{' '}
          <kbd className="rounded border bg-muted px-1 py-px text-[10px] font-mono">,</kbd> para adicionar
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant table — compact tabular view of generated variants         */
/* ------------------------------------------------------------------ */

function VariantTable({
  variants,
  optionNames,
  onUpdate,
}: {
  variants: GeneratedVariant[];
  optionNames: string[];
  onUpdate: (id: string, patch: Partial<GeneratedVariant>) => void;
}) {
  if (variants.length === 0) return null;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
        <p className="text-xs font-semibold text-foreground">
          {variants.length} {variants.length === 1 ? 'variante' : 'variantes'}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {optionNames.map((name) => (
                <th key={name} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {name}
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">SKU</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-24">Estoque</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-28">Ajuste preço</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-border last:border-0 hover:bg-muted/20">
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
                    onChange={(e) => onUpdate(variant.id, { sku: e.target.value })}
                    placeholder="SKU"
                    className="h-8 text-xs w-28"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(e) => onUpdate(variant.id, { stock: Number(e.target.value || 0) })}
                    className="h-8 text-xs w-20"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.priceAdjustment || ''}
                      onChange={(e) =>
                        onUpdate(variant.id, { priceAdjustment: Number(e.target.value || 0) })
                      }
                      className="h-8 text-xs w-20"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ProductVariations({ onChange, initialOptions }: ProductVariationsProps) {
  const [options, setOptions] = useState<VariantOption[]>(initialOptions ?? []);
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);

  const usedNames = useMemo(() => new Set(options.map((o) => o.name)), [options]);

  // Names available for any property dropdown (unused presets)
  const availablePresetNames = PROPERTY_PRESETS.map((p) => p.name).filter((n) => !usedNames.has(n));

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
    if (prevKeys !== nextKeys) setVariants(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedCombos]);

  // Notify parent
  useEffect(() => {
    onChange?.(variants, options);
  }, [variants, options, onChange]);

  const addOption = useCallback(
    (name: string) => {
      setOptions((prev) => [...prev, { id: uid(), name, values: [] }]);
    },
    [],
  );

  const updateOption = useCallback((updated: VariantOption) => {
    setOptions((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const removeOption = useCallback((id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const handleNameChange = useCallback((id: string, name: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, name, values: [] } : o)),
    );
  }, []);

  const handleUpdateVariant = useCallback((id: string, patch: Partial<GeneratedVariant>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const optionNames = options.filter((o) => o.values.length > 0).map((o) => o.name);
  const canAddMore = options.length < 3; // Nuvemshop limit: 3 properties

  return (
    <div className="space-y-4">
      {/* Property rows */}
      {options.map((option) => (
        <PropertyRow
          key={option.id}
          option={option}
          availablePresets={[option.name, ...availablePresetNames]}
          onUpdate={updateOption}
          onRemove={() => removeOption(option.id)}
          onNameChange={handleNameChange}
        />
      ))}

      {/* Add property button */}
      {canAddMore && (
        <AddPropertyButton
          usedNames={usedNames}
          onAddPreset={addOption}
          onAddCustom={addOption}
        />
      )}

      {/* Variant table */}
      {variants.length > 0 && (
        <VariantTable
          variants={variants}
          optionNames={optionNames}
          onUpdate={handleUpdateVariant}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AddPropertyButton — dropdown to pick Cor/Tamanho/+ Nova           */
/* ------------------------------------------------------------------ */

function AddPropertyButton({
  usedNames,
  onAddPreset,
  onAddCustom,
}: {
  usedNames: Set<string>;
  onAddPreset: (name: string) => void;
  onAddCustom: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const availablePresets = PROPERTY_PRESETS.filter((p) => !usedNames.has(p.name));

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCustomSubmit = () => {
    const name = customName.trim();
    if (!name || usedNames.has(name)) return;
    onAddCustom(name);
    setCustomName('');
    setCustomMode(false);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => { setOpen(!open); setCustomMode(false); }}
        className="gap-1.5 text-primary border-dashed"
      >
        <Plus className="h-4 w-4" />
        Adicionar propriedade
      </Button>

      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-56 rounded-lg border border-border bg-popover shadow-lg">
          {!customMode ? (
            <div className="py-1">
              {availablePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => { onAddPreset(preset.name); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                >
                  {preset.name}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova propriedade
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <label className="text-xs text-muted-foreground">Nome da nova propriedade</label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleCustomSubmit(); }
                  if (e.key === 'Escape') { setCustomMode(false); setOpen(false); }
                }}
                placeholder="Ex: Estampa, Sabor..."
                className="text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" onClick={handleCustomSubmit} disabled={!customName.trim()}>
                  Adicionar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCustomMode(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
