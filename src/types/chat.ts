// ═══════════════════════════════════════════════════════════════
//  Chat / Conversation Types
// ═══════════════════════════════════════════════════════════════

export type ConversationStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';
export type ConversationChannel = 'CUSTOMER_CHAT' | 'SUPPORT';
export type SenderType = 'ADMIN' | 'CUSTOMER' | 'SYSTEM';
export type ContentType = 'TEXT' | 'IMAGE' | 'FILE';

export interface Conversation {
  id: number;
  customerName: string;
  customerEmail: string;
  status: ConversationStatus;
  channel: ConversationChannel;
  subject: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadAdminCount: number;
  unreadCustomerCount: number;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderType: SenderType;
  senderName: string;
  senderEmail: string;
  content: string;
  contentType: ContentType;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface CreateConversationRequest {
  customerName: string;
  customerEmail: string;
  subject?: string;
  initialMessage: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ChatStats {
  totalUnread: number;
  openConversations: number;
  closedConversations: number;
}
