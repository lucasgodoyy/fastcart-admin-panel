import apiClient from '@/lib/api';

export type UrlRedirect = {
  id: number;
  oldPath: string;
  newPath: string;
  active: boolean;
  createdAt: string;
};

const redirectService = {
  list: async (): Promise<UrlRedirect[]> => {
    const res = await apiClient.get('/admin/redirects');
    return res.data;
  },

  create: async (data: { oldPath: string; newPath: string }): Promise<UrlRedirect> => {
    const res = await apiClient.post('/admin/redirects', data);
    return res.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/redirects/${id}`);
  },
};

export default redirectService;
