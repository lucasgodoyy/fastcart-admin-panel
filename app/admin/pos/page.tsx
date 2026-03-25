'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Plus, Minus, Trash2, User, Tag, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/admin-language';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import posService from '@/services/pos/posService';
import type {
  PosCartItem,
  PosProductResponse,
  PosPaymentMethod,
  PosSaleRequest,
} from '@/types/pos';
import { PosPaymentModal } from '@/components/admin/pos/payment-modal';
import { PosSaleSuccessModal } from '@/components/admin/pos/sale-success-modal';

export default function PosSalePage() {
  const queryClient = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<{ orderId: number; changeAmount: number | null } | null>(null);

  // Focus search on mount and on key press
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        if (cart.length > 0) setShowPaymentModal(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cart.length]);

  // Products search
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['pos-products', search],
    queryFn: () => posService.searchProducts(search || undefined),
    staleTime: 30_000,
  });

  // Check cash register
  const { data: currentRegister } = useQuery({
    queryKey: ['pos-current-register'],
    queryFn: () => posService.getCurrentRegister(),
    retry: false,
  });

  // Sale mutation
  const saleMutation = useMutation({
    mutationFn: (data: PosSaleRequest) => posService.createSale(data),
    onSuccess: (sale) => {
      setCompletedSale({ orderId: sale.orderId, changeAmount: sale.changeAmount });
      setCart([]);
      setCustomerName('');
      setCustomerDocument('');
      setDiscountAmount(0);
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['pos-current-register'] });
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('Erro ao finalizar venda', 'Error completing sale'));
    },
  });

  // ─── Cart operations ──────────────────────────────────────────

  const addToCart = useCallback((product: PosProductResponse, variantId?: number) => {
    setCart((prev) => {
      const key = `${product.id}-${variantId || 0}`;
      const existing = prev.find((i) => `${i.productId}-${i.variantId || 0}` === key);

      if (existing) {
        if (!product.infiniteStock && existing.quantity >= existing.stock) {
          toast.error(t('Estoque insuficiente', 'Insufficient stock'));
          return prev;
        }
        return prev.map((i) =>
          `${i.productId}-${i.variantId || 0}` === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      const variant = variantId
        ? product.variants?.find((v) => v.id === variantId)
        : null;

      const unitPrice = variant ? variant.price : (product.salePrice ?? product.price);
      const stock = variant ? variant.stock : product.stock;

      return [
        ...prev,
        {
          productId: product.id,
          variantId: variantId || null,
          name: variant ? `${product.name} - ${variant.name}` : product.name,
          sku: variant?.sku || product.sku,
          imageUrl: product.imageUrl,
          unitPrice,
          quantity: 1,
          stock,
          infiniteStock: product.infiniteStock,
        },
      ];
    });
  }, []);

  const updateQuantity = (productId: number, variantId: number | null | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId || (item.variantId || 0) !== (variantId || 0)) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (!item.infiniteStock && newQty > item.stock) {
            toast.error(t('Estoque insuficiente', 'Insufficient stock'));
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const removeFromCart = (productId: number, variantId: number | null | undefined) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && (i.variantId || 0) === (variantId || 0))));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCustomerName('');
    setCustomerDocument('');
  };

  // ─── Totals ────────────────────────────────────────────────────

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  // ─── Payment ───────────────────────────────────────────────────

  const handlePayment = (method: PosPaymentMethod, amountReceived?: number) => {
    const request: PosSaleRequest = {
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      paymentMethod: method,
      amountReceived: method === 'CASH' ? amountReceived : null,
      discountAmount: discountAmount > 0 ? discountAmount : null,
      customerName: customerName || null,
      customerDocument: customerDocument || null,
    };
    saleMutation.mutate(request);
    setShowPaymentModal(false);
  };

  // ─── No cash register ─────────────────────────────────────────

  const noRegister = !currentRegister;

  return (
    <div className="flex h-full">
      {/* ─── Left: Product catalog ─────────────────────────────── */}
      <div className="flex flex-1 flex-col border-r">
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder={t('Buscar produto por nome, SKU ou código de barras (F2)', 'Search by name, SKU or barcode (F2)')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Products grid */}
        <ScrollArea className="flex-1 p-3">
          {noRegister && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <DollarSignIcon className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">{t('Caixa não aberto', 'Cash register not open')}</p>
              <p className="text-sm">{t('Abra o caixa para começar a vender', 'Open the register to start selling')}</p>
              <Button className="mt-4" onClick={() => window.location.href = '/admin/pos/cash-register'}>
                {t('Abrir Caixa', 'Open Register')}
              </Button>
            </div>
          )}

          {!noRegister && loadingProducts && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}

          {!noRegister && !loadingProducts && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShoppingCart className="mb-4 h-12 w-12" />
              <p>{t('Nenhum produto encontrado', 'No products found')}</p>
            </div>
          )}

          {!noRegister && !loadingProducts && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ─── Right: Cart ───────────────────────────────────────── */}
      <div className="flex w-[380px] flex-col bg-card">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">
            {t('Carrinho', 'Cart')} ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs text-muted-foreground">
              {t('Limpar', 'Clear')}
            </Button>
          )}
        </div>

        {/* Cart items */}
        <ScrollArea className="flex-1 px-4 py-2">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="mb-3 h-10 w-10" />
              <p className="text-sm">{t('Carrinho vazio', 'Empty cart')}</p>
            </div>
          )}
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || 0}`}
                className="flex items-center gap-3 rounded-lg border p-2"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    IMG
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.variantId, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.variantId, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.productId, item.variantId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Customer & discount */}
        <div className="space-y-2 border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('Nome do cliente (opcional)', 'Customer name (optional)')}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('CPF/CNPJ (opcional)', 'Document (optional)')}
              value={customerDocument}
              onChange={(e) => setCustomerDocument(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder={t('Desconto R$', 'Discount R$')}
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Totals & checkout */}
        <div className="border-t px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('Subtotal', 'Subtotal')}</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-destructive">
              <span>{t('Desconto', 'Discount')}</span>
              <span>- R$ {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-lg font-bold">
            <span>{t('Total', 'Total')}</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <Button
            className="mt-3 w-full"
            size="lg"
            disabled={cart.length === 0 || noRegister || saleMutation.isPending}
            onClick={() => setShowPaymentModal(true)}
          >
            {saleMutation.isPending
              ? t('Processando...', 'Processing...')
              : t('Finalizar Venda (F9)', 'Checkout (F9)')}
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PosPaymentModal
          total={total}
          onConfirm={handlePayment}
          onClose={() => setShowPaymentModal(false)}
          isPending={saleMutation.isPending}
        />
      )}

      {/* Success Modal */}
      {completedSale && (
        <PosSaleSuccessModal
          orderId={completedSale.orderId}
          changeAmount={completedSale.changeAmount}
          onNewSale={() => {
            setCompletedSale(null);
            searchRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────

function ProductCard({
  product,
  onAdd,
}: {
  product: PosProductResponse;
  onAdd: (p: PosProductResponse, variantId?: number) => void;
}) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [showVariants, setShowVariants] = useState(false);
  const outOfStock = !product.infiniteStock && product.stock <= 0 && !hasVariants;

  const effectivePrice = product.salePrice ?? product.price;

  return (
    <div className={cn('relative flex flex-col rounded-lg border bg-card transition-shadow hover:shadow-md', outOfStock && 'opacity-50')}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-muted-foreground">📦</div>
        )}
        {product.salePrice && product.salePrice < product.price && (
          <Badge variant="destructive" className="absolute top-1 right-1 text-[10px]">
            {t('Promo', 'Sale')}
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2">
        <p className="truncate text-xs font-medium">{product.name}</p>
        <div className="mt-auto flex items-baseline gap-1 pt-1">
          <span className="text-sm font-bold">R$ {effectivePrice.toFixed(2)}</span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-[10px] text-muted-foreground line-through">R$ {product.price.toFixed(2)}</span>
          )}
        </div>
        {!product.infiniteStock && (
          <p className="text-[10px] text-muted-foreground">
            {t('Estoque', 'Stock')}: {product.stock}
          </p>
        )}
      </div>

      {/* Add button */}
      {hasVariants ? (
        <div className="p-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowVariants(!showVariants)}
          >
            {t('Selecionar variação', 'Select variant')}
          </Button>
          {showVariants && (
            <div className="mt-1 space-y-1">
              {product.variants!.map((v) => {
                const variantOutOfStock = !product.infiniteStock && v.stock <= 0;
                return (
                  <Button
                    key={v.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs"
                    disabled={variantOutOfStock}
                    onClick={() => {
                      onAdd(product, v.id);
                      setShowVariants(false);
                    }}
                  >
                    <span className="truncate">{v.name}</span>
                    <span>R$ {v.price.toFixed(2)}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="p-2 pt-0">
          <Button
            size="sm"
            className="w-full text-xs"
            disabled={outOfStock}
            onClick={() => onAdd(product)}
          >
            <Plus className="mr-1 h-3 w-3" />
            {outOfStock ? t('Sem estoque', 'Out of stock') : t('Adicionar', 'Add')}
          </Button>
        </div>
      )}
    </div>
  );
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
