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
  storeId: number;
  customerEmail: string;
  customerName: string | null;
  cartItemsSnapshot: string | null;
  cartTotal: number;
  cartCurrency: string;
  recoveryStatus: string;
  abandonedAt: string;
  recoveryToken: string | null;
  emailCount: number | null;
  lastEmailSentAt: string | null;
  createdAt: string;
  customerId?: number | null;
};

export type AbandonedCartItem = {
  productId?: number;
  productName?: string;
  name?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
};

export type AbandonedCartListResponse = {
  content: AbandonedCart[];
  page: number;
  pageSize: number;
  totalElements: number;
};

export type AbandonedCartSettings = {
  mode: 'AUTO' | 'MANUAL';
  delayHours: number;
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

  sendEmail: async (
    id: number,
    storeId: number,
    subject: string,
    body: string,
  ): Promise<void> => {
    await apiClient.post(`/admin/abandoned-carts/${id}/send-email`, { subject, body }, {
      params: { storeId },
    });
  },

  getSettings: async (storeId: number): Promise<AbandonedCartSettings> => {
    const res = await apiClient.get('/admin/abandoned-carts/settings', {
      params: { storeId },
    });
    return res.data;
  },

  saveSettings: async (storeId: number, settings: AbandonedCartSettings): Promise<void> => {
    await apiClient.put('/admin/abandoned-carts/settings', settings, {
      params: { storeId },
    });
  },

  parseCartItems: (snapshot: string | null): AbandonedCartItem[] => {
    if (!snapshot) return [];
    try {
      const parsed = JSON.parse(snapshot);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
};

export default abandonedCartService;
