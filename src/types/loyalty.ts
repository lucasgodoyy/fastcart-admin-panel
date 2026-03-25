export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface LoyaltySettings {
  id: number;
  storeId: number;
  pointsPerCurrency: number;
  currencyPerPoint: number;
  minimumRedemption: number;
  pointsExpiryDays: number | null;
  earnOnPurchase: boolean;
  earnOnReview: boolean;
  earnOnReferral: boolean;
  enabled: boolean;
}

export interface LoyaltyBalance {
  id: number;
  customerId: number;
  customerName: string | null;
  totalPoints: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
}

export interface LoyaltyTransaction {
  id: number;
  customerId: number;
  type: string;
  points: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}
