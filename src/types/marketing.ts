// ── Marketing Campaign ──────────────────────────────────────

export interface MarketingCampaign {
  id: number;
  storeId: number | null;
  storeName: string | null;
  name: string;
  description: string | null;
  type: string;
  discountValue: string | null;
  channel: string;
  status: string;
  budgetCents: number | null;
  spentCents: number;
  targetAudience: string | null;
  views: number;
  clicks: number;
  conversions: number;
  revenueCents: number;
  startsAt: string | null;
  endsAt: string | null;
  createdBy: number | null;
  isPlatform: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUpsertRequest {
  name: string;
  description?: string;
  type: string;
  discountValue?: string;
  channel?: string;
  status?: string;
  budgetCents?: number;
  targetAudience?: string;
  startsAt?: string;
  endsAt?: string;
  isPlatform?: boolean;
}

// ── Marketing Banner ────────────────────────────────────────

export interface MarketingBanner {
  id: number;
  storeId: number | null;
  storeName: string | null;
  campaignId: number | null;
  campaignName: string | null;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  position: string;
  dimensions: string | null;
  sortOrder: number;
  active: boolean;
  clicks: number;
  impressions: number;
  startsAt: string | null;
  endsAt: string | null;
  isPlatform: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerUpsertRequest {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: string;
  dimensions?: string;
  sortOrder?: number;
  active?: boolean;
  campaignId?: number;
  startsAt?: string;
  endsAt?: string;
  isPlatform?: boolean;
}

// ── Ads Account ─────────────────────────────────────────────

export type AdsPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE' | 'TIKTOK' | 'PINTEREST';

export interface AdsAccount {
  id: number;
  storeId: number;
  storeName: string;
  platform: AdsPlatform;
  accountId: string | null;
  accountName: string | null;
  pixelId: string | null;
  catalogId: string | null;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdsAccountUpsertRequest {
  platform: string;
  accountId?: string;
  accountName?: string;
  accessToken?: string;
  refreshToken?: string;
  pixelId?: string;
  catalogId?: string;
  status?: string;
}

// ── Ads Campaign ────────────────────────────────────────────

export interface AdsCampaign {
  id: number;
  adsAccountId: number;
  platform: string;
  storeId: number;
  storeName: string;
  externalId: string | null;
  name: string;
  objective: string | null;
  status: string;
  dailyBudgetCents: number | null;
  lifetimeBudgetCents: number | null;
  spentCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpcCents: number;
  cpmCents: number;
  roas: number | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Push Template ───────────────────────────────────────────

export interface PushTemplate {
  id: number;
  storeId: number | null;
  storeName: string | null;
  title: string;
  body: string;
  imageUrl: string | null;
  actionUrl: string | null;
  segment: string;
  scheduledAt: string | null;
  sentAt: string | null;
  status: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  isPlatform: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PushTemplateUpsertRequest {
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  segment?: string;
  scheduledAt?: string;
  status?: string;
  isPlatform?: boolean;
}

// ── Stats ───────────────────────────────────────────────────

export interface MarketingStats {
  activeCampaigns: number;
  totalCampaigns: number;
  activeBanners: number;
  totalConversions: number;
  totalRevenueCents: number;
  activePushTemplates: number;
  connectedAdsAccounts: number;
}

// ── Paginated Result (reuse from super-admin if needed) ─────

export interface MarketingPaginatedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
