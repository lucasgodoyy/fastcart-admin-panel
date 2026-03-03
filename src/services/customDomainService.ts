import apiClient from '@/lib/api';

export interface CustomDomain {
  id: number;
  domain: string;
  verified: boolean;
  sslActive: boolean;
  status: string;
  verificationToken: string;
  cnameTarget: string;
  txtRecord: string;
  lastCheckedAt: string | null;
  createdAt: string;
}

const customDomainService = {
  listDomains: async (): Promise<CustomDomain[]> => {
    const { data } = await apiClient.get<CustomDomain[]>('/admin/domains');
    return data;
  },

  addDomain: async (domain: string): Promise<CustomDomain> => {
    const { data } = await apiClient.post<CustomDomain>('/admin/domains', { domain });
    return data;
  },

  verifyDomain: async (domainId: number): Promise<CustomDomain> => {
    const { data } = await apiClient.post<CustomDomain>(`/admin/domains/${domainId}/verify`);
    return data;
  },

  removeDomain: async (domainId: number): Promise<void> => {
    await apiClient.delete(`/admin/domains/${domainId}`);
  },
};

export default customDomainService;
