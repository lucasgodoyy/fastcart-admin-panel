import apiClient from '@/lib/api';

export interface SetupStep {
  key: string;
  title: string;
  description: string;
  completed: boolean;
  actionUrl: string;
}

export interface StoreSetupProgress {
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  steps: SetupStep[];
}

const setupProgressService = {
  async getProgress(): Promise<StoreSetupProgress> {
    const { data } = await apiClient.get<StoreSetupProgress>('/admin/stores/me/setup-progress');
    return data;
  },
};

export default setupProgressService;
