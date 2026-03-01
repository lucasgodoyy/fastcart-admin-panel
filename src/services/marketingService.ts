import apiClient from '@/lib/api';

/* ── Types ── */

export type MarketingStats = {
  activeCampaigns: number;
  totalCampaigns: number;
  activeBanners: number;
  totalConversions: number;
  totalRevenueCents: number;
  activePushTemplates: number;
  connectedAdsAccounts: number;
};

export type MarketingCampaign = {
  id: number;
  storeId: number;
  storeName: string;
  name: string;
  description: string | null;
  type: string;
  discountValue: string | null;
  channel: string | null;
  status: string;
  budgetCents: number | null;
  spentCents: number | null;
  targetAudience: string | null;
  views: number;
  clicks: number;
  conversions: number;
  revenueCents: number;
  startsAt: string | null;
  endsAt: string | null;
  createdBy: number | null;
  isPlatform: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MarketingBanner = {
  id: number;
  storeId: number;
  storeName: string;
  campaignId: number | null;
  campaignName: string | null;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  position: string | null;
  dimensions: string | null;
  sortOrder: number;
  active: boolean;
  clicks: number;
  impressions: number;
  startsAt: string | null;
  endsAt: string | null;
  isPlatform: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PushTemplate = {
  id: number;
  storeId: number;
  storeName: string;
  title: string;
  body: string;
  imageUrl: string | null;
  actionUrl: string | null;
  segment: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  status: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  isPlatform: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdsAccount = {
  id: number;
  storeId: number;
  storeName: string;
  platform: string;
  accountId: string;
  accountName: string;
  pixelId: string | null;
  catalogId: string | null;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/* ── Service ── */

const marketingService = {
  // Stats
  getStats: async (): Promise<MarketingStats> => {
    const res = await apiClient.get('/marketing/stats');
    return res.data;
  },

  // Campaigns
  listCampaigns: async (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<Paginated<MarketingCampaign>> => {
    const res = await apiClient.get('/marketing/campaigns', { params });
    return res.data;
  },

  getCampaign: async (id: number): Promise<MarketingCampaign> => {
    const res = await apiClient.get(`/marketing/campaigns/${id}`);
    return res.data;
  },

  createCampaign: async (data: {
    name: string;
    description?: string;
    type: string;
    discountValue?: string;
    channel?: string;
    status?: string;
    budgetCents?: number;
    targetAudience?: string;
    startsAt?: string;
    endsAt?: string;
  }): Promise<MarketingCampaign> => {
    const res = await apiClient.post('/marketing/campaigns', data);
    return res.data;
  },

  updateCampaign: async (
    id: number,
    data: Partial<{
      name: string;
      description: string;
      type: string;
      discountValue: string;
      channel: string;
      status: string;
      budgetCents: number;
      targetAudience: string;
      startsAt: string;
      endsAt: string;
    }>,
  ): Promise<MarketingCampaign> => {
    const res = await apiClient.put(`/marketing/campaigns/${id}`, data);
    return res.data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/campaigns/${id}`);
  },

  // Banners
  listBanners: async (params?: {
    page?: number;
    size?: number;
  }): Promise<Paginated<MarketingBanner>> => {
    const res = await apiClient.get('/marketing/banners', { params });
    return res.data;
  },

  createBanner: async (data: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    position?: string;
    dimensions?: string;
    sortOrder?: number;
    active?: boolean;
    campaignId?: number;
    startsAt?: string;
    endsAt?: string;
  }): Promise<MarketingBanner> => {
    const res = await apiClient.post('/marketing/banners', data);
    return res.data;
  },

  updateBanner: async (
    id: number,
    data: Partial<{
      title: string;
      subtitle: string;
      imageUrl: string;
      linkUrl: string;
      position: string;
      dimensions: string;
      sortOrder: number;
      active: boolean;
      campaignId: number;
      startsAt: string;
      endsAt: string;
    }>,
  ): Promise<MarketingBanner> => {
    const res = await apiClient.put(`/marketing/banners/${id}`, data);
    return res.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/banners/${id}`);
  },

  // Push templates
  listPush: async (params?: {
    page?: number;
    size?: number;
  }): Promise<Paginated<PushTemplate>> => {
    const res = await apiClient.get('/marketing/push', { params });
    return res.data;
  },

  createPush: async (data: {
    title: string;
    body: string;
    imageUrl?: string;
    actionUrl?: string;
    segment?: string;
    scheduledAt?: string;
    status?: string;
  }): Promise<PushTemplate> => {
    const res = await apiClient.post('/marketing/push', data);
    return res.data;
  },

  updatePush: async (
    id: number,
    data: Partial<{
      title: string;
      body: string;
      imageUrl: string;
      actionUrl: string;
      segment: string;
      scheduledAt: string;
      status: string;
    }>,
  ): Promise<PushTemplate> => {
    const res = await apiClient.put(`/marketing/push/${id}`, data);
    return res.data;
  },

  deletePush: async (id: number): Promise<void> => {
    await apiClient.delete(`/marketing/push/${id}`);
  },

  // Ads accounts
  listAdsAccounts: async (): Promise<AdsAccount[]> => {
    const res = await apiClient.get('/marketing/ads-accounts');
    return res.data;
  },

  connectAdsAccount: async (data: {
    platform: string;
    accountId: string;
    accountName: string;
    accessToken?: string;
    refreshToken?: string;
    pixelId?: string;
    catalogId?: string;
    status?: string;
  }): Promise<AdsAccount> => {
    const res = await apiClient.post('/marketing/ads-accounts', data);
    return res.data;
  },

  disconnectAdsAccount: async (platform: string): Promise<void> => {
    await apiClient.delete(`/marketing/ads-accounts/${platform}`);
  },
};

export default marketingService;
