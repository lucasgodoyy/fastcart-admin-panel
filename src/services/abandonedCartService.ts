import apiClient from '@/lib/api';

/* ── Types ── */

export type RecoveryStats = {
  totalAbandoned: number;
  totalPending: number;
  totalRecovered: number;
  totalOptedOut: number;
  totalRecoveryValue: number;
  recoveryRate: number;
  engagementRate: number;
};

export type AbandonedCart = {
  id: number;
  customerEmail: string;
  customerName: string | null;
  cartTotal: number;
  cartCurrency: string;
  recoveryStatus: string;
  abandonedAt: string;
  recoveryToken: string | null;
  emailCount: number;
  lastEmailSentAt: string | null;
  createdAt: string;
};

export type AbandonedCartListResponse = {
  content: AbandonedCart[];
  page: number;
  pageSize: number;
  totalElements: number;
};

/* ── Service ── */

const abandonedCartService = {
  getStats: async (storeId: number, days = 30): Promise<RecoveryStats> => {
    const res = await apiClient.get('/admin/abandoned-carts/stats', {
      params: { storeId, days },
    });
    return res.data;
  },

  list: async (
    storeId: number,
    status = 'PENDING',
    page = 0,
    pageSize = 20,
  ): Promise<AbandonedCartListResponse> => {
    const res = await apiClient.get('/admin/abandoned-carts', {
      params: { storeId, status, page, pageSize },
    });
    return res.data;
  },

  getById: async (id: number, storeId: number): Promise<AbandonedCart> => {
    const res = await apiClient.get(`/admin/abandoned-carts/${id}`, {
      params: { storeId },
    });
    return res.data;
  },
};

export default abandonedCartService;
