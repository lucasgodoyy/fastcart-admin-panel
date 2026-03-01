import apiClient from '@/lib/api';

/* ── Types ── */

export type NotificationItem = {
  id: number;
  storeId: number | null;
  storeName: string | null;
  userId: number;
  userEmail: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPreference = {
  id: number;
  notificationType: string;
  typeLabel: string;
  typeDescription: string;
  typeCategory: string;
  channelInApp: boolean;
  channelEmail: boolean;
  channelPush: boolean;
};

export type NotificationType = {
  code: string;
  label: string;
  description: string;
  category: string;
  defaultEmail: boolean;
  defaultInApp: boolean;
  defaultPush: boolean;
  sortOrder: number;
};

export type PaginatedNotifications = {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/* ── Service ── */

const notificationService = {
  list: async (params?: {
    page?: number;
    size?: number;
    type?: string;
    unreadOnly?: boolean;
  }): Promise<PaginatedNotifications> => {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data.count;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<number> => {
    const res = await apiClient.put('/notifications/read-all');
    return res.data.updated;
  },

  listTypes: async (): Promise<NotificationType[]> => {
    const res = await apiClient.get('/notifications/types');
    return res.data;
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const res = await apiClient.get('/notifications/preferences');
    return res.data;
  },

  updatePreference: async (data: {
    notificationType: string;
    channelInApp?: boolean;
    channelEmail?: boolean;
    channelPush?: boolean;
  }): Promise<NotificationPreference> => {
    const res = await apiClient.put('/notifications/preferences', data);
    return res.data;
  },
};

export default notificationService;
