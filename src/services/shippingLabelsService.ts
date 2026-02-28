import apiClient from '@/lib/api';

const shippingLabelsService = {
  async list(status?: string) {
    const { data } = await apiClient.get('/shipping-labels/melhor-envio', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  async search(query: string) {
    const { data } = await apiClient.get('/shipping-labels/melhor-envio/search', {
      params: { q: query },
    });
    return data;
  },

  async details(orderId: string) {
    const { data } = await apiClient.get(`/shipping-labels/melhor-envio/${encodeURIComponent(orderId)}`);
    return data;
  },

  async status(orders: string[]) {
    const { data } = await apiClient.post('/shipping-labels/melhor-envio/status', { orders });
    return data;
  },

  async cancellable(orders: string[]) {
    const { data } = await apiClient.post('/shipping-labels/melhor-envio/cancellable', { orders });
    return data;
  },

  async cancel(order: Record<string, unknown>) {
    const { data } = await apiClient.post('/shipping-labels/melhor-envio/cancel', { order });
    return data;
  },

  async generate(orders: string[]) {
    const { data } = await apiClient.post('/shipping-labels/melhor-envio/generate', { orders });
    return data;
  },

  async print(orders: string[], mode = 'public') {
    const { data } = await apiClient.post('/shipping-labels/melhor-envio/print', { orders, mode });
    return data;
  },

  getPrintFileUrl(fileType: string, id: string) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const encodedType = encodeURIComponent(fileType);
    const encodedId = encodeURIComponent(id);
    return `${baseURL}/shipping-labels/melhor-envio/print-files/${encodedType}/${encodedId}`;
  },
};

export default shippingLabelsService;
