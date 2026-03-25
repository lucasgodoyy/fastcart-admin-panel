import apiClient from '@/lib/api';
import { UpsellOffer } from '@/types/upsell';

const upsellService = {
  async list(): Promise<UpsellOffer[]> {
    const { data } = await apiClient.get<UpsellOffer[]>('/admin/upsell-offers');
    return data;
  },

  async getById(id: number): Promise<UpsellOffer> {
    const { data } = await apiClient.get<UpsellOffer>(`/admin/upsell-offers/${id}`);
    return data;
  },

  async create(offer: Partial<UpsellOffer>): Promise<UpsellOffer> {
    const { data } = await apiClient.post<UpsellOffer>('/admin/upsell-offers', offer);
    return data;
  },

  async update(id: number, offer: Partial<UpsellOffer>): Promise<UpsellOffer> {
    const { data } = await apiClient.put<UpsellOffer>(`/admin/upsell-offers/${id}`, offer);
    return data;
  },

  async toggle(id: number, active: boolean): Promise<UpsellOffer> {
    const { data } = await apiClient.patch<UpsellOffer>(`/admin/upsell-offers/${id}/toggle`, null, {
      params: { active },
    });
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/upsell-offers/${id}`);
  },
};

export default upsellService;
