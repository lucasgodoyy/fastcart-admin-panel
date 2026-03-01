import apiClient from '@/lib/api';

export interface ActivityLog {
  id: number;
  actionType: string;
  description: string;
  userName: string;
  userRole: string;
  performedAt: string;
}

export interface ActivityLogPage {
  content: ActivityLog[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const activityService = {
  async list(params?: { actionType?: string; search?: string; page?: number; size?: number }): Promise<ActivityLogPage> {
    const { data } = await apiClient.get('/admin/activity', { params });
    return data;
  },
};

export default activityService;
