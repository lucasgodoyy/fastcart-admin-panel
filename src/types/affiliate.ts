// ═══════════════════════════════════════════════════════════════
//  Affiliate System Types
// ═══════════════════════════════════════════════════════════════

export interface AffiliateItem {
  id: number;
  storeId: number;
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

export interface AffiliateSettings {
  id: number | null;
  storeId: number;
  enabled: boolean;
  commissionRate: number;
  cookieDays: number;
  minPayout: number;
  payoutDay: number;
  autoApprove: boolean;
  termsUrl: string | null;
  updatedAt: string | null;
}

export interface AffiliateLink {
  id: number;
  affiliateId: number;
  affiliateName: string;
  storeId: number;
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

export interface AffiliateConversion {
  id: number;
  affiliateId: number;
  affiliateName: string;
  storeId: number;
  storeName: string | null;
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
  storeName: string | null;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  status: string;
  paidAt: string | null;
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

// ── Request Types ──────────────────────────────────────────

export interface CreateAffiliateRequest {
  name: string;
  email: string;
  phone?: string;
  document?: string;
  referralCode?: string;
  commissionRate?: number;
  pixKey?: string;
  bankInfo?: string;
  notes?: string;
}

export interface UpdateAffiliateRequest {
  name?: string;
  phone?: string;
  document?: string;
  commissionRate?: number;
  status?: string;
  pixKey?: string;
  bankInfo?: string;
  notes?: string;
}

export interface UpdateAffiliateSettingsRequest {
  enabled?: boolean;
  commissionRate?: number;
  cookieDays?: number;
  minPayout?: number;
  payoutDay?: number;
  autoApprove?: boolean;
  termsUrl?: string;
}

export interface CreateAffiliateLinkRequest {
  affiliateId: number;
  slug: string;
  destinationUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface CreateAffiliatePayoutRequest {
  affiliateId: number;
  amount: number;
  method?: string;
  reference?: string;
  notes?: string;
}
