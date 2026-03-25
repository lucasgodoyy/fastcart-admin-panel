import apiClient from '@/lib/api';
import { ReturnRequest, ReturnStats } from '@/types/returns';

const returnService = {
  async list(status?: string, page = 0, size = 20): Promise<{ content: ReturnRequest[]; totalElements: number }> {
    const { data } = await apiClient.get('/admin/returns', {
      params: { status, page, size },
    });
    return data;
  },

  async getById(id: number): Promise<ReturnRequest> {
    const { data } = await apiClient.get<ReturnRequest>(`/admin/returns/${id}`);
    return data;
  },

  async getStats(): Promise<ReturnStats> {
    const { data } = await apiClient.get<ReturnStats>('/admin/returns/stats');
    return data;
  },

  async updateStatus(id: number, status: string, adminNotes?: string, refundAmount?: number, trackingCode?: string): Promise<ReturnRequest> {
    const { data } = await apiClient.patch<ReturnRequest>(`/admin/returns/${id}/status`, {
      status,
      adminNotes,
      refundAmount,
      trackingCode,
    });
    return data;
  },
};

export default returnService;
