'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, Sparkles, Tag, LayoutGrid, SortAsc, Settings2,
  ArrowUpRight, ChevronDown, Save, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import productOrganizeService, { ProductOrgSettings } from '@/services/productOrganizeService';
import { t } from '@/lib/admin-language';

// ─── Tab type ───────────────────────────────────────────────────────────────
type Tab = 'highlight' | 'sort' | 'configure';

// ─── Sorts ──────────────────────────────────────────────────────────────────
const SORT_OPTIONS: { value: ProductOrgSettings['defaultSort']; label: string }[] = [
  { value: 'BEST_SELLING',  label: t('Mais vendidos', 'Best selling') },
  { value: 'NEWEST',        label: t('Mais recentes', 'Newest') },
  { value: 'LOWEST_PRICE',  label: t('Menor preço', 'Lowest price') },
  { value: 'HIGHEST_PRICE', label: t('Maior preço', 'Highest price') },
  { value: 'ALPHABETICAL',  label: t('Alfabética (A→Z)', 'Alphabetical (A→Z)') },
];

// ─── Out-of-stock behaviors ──────────────────────────────────────────────────
const OOS_OPTIONS: { value: ProductOrgSettings['outOfStockListBehavior']; label: string; desc: string }[] = [
  { value: 'SHOW_AT_END',     label: t('Mostrar no final', 'Show at end'),     desc: t('Produtos sem estoque aparecem no final da listagem.', 'Out-of-stock products appear at the end.') },
  { value: 'MAINTAIN_ORDER',  label: t('Manter posição', 'Maintain position'), desc: t('Mantém a ordem de exibição independente do estoque.', 'Maintains display order regardless of stock.') },
  { value: 'HIDE',            label: t('Ocultar', 'Hide'),                     desc: t('Remove da listagem quando o estoque chega a zero.', 'Remove from listing when stock reaches zero.') },
];

// ─── Section card ────────────────────────────────────────────────────────────
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      {children}
    </div>
  );
}

// ─── Radio group ─────────────────────────────────────────────────────────────
function RadioGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string }[];
}) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt.value}
          className={`flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
            value === opt.value
              ? 'border-primary/50 bg-primary/5'
              : 'border-border hover:border-muted-foreground/40 hover:bg-muted/40'
          }`}>
          <input
            type="radio"
            name={`rg-${opt.value}`}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-primary shrink-0"
          />
          <div>
            <p className={`text-sm font-medium ${value === opt.value ? 'text-foreground' : 'text-foreground/80'}`}>
              {opt.label}
            </p>
            {opt.desc && <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Highlight card ──────────────────────────────────────────────────────────
function HighlightCard({
  icon, label, count, filterParam, color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  filterParam: string;
  color: string;
}) {
  return (
    <Link href={`/admin/products?${filterParam}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/40 transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{count.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );
}

// ─── Select wrapper ──────────────────────────────────────────────────────────
function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-1 focus:ring-primary">
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ProductOrganizeClient() {
  const [activeTab, setActiveTab] = useState<Tab>('highlight');
  const qc = useQueryClient();

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['product-org-settings'],
    queryFn: productOrganizeService.getSettings,
  });

  const { data: highlights, isLoading: loadingHighlights } = useQuery({
    queryKey: ['product-highlights'],
    queryFn: productOrganizeService.getHighlights,
  });

  // Local draft state for Ordenar + Configurar tabs
  const [draft, setDraft] = useState<ProductOrgSettings | null>(null);
  const current: ProductOrgSettings = draft ?? settings ?? {
    defaultSort: 'BEST_SELLING',
    outOfStockListBehavior: 'SHOW_AT_END',
    outOfStockSearchBehavior: 'SHOW_AT_END',
  };
  const isDirty = draft !== null;

  const mutation = useMutation({
    mutationFn: () => productOrganizeService.saveSettings(current),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-org-settings'] });
      setDraft(null);
    },
  });

  function patch(partial: Partial<ProductOrgSettings>) {
    setDraft(prev => ({ ...current, ...(prev ?? {}), ...partial }));
  }

  function discard() {
    setDraft(null);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'highlight', label: t('Destacar', 'Highlight'), icon: <Star className="h-4 w-4" /> },
    { id: 'sort',      label: t('Ordenar', 'Sort'),       icon: <SortAsc className="h-4 w-4" /> },
    { id: 'configure', label: t('Configurar', 'Configure'), icon: <Settings2 className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-full flex-col">

      {/* Page header */}
      <div className="border-b border-border px-4 md:px-6 lg:px-8 py-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground tracking-tight">
          {t('Organizar Produtos', 'Organize Products')}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t(
            'Defina destaques, ordenação padrão e comportamento de estoque.',
            'Define highlights, default sorting and stock behavior.',
          )}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border px-4 md:px-6 lg:px-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">

        {/* ── DESTACAR tab ── */}
        {activeTab === 'highlight' && (
          <div className="space-y-6 max-w-2xl">
            <SectionCard>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-foreground">
                  {t('Curadoria da Vitrine', 'Storefront Curation')}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                {t(
                  'Clique em uma coleção para editar quais produtos ela contém.',
                  'Click a collection to edit which products it contains.',
                )}
              </p>

              {loadingHighlights ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <HighlightCard
                    icon={<Star className="h-4 w-4 text-amber-600" />}
                    label={t('Destaques', 'Featured')}
                    count={highlights?.featuredCount ?? 0}
                    filterParam="priceType=featured"
                    color="bg-amber-100 dark:bg-amber-900/30"
                  />
                  <HighlightCard
                    icon={<Sparkles className="h-4 w-4 text-blue-600" />}
                    label={t('Lançamentos', 'New Arrivals')}
                    count={highlights?.newCount ?? 0}
                    filterParam="priceType=new"
                    color="bg-blue-100 dark:bg-blue-900/30"
                  />
                  <HighlightCard
                    icon={<Tag className="h-4 w-4 text-rose-600" />}
                    label={t('Ofertas', 'On Sale')}
                    count={highlights?.saleCount ?? 0}
                    filterParam="priceType=sale"
                    color="bg-rose-100 dark:bg-rose-900/30"
                  />
                  <HighlightCard
                    icon={<LayoutGrid className="h-4 w-4 text-violet-600" />}
                    label={t('Catálogo completo', 'Full catalog')}
                    count={highlights?.totalCount ?? 0}
                    filterParam=""
                    color="bg-violet-100 dark:bg-violet-900/30"
                  />
                </div>
              )}
            </SectionCard>

            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50 p-4">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-semibold">{t('Dica:', 'Tip:')}</span>{' '}
                {t(
                  'Para adicionar ou remover produtos de coleções, edite cada produto individualmente e use os campos "Produto em destaque" e "Lançamento".',
                  'To add or remove products from collections, edit each product individually and use the "Featured product" and "New arrival" fields.',
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── ORDENAR tab ── */}
        {activeTab === 'sort' && (
          <div className="space-y-6 max-w-2xl">
            {loadingSettings ? (
              <div className="h-48 animate-pulse rounded-lg bg-muted" />
            ) : (
              <SectionCard>
                <div className="flex items-center gap-2 mb-1">
                  <SortAsc className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {t('Ordenação padrão', 'Default sort order')}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  {t(
                    'Define como os produtos aparecem na vitrine quando nenhum filtro de ordenação foi aplicado pelo cliente.',
                    'Defines how products appear in the storefront when no sort filter has been applied by the customer.',
                  )}
                </p>
                <Select
                  label={t('Critério padrão para todas as categorias', 'Default criterion for all categories')}
                  value={current.defaultSort}
                  onChange={(v) => patch({ defaultSort: v })}
                  options={SORT_OPTIONS}
                />
              </SectionCard>
            )}
          </div>
        )}

        {/* ── CONFIGURAR tab ── */}
        {activeTab === 'configure' && (
          <div className="space-y-6 max-w-2xl">
            {loadingSettings ? (
              <div className="space-y-4">
                <div className="h-48 animate-pulse rounded-lg bg-muted" />
                <div className="h-48 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <>
                <SectionCard>
                  <h2 className="text-sm font-semibold text-foreground mb-1">
                    {t('Produtos sem estoque nas listagens', 'Out-of-stock in listing pages')}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t(
                      'Comportamento ao exibir categorias, marcas e coleções.',
                      'Behavior when displaying categories, brands and collections.',
                    )}
                  </p>
                  <RadioGroup
                    value={current.outOfStockListBehavior}
                    onChange={(v) => patch({ outOfStockListBehavior: v })}
                    options={OOS_OPTIONS}
                  />
                </SectionCard>

                <SectionCard>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-semibold text-foreground">
                      {t('Produtos sem estoque na busca', 'Out-of-stock in search')}
                    </h2>
                    <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-semibold px-2 py-0.5">
                      {t('Novo', 'New')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t(
                      'Comportamento ao exibir resultados da busca interna.',
                      'Behavior when showing internal search results.',
                    )}
                  </p>
                  <RadioGroup
                    value={current.outOfStockSearchBehavior}
                    onChange={(v) => patch({ outOfStockSearchBehavior: v })}
                    options={OOS_OPTIONS}
                  />
                </SectionCard>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Footer: save/cancel (only for sort + configure) ── */}
      {activeTab !== 'highlight' && (
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between max-w-2xl">
            <p className="text-xs text-muted-foreground">
              {isDirty
                ? t('Você tem alterações não salvas.', 'You have unsaved changes.')
                : t('Configurações atuais da loja.', 'Current store settings.')}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={discard} disabled={!isDirty || mutation.isPending}
                className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                {t('Descartar', 'Discard')}
              </Button>
              <Button size="sm" onClick={() => mutation.mutate()}
                disabled={!isDirty || mutation.isPending}
                className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                {mutation.isPending ? t('Salvando...', 'Saving...') : t('Salvar', 'Save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
