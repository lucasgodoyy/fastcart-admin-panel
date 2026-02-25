import apiClient from '@/lib/api';
import { Coupon, CouponUpsertRequest } from '@/types/coupon';

const couponService = {
  async listAll(): Promise<Coupon[]> {
    const { data } = await apiClient.get<Coupon[]>('/coupons');
    return data;
  },

  async create(request: CouponUpsertRequest): Promise<Coupon> {
    const { data } = await apiClient.post<Coupon>('/coupons', request);
    return data;
  },

  async update(id: number, request: CouponUpsertRequest): Promise<Coupon> {
    const { data } = await apiClient.put<Coupon>(`/coupons/${id}`, request);
    return data;
  },

  async toggleActive(id: number, active: boolean): Promise<Coupon> {
    const { data } = await apiClient.patch<Coupon>(`/coupons/${id}/toggle-active`, null, {
      params: { active },
    });
    return data;
  },
};

export default couponService;
