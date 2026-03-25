// ─── Enums ──────────────────────────────────────────────────────────

export type PosPaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';
export type PosCashRegisterStatus = 'OPEN' | 'CLOSED';
export type PosCashMovementType = 'WITHDRAWAL' | 'SUPPLY';
export type OrderOrigin = 'ONLINE' | 'POS';

// ─── Cash Register ─────────────────────────────────────────────────

export type OpenCashRegisterRequest = {
  openingAmount: number;
  operatorName: string;
};

export type CloseCashRegisterRequest = {
  closingAmount: number;
  observations?: string;
};

export type CashMovementRequest = {
  type: PosCashMovementType;
  amount: number;
  reason: string;
};

export type CashRegisterResponse = {
  id: number;
  storeId: number;
  operatorId: number;
  operatorName: string;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  status: PosCashRegisterStatus;
  totalCashSales: number;
  totalCardSales: number;
  totalPixSales: number;
  totalSupplies: number;
  totalWithdrawals: number;
  salesCount: number;
  openedAt: string;
  closedAt: string | null;
};

export type CashMovementResponse = {
  id: number;
  cashRegisterId: number;
  type: PosCashMovementType;
  amount: number;
  reason: string;
  createdAt: string;
};

export type CashRegisterSummaryResponse = {
  registerId: number;
  operatorName: string;
  openingAmount: number;
  totalCashSales: number;
  totalCardSales: number;
  totalPixSales: number;
  totalSupplies: number;
  totalWithdrawals: number;
  expectedCashInDrawer: number;
  totalSales: number;
  salesCount: number;
  status: string;
};

// ─── POS Sale ──────────────────────────────────────────────────────

export type PosSaleItemRequest = {
  productId: number;
  variantId?: number | null;
  quantity: number;
  unitPrice: number;
};

export type PosSaleRequest = {
  items: PosSaleItemRequest[];
  paymentMethod: PosPaymentMethod;
  amountReceived?: number | null;
  discountAmount?: number | null;
  customerName?: string | null;
  customerDocument?: string | null;
};

export type PosSaleItemResponse = {
  productId: number;
  variantId: number | null;
  productName: string;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type PosSaleResponse = {
  orderId: number;
  status: string;
  paymentStatus: string;
  paymentMethod: PosPaymentMethod;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  amountReceived: number | null;
  changeAmount: number | null;
  customerName: string | null;
  customerDocument: string | null;
  operatorName: string | null;
  createdAt: string;
  items: PosSaleItemResponse[];
};

// ─── POS Product Search ────────────────────────────────────────────

export type PosVariantResponse = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  stock: number;
};

export type PosProductResponse = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  infiniteStock: boolean;
  imageUrl: string | null;
  categoryId: number | null;
  categoryName: string | null;
  active: boolean;
  variants: PosVariantResponse[] | null;
};

// ─── Cart (local state) ────────────────────────────────────────────

export type PosCartItem = {
  productId: number;
  variantId?: number | null;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  infiniteStock: boolean;
};
