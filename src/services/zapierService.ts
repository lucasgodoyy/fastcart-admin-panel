import apiClient from '@/lib/api';

export interface ZapierWebhookConfig {
  id: number;
  storeId: number;
  targetUrlMasked: string;
  targetUrl: string;
  events: string[];
  active: boolean;
  description: string | null;
  createdAt: string;
}

export interface ZapierWebhookCreatedResponse {
  webhook: ZapierWebhookConfig;
  secret: string; // returned only once, on creation
}

export interface CreateZapierWebhookRequest {
  targetUrl: string;
  events: string[];
  description?: string;
}

export const ZAPIER_EVENTS: { value: string; label: string; description: string }[] = [
  {
    value: 'order.paid',
    label: 'Pedido pago',
    description: 'Quando um pedido é confirmado como pago',
  },
  {
    value: 'order.shipped',
    label: 'Pedido despachado',
    description: 'Quando um pedido é enviado (rastreio gerado)',
  },
  {
    value: 'order.delivered',
    label: 'Pedido entregue',
    description: 'Quando um pedido é marcado como entregue',
  },
  {
    value: 'order.cancelled',
    label: 'Pedido cancelado',
    description: 'Quando um pedido é cancelado',
  },
  {
    value: 'customer.created',
    label: 'Novo cliente',
    description: 'Quando um novo cliente se cadastra na loja',
  },
];

const zapierService = {
  listWebhooks: async (): Promise<ZapierWebhookConfig[]> => {
    const { data } = await apiClient.get<ZapierWebhookConfig[]>(
      '/admin/integrations/zapier/webhooks'
    );
    return data;
  },

  createWebhook: async (
    request: CreateZapierWebhookRequest
  ): Promise<ZapierWebhookCreatedResponse> => {
    const { data } = await apiClient.post<ZapierWebhookCreatedResponse>(
      '/admin/integrations/zapier/webhooks',
      request
    );
    return data;
  },

  deleteWebhook: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/integrations/zapier/webhooks/${id}`);
  },

  toggleWebhook: async (id: number, active: boolean): Promise<ZapierWebhookConfig> => {
    const { data } = await apiClient.patch<ZapierWebhookConfig>(
      `/admin/integrations/zapier/webhooks/${id}/toggle`,
      { active }
    );
    return data;
  },

  testWebhook: async (id: number): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      `/admin/integrations/zapier/webhooks/${id}/test`
    );
    return data;
  },

  /** Super-admin only */
  listAllWebhooks: async (): Promise<ZapierWebhookConfig[]> => {
    const { data } = await apiClient.get<ZapierWebhookConfig[]>(
      '/super-admin/zapier/webhooks'
    );
    return data;
  },

  superAdminDelete: async (id: number): Promise<void> => {
    await apiClient.delete(`/super-admin/zapier/webhooks/${id}`);
  },

  superAdminToggle: async (id: number, active: boolean): Promise<ZapierWebhookConfig> => {
    const { data } = await apiClient.patch<ZapierWebhookConfig>(
      `/super-admin/zapier/webhooks/${id}/toggle`,
      { active }
    );
    return data;
  },
};

export default zapierService;
