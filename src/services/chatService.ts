import apiClient from '@/lib/api';

/* ── Types ── */

export type Conversation = {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  channel: string;
  subject: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadAdminCount: number;
  unreadCustomerCount: number;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderType: string;
  senderName: string;
  senderEmail: string;
  content: string;
  contentType: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type PaginatedResult<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ChatStats = {
  totalConversations: number;
  openConversations: number;
  closedConversations: number;
  archivedConversations: number;
  unreadMessages: number;
};

/* ── Service ── */

const chatService = {
  listConversations: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    channel?: string;
  }): Promise<PaginatedResult<Conversation>> => {
    const res = await apiClient.get('/admin/chat/conversations', { params });
    return res.data;
  },

  getConversation: async (id: number): Promise<Conversation> => {
    const res = await apiClient.get(`/admin/chat/conversations/${id}`);
    return res.data;
  },

  createConversation: async (data: {
    customerName: string;
    customerEmail: string;
    subject?: string;
    initialMessage: string;
  }): Promise<Conversation> => {
    const res = await apiClient.post('/admin/chat/conversations', data);
    return res.data;
  },

  updateStatus: async (
    conversationId: number,
    status: 'OPEN' | 'CLOSED' | 'ARCHIVED',
  ): Promise<Conversation> => {
    const res = await apiClient.put(
      `/admin/chat/conversations/${conversationId}/status`,
      { status },
    );
    return res.data;
  },

  listMessages: async (
    conversationId: number,
    params?: { page?: number; size?: number },
  ): Promise<PaginatedResult<ChatMessage>> => {
    const res = await apiClient.get(
      `/admin/chat/conversations/${conversationId}/messages`,
      { params },
    );
    return res.data;
  },

  sendMessage: async (
    conversationId: number,
    content: string,
  ): Promise<Conversation> => {
    const res = await apiClient.post(
      `/admin/chat/conversations/${conversationId}/messages`,
      { content },
    );
    return res.data;
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    await apiClient.put(`/admin/chat/conversations/${conversationId}/read`);
  },

  getStats: async (): Promise<ChatStats> => {
    const res = await apiClient.get('/admin/chat/stats');
    return res.data;
  },
};

export default chatService;
