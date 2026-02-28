import apiClient from '@/lib/api';
import type {
  Conversation,
  ChatMessage,
  CreateConversationRequest,
  SendMessageRequest,
  ChatStats,
} from '@/types/chat';
import type { PaginatedResult } from '@/types/super-admin';

// ═══════════════════════════════════════════════════════════════
//  Chat Service — Admin endpoints
// ═══════════════════════════════════════════════════════════════

const chatService = {
  // ── Conversations ────────────────────────────────────────

  listConversations: async (params?: {
    status?: string;
    channel?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<Conversation>> => {
    const response = await apiClient.get<PaginatedResult<Conversation>>(
      '/admin/chat/conversations',
      { params }
    );
    return response.data;
  },

  getConversation: async (conversationId: number): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(
      `/admin/chat/conversations/${conversationId}`
    );
    return response.data;
  },

  createConversation: async (
    data: CreateConversationRequest
  ): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(
      '/admin/chat/conversations',
      data
    );
    return response.data;
  },

  updateStatus: async (
    conversationId: number,
    status: string
  ): Promise<Conversation> => {
    const response = await apiClient.put<Conversation>(
      `/admin/chat/conversations/${conversationId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  // ── Messages ─────────────────────────────────────────────

  listMessages: async (
    conversationId: number,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResult<ChatMessage>> => {
    const response = await apiClient.get<PaginatedResult<ChatMessage>>(
      `/admin/chat/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: number,
    data: SendMessageRequest
  ): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(
      `/admin/chat/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    await apiClient.put(`/admin/chat/conversations/${conversationId}/read`);
  },

  // ── Stats ────────────────────────────────────────────────

  getStats: async (): Promise<ChatStats> => {
    const response = await apiClient.get<ChatStats>('/admin/chat/stats');
    return response.data;
  },
};

export default chatService;
