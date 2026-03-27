import apiClient from '@/lib/api';
import { FaqCategory, FaqCategoryPayload, FaqItem, FaqItemPayload } from '@/types/faq';

const faqService = {
  async listCategories(): Promise<FaqCategory[]> {
    const { data } = await apiClient.get<FaqCategory[]>('/admin/faq/categories');
    return data;
  },

  async listItems(): Promise<FaqItem[]> {
    const { data } = await apiClient.get<FaqItem[]>('/admin/faq/items');
    return data;
  },

  async createCategory(payload: FaqCategoryPayload): Promise<FaqCategory> {
    const { data } = await apiClient.post<FaqCategory>('/admin/faq/categories', payload);
    return data;
  },

  async updateCategory(id: number, payload: FaqCategoryPayload): Promise<FaqCategory> {
    const { data } = await apiClient.put<FaqCategory>(`/admin/faq/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/admin/faq/categories/${id}`);
  },

  async createItem(payload: FaqItemPayload): Promise<FaqItem> {
    const { data } = await apiClient.post<FaqItem>('/admin/faq/items', payload);
    return data;
  },

  async updateItem(itemId: number, payload: FaqItemPayload): Promise<FaqItem> {
    const { data } = await apiClient.put<FaqItem>(`/admin/faq/items/${itemId}`, payload);
    return data;
  },

  async deleteItem(itemId: number): Promise<void> {
    await apiClient.delete(`/admin/faq/items/${itemId}`);
  },
};

export default faqService;
