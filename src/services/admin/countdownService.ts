import apiClient from '@/lib/api';
import { CountdownTimer } from '@/types/countdown';

const countdownService = {
  async list(): Promise<CountdownTimer[]> {
    const { data } = await apiClient.get<CountdownTimer[]>('/admin/countdown-timers');
    return data;
  },

  async getById(id: number): Promise<CountdownTimer> {
    const { data } = await apiClient.get<CountdownTimer>(`/admin/countdown-timers/${id}`);
    return data;
  },

  async create(timer: Partial<CountdownTimer>): Promise<CountdownTimer> {
    const { data } = await apiClient.post<CountdownTimer>('/admin/countdown-timers', timer);
    return data;
  },

  async update(id: number, timer: Partial<CountdownTimer>): Promise<CountdownTimer> {
    const { data } = await apiClient.put<CountdownTimer>(`/admin/countdown-timers/${id}`, timer);
    return data;
  },

  async toggle(id: number, active: boolean): Promise<CountdownTimer> {
    const { data } = await apiClient.patch<CountdownTimer>(`/admin/countdown-timers/${id}/toggle`, null, {
      params: { active },
    });
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/countdown-timers/${id}`);
  },
};

export default countdownService;
