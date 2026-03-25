export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  price: number;
};

export type AdminOrder = {
  id: number;
  userId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  status: OrderStatus;
  paymentProvider: string | null;
  paymentStatus: string;
  paymentDebugInfo: string | null;
  paymentLastWebhookAt: string | null;
  couponCode: string | null;
  subtotalAmount: number;
  discountAmount: number;
  shippingCost: number | null;
  totalAmount: number;
  currency: string;
  shippingMethod: string | null;
  shippingCarrier: string | null;
  trackingCode: string | null;
  shippingLabelId: string | null;
  shippingAddressJson: string | null;
  customerNote: string | null;
  internalNotes: string | null;
  isDraft: boolean;
  draftName: string | null;
  isManual: boolean;
  manualOrderOrigin: string | null;
  manualCustomerCpfCnpj: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  updatedAt: string | null;
  items: OrderItem[];
  orderOrigin?: 'ONLINE' | 'POS' | null;
  posOperatorId?: number | null;
};

export type MercadoPagoDiagnosis = {
  orderId: number;
  storeId: number;
  storeSlug: string;
  mpUserId: string | null;
  platformUserId: string | null;
  sellerTokenType: string;
  platformTokenType: string;
  sellerTokenPrefix: string;
  platformTokenPrefix: string;
  sandboxMode: boolean;
  testMode: boolean;
  platformTokenIsTest: boolean;
  sellerTokenIsTest: boolean;
  checkoutEnvironment: string;
  buyerRequirement: string;
  checkoutExplanation: string;
};

export type OrderStats = {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;
};

export type DailyRevenue = {
  date: string;
  revenue: number;
};

export type DashboardStats = {
  period: string;
  lastUpdated: string;

  // KPI - Revenue & Orders
  periodRevenue: number;
  periodOrders: number;
  periodAvgOrder: number;
  revenueTrend: number;
  ordersTrend: number;

  // KPI - Unique Visits
  uniqueVisits: number;
  visitsTrend: number;

  // KPI - Cart Conversion
  conversionRate: number;
  cartConversionRate: number;
  cartConversionTrend: number;

  // Funnel (period)
  periodProductViews: number;
  cartAdditions: number;
  checkoutsStarted: number;
  periodPaidOrders: number;

  // Customer behaviour
  newCustomers: number;
  returningCustomers: number;

  // All-time totals
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalProducts: number;

  dailyRevenue: DailyRevenue[];
};

export type ShippingMethodStat = {
  method: string;
  orderCount: number;
  totalRevenue: number;
  avgCost: number;
};

export type ShippingStateStat = {
  state: string;
  orderCount: number;
  totalRevenue: number;
  avgShippingCost: number;
  avgDeliveryDays: number;
};

export type ShippingStats = {
  avgShippingCost: number;
  avgDeliveryDays: number;
  ordersInTransit: number;
  totalShippingCost: number;
  totalShippedOrders: number;
  methodBreakdown: ShippingMethodStat[];
  topStatesByRevenue: ShippingStateStat[];
  topStatesByOrders: ShippingStateStat[];
  topStatesByCost: ShippingStateStat[];
  topStatesByDeliveryDays: ShippingStateStat[];
};

// ─── Payment Stats ───────────────────────────────────────────────────────────

export type PaymentMethodStat = {
  method: string;
  methodLabel: string;
  orderCount: number;
  totalRevenue: number;
};

export type PaymentProviderStat = {
  provider: string;
  orderCount: number;
  totalRevenue: number;
  approvalRate: number;
};

export type InstallmentStat = {
  installments: number;
  orderCount: number;
  totalRevenue: number;
};

export type PaymentStats = {
  totalGrossRevenue: number;
  totalRefunds: number;
  approvalRate: number;
  refundRate: number;
  avgReleaseTimeDays: number;
  methodBreakdown: PaymentMethodStat[];
  providerBreakdown: PaymentProviderStat[];
  installmentBreakdown: InstallmentStat[];
};

// ── Product Statistics ──────────────────────────────────────────────────────

export type ProductSalesItem = {
  productId: number;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  revenue: number;
};

export type ProductStockItem = {
  productId: number;
  productName: string;
  imageUrl: string | null;
  stock: number;
};

export type ProductViewItem = {
  productId: number;
  productName: string;
  imageUrl: string | null;
  viewCount: number;
};

export type ProductStats = {
  totalProductsSold: number;
  totalProductsInCatalog: number;
  lowStockCount: number;
  lowStock: ProductStockItem[];
  topSellersByQty: ProductSalesItem[];
  bottomSellersByQty: ProductSalesItem[];
  topSellersByRevenue: ProductSalesItem[];
  bottomSellersByRevenue: ProductSalesItem[];
  mostViewed: ProductViewItem[];
};

// ── Traffic Source Statistics ────────────────────────────────────────────────

export type TrafficChannelStat = {
  channel: string;
  channelLabel: string;
  color: string;
  visits: number;
  orders: number;
  revenue: number;
  conversionRate: number;
};

export type ReferrerStat = {
  referrer: string;
  visits: number;
  orders: number;
  revenue: number;
};

export type LandingPageStat = {
  landingPage: string;
  visits: number;
  conversions: number;
};

export type ChannelRoiStat = {
  channel: string;
  channelLabel: string;
  avgOrderValue: number;
  estimatedCpa: number;
  paidOrders: number;
};

export type TrafficStats = {
  totalVisits: number;
  taggedVisits: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  overallConversionRate: number;
  channelBreakdown: TrafficChannelStat[];
  topReferrers: ReferrerStat[];
  topLandingPages: LandingPageStat[];
  channelRoi: ChannelRoiStat[];
};
