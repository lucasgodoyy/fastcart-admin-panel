import apiClient from '@/lib/api';
import {
  MelhorEnvioAuthorizeUrlResponse,
  MelhorEnvioConnectionStatus,
  StripeConnectDashboardLinkResponse,
  StripeConnectOnboardingResponse,
  StripeConnectStatus,
} from '@/types/integration';

const integrationService = {
  async getStripeStatus(): Promise<StripeConnectStatus> {
    const { data } = await apiClient.get<StripeConnectStatus>('/admin/stores/me/stripe-connect/status');
    return data;
  },

  async createStripeOnboardingLink(): Promise<StripeConnectOnboardingResponse> {
    const { data } = await apiClient.post<StripeConnectOnboardingResponse>('/admin/stores/me/stripe-connect/onboarding-link');
    return data;
  },

  async createStripeDashboardLink(): Promise<StripeConnectDashboardLinkResponse> {
    const { data } = await apiClient.post<StripeConnectDashboardLinkResponse>('/admin/stores/me/stripe-connect/dashboard-link');
    return data;
  },

  async disconnectStripe(): Promise<void> {
    await apiClient.delete('/admin/stores/me/stripe-connect/disconnect');
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

  async disconnectMelhorEnvio(): Promise<void> {
    await apiClient.delete('/shipping-accounts/melhor-envio/disconnect');
  },
};

export default integrationService;
