import apiClient from '@/lib/api';
import type {
  PlatformOverview,
  PlatformGeneralSettings,
  PaginatedResult,
  StoreSummary,
  UserSummary,
  UserSession,
  ResetUserPasswordRequest,
  UpdateUserRoleRequest,
  SupportTicketSummary,
  SupportTicketDetail,
  OutboundEmailLogSummary,
  EmailTemplateSummary,
  ActivityLog,
  SubscriptionPlan,
  CreateOrUpdatePlanRequest,
  StoreSubscription,
  SubscriptionStats,
  Affiliate,
  AffiliateStats,
  AffiliateConversion,
  AffiliatePayout,
  AffiliateLink,
  AffiliateSettings,
  MarketingStats,
  MarketingCampaign,
  CampaignUpsertRequest,
  MarketingBanner,
  BannerUpsertRequest,
  PushTemplate,
  PushTemplateUpsertRequest,
  SANotification,
  NotificationStats,
  CreateNotificationRequest,
  EmailCampaign,
  EmailCampaignStats,
  EmailCampaignUpsertRequest,
  PlatformErrorLog,
  ErrorLogStats,
} from '@/types/super-admin';

// ────────────────────────────────────────────────────────────────
// Super-Admin Service — covers all 46 backend endpoints
// ────────────────────────────────────────────────────────────────

const superAdminService = {
  // ── Overview & Settings ────────────────────────────────────────
  getOverview: async (): Promise<PlatformOverview> => {
    const { data } = await apiClient.get<PlatformOverview>('/super-admin/overview');
    return data;
  },

  getGeneralSettings: async (): Promise<PlatformGeneralSettings> => {
    const { data } = await apiClient.get<PlatformGeneralSettings>('/super-admin/settings/general');
    return data;
  },

  // ── Store Management ──────────────────────────────────────────
  listStores: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<StoreSummary>> => {
    const { data } = await apiClient.get<PaginatedResult<StoreSummary>>('/super-admin/stores', { params });
    return data;
  },

  getStore: async (storeId: number): Promise<StoreSummary> => {
    const { data } = await apiClient.get<StoreSummary>(`/super-admin/stores/${storeId}`);
    return data;
  },

  toggleStoreStatus: async (storeId: number): Promise<void> => {
    await apiClient.put(`/super-admin/stores/${storeId}/toggle-status`);
  },

  // ── User Management ───────────────────────────────────────────
  listUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<UserSummary>> => {
    const { data } = await apiClient.get<PaginatedResult<UserSummary>>('/super-admin/users', { params });
    return data;
  },

  resetUserPassword: async (userId: number, body: ResetUserPasswordRequest): Promise<void> => {
    await apiClient.post(`/super-admin/users/${userId}/reset-password`, body);
  },

  toggleUserStatus: async (userId: number): Promise<void> => {
    await apiClient.put(`/super-admin/users/${userId}/toggle-status`);
  },

  updateUserRole: async (userId: number, body: UpdateUserRoleRequest): Promise<void> => {
    await apiClient.put(`/super-admin/users/${userId}/role`, body);
  },

  listUserSessions: async (params?: {
    activeOnly?: boolean;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<UserSession>> => {
    const { data } = await apiClient.get<PaginatedResult<UserSession>>('/super-admin/users/sessions', { params });
    return data;
  },

  revokeSession: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/users/sessions/${sessionId}`);
  },

  revokeAllUserSessions: async (userId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/users/${userId}/sessions`);
  },

  // ── Support Tickets ───────────────────────────────────────────
  listSupportTickets: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<SupportTicketSummary>> => {
    const { data } = await apiClient.get<PaginatedResult<SupportTicketSummary>>('/super-admin/support/tickets', { params });
    return data;
  },

  getSupportTicketDetail: async (ticketId: number): Promise<SupportTicketDetail> => {
    const { data } = await apiClient.get<SupportTicketDetail>(`/super-admin/support/tickets/${ticketId}`);
    return data;
  },

  replyToSupportTicket: async (ticketId: number, message: string): Promise<SupportTicketDetail> => {
    const { data } = await apiClient.post<SupportTicketDetail>(`/super-admin/support/tickets/${ticketId}/reply`, { message });
    return data;
  },

  updateSupportTicketStatus: async (ticketId: number, status: string): Promise<void> => {
    await apiClient.put(`/super-admin/support/tickets/${ticketId}/status`, { status });
  },

  // ── Email Logs & Templates ────────────────────────────────────
  listEmailLogs: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<OutboundEmailLogSummary>> => {
    const { data } = await apiClient.get<PaginatedResult<OutboundEmailLogSummary>>('/super-admin/emails/logs', { params });
    return data;
  },

  listEmailTemplates: async (params?: {
    storeId?: number;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<EmailTemplateSummary>> => {
    const { data } = await apiClient.get<PaginatedResult<EmailTemplateSummary>>('/super-admin/emails/templates', { params });
    return data;
  },

  resendEmail: async (logId: number): Promise<void> => {
    await apiClient.post(`/super-admin/emails/logs/${logId}/resend`);
  },

  sendPlatformEmail: async (data: { to: string; subject: string; bodyHtml: string }): Promise<{ status: string; messageId: string }> => {
    const { data: result } = await apiClient.post('/super-admin/emails/send', data);
    return result;
  },

  getPlatformTemplates: async (): Promise<{ id: number | null; templateKey: string; subject: string; bodyHtml: string; active: boolean; updatedAt: string | null }[]> => {
    const { data } = await apiClient.get('/super-admin/emails/platform-templates');
    return data;
  },

  upsertPlatformTemplate: async (templateKey: string, data: { subject: string; bodyHtml: string; active: boolean }): Promise<void> => {
    await apiClient.put(`/super-admin/emails/templates/${templateKey}`, data);
  },

  // ── Activity Logs ─────────────────────────────────────────────
  listActivityLogs: async (params?: {
    actionType?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<ActivityLog>> => {
    const { data } = await apiClient.get<PaginatedResult<ActivityLog>>('/super-admin/activity', { params });
    return data;
  },

  // ── Subscription Plans ────────────────────────────────────────
  listPlans: async (params?: {
    activeOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<SubscriptionPlan>> => {
    const { data } = await apiClient.get<PaginatedResult<SubscriptionPlan>>('/super-admin/subscriptions/plans', { params });
    return data;
  },

  getPlan: async (planId: number): Promise<SubscriptionPlan> => {
    const { data } = await apiClient.get<SubscriptionPlan>(`/super-admin/subscriptions/plans/${planId}`);
    return data;
  },

  createPlan: async (body: CreateOrUpdatePlanRequest): Promise<SubscriptionPlan> => {
    const { data } = await apiClient.post<SubscriptionPlan>('/super-admin/subscriptions/plans', body);
    return data;
  },

  updatePlan: async (planId: number, body: CreateOrUpdatePlanRequest): Promise<SubscriptionPlan> => {
    const { data } = await apiClient.put<SubscriptionPlan>(`/super-admin/subscriptions/plans/${planId}`, body);
    return data;
  },

  togglePlanActive: async (planId: number): Promise<void> => {
    await apiClient.put(`/super-admin/subscriptions/plans/${planId}/toggle-active`);
  },

  deletePlan: async (planId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/subscriptions/plans/${planId}`);
  },

  // ── Store Subscriptions ───────────────────────────────────────
  listSubscriptions: async (params?: {
    status?: string;
    planId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<StoreSubscription>> => {
    const { data } = await apiClient.get<PaginatedResult<StoreSubscription>>('/super-admin/subscriptions', { params });
    return data;
  },

  getStoreSubscription: async (storeId: number): Promise<StoreSubscription> => {
    const { data } = await apiClient.get<StoreSubscription>(`/super-admin/subscriptions/store/${storeId}`);
    return data;
  },

  assignPlan: async (storeId: number, planId: number): Promise<StoreSubscription> => {
    const { data } = await apiClient.post<StoreSubscription>(
      `/super-admin/subscriptions/store/${storeId}`,
      null,
      { params: { planId } },
    );
    return data;
  },

  changePlan: async (storeId: number, planId: number): Promise<StoreSubscription> => {
    const { data } = await apiClient.put<StoreSubscription>(
      `/super-admin/subscriptions/store/${storeId}/change-plan`,
      null,
      { params: { planId } },
    );
    return data;
  },

  cancelSubscription: async (storeId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/subscriptions/store/${storeId}`);
  },

  getSubscriptionStats: async (): Promise<SubscriptionStats> => {
    const { data } = await apiClient.get<SubscriptionStats>('/super-admin/subscriptions/stats');
    return data;
  },

  // ── Affiliates ────────────────────────────────────────────────
  listAffiliates: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<Affiliate>> => {
    const { data } = await apiClient.get<PaginatedResult<Affiliate>>('/super-admin/affiliates', { params });
    return data;
  },

  getAffiliateStats: async (): Promise<AffiliateStats> => {
    const { data } = await apiClient.get<AffiliateStats>('/super-admin/affiliates/stats');
    return data;
  },

  listAffiliateConversions: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateConversion>> => {
    const { data } = await apiClient.get<PaginatedResult<AffiliateConversion>>('/super-admin/affiliates/conversions', { params });
    return data;
  },

  listAffiliatePayouts: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliatePayout>> => {
    const { data } = await apiClient.get<PaginatedResult<AffiliatePayout>>('/super-admin/affiliates/payouts', { params });
    return data;
  },

  getAffiliateById: async (id: number): Promise<Affiliate> => {
    const { data } = await apiClient.get<Affiliate>(`/super-admin/affiliates/${id}`);
    return data;
  },

  createAffiliate: async (storeId: number, body: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
    referralCode?: string;
    commissionRate?: number;
    pixKey?: string;
    bankInfo?: string;
    notes?: string;
  }): Promise<Affiliate> => {
    const { data } = await apiClient.post<Affiliate>('/super-admin/affiliates', body, { params: { storeId } });
    return data;
  },

  updateAffiliate: async (id: number, body: {
    name?: string;
    phone?: string;
    document?: string;
    commissionRate?: number;
    status?: string;
    pixKey?: string;
    bankInfo?: string;
    notes?: string;
  }): Promise<Affiliate> => {
    const { data } = await apiClient.put<Affiliate>(`/super-admin/affiliates/${id}`, body);
    return data;
  },

  approveAffiliate: async (id: number): Promise<Affiliate> => {
    const { data } = await apiClient.put<Affiliate>(`/super-admin/affiliates/${id}/approve`);
    return data;
  },

  suspendAffiliate: async (id: number): Promise<Affiliate> => {
    const { data } = await apiClient.put<Affiliate>(`/super-admin/affiliates/${id}/suspend`);
    return data;
  },

  listAffiliateLinks: async (params?: {
    affiliateId?: number;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<AffiliateLink>> => {
    const { data } = await apiClient.get<PaginatedResult<AffiliateLink>>('/super-admin/affiliates/links', { params });
    return data;
  },

  approveAffiliateConversion: async (id: number): Promise<AffiliateConversion> => {
    const { data } = await apiClient.put<AffiliateConversion>(`/super-admin/affiliates/conversions/${id}/approve`);
    return data;
  },

  rejectAffiliateConversion: async (id: number, reason?: string): Promise<AffiliateConversion> => {
    const { data } = await apiClient.put<AffiliateConversion>(
      `/super-admin/affiliates/conversions/${id}/reject`,
      null,
      { params: reason ? { reason } : undefined },
    );
    return data;
  },

  createAffiliatePayout: async (body: {
    affiliateId: number;
    amount: number;
    method?: string;
    reference?: string;
    notes?: string;
  }): Promise<AffiliatePayout> => {
    const { data } = await apiClient.post<AffiliatePayout>('/super-admin/affiliates/payouts', body);
    return data;
  },

  markAffiliatePayoutPaid: async (id: number): Promise<AffiliatePayout> => {
    const { data } = await apiClient.put<AffiliatePayout>(`/super-admin/affiliates/payouts/${id}/paid`);
    return data;
  },

  getAffiliateSettings: async (storeId?: number): Promise<AffiliateSettings> => {
    const { data } = await apiClient.get<AffiliateSettings>('/super-admin/affiliates/settings', {
      params: storeId ? { storeId } : undefined,
    });
    return data;
  },

  updateAffiliateSettings: async (storeId: number, body: {
    enabled?: boolean;
    commissionRate?: number;
    cookieDays?: number;
    minPayout?: number;
    payoutDay?: number;
    autoApprove?: boolean;
    termsUrl?: string;
  }): Promise<AffiliateSettings> => {
    const { data } = await apiClient.put<AffiliateSettings>('/super-admin/affiliates/settings', body, {
      params: { storeId },
    });
    return data;
  },

  // ── Marketing ─────────────────────────────────────────────────
  getMarketingStats: async (): Promise<MarketingStats> => {
    const { data } = await apiClient.get<MarketingStats>('/super-admin/marketing/stats');
    return data;
  },

  listCampaigns: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<MarketingCampaign>> => {
    const { data } = await apiClient.get<PaginatedResult<MarketingCampaign>>('/super-admin/marketing/campaigns', { params });
    return data;
  },

  getCampaign: async (id: number): Promise<MarketingCampaign> => {
    const { data } = await apiClient.get<MarketingCampaign>(`/super-admin/marketing/campaigns/${id}`);
    return data;
  },

  createCampaign: async (body: CampaignUpsertRequest): Promise<MarketingCampaign> => {
    const { data } = await apiClient.post<MarketingCampaign>('/super-admin/marketing/campaigns', body);
    return data;
  },

  updateCampaign: async (id: number, body: CampaignUpsertRequest): Promise<MarketingCampaign> => {
    const { data } = await apiClient.put<MarketingCampaign>(`/super-admin/marketing/campaigns/${id}`, body);
    return data;
  },

  updateCampaignStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.patch(`/super-admin/marketing/campaigns/${id}/status`, null, { params: { status } });
  },

  listBanners: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<MarketingBanner>> => {
    const { data } = await apiClient.get<PaginatedResult<MarketingBanner>>('/super-admin/marketing/banners', { params });
    return data;
  },

  createBanner: async (body: BannerUpsertRequest): Promise<MarketingBanner> => {
    const { data } = await apiClient.post<MarketingBanner>('/super-admin/marketing/banners', body);
    return data;
  },

  toggleBannerActive: async (id: number, active: boolean): Promise<void> => {
    await apiClient.patch(`/super-admin/marketing/banners/${id}/toggle-active`, null, { params: { active } });
  },

  listPushTemplates: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<PushTemplate>> => {
    const { data } = await apiClient.get<PaginatedResult<PushTemplate>>('/super-admin/marketing/push', { params });
    return data;
  },

  createPushTemplate: async (body: PushTemplateUpsertRequest): Promise<PushTemplate> => {
    const { data } = await apiClient.post<PushTemplate>('/super-admin/marketing/push', body);
    return data;
  },

  // ── Notifications ─────────────────────────────────────────────
  listNotifications: async (params?: {
    type?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<SANotification>> => {
    const { data } = await apiClient.get<PaginatedResult<SANotification>>('/super-admin/notifications', { params });
    return data;
  },

  getNotificationStats: async (): Promise<NotificationStats> => {
    const { data } = await apiClient.get<NotificationStats>('/super-admin/notifications/stats');
    return data;
  },

  createNotification: async (body: CreateNotificationRequest): Promise<SANotification> => {
    const { data } = await apiClient.post<SANotification>('/super-admin/notifications', body);
    return data;
  },

  // ── Email Campaigns (Platform) ────────────────────────────────
  getEmailCampaignStats: async (): Promise<EmailCampaignStats> => {
    const { data } = await apiClient.get<EmailCampaignStats>('/super-admin/email-campaigns/stats');
    return data;
  },

  listEmailCampaigns: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<EmailCampaign>> => {
    const { data } = await apiClient.get<PaginatedResult<EmailCampaign>>('/super-admin/email-campaigns', { params });
    return data;
  },

  getEmailCampaign: async (id: number): Promise<EmailCampaign> => {
    const { data } = await apiClient.get<EmailCampaign>(`/super-admin/email-campaigns/${id}`);
    return data;
  },

  createEmailCampaign: async (body: EmailCampaignUpsertRequest): Promise<EmailCampaign> => {
    const { data } = await apiClient.post<EmailCampaign>('/super-admin/email-campaigns', body);
    return data;
  },

  updateEmailCampaign: async (id: number, body: EmailCampaignUpsertRequest): Promise<EmailCampaign> => {
    const { data } = await apiClient.put<EmailCampaign>(`/super-admin/email-campaigns/${id}`, body);
    return data;
  },

  updateEmailCampaignStatus: async (id: number, status: string): Promise<EmailCampaign> => {
    const { data } = await apiClient.patch<EmailCampaign>(`/super-admin/email-campaigns/${id}/status`, null, { params: { status } });
    return data;
  },

  sendEmailCampaignNow: async (id: number): Promise<EmailCampaign> => {
    const { data } = await apiClient.post<EmailCampaign>(`/super-admin/email-campaigns/${id}/send`);
    return data;
  },

  deleteEmailCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/super-admin/email-campaigns/${id}`);
  },

  // ── Error Logs ────────────────────────────────────────────────
  listErrorLogs: async (params?: {
    severity?: string;
    resolved?: boolean;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<PlatformErrorLog>> => {
    const { data } = await apiClient.get<PaginatedResult<PlatformErrorLog>>('/super-admin/error-logs', { params });
    return data;
  },

  getErrorLogStats: async (): Promise<ErrorLogStats> => {
    const { data } = await apiClient.get<ErrorLogStats>('/super-admin/error-logs/stats');
    return data;
  },

  resolveErrorLog: async (id: number): Promise<PlatformErrorLog> => {
    const { data } = await apiClient.put<PlatformErrorLog>(`/super-admin/error-logs/${id}/resolve`);
    return data;
  },

  addErrorLogNote: async (id: number, notes: string): Promise<PlatformErrorLog> => {
    const { data } = await apiClient.put<PlatformErrorLog>(`/super-admin/error-logs/${id}/notes`, { notes });
    return data;
  },
};

export default superAdminService;
