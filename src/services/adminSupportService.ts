import apiClient from '@/lib/api';
import type { SupportTicketDetail } from '@/types/super-admin';

// ═══════════════════════════════════════════════════════════════
//  Admin Support Service (store-scoped)
// ═══════════════════════════════════════════════════════════════

export interface AdminTicketSummary {
  id: number;
  storeId: number | null;
  storeName: string | null;
  customerName: string | null;
  customerEmail: string;
  subject: string;
  status: string;
  source: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicketListResponse {
  content: AdminTicketSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

const adminSupportService = {
  listTickets: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<AdminTicketListResponse> => {
    const { data } = await apiClient.get<AdminTicketListResponse>('/support/tickets', { params });
    return data;
  },

  getTicketDetail: async (ticketId: number): Promise<SupportTicketDetail> => {
    const { data } = await apiClient.get<SupportTicketDetail>(`/support/tickets/${ticketId}`);
    return data;
  },

  replyToTicket: async (ticketId: number, message: string): Promise<SupportTicketDetail> => {
    const { data } = await apiClient.post<SupportTicketDetail>(`/support/tickets/${ticketId}/reply`, { message });
    return data;
  },

  updateTicketStatus: async (ticketId: number, status: string): Promise<void> => {
    await apiClient.put(`/support/tickets/${ticketId}/status`, { status });
  },

  resendEmail: async (logId: number): Promise<void> => {
    await apiClient.post(`/support/emails/${logId}/resend`);
  },
};

export default adminSupportService;
