// ── Pagination ──────────────────────────────────────────────────
export interface PaginatedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ── Platform Overview ──────────────────────────────────────────
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

// ── Platform Settings ──────────────────────────────────────────
export interface PlatformGeneralSettings {
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
}

// ── Store Management ───────────────────────────────────────────
export interface StoreSummary {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  active: boolean;
  status: string;
  planName: string | null;
  customDomain: string | null;
  productsCount: number;
  ordersCount: number;
  paidRevenue: number;
  createdAt: string;
  updatedAt: string | null;
}

// ── User Management ────────────────────────────────────────────
export interface UserSummary {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  storeName: string | null;
  storeId: number | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserSession {
  id: number;
  userId: number;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  active: boolean;
  createdAt: string;
  lastAccessedAt: string;
}

export interface ResetUserPasswordRequest {
  newPassword: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

// ── Support Tickets ────────────────────────────────────────────
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

// ── Email Logs & Templates ─────────────────────────────────────
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

export interface EmailTemplateSummary {
  id: number;
  storeId: number | null;
  storeName: string | null;
  templateKey: string;
  subject: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Activity Logs ──────────────────────────────────────────────
export interface ActivityLog {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userRole: string | null;
  actionType: string;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

// ── Subscription Plans ─────────────────────────────────────────
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  monthlyPrice: number;
  annualPrice: number | null;
  maxProducts: number;
  maxStores: number;
  maxStaff: number;
  featuresJson: string;
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateOrUpdatePlanRequest {
  name: string;
  slug: string;
  monthlyPrice: number;
  annualPrice?: number | null;
  maxProducts: number;
  maxStores: number;
  maxStaff: number;
  featuresJson: string;
  stripePriceIdMonthly?: string | null;
  stripePriceIdAnnual?: string | null;
  active?: boolean;
}

export interface StoreSubscription {
  id: number;
  storeId: number;
  storeName: string;
  storeEmail: string;
  planId: number;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyPrice: number;
  createdAt: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  mrr: number;
  churnRate: number;
  avgLifetimeValue: number;
}

// ── Affiliates ─────────────────────────────────────────────────
export interface Affiliate {
  id: number;
  name: string;
  email: string;
  code: string;
  status: string;
  storeId: number | null;
  storeName: string | null;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  tier: string;
  createdAt: string;
}

export interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalRevenue: number;
  totalCommissions: number;
  avgConversionRate: number;
}

export interface AffiliateConversion {
  id: number;
  affiliateId: number;
  affiliateName: string;
  storeId: number;
  storeName: string;
  saleAmount: number;
  commissionAmount: number;
  status: string;
  createdAt: string;
}

export interface AffiliatePayout {
  id: number;
  affiliateId: number;
  affiliateName: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

// ── Marketing ──────────────────────────────────────────────────
export interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBanners: number;
  activeBanners: number;
}

export interface MarketingCampaign {
  id: number;
  name: string;
  status: string;
  type: string;
  storeId: number | null;
  storeName: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface CampaignUpsertRequest {
  name: string;
  type: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface MarketingBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  active: boolean;
  createdAt: string;
}

export interface BannerUpsertRequest {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  active?: boolean;
}

export interface PushTemplate {
  id: number;
  title: string;
  body: string;
  active: boolean;
  createdAt: string;
}

export interface PushTemplateUpsertRequest {
  title: string;
  body: string;
  active?: boolean;
}

// ── Notifications ──────────────────────────────────────────────
export interface SANotification {
  id: number;
  type: string;
  title: string;
  message: string;
  storeId: number | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
}

export interface CreateNotificationRequest {
  type: string;
  title: string;
  message: string;
  storeId?: number | null;
}
