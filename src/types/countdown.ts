export type CountdownType = 'FIXED_DATE' | 'EVERGREEN' | 'DAILY_RECURRING';
export type CountdownPosition = 'TOP' | 'BOTTOM' | 'PRODUCT_PAGE' | 'CART_PAGE';

export interface CountdownTimer {
  id: number;
  storeId: number;
  name: string;
  type: CountdownType;
  position: CountdownPosition;
  message: string | null;
  endDate: string | null;
  durationMinutes: number | null;
  dailyStartTime: string | null;
  dailyEndTime: string | null;
  bgColor: string | null;
  textColor: string | null;
  productIds: number[] | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
