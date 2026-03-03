import apiClient from '@/lib/api';
import { StoreBillingResponse } from '@/types/billing';

const billingService = {
  /** Get billing info: current subscription + available plans */
  getBilling: async (): Promise<StoreBillingResponse> => {
    const response = await apiClient.get('/admin/billing');
    return response.data;
  },

  /** Create a Stripe Checkout Session for a subscription plan */
  createCheckout: async (planId: number): Promise<{ url: string }> => {
    const response = await apiClient.post(`/admin/billing/checkout?planId=${planId}`);
    return response.data;
  },

  /** Create a Stripe Customer Portal session for managing subscription */
  createPortalSession: async (): Promise<{ url: string }> => {
    const response = await apiClient.post('/admin/billing/portal');
    return response.data;
  },
};

export default billingService;
