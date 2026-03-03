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

const googleShoppingService = {
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
};

export default googleShoppingService;
