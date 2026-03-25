import apiClient from '@/lib/api';

// ── Types ──────────────────────────────────────────────────

export interface TikTokConnection {
  id: number | null;
  storeId: number;
  status: string;
  accessToken: string | null;
  advertiserId: string | null;
  advertiserName: string | null;
  businessCenterId: string | null;
  businessCenterName: string | null;
  pixelId: string | null;
  catalogId: string | null;
  catalogName: string | null;
  shopId: string | null;
  shopName: string | null;
  feedUrl: string | null;
  syncFrequency: string;
  lastSyncedAt: string | null;
  syncStatus: string;
  productCount: number;
  errorCount: number;
  scopesGranted: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateTikTokConnectionRequest {
  advertiserId?: string;
  advertiserName?: string;
  businessCenterId?: string;
  businessCenterName?: string;
  pixelId?: string;
  catalogId?: string;
  catalogName?: string;
  shopId?: string;
  shopName?: string;
  syncFrequency?: string;
}

export interface TikTokOAuthUrl {
  authorizationUrl: string;
  state: string;
}

export interface PlatformTikTokConfig {
  id: number | null;
  appId: string | null;
  appSecret: string | null;
  oauthRedirectUri: string | null;
  active: boolean;
}

export interface PlatformTikTokConfigRequest {
  appId: string;
  appSecret: string;
  oauthRedirectUri: string;
  active: boolean;
}

// ── Service ────────────────────────────────────────────────

const tiktokAdsService = {
  // ── Connection / OAuth ────────────────────────────────

  async getConnection(): Promise<TikTokConnection> {
    const { data } = await apiClient.get<TikTokConnection>('/admin/tiktok/connection');
    return data;
  },

  async updateConnection(request: UpdateTikTokConnectionRequest): Promise<TikTokConnection> {
    const { data } = await apiClient.put<TikTokConnection>('/admin/tiktok/connection', request);
    return data;
  },

  async getOAuthUrl(): Promise<TikTokOAuthUrl> {
    const { data } = await apiClient.get<TikTokOAuthUrl>('/admin/tiktok/oauth/url');
    return data;
  },

  async syncCatalog(): Promise<TikTokConnection> {
    const { data } = await apiClient.post<TikTokConnection>('/admin/tiktok/catalog/sync');
    return data;
  },

  async disconnect(): Promise<void> {
    await apiClient.delete('/admin/tiktok/connection');
  },

  // ── Platform Config (Super Admin) ─────────────────────

  async getPlatformConfig(): Promise<PlatformTikTokConfig> {
    const { data } = await apiClient.get<PlatformTikTokConfig>('/super-admin/tiktok/config');
    return data;
  },

  async savePlatformConfig(request: PlatformTikTokConfigRequest): Promise<PlatformTikTokConfig> {
    const { data } = await apiClient.put<PlatformTikTokConfig>('/super-admin/tiktok/config', request);
    return data;
  },
};

export default tiktokAdsService;
