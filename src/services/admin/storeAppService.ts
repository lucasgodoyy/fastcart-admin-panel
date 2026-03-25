import apiClient from '@/lib/api';
import { StoreApp } from '@/types/store-app';

const storeAppService = {
  async list(): Promise<StoreApp[]> {
    const { data } = await apiClient.get<StoreApp[]>('/admin/apps');
    return data;
  },

  async initialize(): Promise<StoreApp[]> {
    const { data } = await apiClient.post<StoreApp[]>('/admin/apps/initialize');
    return data;
  },

  async toggle(appKey: string, enabled: boolean): Promise<StoreApp> {
    const { data } = await apiClient.patch<StoreApp>(`/admin/apps/${appKey}/toggle`, null, {
      params: { enabled },
    });
    return data;
  },

  async updateSettings(appKey: string, settings: Record<string, string>): Promise<StoreApp> {
    const { data } = await apiClient.put<StoreApp>(`/admin/apps/${appKey}/settings`, settings);
    return data;
  },
};

export default storeAppService;
