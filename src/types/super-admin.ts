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

export interface PlatformGeneralSettings {
  applicationName: string;
  storeFrontendUrl: string;
  adminFrontendUrl: string;
  flywayEnabled: boolean;
  swaggerEnabled: boolean;
  swaggerPath: string;
  defaultEmailFrom: string;
}

export interface StoreSummary {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  active: boolean;
  status: string;
  productsCount: number;
  ordersCount: number;
  paidRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: number;
  name: string | null;
  email: string;
  role: string | null;
  active: boolean;
  status: string;
  storeId: number | null;
  storeName: string | null;
  lastLogin: string | null;
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

export interface UserSessionSummary {
  id: number;
  userId: number;
  userEmail: string;
  userRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string | null;
  revoked: boolean;
  active: boolean;
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

export interface ActivityLogSummary {
  id: number;
  userId: number | null;
  userEmail: string | null;
  actionType: string;
  description: string;
  entityType: string | null;
  entityId: number | null;
  ipAddress: string | null;
  createdAt: string;
}

// ── Subscriptions ──────────────────────────────────────────

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  maxStores: number;
  maxProducts: number | null;
  features: string[];
  stripeProductId: string | null;
  stripePriceId: string | null;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdatePlanRequest {
  name: string;
  slug: string;
  description?: string;
  priceCents: number;
  billingPeriod?: string;
  sortOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
  maxStores?: number;
  maxProducts?: number | null;
  features?: string[];
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface StoreSubscription {
  id: number;
  storeId: number;
  storeName: string;
  storeSlug: string;
  planId: number;
  planName: string;
  planSlug: string;
  planPriceCents: number;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  activeSubscribers: number;
  trialingSubscribers: number;
  canceledSubscribers: number;
  totalSubscribers: number;
  mrrCents: number;
  churnRatePercent: number;
}

// ── Notifications ──────────────────────────────────────────

export interface NotificationItem {
  id: number;
  storeId: number | null;
  storeName: string | null;
  userId: number | null;
  userEmail: string | null;
  type: string;
  channel: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationType {
  code: string;
  label: string;
  description: string | null;
  category: string;
  defaultEmail: boolean;
  defaultInApp: boolean;
  defaultPush: boolean;
  sortOrder: number;
}

export interface NotificationPreference {
  id: number | null;
  notificationType: string;
  typeLabel: string;
  typeDescription: string | null;
  typeCategory: string;
  channelInApp: boolean;
  channelEmail: boolean;
  channelPush: boolean;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  todayNotifications: number;
  countByType: Record<string, number>;
}

export interface CreateNotificationRequest {
  storeId?: number;
  userId?: number;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}

export interface UpdatePreferenceRequest {
  notificationType: string;
  channelInApp: boolean;
  channelEmail: boolean;
  channelPush: boolean;
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
