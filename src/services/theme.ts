import apiClient from '@/lib/api';
import type { ThemeSectionsResponse, UpdateThemeSectionsRequest } from '@/types/theme';

const themeService = {
  async getThemeSections(): Promise<ThemeSectionsResponse> {
    const { data } = await apiClient.get<ThemeSectionsResponse>('/admin/stores/me/theme');
    return data;
  },

  async updateThemeSections(payload: UpdateThemeSectionsRequest): Promise<ThemeSectionsResponse> {
    const { data } = await apiClient.put<ThemeSectionsResponse>('/admin/stores/me/theme', payload);
    return data;
  },

  async saveDraft(themeDraftJson: string): Promise<ThemeSectionsResponse> {
    const { data } = await apiClient.put<ThemeSectionsResponse>('/admin/stores/me/theme/draft', {
      themeDraftJson,
    });
    return data;
  },
};

export default themeService;
