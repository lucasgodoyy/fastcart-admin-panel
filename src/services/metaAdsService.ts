import apiClient from '@/lib/api';
import type {
  MetaAdsConnection,
  MetaOAuthAuthorizeUrl,
  UpdateMetaAssetsRequest,
  MetaCatalogSync,
  MetaCatalogProduct,
  MetaProductSet,
  CreateProductSetRequest,
  MetaCampaign,
  CreateMetaCampaignRequest,
  UpdateMetaCampaignRequest,
  MetaCampaignDraft,
  SaveDraftRequest,
  PlatformMetaConfig,
  PlatformMetaConfigRequest,
  PageResponse,
} from '@/types/meta-ads';

const metaAdsService = {
  // ── Connection / OAuth ────────────────────────────────

  async getAuthorizeUrl(): Promise<MetaOAuthAuthorizeUrl> {
    const { data } = await apiClient.get<MetaOAuthAuthorizeUrl>('/admin/meta-ads/authorize-url');
    return data;
  },

  async getConnectionStatus(): Promise<MetaAdsConnection> {
    const { data } = await apiClient.get<MetaAdsConnection>('/admin/meta-ads/connection');
    return data;
  },

  async updateAssets(request: UpdateMetaAssetsRequest): Promise<MetaAdsConnection> {
    const { data } = await apiClient.put<MetaAdsConnection>('/admin/meta-ads/assets', request);
    return data;
  },

  async disconnect(): Promise<void> {
    await apiClient.delete('/admin/meta-ads/disconnect');
  },

  // ── Domain Verification ───────────────────────────────

  async saveDomainVerificationTag(verificationTag: string): Promise<MetaAdsConnection> {
    const { data } = await apiClient.post<MetaAdsConnection>('/admin/meta-ads/domain/verification-tag', { verificationTag });
    return data;
  },

  async confirmDomainVerified(): Promise<MetaAdsConnection> {
    const { data } = await apiClient.post<MetaAdsConnection>('/admin/meta-ads/domain/confirm');
    return data;
  },

  // ── Catalog Sync ──────────────────────────────────────

  async getCatalogSyncStatus(): Promise<MetaCatalogSync> {
    const { data } = await apiClient.get<MetaCatalogSync>('/admin/meta-ads/catalog/sync');
    return data;
  },

  async syncCatalog(): Promise<MetaCatalogSync> {
    const { data } = await apiClient.post<MetaCatalogSync>('/admin/meta-ads/catalog/sync');
    return data;
  },

  async listCatalogProducts(status?: string, page = 0, size = 20): Promise<PageResponse<MetaCatalogProduct>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set('status', status);
    const { data } = await apiClient.get<PageResponse<MetaCatalogProduct>>(`/admin/meta-ads/catalog/products?${params}`);
    return data;
  },

  // ── Product Sets ──────────────────────────────────────

  async listProductSets(): Promise<MetaProductSet[]> {
    const { data } = await apiClient.get<MetaProductSet[]>('/admin/meta-ads/product-sets');
    return data;
  },

  async createProductSet(request: CreateProductSetRequest): Promise<MetaProductSet> {
    const { data } = await apiClient.post<MetaProductSet>('/admin/meta-ads/product-sets', request);
    return data;
  },

  async deleteProductSet(id: number): Promise<void> {
    await apiClient.delete(`/admin/meta-ads/product-sets/${id}`);
  },

  // ── Campaigns ─────────────────────────────────────────

  async listCampaigns(page = 0, size = 20): Promise<PageResponse<MetaCampaign>> {
    const { data } = await apiClient.get<PageResponse<MetaCampaign>>(`/admin/meta-ads/campaigns?page=${page}&size=${size}`);
    return data;
  },

  async getCampaign(id: number): Promise<MetaCampaign> {
    const { data } = await apiClient.get<MetaCampaign>(`/admin/meta-ads/campaigns/${id}`);
    return data;
  },

  async createCampaign(request: CreateMetaCampaignRequest): Promise<MetaCampaign> {
    const { data } = await apiClient.post<MetaCampaign>('/admin/meta-ads/campaigns', request);
    return data;
  },

  async updateCampaign(id: number, request: UpdateMetaCampaignRequest): Promise<MetaCampaign> {
    const { data } = await apiClient.put<MetaCampaign>(`/admin/meta-ads/campaigns/${id}`, request);
    return data;
  },

  async publishCampaign(id: number): Promise<MetaCampaign> {
    const { data } = await apiClient.post<MetaCampaign>(`/admin/meta-ads/campaigns/${id}/publish`);
    return data;
  },

  async deleteCampaign(id: number): Promise<void> {
    await apiClient.delete(`/admin/meta-ads/campaigns/${id}`);
  },

  // ── Drafts ────────────────────────────────────────────

  async listDrafts(): Promise<MetaCampaignDraft[]> {
    const { data } = await apiClient.get<MetaCampaignDraft[]>('/admin/meta-ads/drafts');
    return data;
  },

  async saveDraft(request: SaveDraftRequest, draftId?: number): Promise<MetaCampaignDraft> {
    const params = draftId ? `?draftId=${draftId}` : '';
    const { data } = await apiClient.post<MetaCampaignDraft>(`/admin/meta-ads/drafts${params}`, request);
    return data;
  },

  async deleteDraft(id: number): Promise<void> {
    await apiClient.delete(`/admin/meta-ads/drafts/${id}`);
  },

  // ── Platform Config (Super Admin) ─────────────────────

  async getPlatformConfig(): Promise<PlatformMetaConfig> {
    const { data } = await apiClient.get<PlatformMetaConfig>('/super-admin/meta-ads/config');
    return data;
  },

  async savePlatformConfig(request: PlatformMetaConfigRequest): Promise<PlatformMetaConfig> {
    const { data } = await apiClient.put<PlatformMetaConfig>('/super-admin/meta-ads/config', request);
    return data;
  },
};

export default metaAdsService;
