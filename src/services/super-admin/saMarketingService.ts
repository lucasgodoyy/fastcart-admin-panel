import apiClient from '@/lib/api';
import type {
  MarketingCampaign,
  MarketingBanner,
  PushTemplate,
  MarketingStats,
  CampaignUpsertRequest,
  BannerUpsertRequest,
  PushTemplateUpsertRequest,
  MarketingPaginatedResult,
} from '@/types/marketing';

const saMarketingService = {
  // ── Stats ──────────────────────────────────────────────────

  getStats: async (): Promise<MarketingStats> => {
    const res = await apiClient.get<MarketingStats>('/super-admin/marketing/stats');
    return res.data;
  },

  // ── Campaigns ──────────────────────────────────────────────

  listCampaigns: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<MarketingCampaign>> => {
    const res = await apiClient.get<MarketingPaginatedResult<MarketingCampaign>>(
      '/super-admin/marketing/campaigns',
      { params },
    );
    return res.data;
  },

  getCampaign: async (id: number): Promise<MarketingCampaign> => {
    const res = await apiClient.get<MarketingCampaign>(`/super-admin/marketing/campaigns/${id}`);
    return res.data;
  },

  createCampaign: async (data: CampaignUpsertRequest): Promise<MarketingCampaign> => {
    const res = await apiClient.post<MarketingCampaign>('/super-admin/marketing/campaigns', data);
    return res.data;
  },

  updateCampaign: async (id: number, data: CampaignUpsertRequest): Promise<MarketingCampaign> => {
    const res = await apiClient.put<MarketingCampaign>(`/super-admin/marketing/campaigns/${id}`, data);
    return res.data;
  },

  updateCampaignStatus: async (id: number, status: string): Promise<MarketingCampaign> => {
    const res = await apiClient.patch<MarketingCampaign>(
      `/super-admin/marketing/campaigns/${id}/status`,
      null,
      { params: { status } },
    );
    return res.data;
  },

  // ── Banners ────────────────────────────────────────────────

  listBanners: async (params?: {
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<MarketingBanner>> => {
    const res = await apiClient.get<MarketingPaginatedResult<MarketingBanner>>(
      '/super-admin/marketing/banners',
      { params },
    );
    return res.data;
  },

  createBanner: async (data: BannerUpsertRequest): Promise<MarketingBanner> => {
    const res = await apiClient.post<MarketingBanner>('/super-admin/marketing/banners', data);
    return res.data;
  },

  toggleBannerActive: async (id: number, active: boolean): Promise<MarketingBanner> => {
    const res = await apiClient.patch<MarketingBanner>(
      `/super-admin/marketing/banners/${id}/toggle-active`,
      null,
      { params: { active } },
    );
    return res.data;
  },

  // ── Push ───────────────────────────────────────────────────

  listPush: async (params?: {
    page?: number;
    size?: number;
  }): Promise<MarketingPaginatedResult<PushTemplate>> => {
    const res = await apiClient.get<MarketingPaginatedResult<PushTemplate>>(
      '/super-admin/marketing/push',
      { params },
    );
    return res.data;
  },

  createPush: async (data: PushTemplateUpsertRequest): Promise<PushTemplate> => {
    const res = await apiClient.post<PushTemplate>('/super-admin/marketing/push', data);
    return res.data;
  },
};

export default saMarketingService;
