import apiClient from '@/lib/api';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';

const categoryService = {
  async list(onlyActive = false): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories', {
      params: { onlyActive },
    });
    return data;
  },

  async create(request: CreateCategoryRequest): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', request);
    return data;
  },

  async update(id: number, request: UpdateCategoryRequest): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, request);
    return data;
  },

  async toggleActive(id: number, active: boolean): Promise<void> {
    await apiClient.patch(`/categories/${id}/toggle-active`, null, {
      params: { active },
    });
  },

  async softDelete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};

export default categoryService;
