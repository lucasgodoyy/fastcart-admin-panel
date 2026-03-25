import apiClient from '@/lib/api';
import { SubscriptionPlan, ProductSubscription } from '@/types/product-subscription';

const productSubscriptionService = {
  async listPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get<SubscriptionPlan[]>('/admin/product-subscriptions/plans');
    return data;
  },

  async createPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data } = await apiClient.post<SubscriptionPlan>('/admin/product-subscriptions/plans', plan);
    return data;
  },

  async updatePlan(id: number, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data } = await apiClient.put<SubscriptionPlan>(`/admin/product-subscriptions/plans/${id}`, plan);
    return data;
  },

  async togglePlan(id: number, active: boolean): Promise<SubscriptionPlan> {
    const { data } = await apiClient.patch<SubscriptionPlan>(`/admin/product-subscriptions/plans/${id}/toggle`, null, {
      params: { active },
    });
    return data;
  },

  async deletePlan(id: number): Promise<void> {
    await apiClient.delete(`/admin/product-subscriptions/plans/${id}`);
  },

  async listSubscriptions(page = 0, size = 20): Promise<{ content: ProductSubscription[]; totalElements: number }> {
    const { data } = await apiClient.get('/admin/product-subscriptions', {
      params: { page, size },
    });
    return data;
  },

  async cancelSubscription(id: number): Promise<ProductSubscription> {
    const { data } = await apiClient.patch<ProductSubscription>(`/admin/product-subscriptions/${id}/cancel`);
    return data;
  },
};

export default productSubscriptionService;
