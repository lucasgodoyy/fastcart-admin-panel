import apiClient from '@/lib/api';
import type {
  NotificationItem,
  NotificationType,
  NotificationPreference,
  NotificationStats,
  CreateNotificationRequest,
  UpdatePreferenceRequest,
  PaginatedResult,
} from '@/types/super-admin';

// ═══════════════════════════════════════════════════════════════
//  Admin / Store-owner Notification Service
// ═══════════════════════════════════════════════════════════════

const notificationService = {
  // ── List ──────────────────────────────────────────────────

  list: async (params?: {
    type?: string;
    unreadOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<NotificationItem>> => {
    const response = await apiClient.get<PaginatedResult<NotificationItem>>(
      '/notifications',
      { params }
    );
    return response.data;
  },

  // ── Unread Count ─────────────────────────────────────────

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  // ── Mark As Read ─────────────────────────────────────────

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.put<{ updated: number }>('/notifications/read-all');
    return response.data.updated;
  },

  // ── Notification Types ───────────────────────────────────

  listTypes: async (): Promise<NotificationType[]> => {
    const response = await apiClient.get<NotificationType[]>('/notifications/types');
    return response.data;
  },

  // ── Preferences ──────────────────────────────────────────

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const response = await apiClient.get<NotificationPreference[]>('/notifications/preferences');
    return response.data;
  },

  updatePreference: async (data: UpdatePreferenceRequest): Promise<NotificationPreference> => {
    const response = await apiClient.put<NotificationPreference>('/notifications/preferences', data);
    return response.data;
  },
};

export default notificationService;

// ═══════════════════════════════════════════════════════════════
//  Super-Admin Notification Service
// ═══════════════════════════════════════════════════════════════

export const superAdminNotificationService = {
  list: async (params?: {
    type?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<NotificationItem>> => {
    const response = await apiClient.get<PaginatedResult<NotificationItem>>(
      '/super-admin/notifications',
      { params }
    );
    return response.data;
  },

  getStats: async (): Promise<NotificationStats> => {
    const response = await apiClient.get<NotificationStats>('/super-admin/notifications/stats');
    return response.data;
  },

  create: async (data: CreateNotificationRequest): Promise<NotificationItem> => {
    const response = await apiClient.post<NotificationItem>('/super-admin/notifications', data);
    return response.data;
  },
};
