import apiClient from '@/lib/api';
import { CreateCustomerRequest, Customer, UpdateCustomerRequest } from '@/types/customer';

const customerService = {
  listByStore: async (storeId: number): Promise<Customer[]> => {
    const response = await apiClient.get(`/customers/store/${storeId}`);
    return response.data;
  },

  getById: async (storeId: number, customerId: number): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${storeId}/${customerId}`);
    return response.data;
  },

  create: async (request: CreateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.post('/customers', request);
    return response.data;
  },

  update: async (storeId: number, customerId: number, request: UpdateCustomerRequest): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${storeId}/${customerId}`, request);
    return response.data;
  },
};

export default customerService;
