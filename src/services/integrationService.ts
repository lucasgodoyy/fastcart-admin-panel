import apiClient from '@/lib/api';
import {
  MelhorEnvioAuthorizeUrlResponse,
  MelhorEnvioConnectionStatus,
  MercadoPagoAuthorizeUrlResponse,
  MercadoPagoStatus,
  StripeConnectDashboardLinkResponse,
  StripeConnectOnboardingResponse,
  StripeConnectStatus,
} from '@/types/integration';

const integrationService = {
  async getStripeStatus(): Promise<StripeConnectStatus> {
    console.log('[Stripe] Fetching status from /admin/stores/me/stripe-connect/status');
    try {
      const { data } = await apiClient.get<StripeConnectStatus>('/admin/stores/me/stripe-connect/status');
      console.log('[Stripe] Status response:', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('[Stripe] Status fetch FAILED:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async createStripeOnboardingLink(): Promise<StripeConnectOnboardingResponse> {
    console.log('[Stripe] Creating onboarding link via POST /admin/stores/me/stripe-connect/onboarding-link');
    try {
      const { data } = await apiClient.post<StripeConnectOnboardingResponse>('/admin/stores/me/stripe-connect/onboarding-link');
      console.log('[Stripe] Onboarding link response:', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('[Stripe] Onboarding link FAILED:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async createStripeDashboardLink(): Promise<StripeConnectDashboardLinkResponse> {
    console.log('[Stripe] Creating dashboard link via POST /admin/stores/me/stripe-connect/dashboard-link');
    try {
      const { data } = await apiClient.post<StripeConnectDashboardLinkResponse>('/admin/stores/me/stripe-connect/dashboard-link');
      console.log('[Stripe] Dashboard link response:', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('[Stripe] Dashboard link FAILED:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async disconnectStripe(): Promise<void> {
    console.log('[Stripe] Disconnecting via DELETE /admin/stores/me/stripe-connect/disconnect');
    try {
      await apiClient.delete('/admin/stores/me/stripe-connect/disconnect');
      console.log('[Stripe] Disconnect SUCCESS');
    } catch (error: any) {
      console.error('[Stripe] Disconnect FAILED:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async manuallyLinkStripeAccount(stripeAccountId: string): Promise<StripeConnectStatus> {
    console.log('[Stripe] Manually linking connected account:', stripeAccountId);
    try {
      const { data } = await apiClient.put<StripeConnectStatus>('/admin/stores/me/stripe-connect/manual-link', {
        stripeAccountId,
        stripeAccountStatus: 'PENDING',
      });
      console.log('[Stripe] Manual link response:', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('[Stripe] Manual link FAILED:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async getMelhorEnvioStatus(): Promise<MelhorEnvioConnectionStatus> {
    const { data } = await apiClient.get<MelhorEnvioConnectionStatus>('/shipping-accounts/melhor-envio/status');
    return data;
  },

  async getMelhorEnvioAuthorizeUrl(): Promise<MelhorEnvioAuthorizeUrlResponse> {
    const { data } = await apiClient.get<MelhorEnvioAuthorizeUrlResponse>('/shipping-accounts/melhor-envio/authorize-url');
    return data;
  },

  async connectMelhorEnvio(code: string): Promise<MelhorEnvioConnectionStatus> {
    const { data } = await apiClient.post<MelhorEnvioConnectionStatus>('/shipping-accounts/melhor-envio/connect', { code });
    return data;
  },

  async connectMelhorEnvioWithToken(accessToken: string): Promise<MelhorEnvioConnectionStatus> {
    const { data } = await apiClient.post<MelhorEnvioConnectionStatus>('/shipping-accounts/melhor-envio/connect-token', { accessToken });
    return data;
  },

  async disconnectMelhorEnvio(): Promise<void> {
    await apiClient.delete('/shipping-accounts/melhor-envio/disconnect');
  },

  // ─── Mercado Pago (OAuth Marketplace) ───

  async getMercadoPagoStatus(): Promise<MercadoPagoStatus> {
    console.log('[MercadoPago] Fetching status');
    try {
      const { data } = await apiClient.get<MercadoPagoStatus>('/admin/stores/me/mercadopago/status');
      console.log('[MercadoPago] Status:', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('[MercadoPago] Status fetch failed:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async getMercadoPagoAuthorizeUrl(): Promise<MercadoPagoAuthorizeUrlResponse> {
    console.log('[MercadoPago] Getting OAuth authorize URL');
    try {
      const { data } = await apiClient.get<MercadoPagoAuthorizeUrlResponse>('/admin/stores/me/mercadopago/authorize-url');
      console.log('[MercadoPago] Authorize URL:', data.authorizeUrl);
      return data;
    } catch (error: any) {
      console.error('[MercadoPago] Authorize URL failed:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  async disconnectMercadoPago(): Promise<void> {
    console.log('[MercadoPago] Disconnecting');
    try {
      await apiClient.delete('/admin/stores/me/mercadopago/disconnect');
      console.log('[MercadoPago] Disconnect SUCCESS');
    } catch (error: any) {
      console.error('[MercadoPago] Disconnect failed:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },
};

export default integrationService;
