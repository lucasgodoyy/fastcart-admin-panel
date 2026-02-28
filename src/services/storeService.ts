import apiClient from '@/lib/api';

export interface StoreInfo {
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
  storeCurrency: string;
  active: boolean;
  checkoutSettingsJson: string | null;
  customerMessageJson: string | null;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressCountry?: string;
  checkoutSettingsJson?: string;
  customerMessageJson?: string;
}

// ── Typed settings interfaces ──
export interface CheckoutSettings {
  useLayoutColors: boolean;
  askPhone: boolean;
  askInvoice: boolean;
  customerMessageFieldName: string;
  fieldRequired: boolean;
  trackingMessage: string;
  clearSaleCode: string;
  restrictPurchases: 'all' | 'authorized';
  allowPaymentMethodChange: boolean;
}

export interface CustomerMessageSettings {
  showMessage: boolean;
  message: string;
}

export const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  useLayoutColors: false,
  askPhone: false,
  askInvoice: false,
  customerMessageFieldName: '',
  fieldRequired: false,
  trackingMessage: '',
  clearSaleCode: '',
  restrictPurchases: 'all',
  allowPaymentMethodChange: false,
};

export const DEFAULT_CUSTOMER_MESSAGE: CustomerMessageSettings = {
  showMessage: false,
  message: '',
};

const storeService = {
  getMyStore: async (): Promise<StoreInfo> => {
    const response = await apiClient.get<StoreInfo>('/admin/stores/me');
    return response.data;
  },

  updateMyStore: async (data: UpdateStoreRequest): Promise<StoreInfo> => {
    const response = await apiClient.put<StoreInfo>('/admin/stores/me', data);
    return response.data;
  },

  // ── Helpers ──
  parseCheckoutSettings: (json: string | null): CheckoutSettings => {
    if (!json) return { ...DEFAULT_CHECKOUT_SETTINGS };
    try {
      return { ...DEFAULT_CHECKOUT_SETTINGS, ...JSON.parse(json) };
    } catch {
      return { ...DEFAULT_CHECKOUT_SETTINGS };
    }
  },

  parseCustomerMessage: (json: string | null): CustomerMessageSettings => {
    if (!json) return { ...DEFAULT_CUSTOMER_MESSAGE };
    try {
      return { ...DEFAULT_CUSTOMER_MESSAGE, ...JSON.parse(json) };
    } catch {
      return { ...DEFAULT_CUSTOMER_MESSAGE };
    }
  },
};

export default storeService;
