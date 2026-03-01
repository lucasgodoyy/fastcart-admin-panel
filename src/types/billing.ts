export type CurrentSubscription = {
  subscriptionId: number;
  planId: number;
  planName: string;
  planSlug: string;
  planPriceCents: number;
  currency: string;
  billingPeriod: string;
  status: string;
  features: string[];
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  canceledAt: string | null;
  createdAt: string;
};

export type AvailablePlan = {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  isPopular: boolean;
  maxStores: number;
  maxProducts: number | null;
  features: string[];
  isCurrent: boolean;
};

export type StoreBillingResponse = {
  currentSubscription: CurrentSubscription | null;
  availablePlans: AvailablePlan[];
};
