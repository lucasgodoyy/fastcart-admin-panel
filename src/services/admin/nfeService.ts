import apiClient from '@/lib/api';
import { NfeConfig, NfeInvoice } from '@/types/nfe';

const nfeService = {
  async getConfig(): Promise<NfeConfig | null> {
    const { data } = await apiClient.get('/admin/nfe/config');
    return data || null;
  },

  async upsertConfig(config: Partial<NfeConfig> & { apiKey?: string }): Promise<NfeConfig> {
    const { data } = await apiClient.put<NfeConfig>('/admin/nfe/config', config);
    return data;
  },

  async listInvoices(status?: string, page = 0, size = 20): Promise<{ content: NfeInvoice[]; totalElements: number }> {
    const { data } = await apiClient.get('/admin/nfe/invoices', {
      params: { status, page, size },
    });
    return data;
  },

  async getInvoice(id: number): Promise<NfeInvoice> {
    const { data } = await apiClient.get<NfeInvoice>(`/admin/nfe/invoices/${id}`);
    return data;
  },

  async createInvoice(orderId: number, totalAmount: number): Promise<NfeInvoice> {
    const { data } = await apiClient.post<NfeInvoice>('/admin/nfe/invoices', null, {
      params: { orderId, totalAmount },
    });
    return data;
  },

  async cancelInvoice(id: number): Promise<NfeInvoice> {
    const { data } = await apiClient.patch<NfeInvoice>(`/admin/nfe/invoices/${id}/cancel`);
    return data;
  },
};

export default nfeService;
