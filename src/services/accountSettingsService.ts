import apiClient from '@/lib/api';

export type AccountInfo = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  profilePictureUrl: string | null;
  role: string;
  twoFactorEnabled: boolean;
};

export type UpdateAccountRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  displayName?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SessionInfo = {
  id: number;
  ipAddress: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  isCurrent: boolean;
  createdAt: string;
  lastSeenAt: string | null;
};

const accountSettingsService = {
  getMyAccount: async (): Promise<AccountInfo> => {
    const response = await apiClient.get('/admin/account/me');
    return response.data;
  },

  updateMyAccount: async (data: UpdateAccountRequest): Promise<AccountInfo> => {
    const response = await apiClient.put('/admin/account/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/admin/account/me/change-password', data);
  },

  getActiveSessions: async (): Promise<SessionInfo[]> => {
    const response = await apiClient.get('/admin/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/admin/sessions/${sessionId}`);
  },

  revokeAllOtherSessions: async (): Promise<void> => {
    await apiClient.delete('/admin/sessions/revoke-others');
  },
};

export default accountSettingsService;
