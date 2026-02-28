import apiClient from '@/lib/api';
import {
  OutboundEmailLogSummary,
  PaginatedResult,
  PlatformOverview,
  SupportTicketSummary,
} from '@/types/super-admin';

const superAdminService = {
  getOverview: async (): Promise<PlatformOverview> => {
    const response = await apiClient.get<PlatformOverview>('/super-admin/overview');
    return response.data;
  },

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
};

export default superAdminService;
