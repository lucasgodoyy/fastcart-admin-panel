export interface PlatformOverview {
  totalStores: number;
  activeStores: number;
  totalUsers: number;
  activeUsers: number;
  totalSupportTickets: number;
  openSupportTickets: number;
  totalEmailLogs: number;
  failedEmailLogs: number;
}

export interface SupportTicketSummary {
  id: number;
  storeId: number | null;
  storeName: string | null;
  customerName: string | null;
  customerEmail: string;
  subject: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundEmailLogSummary {
  id: number;
  storeId: number | null;
  storeName: string | null;
  recipientEmail: string;
  subject: string;
  templateKey: string;
  deliveryStatus: string;
  createdAt: string;
  sentAt: string | null;
}

export interface PaginatedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
