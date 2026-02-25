import apiClient from '@/lib/api';
import { Brand } from '@/types/brand';

const brandService = {
  list: async (): Promise<Brand[]> => {
    const response = await apiClient.get<Brand[]>('/brands');
    return response.data;
  },
};

export default brandService;
