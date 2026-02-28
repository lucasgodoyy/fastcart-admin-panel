import apiClient from '@/lib/api';
import type { PaginatedResult, SupportTicketSummary } from '@/types/super-admin';

// ═══════════════════════════════════════════════════════════════
//  Super-Admin Support Ticket Service
// ═══════════════════════════════════════════════════════════════

const supportTicketService = {
  list: async (params?: {
    status?: string;
    storeId?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResult<SupportTicketSummary>> => {
    const response = await apiClient.get<PaginatedResult<SupportTicketSummary>>(
      '/super-admin/support/tickets',
      { params }
    );
    return response.data;
  },
};

export default supportTicketService;
