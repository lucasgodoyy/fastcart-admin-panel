import apiClient from '@/lib/api';

export interface GoogleShoppingConfig {
  id: number | null;
  enabled: boolean;
  merchantId: string | null;
  targetCountry: string;
  contentLanguage: string;
  feedUrl: string | null;
  syncFrequency: string;
  lastSyncedAt: string | null;
  syncStatus: string;
  productCount: number;
  errorCount: number;
  verificationTag: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateGoogleShoppingConfigRequest {
  enabled?: boolean;
  merchantId?: string;
  targetCountry?: string;
  contentLanguage?: string;
  syncFrequency?: string;
  verificationTag?: string;
}

export interface Campaign {
  id: number;
  name: string;
  status: string;
  campaignType: string;
  dailyBudget: number | null;
  currency: string;
  targetCountry: string;
  targetRoas: number | null;
  startDate: string | null;
  endDate: string | null;
  productFilter: string | null;
  googleCampaignId: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  costSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  campaignType: string;
  dailyBudget: number;
  currency?: string;
  targetCountry?: string;
  targetRoas?: number;
  startDate?: string;
  endDate?: string;
  productFilter?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  status?: string;
  dailyBudget?: number;
  targetRoas?: number;
  startDate?: string;
  endDate?: string;
  productFilter?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const googleShoppingService = {
  // ── Config ──
  getConfig: async (): Promise<GoogleShoppingConfig> => {
    const { data } = await apiClient.get<GoogleShoppingConfig>('/admin/google-shopping/config');
    return data;
  },

  updateConfig: async (request: UpdateGoogleShoppingConfigRequest): Promise<GoogleShoppingConfig> => {
    const { data } = await apiClient.put<GoogleShoppingConfig>('/admin/google-shopping/config', request);
    return data;
  },

  syncNow: async (): Promise<GoogleShoppingConfig> => {
    const { data } = await apiClient.post<GoogleShoppingConfig>('/admin/google-shopping/sync');
    return data;
  },

  // ── Campaigns ──
  listCampaigns: async (page = 0, size = 20): Promise<PageResponse<Campaign>> => {
    const { data } = await apiClient.get<PageResponse<Campaign>>('/admin/google-shopping/campaigns', { params: { page, size } });
    return data;
  },

  getCampaign: async (id: number): Promise<Campaign> => {
    const { data } = await apiClient.get<Campaign>(`/admin/google-shopping/campaigns/${id}`);
    return data;
  },

  createCampaign: async (request: CreateCampaignRequest): Promise<Campaign> => {
    const { data } = await apiClient.post<Campaign>('/admin/google-shopping/campaigns', request);
    return data;
  },

  updateCampaign: async (id: number, request: UpdateCampaignRequest): Promise<Campaign> => {
    const { data } = await apiClient.put<Campaign>(`/admin/google-shopping/campaigns/${id}`, request);
    return data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/google-shopping/campaigns/${id}`);
  },
};

export default googleShoppingService;
