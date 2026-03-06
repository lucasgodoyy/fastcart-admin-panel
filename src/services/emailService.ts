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

type EmailLogApi = {
  id: number;
  recipientEmail: string;
  subject: string;
  status?: string;
  deliveryStatus?: string;
  sentAt?: string | null;
  createdAt?: string | null;
  errorMessage?: string | null;
};

export type PaginatedResult<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type EmailCampaignStats = {
  totalCampaigns: number;
  draftCampaigns: number;
  scheduledCampaigns: number;
  activeCampaigns: number;
  sentCampaigns: number;
  totalRecipients: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  avgOpenRate: number;
  avgClickRate: number;
};

export type StoreEmailCampaign = {
  id: number;
  storeId: number | null;
  storeName: string | null;
  name: string;
  subject: string;
  bodyHtml: string;
  status: string;
  targetAudience: string | null;
  segmentFilter: string | null;
  sendAt: string | null;
  frequency: string | null;
  nextSendAt: string | null;
  lastSentAt: string | null;
  recurrenceEnd: string | null;
  timezone: string | null;
  fromName: string | null;
  fromEmail: string | null;
  replyToEmail: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  failedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  isPlatform: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type StoreEmailCampaignUpsert = {
  name: string;
  subject: string;
  bodyHtml: string;
  status?: string;
  targetAudience?: string;
  segmentFilter?: string;
  sendAt?: string | null;
  frequency?: string | null;
  recurrenceEnd?: string | null;
  timezone?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  recipients?: Array<{ email: string; name?: string }>;
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
    const res = await apiClient.get<EmailLogApi[]>('/email/logs', { params });
    return res.data.map((log) => ({
      id: log.id,
      recipientEmail: log.recipientEmail,
      subject: log.subject,
      status: log.status ?? log.deliveryStatus ?? 'PENDING',
      sentAt: log.sentAt ?? log.createdAt ?? new Date().toISOString(),
      errorMessage: log.errorMessage ?? null,
    }));
  },

  resendEmail: async (logId: number): Promise<void> => {
    await apiClient.post(`/email/logs/${logId}/resend`);
  },

  sendEmail: async (data: { to: string; subject: string; bodyHtml: string }): Promise<EmailLog> => {
    const res = await apiClient.post<EmailLogApi>('/email/send', data);
    return {
      id: res.data.id,
      recipientEmail: res.data.recipientEmail,
      subject: res.data.subject,
      status: res.data.status ?? res.data.deliveryStatus ?? 'PENDING',
      sentAt: res.data.sentAt ?? res.data.createdAt ?? new Date().toISOString(),
      errorMessage: res.data.errorMessage ?? null,
    };
  },

  sendTestEmail: async (recipientEmail: string, templateKey?: string): Promise<EmailLog> => {
    const params: Record<string, string> = { recipientEmail };
    if (templateKey) params.templateKey = templateKey;
    const res = await apiClient.post<EmailLogApi>('/email/send-test', null, { params });
    return {
      id: res.data.id,
      recipientEmail: res.data.recipientEmail,
      subject: res.data.subject,
      status: res.data.status ?? res.data.deliveryStatus ?? 'PENDING',
      sentAt: res.data.sentAt ?? res.data.createdAt ?? new Date().toISOString(),
      errorMessage: res.data.errorMessage ?? null,
    };
  },

  // ── Email Campaigns (Store) ─────────────────────────────────
  getCampaignStats: async (): Promise<EmailCampaignStats> => {
    const res = await apiClient.get('/email/campaigns/stats');
    return res.data;
  },

  listCampaigns: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<StoreEmailCampaign>> => {
    const res = await apiClient.get('/email/campaigns', { params });
    return res.data;
  },

  getCampaign: async (id: number): Promise<StoreEmailCampaign> => {
    const res = await apiClient.get(`/email/campaigns/${id}`);
    return res.data;
  },

  createCampaign: async (body: StoreEmailCampaignUpsert): Promise<StoreEmailCampaign> => {
    const res = await apiClient.post('/email/campaigns', body);
    return res.data;
  },

  updateCampaign: async (id: number, body: StoreEmailCampaignUpsert): Promise<StoreEmailCampaign> => {
    const res = await apiClient.put(`/email/campaigns/${id}`, body);
    return res.data;
  },

  updateCampaignStatus: async (id: number, status: string): Promise<StoreEmailCampaign> => {
    const res = await apiClient.patch(`/email/campaigns/${id}/status`, null, { params: { status } });
    return res.data;
  },

  sendCampaignNow: async (id: number): Promise<StoreEmailCampaign> => {
    const res = await apiClient.post(`/email/campaigns/${id}/send`);
    return res.data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/email/campaigns/${id}`);
  },
};

export default emailService;
