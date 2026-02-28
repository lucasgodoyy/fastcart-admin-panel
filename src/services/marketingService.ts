import apiClient from '@/lib/api';
import type {
  MarketingCampaign,
  MarketingBanner,
  AdsAccount,
  AdsCampaign,
  PushTemplate,
  MarketingStats,
  CampaignUpsertRequest,
  BannerUpsertRequest,
  AdsAccountUpsertRequest,
  PushTemplateUpsertRequest,
  MarketingPaginatedResult,
} from '@/types/marketing';

const marketingService = {
  // ── Stats ──────────────────────────────────────────────────

  getStats: async (): Promise<MarketingStats> => {
    const res = await apiClient.get<MarketingStats>('/marketing/stats');
    return res.data;
  },

  // ── Campaigns ──────────────────────────────────────────────

  listCampaigns: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<MarketingCampaign>> => {
    const res = await apiClient.get<MarketingPaginatedResult<MarketingCampaign>>(
      '/marketing/campaigns',
      { params },
    );
    return res.data;
  },

  getCampaign: async (id: number): Promise<MarketingCampaign> => {
    const res = await apiClient.get<MarketingCampaign>(`/marketing/campaigns/${id}`);
    return res.data;
  },

  createCampaign: async (data: CampaignUpsertRequest): Promise<MarketingCampaign> => {
    const res = await apiClient.post<MarketingCampaign>('/marketing/campaigns', data);
    return res.data;
  },

  updateCampaign: async (id: number, data: CampaignUpsertRequest): Promise<MarketingCampaign> => {
    const res = await apiClient.put<MarketingCampaign>(`/marketing/campaigns/${id}`, data);
    return res.data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/campaigns/${id}`);
  },

  // ── Banners ────────────────────────────────────────────────

  listBanners: async (params?: {
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<MarketingBanner>> => {
    const res = await apiClient.get<MarketingPaginatedResult<MarketingBanner>>(
      '/marketing/banners',
      { params },
    );
    return res.data;
  },

  createBanner: async (data: BannerUpsertRequest): Promise<MarketingBanner> => {
    const res = await apiClient.post<MarketingBanner>('/marketing/banners', data);
    return res.data;
  },

  updateBanner: async (id: number, data: BannerUpsertRequest): Promise<MarketingBanner> => {
    const res = await apiClient.put<MarketingBanner>(`/marketing/banners/${id}`, data);
    return res.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/banners/${id}`);
  },

  // ── Ads Accounts ───────────────────────────────────────────

  listAdsAccounts: async (): Promise<AdsAccount[]> => {
    const res = await apiClient.get<AdsAccount[]>('/marketing/ads-accounts');
    return res.data;
  },

  upsertAdsAccount: async (data: AdsAccountUpsertRequest): Promise<AdsAccount> => {
    const res = await apiClient.post<AdsAccount>('/marketing/ads-accounts', data);
    return res.data;
  },

  disconnectAdsAccount: async (platform: string): Promise<void> => {
    await apiClient.delete(`/marketing/ads-accounts/${platform}`);
  },

  // ── Ads Campaigns ──────────────────────────────────────────

  listAdsCampaigns: async (params?: {
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<AdsCampaign>> => {
    const res = await apiClient.get<MarketingPaginatedResult<AdsCampaign>>(
      '/marketing/ads-campaigns',
      { params },
    );
    return res.data;
  },

  // ── Push Templates ─────────────────────────────────────────

  listPush: async (params?: {
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<PushTemplate>> => {
    const res = await apiClient.get<MarketingPaginatedResult<PushTemplate>>(
      '/marketing/push',
      { params },
    );
    return res.data;
  },

  createPush: async (data: PushTemplateUpsertRequest): Promise<PushTemplate> => {
    const res = await apiClient.post<PushTemplate>('/marketing/push', data);
    return res.data;
  },

  updatePush: async (id: number, data: PushTemplateUpsertRequest): Promise<PushTemplate> => {
    const res = await apiClient.put<PushTemplate>(`/marketing/push/${id}`, data);
    return res.data;
  },

  deletePush: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/push/${id}`);
  },
};

export default marketingService;
