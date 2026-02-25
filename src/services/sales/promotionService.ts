import apiClient from '@/lib/api';
import { Promotion, PromotionUpsertRequest } from '@/types/promotion';

const promotionService = {
  async listAll(): Promise<Promotion[]> {
    const { data } = await apiClient.get<Promotion[]>('/promotions');
    return data;
  },

  async create(request: PromotionUpsertRequest): Promise<Promotion> {
    const { data } = await apiClient.post<Promotion>('/promotions', request);
    return data;
  },

  async update(id: number, request: PromotionUpsertRequest): Promise<Promotion> {
    const { data } = await apiClient.put<Promotion>(`/promotions/${id}`, request);
    return data;
  },

  async toggleActive(id: number, active: boolean): Promise<Promotion> {
    const { data } = await apiClient.patch<Promotion>(`/promotions/${id}/toggle-active`, null, {
      params: { active },
    });
    return data;
  },
};

export default promotionService;
