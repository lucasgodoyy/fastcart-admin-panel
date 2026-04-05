import apiClient from '@/lib/api';

/* ── Types ── */

export type AffiliateSettings = {
  id: number;
  storeId: number;
  enabled: boolean;
  defaultCommissionPercent: number;
  commissionRate: number;
  cookieDurationDays: number;
  cookieDays: number;
  minPayoutCents: number;
  minPayout: number;
  payoutDay: number;
  autoApproveConversions: boolean;
  autoApprove: boolean;
  termsAndConditions: string | null;
  termsUrl: string | null;
  updatedAt: string | null;
};

export type Affiliate = {
  id: number;
  storeId: number;
  name: string;
  email: string;
  referralCode: string;
  commissionPercent: number;
  commissionRate: number;
  status: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalRevenueCents: number;
  totalOrders: number;
  totalEarned: number;
  totalEarnedCents: number;
  totalCommission: number;
  totalPaid: number;
  totalPaidCents: number;
  createdAt: string;
};

export type AffiliateLink = {
  id: number;
  affiliateId: number;
  affiliateName: string;
  targetUrl: string;
  destinationUrl: string;
  slug: string;
  fullUrl: string;
  clicks: number;
  totalClicks: number;
  conversions: number;
  totalConversions: number;
  active: boolean;
  status: string;
  createdAt: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type AffiliateConversion = {
  id: number;
  affiliateId: number;
  affiliateName: string;
  orderId: number | null;
  orderTotal: number;
  orderAmount: number;
  commissionCents: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  convertedAt: string;
  createdAt: string;
  approvedAt: string | null;
};

export type AffiliatePayout = {
  id: number;
  affiliateId: number;
  affiliateName: string;
  amount: number;
  amountCents: number;
  method: string;
  reference: string | null;
  notes: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type AffiliateStats = {
  totalAffiliates: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalRevenueCents: number;
  totalCommission: number;
  totalCommissionCents: number;
  pendingCommission: number;
  paidCommission: number;
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
    targetUrl?: string;
    destinationUrl?: string;
    slug?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
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
    amountCents?: number;
    amount?: number;
    method?: string;
    reference?: string;
    notes?: string;
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
