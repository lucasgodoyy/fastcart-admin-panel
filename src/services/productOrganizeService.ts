import apiClient from '@/lib/api';

/* ── Types ── */

export type ProductOrgSettings = {
  defaultSort: 'BEST_SELLING' | 'LOWEST_PRICE' | 'HIGHEST_PRICE' | 'ALPHABETICAL' | 'NEWEST';
  outOfStockListBehavior: 'SHOW_AT_END' | 'MAINTAIN_ORDER' | 'HIDE';
  outOfStockSearchBehavior: 'SHOW_AT_END' | 'MAINTAIN_ORDER' | 'HIDE';
};

export type ProductHighlights = {
  featuredCount: number;
  newCount: number;
  saleCount: number;
  totalCount: number;
};

/* ── Service ── */

const productOrganizeService = {
  getSettings: async (): Promise<ProductOrgSettings> => {
    const res = await apiClient.get('/products/organization');
    return res.data;
  },

  saveSettings: async (settings: ProductOrgSettings): Promise<void> => {
    await apiClient.put('/products/organization', settings);
  },

  getHighlights: async (): Promise<ProductHighlights> => {
    const res = await apiClient.get('/products/organization/highlights');
    return res.data;
  },
};

export default productOrganizeService;
