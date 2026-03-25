export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

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
  includeShippingInDiscount: boolean;
  cheapestShippingOnly: boolean;
  combineWithPromotions: boolean;
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
  includeShippingInDiscount?: boolean;
  cheapestShippingOnly?: boolean;
  combineWithPromotions?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  active?: boolean;
}

// ── UI-only filter/sort types ──────────────────────────────────────────────────

export type CouponSortOption = 'az' | 'za' | 'newest' | 'oldest' | 'most_used' | 'least_used';

export interface CouponFilters {
  discountType: 'ALL' | CouponType;
  shippingIncluded: 'ALL' | 'YES' | 'NO';
  usageLimit: 'ALL' | 'UNLIMITED' | 'LIMITED';
  validity: 'ALL' | 'UNLIMITED' | 'PERIOD';
  minCartValue: 'ALL' | 'NONE' | 'HAS';
  maxDiscount: 'ALL' | 'NONE' | 'HAS';
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  createdAt: 'ALL' | 'CUSTOM';
  createdFrom: string;
  createdTo: string;
}

export const DEFAULT_FILTERS: CouponFilters = {
  discountType: 'ALL',
  shippingIncluded: 'ALL',
  usageLimit: 'ALL',
  validity: 'ALL',
  minCartValue: 'ALL',
  maxDiscount: 'ALL',
  status: 'ALL',
  createdAt: 'ALL',
  createdFrom: '',
  createdTo: '',
};
