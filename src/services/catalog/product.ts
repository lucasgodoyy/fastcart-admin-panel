import apiClient from '@/lib/api';
import { CreateProductRequest, Product, ProductListFilters } from '@/types/product';

const productService = {
  listAll: async (filters?: ProductListFilters): Promise<Product[]> => {
    const response = await apiClient.get('/products', {
      params: {
        search: filters?.search?.trim() || undefined,
        categoryId: filters?.categoryId,
        brandId: filters?.brandId,
        stockStatus: filters?.stockStatus,
        priceType: filters?.priceType,
        visibility: filters?.visibility,
        shippingPromotion: filters?.shippingPromotion,
        weightDimensions: filters?.weightDimensions,
      },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  create: async (request: CreateProductRequest, images?: File[]): Promise<Product> => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    images?.forEach((image) => formData.append('images', image));

    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  update: async (id: number, request: CreateProductRequest): Promise<Product> => {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  updateInventory: async (id: number, payload: { infiniteStock: boolean; stock: number; reason?: string }): Promise<void> => {
    await apiClient.patch(`/products/${id}/inventory`, payload);
  },

  toggleActive: async (id: number, active: boolean): Promise<void> => {
    await apiClient.patch(`/products/${id}/toggle-active`, null, {
      params: { active },
    });
  },
};

export default productService;
