import apiClient from '@/lib/api';
import type {
  AffiliateItem,
  AffiliateSettings,
  AffiliateLink,
  AffiliateConversion,
  AffiliatePayout,
  AffiliateStats,
  CreateAffiliateRequest,
  UpdateAffiliateRequest,
  UpdateAffiliateSettingsRequest,
  CreateAffiliateLinkRequest,
  CreateAffiliatePayoutRequest,
} from '@/types/affiliate';
import type { PaginatedResult } from '@/types/super-admin';

// ═══════════════════════════════════════════════════════════════
//  Admin / Store-owner Affiliate Service
// ═══════════════════════════════════════════════════════════════

const affiliateService = {
  // ── Settings ─────────────────────────────────────────────

  getSettings: async (): Promise<AffiliateSettings> => {
    const res = await apiClient.get<AffiliateSettings>('/affiliates/settings');
    return res.data;
  },

  updateSettings: async (data: UpdateAffiliateSettingsRequest): Promise<AffiliateSettings> => {
    const res = await apiClient.put<AffiliateSettings>('/affiliates/settings', data);
    return res.data;
  },

  // ── Affiliates CRUD ──────────────────────────────────────

  list: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateItem>> => {
    const res = await apiClient.get<PaginatedResult<AffiliateItem>>('/affiliates', { params });
    return res.data;
  },

  getById: async (id: number): Promise<AffiliateItem> => {
    const res = await apiClient.get<AffiliateItem>(`/affiliates/${id}`);
    return res.data;
  },

  create: async (data: CreateAffiliateRequest): Promise<AffiliateItem> => {
    const res = await apiClient.post<AffiliateItem>('/affiliates', data);
    return res.data;
  },

  update: async (id: number, data: UpdateAffiliateRequest): Promise<AffiliateItem> => {
    const res = await apiClient.put<AffiliateItem>(`/affiliates/${id}`, data);
    return res.data;
  },

  // ── Links ────────────────────────────────────────────────

  listLinks: async (params?: {
    affiliateId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateLink>> => {
    const res = await apiClient.get<PaginatedResult<AffiliateLink>>('/affiliates/links', { params });
    return res.data;
  },

  createLink: async (data: CreateAffiliateLinkRequest): Promise<AffiliateLink> => {
    const res = await apiClient.post<AffiliateLink>('/affiliates/links', data);
    return res.data;
  },

  // ── Conversions ──────────────────────────────────────────

  listConversions: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateConversion>> => {
    const res = await apiClient.get<PaginatedResult<AffiliateConversion>>('/affiliates/conversions', { params });
    return res.data;
  },

  approveConversion: async (id: number): Promise<AffiliateConversion> => {
    const res = await apiClient.put<AffiliateConversion>(`/affiliates/conversions/${id}/approve`);
    return res.data;
  },

  rejectConversion: async (id: number, reason?: string): Promise<AffiliateConversion> => {
    const res = await apiClient.put<AffiliateConversion>(
      `/affiliates/conversions/${id}/reject`,
      null,
      { params: reason ? { reason } : undefined }
    );
    return res.data;
  },

  // ── Payouts ──────────────────────────────────────────────

  listPayouts: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliatePayout>> => {
    const res = await apiClient.get<PaginatedResult<AffiliatePayout>>('/affiliates/payouts', { params });
    return res.data;
  },

  createPayout: async (data: CreateAffiliatePayoutRequest): Promise<AffiliatePayout> => {
    const res = await apiClient.post<AffiliatePayout>('/affiliates/payouts', data);
    return res.data;
  },

  markPayoutPaid: async (id: number): Promise<AffiliatePayout> => {
    const res = await apiClient.put<AffiliatePayout>(`/affiliates/payouts/${id}/paid`);
    return res.data;
  },

  // ── Stats ────────────────────────────────────────────────

  getStats: async (): Promise<AffiliateStats> => {
    const res = await apiClient.get<AffiliateStats>('/affiliates/stats');
    return res.data;
  },
};

export default affiliateService;

// ═══════════════════════════════════════════════════════════════
//  Super-Admin Affiliate Service
// ═══════════════════════════════════════════════════════════════

export const superAdminAffiliateService = {
  list: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateItem>> => {
    const res = await apiClient.get<PaginatedResult<AffiliateItem>>('/super-admin/affiliates', { params });
    return res.data;
  },

  getStats: async (): Promise<AffiliateStats> => {
    const res = await apiClient.get<AffiliateStats>('/super-admin/affiliates/stats');
    return res.data;
  },

  listConversions: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateConversion>> => {
    const res = await apiClient.get<PaginatedResult<AffiliateConversion>>('/super-admin/affiliates/conversions', { params });
    return res.data;
  },

  listPayouts: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliatePayout>> => {
    const res = await apiClient.get<PaginatedResult<AffiliatePayout>>('/super-admin/affiliates/payouts', { params });
    return res.data;
  },
};
