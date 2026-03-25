import apiClient from '@/lib/api';
import { AdminOrder, OrderStats, DashboardStats, MercadoPagoDiagnosis, ShippingStats, PaymentStats, ProductStats, TrafficStats } from '@/types/order';

const orderService = {
  /** List all orders for the authenticated store */
  listStoreOrders: async (): Promise<AdminOrder[]> => {
    const response = await apiClient.get('/orders/store');
    return response.data;
  },

  /** Get a single order by ID for the authenticated store */
  getById: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.get(`/orders/store/${orderId}`);
    return response.data;
  },

  /** Get order stats (KPIs) for the authenticated store */
  getStats: async (): Promise<OrderStats> => {
    const response = await apiClient.get('/orders/store/stats');
    return response.data;
  },

  /** Alias for backward compatibility */
  getStoreStats: async (): Promise<OrderStats> => {
    const response = await apiClient.get('/orders/store/stats');
    return response.data;
  },

  /** Get enhanced dashboard stats with period filter + daily revenue */
  getDashboardStats: async (period: string = '30d'): Promise<DashboardStats> => {
    const response = await apiClient.get('/orders/store/dashboard-stats', { params: { period } });
    return response.data;
  },

  /** Mark an order as dispatched/shipped, optionally with tracking code */
  dispatch: async (orderId: number, trackingCode?: string): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/dispatch`, { trackingCode });
    return response.data;
  },

  /** Mark an order as delivered */
  deliver: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/deliver`);
    return response.data;
  },

  /** Cancel an order (with optional partial refund) */
  cancel: async (orderId: number, reason?: string): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/cancel`, { reason });
    return response.data;
  },

  /** Request a refund for an order */
  refund: async (orderId: number, amountCents?: number, reason?: string): Promise<AdminOrder> => {
    const response = await apiClient.post(`/orders/store/${orderId}/refund`, { amountCents, reason });
    return response.data;
  },

  /** Retry Mercado Pago checkout — re-creates a preference and returns the checkout URL */
  retryMercadoPagoCheckout: async (orderId: number): Promise<{ checkoutUrl: string; preferenceId: string; sandboxMode: boolean }> => {
    const response = await apiClient.post(`/payments/mercadopago/retry-checkout/${orderId}`);
    return response.data;
  },

  getMercadoPagoDiagnosis: async (orderId: number): Promise<MercadoPagoDiagnosis> => {
    const response = await apiClient.get(`/payments/mercadopago/diagnose/${orderId}`);
    return response.data;
  },

  syncMercadoPagoPayment: async (orderId: number): Promise<{ status: string; message: string; paymentId?: number; error?: string }> => {
    const response = await apiClient.post(`/payments/mercadopago/sync-payment/${orderId}`);
    return response.data;
  },

  /** Update tracking code and/or shipping label ID for an order */
  updateTracking: async (orderId: number, trackingCode?: string, shippingLabelId?: string): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/tracking`, { trackingCode, shippingLabelId });
    return response.data;
  },

  /** Manually trigger Melhor Envio label creation for an order */
  createShippingLabel: async (orderId: number): Promise<{ message: string; orderId: number }> => {
    const response = await apiClient.post(`/orders/store/${orderId}/create-label`);
    return response.data;
  },

  /** Get Melhor Envio label details for an order */
  getLabelDetails: async (orderId: number): Promise<Record<string, unknown>> => {
    const response = await apiClient.get(`/orders/store/${orderId}/label`);
    return response.data;
  },

  /** Print Melhor Envio label for an order */
  printLabel: async (orderId: number): Promise<{ url?: string }> => {
    const response = await apiClient.post(`/orders/store/${orderId}/print-label`);
    return response.data;
  },

  /** Update internal merchant notes on an order (never shown to customer) */
  updateInternalNotes: async (orderId: number, notes: string): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/internal-notes`, { notes });
    return response.data;
  },

  // ─── Draft Orders ──────────────────────────────────────────────────────────

  /** Create a draft order */
  createDraft: async (name?: string): Promise<AdminOrder> => {
    const response = await apiClient.post('/orders/store/drafts', { name });
    return response.data;
  },

  /** List draft orders */
  listDrafts: async (): Promise<AdminOrder[]> => {
    const response = await apiClient.get('/orders/store/drafts');
    return response.data;
  },

  /** Convert a draft to a live order */
  convertDraft: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/convert-draft`);
    return response.data;
  },

  /** Discard (delete) a draft order */
  discardDraft: async (orderId: number): Promise<void> => {
    await apiClient.delete(`/orders/store/${orderId}/draft`);
  },

  /** Get shipping analytics stats for the store */
  getShippingStats: async (period: string = '30d'): Promise<ShippingStats> => {
    const response = await apiClient.get('/orders/store/shipping-stats', { params: { period } });
    return response.data;
  },

  /** Get payment analytics stats for the store */
  getPaymentStats: async (period: string = '30d'): Promise<PaymentStats> => {
    const response = await apiClient.get('/orders/store/payment-stats', { params: { period } });
    return response.data;
  },

  /** Get traffic source analytics stats for the store */
  getTrafficStats: async (period: string = '30d'): Promise<TrafficStats> => {
    const response = await apiClient.get('/orders/store/traffic-stats', { params: { period } });
    return response.data;
  },

  // ─── Manual Orders ────────────────────────────────────────────────────────

  /** Create a manual order */
  createManualOrder: async (body: {
    items: { productId: number; variantId?: number | null; quantity: number; unitPrice?: number | null }[];
    discountAmount?: number | null;
    discountType?: 'PERCENT' | 'FIXED' | null;
    shippingCost?: number | null;
    customerFirstName?: string | null;
    customerLastName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    customerCpfCnpj?: string | null;
    paymentStatus: 'UNPAID' | 'PENDING' | 'PAID';
    shippingAddressJson?: string | null;
    origin?: string | null;
    internalNotes?: string | null;
  }): Promise<AdminOrder> => {
    const response = await apiClient.post('/orders/store/manual', body);
    return response.data;
  },

  /** List manual orders */
  listManualOrders: async (): Promise<AdminOrder[]> => {
    const response = await apiClient.get('/orders/store/manual');
    return response.data;
  },

  /** Mark manual order as paid */
  markManualOrderPaid: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/mark-paid`);
    return response.data;
  },

  /** Get product statistics: sales rankings, low-stock, most viewed */
  getProductStats: async (
    period: string = '30d',
    topLimit: number = 10,
    lowStockThreshold: number = 5
  ): Promise<ProductStats> => {
    const response = await apiClient.get('/analytics/product-stats', {
      params: { period, topLimit, lowStockThreshold },
    });
    return response.data;
  },
};

export default orderService;
