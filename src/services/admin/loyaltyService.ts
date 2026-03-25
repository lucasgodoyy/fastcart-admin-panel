import apiClient from '@/lib/api';
import { LoyaltySettings, LoyaltyBalance, LoyaltyTransaction } from '@/types/loyalty';

const loyaltyService = {
  async getSettings(): Promise<LoyaltySettings | null> {
    const { data } = await apiClient.get('/admin/loyalty/settings');
    return data;
  },

  async updateSettings(settings: Partial<LoyaltySettings>): Promise<LoyaltySettings> {
    const { data } = await apiClient.put<LoyaltySettings>('/admin/loyalty/settings', settings);
    return data;
  },

  async getLeaderboard(page = 0, size = 20): Promise<{ content: LoyaltyBalance[]; totalElements: number }> {
    const { data } = await apiClient.get('/admin/loyalty/leaderboard', {
      params: { page, size },
    });
    return data;
  },

  async getTransactions(customerId: number, page = 0, size = 20): Promise<{ content: LoyaltyTransaction[]; totalElements: number }> {
    const { data } = await apiClient.get(`/admin/loyalty/customers/${customerId}/transactions`, {
      params: { page, size },
    });
    return data;
  },

  async adjustPoints(customerId: number, points: number, description: string): Promise<void> {
    await apiClient.post(`/admin/loyalty/customers/${customerId}/adjust`, { points, description });
  },
};

export default loyaltyService;
