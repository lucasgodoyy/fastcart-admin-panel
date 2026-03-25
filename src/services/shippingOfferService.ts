import apiClient from '@/lib/api';

/* ── Scope type constants (match backend PromotionApplyScopeType enum) ── */
export const SHIPPING_SCOPE_TYPES = ['ENTIRE_STORE', 'CATEGORIES', 'PRODUCTS', 'BRANDS'] as const;
export type ShippingApplyScopeType = (typeof SHIPPING_SCOPE_TYPES)[number];

/* ── Zone type constants (match backend DeliveryZoneType enum) ── */
export const DELIVERY_ZONE_TYPES = ['ALL', 'SPECIFIC'] as const;
export type DeliveryZoneType = (typeof DELIVERY_ZONE_TYPES)[number];

/* ── Types ── */

export type ShippingOffer = {
  id: number;
  name: string;
  shippingMethodCodes: string[];
  lowestCostOnly: boolean;
  applyScopeType: ShippingApplyScopeType;
  applyScopeTargetIds: number[];
  allowCombineWithOtherDiscounts: boolean;
  deliveryZoneType: DeliveryZoneType;
  deliveryZoneCodes: string[];
  minCartAmount: number | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShippingOfferUpsertRequest = {
  name: string;
  shippingMethodCodes: string[];
  lowestCostOnly?: boolean;
  applyScopeType: ShippingApplyScopeType;
  applyScopeTargetIds?: number[];
  allowCombineWithOtherDiscounts?: boolean;
  deliveryZoneType: DeliveryZoneType;
  deliveryZoneCodes?: string[];
  minCartAmount?: number;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  startsAt?: string;
  expiresAt?: string;
  active?: boolean;
};

/* ── Service ── */

const shippingOfferService = {
  list: async (): Promise<ShippingOffer[]> => {
    const res = await apiClient.get('/shipping-offers');
    return res.data;
  },

  create: async (data: ShippingOfferUpsertRequest): Promise<ShippingOffer> => {
    const res = await apiClient.post('/shipping-offers', data);
    return res.data;
  },

  update: async (id: number, data: ShippingOfferUpsertRequest): Promise<ShippingOffer> => {
    const res = await apiClient.put(`/shipping-offers/${id}`, data);
    return res.data;
  },

  toggleActive: async (id: number, active: boolean): Promise<ShippingOffer> => {
    const res = await apiClient.patch(`/shipping-offers/${id}/toggle-active`, null, {
      params: { active },
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/shipping-offers/${id}`);
  },
};

export default shippingOfferService;
