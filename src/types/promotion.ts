export type PromotionDiscountType =
  | 'BUY_X_PAY_Y'
  | 'PRICE_DISCOUNT'
  | 'CROSS_SELLING'
  | 'PROGRESSIVE_DISCOUNT'
  | 'CART_DISCOUNT';

export type PromotionApplyScopeType =
  | 'ENTIRE_STORE'
  | 'CATEGORIES'
  | 'PRODUCTS'
  | 'BRANDS';

export type DiscountValueType = 'PERCENTAGE' | 'FIXED';

export interface ProgressiveTier {
  minQty: number;
  discountValue: number;
  discountValueType: DiscountValueType;
}

export interface Promotion {
  id: number;
  name: string;
  discountType: PromotionDiscountType;
  /** BUY_X_PAY_Y only */
  buyQuantity?: number | null;
  /** BUY_X_PAY_Y only */
  payQuantity?: number | null;
  buyScopeType: PromotionApplyScopeType;
  buyScopeTargetIds: number[];
  payScopeType: PromotionApplyScopeType;
  payScopeTargetIds: number[];
  /** PRICE_DISCOUNT, CROSS_SELLING, CART_DISCOUNT */
  discountValue?: number | null;
  discountValueType?: DiscountValueType | null;
  /** CART_DISCOUNT: minimum cart amount to trigger */
  minCartAmount?: number | null;
  /** PROGRESSIVE_DISCOUNT: JSON stringified ProgressiveTier[] */
  progressiveRules?: string | null;
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
  buyQuantity?: number | null;
  payQuantity?: number | null;
  buyScopeType: PromotionApplyScopeType;
  buyScopeTargetIds?: number[] | null;
  payScopeType: PromotionApplyScopeType;
  payScopeTargetIds?: number[] | null;
  discountValue?: number | null;
  discountValueType?: DiscountValueType | null;
  minCartAmount?: number | null;
  progressiveRules?: string | null;
  combineWithPriceDiscounts?: boolean;
  combineWithFreeShipping?: boolean;
  combineWithCartDiscounts?: boolean;
  combineWithAppDiscounts?: boolean;
  usageLimit?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  active?: boolean;
}
