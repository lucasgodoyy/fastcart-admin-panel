export type PromotionDiscountType = 'BUY_X_PAY_Y';

export type PromotionApplyScopeType =
  | 'ENTIRE_STORE'
  | 'CATEGORIES'
  | 'PRODUCTS'
  | 'BRANDS';

export interface Promotion {
  id: number;
  name: string;
  discountType: PromotionDiscountType;
  buyQuantity: number;
  payQuantity: number;
  buyScopeType: PromotionApplyScopeType;
  buyScopeTargetIds: number[];
  payScopeType: PromotionApplyScopeType;
  payScopeTargetIds: number[];
  combineWithPriceDiscounts: boolean;
  combineWithFreeShipping: boolean;
  combineWithCartDiscounts: boolean;
  combineWithAppDiscounts: boolean;
  usageLimit?: number | null;
  usageCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionUpsertRequest {
  name: string;
  discountType: PromotionDiscountType;
  buyQuantity: number;
  payQuantity: number;
  buyScopeType: PromotionApplyScopeType;
  buyScopeTargetIds?: number[] | null;
  payScopeType: PromotionApplyScopeType;
  payScopeTargetIds?: number[] | null;
  combineWithPriceDiscounts?: boolean;
  combineWithFreeShipping?: boolean;
  combineWithCartDiscounts?: boolean;
  combineWithAppDiscounts?: boolean;
  usageLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  active?: boolean;
}
