export interface StripeConnectStatus {
  connected: boolean;
  stripeAccountId?: string | null;
  accountStatus?: string | null;
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  actionRequired: boolean;
  pendingReview: boolean;
  disabledReason?: string | null;
  currentDeadline?: number | null;
  currentlyDue: string[];
  pendingVerification: string[];
  eventuallyDue: string[];
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

// ─── Mercado Pago ───

export interface MercadoPagoStatus {
  connected: boolean;
  status: string;
  hasAccessToken: boolean;
  hasPublicKey: boolean;
  mercadoPagoUserId?: string | null;
}

export interface MercadoPagoAuthorizeUrlResponse {
  authorizeUrl: string;
}
