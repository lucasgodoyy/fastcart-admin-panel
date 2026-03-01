import apiClient from '@/lib/api';

export type EmailSenderConfig = {
  id: number;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  active: boolean;
  updatedAt: string;
};

export type EmailTemplate = {
  id: number;
  templateKey: string;
  subject: string;
  bodyHtml: string;
  active: boolean;
  updatedAt: string;
};

export type EmailLog = {
  id: number;
  recipientEmail: string;
  subject: string;
  status: string;
  sentAt: string;
  errorMessage: string | null;
};

const emailService = {
  getSenderConfig: async (): Promise<EmailSenderConfig> => {
    const res = await apiClient.get('/email/sender-config');
    return res.data;
  },

  upsertSenderConfig: async (data: {
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
    active: boolean;
  }): Promise<EmailSenderConfig> => {
    const res = await apiClient.put('/email/sender-config', data);
    return res.data;
  },

  listTemplates: async (): Promise<EmailTemplate[]> => {
    const res = await apiClient.get('/email/templates');
    return res.data;
  },

  upsertTemplate: async (
    templateKey: string,
    data: { subject: string; bodyHtml: string; active: boolean },
  ): Promise<EmailTemplate> => {
    const res = await apiClient.put(`/email/templates/${templateKey}`, data);
    return res.data;
  },

  listLogs: async (status?: string, limit?: number): Promise<EmailLog[]> => {
    const params: Record<string, string | number> = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    const res = await apiClient.get('/email/logs', { params });
    return res.data;
  },
};

export default emailService;
