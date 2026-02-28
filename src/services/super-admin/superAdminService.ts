import apiClient from '@/lib/api';
import {
  ActivityLogSummary,
  CreateOrUpdatePlanRequest,
  EmailTemplateSummary,
  OutboundEmailLogSummary,
  PaginatedResult,
  PlatformGeneralSettings,
  PlatformOverview,
  StoreSummary,
  StoreSubscription,
  SubscriptionPlan,
  SubscriptionStats,
  SupportTicketSummary,
  UserSessionSummary,
  UserSummary,
} from '@/types/super-admin';

const superAdminService = {
  // ── Overview & Settings ────────────────────────────────────

  getOverview: async (): Promise<PlatformOverview> => {
    const response = await apiClient.get<PlatformOverview>('/super-admin/overview');
    return response.data;
  },

  getGeneralSettings: async (): Promise<PlatformGeneralSettings> => {
    const response = await apiClient.get<PlatformGeneralSettings>('/super-admin/settings/general');
    return response.data;
  },

  // ── Stores ─────────────────────────────────────────────────

  listStores: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<StoreSummary>> => {
    const response = await apiClient.get<PaginatedResult<StoreSummary>>('/super-admin/stores', {
      params,
    });
    return response.data;
  },

  toggleStoreStatus: async (storeId: number): Promise<void> => {
    await apiClient.put(`/super-admin/stores/${storeId}/toggle-status`);
  },

  getStoreById: async (storeId: number): Promise<StoreSummary> => {
    const response = await apiClient.get<StoreSummary>(`/super-admin/stores/${storeId}`);
    return response.data;
  },

  // ── Users ──────────────────────────────────────────────────

  listUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<UserSummary>> => {
    const response = await apiClient.get<PaginatedResult<UserSummary>>('/super-admin/users', {
      params,
    });
    return response.data;
  },

  resetUserPassword: async (userId: number, newPassword: string): Promise<void> => {
    await apiClient.post(`/super-admin/users/${userId}/reset-password`, { newPassword });
  },

  toggleUserStatus: async (userId: number): Promise<void> => {
    await apiClient.put(`/super-admin/users/${userId}/toggle-status`);
  },

  updateUserRole: async (userId: number, role: string): Promise<void> => {
    await apiClient.put(`/super-admin/users/${userId}/role`, { role });
  },

  // ── Sessions ───────────────────────────────────────────────

  listSessions: async (params?: {
    activeOnly?: boolean;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<UserSessionSummary>> => {
    const response = await apiClient.get<PaginatedResult<UserSessionSummary>>('/super-admin/users/sessions', {
      params,
    });
    return response.data;
  },

  revokeSession: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/users/sessions/${sessionId}`);
  },

  revokeAllUserSessions: async (userId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/users/${userId}/sessions`);
  },

  // ── Support ────────────────────────────────────────────────

  listSupportTickets: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<SupportTicketSummary>> => {
    const response = await apiClient.get<PaginatedResult<SupportTicketSummary>>('/super-admin/support/tickets', {
      params,
    });
    return response.data;
  },

  // ── Emails ─────────────────────────────────────────────────

  listEmailLogs: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<OutboundEmailLogSummary>> => {
    const response = await apiClient.get<PaginatedResult<OutboundEmailLogSummary>>('/super-admin/emails/logs', {
      params,
    });
    return response.data;
  },

  listEmailTemplates: async (params?: {
    storeId?: number;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<EmailTemplateSummary>> => {
    const response = await apiClient.get<PaginatedResult<EmailTemplateSummary>>('/super-admin/emails/templates', {
      params,
    });
    return response.data;
  },

  // ── Activity Logs ──────────────────────────────────────────

  listActivityLogs: async (params?: {
    actionType?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<ActivityLogSummary>> => {
    const response = await apiClient.get<PaginatedResult<ActivityLogSummary>>('/super-admin/activity', {
      params,
    });
    return response.data;
  },

  // ── Subscriptions — Plans ──────────────────────────────────

  listPlans: async (params?: {
    activeOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<SubscriptionPlan>> => {
    const response = await apiClient.get<PaginatedResult<SubscriptionPlan>>('/super-admin/subscriptions/plans', {
      params,
    });
    return response.data;
  },

  getPlanById: async (planId: number): Promise<SubscriptionPlan> => {
    const response = await apiClient.get<SubscriptionPlan>(`/super-admin/subscriptions/plans/${planId}`);
    return response.data;
  },

  createPlan: async (data: CreateOrUpdatePlanRequest): Promise<SubscriptionPlan> => {
    const response = await apiClient.post<SubscriptionPlan>('/super-admin/subscriptions/plans', data);
    return response.data;
  },

  updatePlan: async (planId: number, data: CreateOrUpdatePlanRequest): Promise<SubscriptionPlan> => {
    const response = await apiClient.put<SubscriptionPlan>(`/super-admin/subscriptions/plans/${planId}`, data);
    return response.data;
  },

  togglePlanActive: async (planId: number): Promise<void> => {
    await apiClient.put(`/super-admin/subscriptions/plans/${planId}/toggle-active`);
  },

  deletePlan: async (planId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/subscriptions/plans/${planId}`);
  },

  // ── Subscriptions — Store Subscriptions ────────────────────

  listSubscriptions: async (params?: {
    status?: string;
    planId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<StoreSubscription>> => {
    const response = await apiClient.get<PaginatedResult<StoreSubscription>>('/super-admin/subscriptions', {
      params,
    });
    return response.data;
  },

  getSubscriptionByStoreId: async (storeId: number): Promise<StoreSubscription> => {
    const response = await apiClient.get<StoreSubscription>(`/super-admin/subscriptions/store/${storeId}`);
    return response.data;
  },

  assignSubscription: async (storeId: number, planId: number): Promise<StoreSubscription> => {
    const response = await apiClient.post<StoreSubscription>(
      `/super-admin/subscriptions/store/${storeId}`,
      null,
      { params: { planId } }
    );
    return response.data;
  },

  changeSubscriptionPlan: async (storeId: number, planId: number): Promise<StoreSubscription> => {
    const response = await apiClient.put<StoreSubscription>(
      `/super-admin/subscriptions/store/${storeId}/change-plan`,
      null,
      { params: { planId } }
    );
    return response.data;
  },

  cancelSubscription: async (storeId: number): Promise<void> => {
    await apiClient.delete(`/super-admin/subscriptions/store/${storeId}`);
  },

  // ── Subscriptions — Stats ──────────────────────────────────

  getSubscriptionStats: async (): Promise<SubscriptionStats> => {
    const response = await apiClient.get<SubscriptionStats>('/super-admin/subscriptions/stats');
    return response.data;
  },
};

export default superAdminService;
