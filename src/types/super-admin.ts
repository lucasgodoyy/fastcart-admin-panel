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
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  storeName: string | null;
  storeId: number | null;
  lastLoginAt: string | null;
  createdAt: string;
  emailVerified?: boolean;
}

export interface UserSession {
  id: number;
  userId: number;
  userEmail: string;
  userRole: string | null;
  ipAddress: string;
  userAgent: string;
  active: boolean;
  revoked: boolean;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
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

export interface SupportTicketDetail {
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
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: number;
  senderType: string;
  senderName: string | null;
  senderEmail: string;
  messageBody: string;
  createdAt: string;
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
  description: string | null;
  priceCents: number;
  annualPriceCents: number | null;
  currency: string;
  billingPeriod: string;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
  maxStores: number;
  maxProducts: number | null;
  maxStaff: number;
  trialPeriodDays: number;
  features: string[];
  stripeProductId: string | null;
  stripePriceId: string | null;
  annualStripePriceId: string | null;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdatePlanRequest {
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  annualPriceCents?: number | null;
  billingPeriod?: string;
  sortOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
  maxStores?: number;
  maxProducts?: number | null;
  maxStaff?: number;
  trialPeriodDays?: number;
  features?: string[];
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  annualStripePriceId?: string | null;
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
  blockedAt: string | null;
  blockReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  activeSubscriptions: number;
  trialSubscriptions: number;
  canceledSubscriptions: number;
  totalSubscriptions: number;
  mrrCents: number;
  churnRate: number;
}

// ── Affiliates ─────────────────────────────────────────────────
export interface Affiliate {
  id: number;
  storeId: number | null;
  storeName: string | null;
  userId: number | null;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  referralCode: string;
  commissionRate: number;
  status: string;
  pixKey: string | null;
  bankInfo: string | null;
  notes: string | null;
  totalClicks: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  approvedAt: string | null;
  createdAt: string;
}

export interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
}

export interface AffiliateConversion {
  id: number;
  affiliateId: number;
  affiliateName: string;
  storeId: number;
  storeName: string;
  orderId: number | null;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface AffiliatePayout {
  id: number;
  affiliateId: number;
  affiliateName: string;
  storeId: number;
  storeName: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface AffiliateLink {
  id: number;
  affiliateId: number | null;
  affiliateName: string | null;
  storeId: number | null;
  slug: string;
  destinationUrl: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  totalClicks: number;
  totalConversions: number;
  active: boolean;
  createdAt: string;
}

export interface AffiliateSettings {
  id: number | null;
  storeId: number | null;
  enabled: boolean;
  commissionRate: number;
  cookieDays: number;
  minPayout: number;
  payoutDay: number;
  autoApprove: boolean;
  termsUrl: string | null;
  updatedAt: string | null;
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

// ── Email Campaigns ────────────────────────────────────────────
export interface EmailCampaign {
  id: number;
  storeId: number | null;
  storeName: string | null;
  name: string;
  subject: string;
  bodyHtml: string;
  status: string;
  targetAudience: string | null;
  segmentFilter: string | null;
  sendAt: string | null;
  frequency: string | null;
  nextSendAt: string | null;
  lastSentAt: string | null;
  recurrenceEnd: string | null;
  timezone: string | null;
  fromName: string | null;
  fromEmail: string | null;
  replyToEmail: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  failedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  isPlatform: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmailCampaignStats {
  totalCampaigns: number;
  draftCampaigns: number;
  scheduledCampaigns: number;
  activeCampaigns: number;
  sentCampaigns: number;
  totalRecipients: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export interface EmailCampaignUpsertRequest {
  name: string;
  subject: string;
  bodyHtml: string;
  status?: string;
  targetAudience?: string;
  segmentFilter?: string;
  sendAt?: string | null;
  frequency?: string | null;
  recurrenceEnd?: string | null;
  timezone?: string;
  fromName?: string;
  fromEmail?: string;
  replyToEmail?: string;
  isPlatform?: boolean;
  recipients?: Array<{ email: string; name?: string }>;
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

// ── Error Logs ─────────────────────────────────────────────────
export interface PlatformErrorLog {
  id: number;
  severity: string;
  errorType: string;
  message: string;
  stackTrace: string | null;
  requestMethod: string | null;
  requestPath: string | null;
  requestQuery: string | null;
  userId: number | null;
  storeId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  resolved: boolean;
  resolvedBy: number | null;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ErrorLogStats {
  totalErrors: number;
  unresolvedErrors: number;
  errorsLast24h: number;
  criticalUnresolved: number;
  errorCount: number;
  warnCount: number;
}

// ── Landing Config ─────────────────────────────────────────
export interface LandingConfig {
  id: number;
  announcementActive: boolean;
  announcementText: string | null;
  announcementLink: string | null;
  announcementBgColor: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroTypewriterPhrases: string | null;
  heroCtaText: string | null;
  heroCtaLink: string | null;
  heroVideoUrl: string | null;
  statsStoresCount: number | null;
  statsProductsCount: number | null;
  statsUptime: string | null;
  testimonials: string | null;
  showcaseStores: string | null;
  footerInstagram: string | null;
  footerYoutube: string | null;
  footerLinkedin: string | null;
  footerTiktok: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOgImage: string | null;
}

export type LandingConfigUpdateRequest = Partial<Omit<LandingConfig, 'id'>>;
