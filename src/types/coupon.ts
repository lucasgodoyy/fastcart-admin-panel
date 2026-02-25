export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type CouponScopeType =
  | 'ALL_PRODUCTS'
  | 'SPECIFIC_PRODUCTS'
  | 'SPECIFIC_CATEGORIES'
  | 'SPECIFIC_COLLECTIONS';

export interface Coupon {
  id: number;
  code: string;
  scopeType: CouponScopeType;
  scopeTargetIds: number[];
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perCustomerLimit?: number | null;
  firstOrderOnly: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUpsertRequest {
  code: string;
  scopeType: CouponScopeType;
  scopeTargetIds?: number[] | null;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  firstOrderOnly?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  active?: boolean;
}
