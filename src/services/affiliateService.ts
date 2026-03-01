import apiClient from '@/lib/api';

/* ── Types ── */

export type AffiliateSettings = {
  id: number;
  storeId: number;
  enabled: boolean;
  defaultCommissionPercent: number;
  cookieDurationDays: number;
  minPayoutCents: number;
  autoApproveConversions: boolean;
  termsAndConditions: string | null;
};

export type Affiliate = {
  id: number;
  storeId: number;
  name: string;
  email: string;
  referralCode: string;
  commissionPercent: number;
  status: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenueCents: number;
  totalEarnedCents: number;
  totalPaidCents: number;
  createdAt: string;
};

export type AffiliateLink = {
  id: number;
  affiliateId: number;
  targetUrl: string;
  slug: string;
  fullUrl: string;
  clicks: number;
  conversions: number;
  active: boolean;
  createdAt: string;
};

export type AffiliateConversion = {
  id: number;
  affiliateId: number;
  affiliateName: string;
  orderId: number | null;
  orderTotal: number;
  commissionCents: number;
  status: string;
  convertedAt: string;
  approvedAt: string | null;
};

export type AffiliatePayout = {
  id: number;
  affiliateId: number;
  affiliateName: string;
  amountCents: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type AffiliateStats = {
  totalAffiliates: number;
  activeAffiliates: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenueCents: number;
  totalCommissionCents: number;
  pendingPayoutCents: number;
};

export type PaginatedResult<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/* ── Service ── */

const affiliateService = {
  // Settings
  getSettings: async (): Promise<AffiliateSettings> => {
    const { data } = await apiClient.get('/affiliates/settings');
    return data;
  },

  updateSettings: async (body: Partial<AffiliateSettings>): Promise<AffiliateSettings> => {
    const { data } = await apiClient.put('/affiliates/settings', body);
    return data;
  },

  // Affiliates
  list: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<Affiliate>> => {
    const { data } = await apiClient.get('/affiliates', { params });
    return data;
  },

  getById: async (id: number): Promise<Affiliate> => {
    const { data } = await apiClient.get(`/affiliates/${id}`);
    return data;
  },

  create: async (body: {
    name: string;
    email: string;
    commissionPercent?: number;
  }): Promise<Affiliate> => {
    const { data } = await apiClient.post('/affiliates', body);
    return data;
  },

  update: async (
    id: number,
    body: { name?: string; email?: string; commissionPercent?: number; status?: string },
  ): Promise<Affiliate> => {
    const { data } = await apiClient.put(`/affiliates/${id}`, body);
    return data;
  },

  // Links
  listLinks: async (params?: {
    affiliateId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateLink>> => {
    const { data } = await apiClient.get('/affiliates/links', { params });
    return data;
  },

  createLink: async (body: {
    affiliateId: number;
    targetUrl: string;
    slug?: string;
  }): Promise<AffiliateLink> => {
    const { data } = await apiClient.post('/affiliates/links', body);
    return data;
  },

  // Conversions
  listConversions: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateConversion>> => {
    const { data } = await apiClient.get('/affiliates/conversions', { params });
    return data;
  },

  approveConversion: async (id: number): Promise<AffiliateConversion> => {
    const { data } = await apiClient.put(`/affiliates/conversions/${id}/approve`);
    return data;
  },

  rejectConversion: async (
    id: number,
    reason?: string,
  ): Promise<AffiliateConversion> => {
    const { data } = await apiClient.put(`/affiliates/conversions/${id}/reject`, null, {
      params: reason ? { reason } : undefined,
    });
    return data;
  },

  // Payouts
  listPayouts: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliatePayout>> => {
    const { data } = await apiClient.get('/affiliates/payouts', { params });
    return data;
  },

  createPayout: async (body: {
    affiliateId: number;
    amountCents: number;
  }): Promise<AffiliatePayout> => {
    const { data } = await apiClient.post('/affiliates/payouts', body);
    return data;
  },

  markPayoutPaid: async (id: number): Promise<AffiliatePayout> => {
    const { data } = await apiClient.put(`/affiliates/payouts/${id}/paid`);
    return data;
  },

  // Stats
  getStats: async (): Promise<AffiliateStats> => {
    const { data } = await apiClient.get('/affiliates/stats');
    return data;
  },
};

export default affiliateService;
