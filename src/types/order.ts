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
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  updatedAt: string | null;
  items: OrderItem[];
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
  periodRevenue: number;
  periodOrders: number;
  periodAvgOrder: number;
  revenueTrend: number;
  ordersTrend: number;
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
  conversionRate: number;
  dailyRevenue: DailyRevenue[];
};
