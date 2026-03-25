export type UpsellType = 'UPSELL' | 'CROSS_SELL' | 'BUNDLE' | 'POST_PURCHASE';
export type UpsellTriggerType = 'PRODUCT' | 'CATEGORY' | 'CART_VALUE' | 'ALL';

export interface UpsellOffer {
  id: number;
  storeId: number;
  name: string;
  type: UpsellType;
  triggerType: UpsellTriggerType;
  triggerIds: number[] | null;
  offerProductIds: number[];
  discountPercent: number | null;
  message: string | null;
  priority: number;
  maxImpressions: number | null;
  impressionCount: number;
  conversionCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
