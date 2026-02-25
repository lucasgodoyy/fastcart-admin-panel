import apiClient from '@/lib/api';
import {
  SalesChannelSettings,
  UpdateSalesChannelSettingsRequest,
} from '@/types/salesChannel';

const salesChannelsService = {
  async getSettings(): Promise<SalesChannelSettings> {
    const { data } = await apiClient.get<SalesChannelSettings>('/admin/stores/me/sales-channels');
    return data;
  },

  async updateSettings(payload: UpdateSalesChannelSettingsRequest): Promise<SalesChannelSettings> {
    const { data } = await apiClient.put<SalesChannelSettings>('/admin/stores/me/sales-channels', payload);
    return data;
  },
};

export default salesChannelsService;
