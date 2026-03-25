import apiClient from '@/lib/api';
import {
  CustomShippingMethod,
  CustomShippingMethodRequest,
  ShippingStoreConfig,
  ShippingStoreConfigRequest,
} from '@/types/shippingConfig';

const shippingConfigService = {
  async getConfig(): Promise<ShippingStoreConfig> {
    const { data } = await apiClient.get<ShippingStoreConfig>('/shipping-config');
    return data;
  },

  async saveConfig(request: ShippingStoreConfigRequest): Promise<ShippingStoreConfig> {
    const { data } = await apiClient.put<ShippingStoreConfig>('/shipping-config', request);
    return data;
  },

  async listCustomMethods(): Promise<CustomShippingMethod[]> {
    const { data } = await apiClient.get<CustomShippingMethod[]>('/shipping-config/custom-methods');
    return data;
  },

  async createMethod(request: CustomShippingMethodRequest): Promise<CustomShippingMethod> {
    const { data } = await apiClient.post<CustomShippingMethod>('/shipping-config/custom-methods', request);
    return data;
  },

  async updateMethod(id: number, request: CustomShippingMethodRequest): Promise<CustomShippingMethod> {
    const { data } = await apiClient.put<CustomShippingMethod>(`/shipping-config/custom-methods/${id}`, request);
    return data;
  },

  async toggleMethod(id: number, active: boolean): Promise<CustomShippingMethod> {
    const { data } = await apiClient.patch<CustomShippingMethod>(
      `/shipping-config/custom-methods/${id}/toggle-active`,
      null,
      { params: { active } },
    );
    return data;
  },

  async deleteMethod(id: number): Promise<void> {
    await apiClient.delete(`/shipping-config/custom-methods/${id}`);
  },
};

export default shippingConfigService;
