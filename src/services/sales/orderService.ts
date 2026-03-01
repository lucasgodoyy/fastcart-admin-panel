import apiClient from '@/lib/api';
import { AdminOrder, OrderStats, DashboardStats } from '@/types/order';

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

  /** Get enhanced dashboard stats with period filter + daily revenue */
  getDashboardStats: async (period: string = '30d'): Promise<DashboardStats> => {
    const response = await apiClient.get('/orders/store/dashboard-stats', { params: { period } });
    return response.data;
  },

  /** Mark an order as dispatched/shipped */
  dispatch: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/dispatch`);
    return response.data;
  },

  /** Mark an order as delivered */
  deliver: async (orderId: number): Promise<AdminOrder> => {
    const response = await apiClient.patch(`/orders/store/${orderId}/deliver`);
    return response.data;
  },
};

export default orderService;
