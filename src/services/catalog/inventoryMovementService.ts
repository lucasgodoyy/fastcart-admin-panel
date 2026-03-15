import apiClient from '@/lib/api';

export type MovementType = 'DEDUCTION' | 'RESTORE' | 'MANUAL_ADJUSTMENT';

export interface InventoryMovement {
  id: number;
  productId: number;
  variantId: number | null;
  movementType: MovementType;
  quantityBefore: number;
  quantityAfter: number;
  quantityDelta: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
}

const inventoryMovementService = {
  async listByProduct(productId: number): Promise<InventoryMovement[]> {
    const response = await apiClient.get(`/admin/products/${productId}/inventory-movements`);
    return response.data;
  },
};

export default inventoryMovementService;
