import apiClient from '@/lib/api';

export type StoreSettings = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZipCode: string | null;
  addressCountry: string | null;
  storeCurrency: string | null;
  templateId: string | null;
  storeNiche: string | null;
  layoutPreset: string | null;
  active: boolean;
  checkoutSettingsJson: string | null;
  customerMessageJson: string | null;
  stripeAccountId: string | null;
  stripeConnected: boolean;
  createdAt: string;
};

export type UpdateStoreSettingsRequest = {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressCountry?: string;
  storeCurrency?: string;
  templateId?: string;
  storeNiche?: string;
  layoutPreset?: string;
  active?: boolean;
  checkoutSettingsJson?: string;
  customerMessageJson?: string;
};

export type StoreUser = {
  id: number;
  email: string;
  role: string;
  storeId: number | null;
  createdAt: string;
};

const storeSettingsService = {
  /** Get current store info */
  getMyStore: async (): Promise<StoreSettings> => {
    const response = await apiClient.get('/admin/stores/me');
    return response.data;
  },

  /** Update current store */
  updateMyStore: async (data: UpdateStoreSettingsRequest): Promise<StoreSettings> => {
    const response = await apiClient.put('/admin/stores/me', data);
    return response.data;
  },

  /** List users for a store */
  listUsers: async (storeId: number): Promise<StoreUser[]> => {
    const response = await apiClient.get(`/admin/users/store/${storeId}`);
    return response.data;
  },

  /** Create a user */
  createUser: async (data: { email: string; password: string; role: string; storeId: number }): Promise<StoreUser> => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  /** Delete a user */
  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};

export default storeSettingsService;
