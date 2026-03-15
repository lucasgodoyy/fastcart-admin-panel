import apiClient from '@/lib/api';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StoreReview {
  id: number;
  productId: number;
  productName?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  orderId?: number | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  status: ReviewStatus;
  verifiedPurchase?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageApprovedRating: number | null;
  ratingBreakdown: Record<string, number>;
}

const reviewService = {
  async list(status?: string): Promise<StoreReview[]> {
    const response = await apiClient.get('/admin/reviews', {
      params: status && status !== 'ALL' ? { status } : undefined,
    });
    return response.data;
  },

  async getStats(): Promise<StoreReviewStats> {
    const response = await apiClient.get('/admin/reviews/stats');
    return response.data;
  },

  async moderate(reviewId: number, status: ReviewStatus): Promise<StoreReview> {
    const response = await apiClient.patch(`/admin/reviews/${reviewId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  async remove(reviewId: number): Promise<void> {
    await apiClient.delete(`/admin/reviews/${reviewId}`);
  },
};

export default reviewService;
