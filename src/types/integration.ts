export interface StripeConnectStatus {
  connected: boolean;
  stripeAccountId?: string | null;
  accountStatus?: string | null;
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface StripeConnectOnboardingResponse {
  onboardingUrl: string;
  status: StripeConnectStatus;
}

export interface StripeConnectDashboardLinkResponse {
  dashboardUrl: string;
}

export interface MelhorEnvioAuthorizeUrlResponse {
  authorizeUrl: string;
}

export interface MelhorEnvioConnectionStatus {
  provider: string;
  connected: boolean;
  providerAccountId?: string | null;
  connectedAt?: string | null;
  expiresAt?: string | null;
}

export type StripeOnboardingResponse = StripeConnectOnboardingResponse;
export type StripeDashboardLinkResponse = StripeConnectDashboardLinkResponse;
export type MelhorEnvioStatus = MelhorEnvioConnectionStatus;
