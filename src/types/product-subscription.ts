export type SubscriptionFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface SubscriptionPlan {
  id: number;
  storeId: number;
  productId: number;
  productName: string | null;
  name: string;
  frequency: SubscriptionFrequency;
  discountPercent: number;
  active: boolean;
  createdAt: string;
}

export interface ProductSubscription {
  id: number;
  storeId: number;
  customerId: number;
  customerName: string | null;
  planId: number;
  planName: string | null;
  status: SubscriptionStatus;
  nextOrderAt: string | null;
  lastOrderAt: string | null;
  totalOrders: number;
  createdAt: string;
}
