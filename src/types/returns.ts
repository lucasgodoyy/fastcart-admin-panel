export type ReturnType = 'RETURN' | 'EXCHANGE';
export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'REFUNDED' | 'EXCHANGED' | 'COMPLETED' | 'CANCELLED';
export type ReturnReason = 'DEFECTIVE' | 'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'CHANGED_MIND' | 'SIZE_FIT' | 'DAMAGED_IN_SHIPPING' | 'OTHER';

export interface ReturnRequestItem {
  id: number;
  orderItemId: number;
  productId: number;
  productVariantId: number | null;
  quantity: number;
  productName: string | null;
  variantLabel: string | null;
  unitPrice: number | null;
  exchangeVariantId: number | null;
}

export interface ReturnRequest {
  id: number;
  storeId: number;
  orderId: number;
  customerId: number;
  customerEmail: string | null;
  customerName: string | null;
  type: ReturnType;
  status: ReturnStatus;
  reason: ReturnReason;
  reasonDetails: string | null;
  adminNotes: string | null;
  refundAmount: number | null;
  trackingCode: string | null;
  items: ReturnRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnStats {
  total: number;
  requested: number;
  approved: number;
  completed: number;
  rejected: number;
}
