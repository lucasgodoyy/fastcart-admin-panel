export interface ShippingStoreConfig {
  id: number | null;
  originCep: string | null;
  extraDays: number;
  extraFee: number;
  extraFeeType: 'FIXED' | 'PERCENTAGE';
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ShippingStoreConfigRequest {
  originCep?: string | null;
  extraDays?: number;
  extraFee?: number;
  extraFeeType?: 'FIXED' | 'PERCENTAGE';
}

export type CustomShippingMethodType = 'FLAT' | 'BY_CEP_RANGE' | 'PICKUP';

export interface CustomShippingMethod {
  id: number;
  name: string;
  type: CustomShippingMethodType;
  price: number;
  cepFrom: string | null;
  cepTo: string | null;
  pickupAddress: string | null;
  pickupInstructions: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CustomShippingMethodRequest {
  name: string;
  type: CustomShippingMethodType;
  price?: number;
  cepFrom?: string | null;
  cepTo?: string | null;
  pickupAddress?: string | null;
  pickupInstructions?: string | null;
  active: boolean;
  sortOrder: number;
}
