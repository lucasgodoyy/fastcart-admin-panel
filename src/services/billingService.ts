import apiClient from '@/lib/api';
import { StoreBillingResponse } from '@/types/billing';

const billingService = {
  /** Get billing info: current subscription + available plans */
  getBilling: async (): Promise<StoreBillingResponse> => {
    const response = await apiClient.get('/admin/billing');
    return response.data;
  },
};

export default billingService;
