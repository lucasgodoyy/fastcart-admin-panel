import apiClient from '@/lib/api';

/* ── Types ── */

export type ShippingOffer = {
  id: number;
  name: string;
  shippingMethodCodes: string[];
  lowestCostOnly: boolean;
  applyScopeType: string;
  applyScopeTargetIds: number[];
  allowCombineWithOtherDiscounts: boolean;
  deliveryZoneType: string;
  deliveryZoneCodes: string[];
  minCartAmount: number | null;
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
  applyScopeType: string;
  applyScopeTargetIds?: number[];
  allowCombineWithOtherDiscounts?: boolean;
  deliveryZoneType: string;
  deliveryZoneCodes?: string[];
  minCartAmount?: number;
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
};

export default shippingOfferService;
