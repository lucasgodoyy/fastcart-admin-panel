// ── Meta Ads Connection ─────────────────────────────────

export interface MetaAdsConnection {
  id: number | null;
  status: 'DISCONNECTED' | 'CONNECTED' | 'TOKEN_EXPIRED' | 'ERROR';
  metaUserId: string | null;
  businessId: string | null;
  businessName: string | null;
  pageId: string | null;
  pageName: string | null;
  catalogId: string | null;
  catalogName: string | null;
  adAccountId: string | null;
  adAccountName: string | null;
  pixelId: string | null;
  pixelName: string | null;
  instagramActorId: string | null;
  domainVerified: boolean;
  domainVerificationTag: string | null;
  scopesGranted: string | null;
  tokenExpiresAt: string | null;
  connectedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MetaOAuthAuthorizeUrl {
  authorizeUrl: string;
}

export interface UpdateMetaAssetsRequest {
  businessId?: string;
  businessName?: string;
  pageId?: string;
  pageName?: string;
  catalogId?: string;
  catalogName?: string;
  adAccountId?: string;
  adAccountName?: string;
  pixelId?: string;
  pixelName?: string;
  instagramActorId?: string;
}

// ── Catalog Sync ────────────────────────────────────────

export interface MetaCatalogSync {
  id: number | null;
  catalogId: string | null;
  totalProducts: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  syncStatus: 'NEVER' | 'SYNCING' | 'SYNCED' | 'ERROR';
  lastSyncedAt: string | null;
  syncError: string | null;
  updatedAt: string | null;
}

export interface MetaCatalogProduct {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  metaProductId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  lastSentAt: string | null;
}

// ── Product Sets ────────────────────────────────────────

export interface MetaProductSet {
  id: number;
  name: string;
  metaSetId: string | null;
  filterJson: string | null;
  productCount: number;
  createdAt: string | null;
}

export interface CreateProductSetRequest {
  name: string;
  filterJson?: string;
}

// ── Campaigns ───────────────────────────────────────────

export interface MetaCampaign {
  id: number;
  metaCampaignId: string | null;
  metaAdsetId: string | null;
  metaAdId: string | null;
  name: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'REJECTED';
  objective: string;
  audienceType: 'ADVANTAGE_PLUS' | 'MANUAL';
  ageMin: number;
  ageMax: number;
  gender: 'ALL' | 'MALE' | 'FEMALE';
  interestsJson: string | null;
  locationsJson: string | null;
  countryWide: boolean;
  creativeType: 'DYNAMIC_CATALOG' | 'SINGLE_IMAGE' | 'CAROUSEL' | 'VIDEO';
  headline: string | null;
  description: string | null;
  callToAction: string;
  mediaUrlsJson: string | null;
  productSetId: number | null;
  productSetName: string | null;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  costSpent: number;
  ctr: number;
  cpc: number;
  roas: number;
  rejectionReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateMetaCampaignRequest {
  name: string;
  objective?: string;
  audienceType?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  interestsJson?: string;
  locationsJson?: string;
  countryWide?: boolean;
  creativeType?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  mediaUrlsJson?: string;
  productSetId?: number;
  dailyBudget: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateMetaCampaignRequest {
  name?: string;
  status?: string;
  audienceType?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  interestsJson?: string;
  locationsJson?: string;
  countryWide?: boolean;
  creativeType?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  mediaUrlsJson?: string;
  productSetId?: number;
  dailyBudget?: number;
  startDate?: string;
  endDate?: string;
}

// ── Drafts ──────────────────────────────────────────────

export interface MetaCampaignDraft {
  id: number;
  name: string | null;
  wizardStep: number;
  draftJson: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SaveDraftRequest {
  name?: string;
  wizardStep?: number;
  draftJson?: string;
}

// ── Platform Config (Super Admin) ───────────────────────

export interface PlatformMetaConfig {
  id: number | null;
  metaAppId: string;
  hasSecret: boolean;
  metaAppSecret: string | null;
  defaultRedirectUri: string;
  webhookVerifyToken: string | null;
  requiredScopes: string;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PlatformMetaConfigRequest {
  metaAppId: string;
  metaAppSecret: string;
  defaultRedirectUri?: string;
  webhookVerifyToken?: string;
  requiredScopes?: string;
  enabled?: boolean;
}

// ── Page Response ───────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
