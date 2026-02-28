import apiClient from '@/lib/api';
import { BlogPost, BlogPostUpsertRequest } from '@/types/blog';

const blogService = {
  async list(): Promise<BlogPost[]> {
    const { data } = await apiClient.get<BlogPost[]>('/admin/blog/posts');
    return data;
  },

  async create(payload: BlogPostUpsertRequest): Promise<BlogPost> {
    const { data } = await apiClient.post<BlogPost>('/admin/blog/posts', payload);
    return data;
  },

  async update(postId: number, payload: BlogPostUpsertRequest): Promise<BlogPost> {
    const { data } = await apiClient.put<BlogPost>(`/admin/blog/posts/${postId}`, payload);
    return data;
  },

  async remove(postId: number): Promise<void> {
    await apiClient.delete(`/admin/blog/posts/${postId}`);
  },
};

export default blogService;
