'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import orderService from '@/services/sales/orderService';
import productService from '@/services/catalog/product';
import { Product } from '@/types/product';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';

type LineItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
};

const ORIGINS = [
  'WhatsApp',
  'Instagram',
  'Facebook',
  'Presencial',
  'Telefone',
  'E-mail',
  t('Outro', 'Other'),
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function CreateManualOrderClient() {
  const router = useRouter();

  // ── Line items
  const [items, setItems] = useState<LineItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Discount
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState('');

  // ── Shipping
  const [shippingCost, setShippingCost] = useState('');

  // ── Customer
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');

  // ── Payment status
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PENDING' | 'PAID'>('PENDING');

  // ── Address
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  // ── Order info
  const [origin, setOrigin] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // ── Product search
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products-search', productSearch],
    queryFn: () => productService.listAll({ search: productSearch }),
    enabled: productSearch.trim().length > 1,
  });

  const addItem = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            unitPrice: product.salePrice ?? product.price,
            quantity: 1,
          },
        ];
      });
      setProductSearch('');
      setShowProductDropdown(false);
    },
    []
  );

  const removeItem = (productId: number) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const updateQty = (productId: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  };

  const updatePrice = (productId: number, price: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, unitPrice: price } : i))
    );
  };

  // ── CEP lookup
  const fetchCep = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch {
      // silent
    } finally {
      setCepLoading(false);
    }
  };

  // ── Totals
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const parsedDiscount = parseFloat(discountValue) || 0;
  const discountAmount =
    discountType === 'PERCENT'
      ? (subtotal * parsedDiscount) / 100
      : Math.min(parsedDiscount, subtotal);
  const parsedShipping = parseFloat(shippingCost) || 0;
  const total = subtotal - discountAmount + parsedShipping;

  // ── Mutation
  const createMutation = useMutation({
    mutationFn: () => {
      const shippingAddressJson =
        street || city
          ? JSON.stringify({
              cep,
              street,
              number,
              complement,
              neighborhood,
              city,
              state,
              country: 'BR',
            })
          : null;

      return orderService.createManualOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discountAmount: parsedDiscount > 0 ? parsedDiscount : null,
        discountType: parsedDiscount > 0 ? discountType : null,
        shippingCost: parsedShipping > 0 ? parsedShipping : null,
        customerFirstName: firstName || null,
        customerLastName: lastName || null,
        customerEmail: email || null,
        customerPhone: phone || null,
        customerCpfCnpj: cpfCnpj || null,
        paymentStatus,
        shippingAddressJson,
        origin: origin || null,
        internalNotes: internalNotes || null,
      });
    },
    onSuccess: () => {
      toast.success(t('Pedido manual criado!', 'Manual order created!'));
      router.push('/admin/sales/manual');
    },
    onError: () => toast.error(t('Erro ao criar pedido.', 'Failed to create order.')),
  });

  const canSubmit = items.length > 0 && !createMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {t('Novo Pedido Manual', 'New Manual Order')}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t(
            'Registre uma venda feita por WhatsApp, Instagram, presencial ou outro canal.',
            'Record a sale made via WhatsApp, Instagram, in-person or another channel.'
          )}
        </p>
      </div>

      {/* ── Section A: Products ─────────────────── */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-medium text-foreground">{t('Produtos', 'Products')}</h2>

        {/* Product search */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('Buscar produto...', 'Search product...')}
              value={productSearch}
              className="pl-9"
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
            />
          </div>
          {showProductDropdown && products.length > 0 && (
            <div className="absolute z-50 w-full mt-1 rounded-lg border bg-popover shadow-lg max-h-64 overflow-y-auto">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/60 transition-colors"
                  onClick={() => addItem(p)}
                >
                  {p.primaryImageUrl && (
                    <img
                      src={p.primaryImageUrl}
                      alt={p.name}
                      className="h-8 w-8 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(p.salePrice ?? p.price)}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Line items */}
        {items.length > 0 && (
          <div className="space-y-2 mt-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3"
              >
                <p className="flex-1 text-sm font-medium text-foreground truncate">
                  {item.productName}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-base font-medium"
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 text-base font-medium"
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                  className="w-28 h-8 text-right text-sm"
                />
                <span className="w-24 text-right text-sm font-semibold text-foreground shrink-0">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section B: Totals ─────────────────────── */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-medium text-foreground">{t('Valores', 'Totals')}</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Discount input */}
          <div className="space-y-2">
            <Label>{t('Desconto', 'Discount')}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <div className="flex overflow-hidden rounded-md border">
                <button
                  type="button"
                  onClick={() => setDiscountType('FIXED')}
                  className={`px-3 text-sm transition-colors ${
                    discountType === 'FIXED'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  R$
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('PERCENT')}
                  className={`px-3 text-sm transition-colors ${
                    discountType === 'PERCENT'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  %
                </button>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="space-y-2">
            <Label>{t('Frete', 'Shipping')}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-muted/30 px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('Subtotal', 'Subtotal')}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>{t('Desconto', 'Discount')}</span>
              <span>−{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {parsedShipping > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t('Frete', 'Shipping')}</span>
              <span>{formatCurrency(parsedShipping)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-foreground pt-1.5 border-t border-border/60">
            <span>{t('Total', 'Total')}</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </section>

      {/* ── Section C: Customer ─────────────────── */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-medium text-foreground">{t('Dados do Cliente', 'Customer Info')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('Nome', 'First Name')}</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('Sobrenome', 'Last Name')}</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('E-mail', 'Email')}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('Telefone / WhatsApp', 'Phone / WhatsApp')}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>CPF / CNPJ</Label>
            <Input
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
      </section>

      {/* ── Section D: Payment status ────────────── */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-medium text-foreground">
          {t('Status do Pagamento', 'Payment Status')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'UNPAID', label: t('Não pago', 'Unpaid'), color: 'bg-slate-100 text-slate-700' },
            {
              value: 'PENDING',
              label: t('Aguardando pagamento', 'Awaiting payment'),
              color: 'bg-yellow-100 text-yellow-700',
            },
            { value: 'PAID', label: t('Pago', 'Paid'), color: 'bg-emerald-100 text-emerald-700' },
          ].map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaymentStatus(value as typeof paymentStatus)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                paymentStatus === value
                  ? `${color} ring-2 ring-offset-1 ring-primary`
                  : 'border-border text-muted-foreground hover:bg-muted/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Section E: Shipping address ──────────── */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-medium text-foreground">
          {t('Endereço de Entrega', 'Shipping Address')}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>CEP</Label>
            <div className="relative">
              <Input
                value={cep}
                onChange={(e) => {
                  setCep(e.target.value);
                  if (e.target.value.replace(/\D/g, '').length === 8) {
                    fetchCep(e.target.value);
                  }
                }}
                placeholder="00000-000"
                maxLength={9}
              />
              {cepLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t('Rua / Logradouro', 'Street')}</Label>
            <Input value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('Número', 'Number')}</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t('Complemento', 'Complement')}</Label>
            <Input value={complement} onChange={(e) => setComplement(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('Bairro', 'Neighborhood')}</Label>
            <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('Cidade', 'City')}</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('Estado (UF)', 'State')}</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
          </div>
        </div>
      </section>

      {/* ── Section F: Origin + Notes ────────────── */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h2 className="font-medium text-foreground">
          {t('Canal de Venda e Observações', 'Sales Channel & Notes')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t('Origem do Pedido', 'Order Origin')}</Label>
            <div className="relative">
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">{t('Selecionar...', 'Select...')}</option>
                {ORIGINS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('Notas internas', 'Internal Notes')}</Label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder={t(
              'Observações visíveis apenas para a equipe...',
              'Notes visible only to the team...'
            )}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('Cancelar', 'Cancel')}
        </Button>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending
            ? t('Criando...', 'Creating...')
            : t('Criar Pedido', 'Create Order')}
        </Button>
      </div>
    </div>
  );
}
