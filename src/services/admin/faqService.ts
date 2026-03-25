import apiClient from '@/lib/api';
import { FaqCategory, FaqItem } from '@/types/faq';

const faqService = {
  async listCategories(): Promise<FaqCategory[]> {
    const { data } = await apiClient.get<FaqCategory[]>('/admin/faq/categories');
    return data;
  },

  async createCategory(name: string, sortOrder?: number): Promise<FaqCategory> {
    const { data } = await apiClient.post<FaqCategory>('/admin/faq/categories', { name, sortOrder });
    return data;
  },

  async updateCategory(id: number, name: string, sortOrder?: number, active?: boolean): Promise<FaqCategory> {
    const { data } = await apiClient.put<FaqCategory>(`/admin/faq/categories/${id}`, { name, sortOrder, active });
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/admin/faq/categories/${id}`);
  },

  async createItem(categoryId: number, question: string, answer: string, sortOrder?: number): Promise<FaqItem> {
    const { data } = await apiClient.post<FaqItem>(`/admin/faq/categories/${categoryId}/items`, { question, answer, sortOrder });
    return data;
  },

  async updateItem(itemId: number, question: string, answer: string, sortOrder?: number, active?: boolean): Promise<FaqItem> {
    const { data } = await apiClient.put<FaqItem>(`/admin/faq/items/${itemId}`, { question, answer, sortOrder, active });
    return data;
  },

  async deleteItem(itemId: number): Promise<void> {
    await apiClient.delete(`/admin/faq/items/${itemId}`);
  },
};

export default faqService;
