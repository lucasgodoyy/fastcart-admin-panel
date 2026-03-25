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
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  tiktokPixelId: string | null;
  googleAdsId: string | null;
  gtmId: string | null;
  googleMerchantId: string | null;
  googleAnalyticsApiSecret: string | null;
  googleVerificationTag: string | null;
  bingVerificationTag: string | null;
  conversionCodeCheckout: string | null;
  conversionCodeConfirmation: string | null;
  mailchimpApiKey: string | null;
  mailchimpListId: string | null;
  mailchimpServer: string | null;
  googleCustomerReviewsEnabled: boolean;
  ebitId: string | null;
  ebitUrl: string | null;
  hotjarId: string | null;
  externalChatScript: string | null;
  subdomain: string | null;
  customDomain: string | null;
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
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleAdsId?: string;
  gtmId?: string;
  googleMerchantId?: string;
  googleAnalyticsApiSecret?: string;
  googleVerificationTag?: string;
  bingVerificationTag?: string;
  conversionCodeCheckout?: string;
  conversionCodeConfirmation?: string;
  mailchimpApiKey?: string;
  mailchimpListId?: string;
  mailchimpServer?: string;
  googleCustomerReviewsEnabled?: boolean;
  ebitId?: string;
  ebitUrl?: string;
  hotjarId?: string;
  externalChatScript?: string;
  subdomain?: string;
  customDomain?: string;
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
