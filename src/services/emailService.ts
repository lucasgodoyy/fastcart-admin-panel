import apiClient from '@/lib/api';

// ── Types ────────────────────────────────────────────────────
export interface EmailSenderConfig {
  id: number | null;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  active: boolean;
  updatedAt: string | null;
}

export interface EmailTemplate {
  id: number;
  templateKey: string;
  subject: string;
  bodyHtml: string;
  active: boolean;
  updatedAt: string | null;
}

export interface OutboundEmailLog {
  id: number;
  orderId: number | null;
  recipientEmail: string;
  subject: string;
  templateKey: string;
  resendMessageId: string | null;
  deliveryStatus: string;
  errorMessage: string | null;
  lastEventType: string | null;
  lastEventAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface EmailSenderConfigRequest {
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | null;
  active: boolean;
}

export interface EmailTemplateUpsertRequest {
  subject: string;
  bodyHtml: string;
  active: boolean;
}

// ── Service ──────────────────────────────────────────────────
const emailService = {
  // Sender Config
  getSenderConfig: async (): Promise<EmailSenderConfig> => {
    const response = await apiClient.get<EmailSenderConfig>('/email/sender-config');
    return response.data;
  },

  updateSenderConfig: async (data: EmailSenderConfigRequest): Promise<EmailSenderConfig> => {
    const response = await apiClient.put<EmailSenderConfig>('/email/sender-config', data);
    return response.data;
  },

  // Templates
  listTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await apiClient.get<EmailTemplate[]>('/email/templates');
    return response.data;
  },

  upsertTemplate: async (templateKey: string, data: EmailTemplateUpsertRequest): Promise<EmailTemplate> => {
    const response = await apiClient.put<EmailTemplate>(`/email/templates/${templateKey}`, data);
    return response.data;
  },

  // Logs
  listLogs: async (params?: { status?: string; limit?: number }): Promise<OutboundEmailLog[]> => {
    const response = await apiClient.get<OutboundEmailLog[]>('/email/logs', { params });
    return response.data;
  },
};

export default emailService;
