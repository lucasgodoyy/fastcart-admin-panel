import apiClient from '@/lib/api';

// ── Types ────────────────────────────────────────────────────
export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: number;
  userId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  couponCode: string | null;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
}

export interface OrderStats {
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
}

// ── Service ──────────────────────────────────────────────────
const orderService = {
  listStoreOrders: async (): Promise<AdminOrder[]> => {
    const response = await apiClient.get<AdminOrder[]>('/orders/store');
    return response.data;
  },

  getStoreOrder: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.get<AdminOrder>(`/orders/store/${orderId}`);
    return response.data;
  },

  getStoreStats: async (): Promise<OrderStats> => {
    const response = await apiClient.get<OrderStats>('/orders/store/stats');
    return response.data;
  },

  dispatchOrder: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch<AdminOrder>(`/orders/store/${orderId}/dispatch`);
    return response.data;
  },

  deliverOrder: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch<AdminOrder>(`/orders/store/${orderId}/deliver`);
    return response.data;
  },
};

export default orderService;
