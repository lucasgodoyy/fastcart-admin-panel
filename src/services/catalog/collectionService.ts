import apiClient from '@/lib/api';
import { Collection, CollectionRequest } from '@/types/collection';

const collectionService = {
  async list(onlyActive = false): Promise<Collection[]> {
    const { data } = await apiClient.get<Collection[]>('/collections', {
      params: { onlyActive },
    });
    return data;
  },

  async getById(id: number): Promise<Collection> {
    const { data } = await apiClient.get<Collection>(`/collections/${id}`);
    return data;
  },

  async create(request: CollectionRequest): Promise<Collection> {
    const { data } = await apiClient.post<Collection>('/collections', request);
    return data;
  },

  async update(id: number, request: CollectionRequest): Promise<Collection> {
    const { data } = await apiClient.put<Collection>(`/collections/${id}`, request);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/collections/${id}`);
  },

  async addProducts(id: number, productIds: number[]): Promise<Collection> {
    const { data } = await apiClient.post<Collection>(`/collections/${id}/products`, productIds);
    return data;
  },

  async removeProducts(id: number, productIds: number[]): Promise<Collection> {
    const { data } = await apiClient.delete<Collection>(`/collections/${id}/products`, {
      data: productIds,
    });
    return data;
  },
};

export default collectionService;
