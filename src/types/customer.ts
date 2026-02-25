export type Customer = {
  id: number;
  userId: number;
  storeId: number;
  firstName: string;
  lastName: string;
  phone: string;
  document?: string | null;
  createdAt?: string;
};

export type CreateCustomerRequest = {
  storeId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string;
};

export type UpdateCustomerRequest = CreateCustomerRequest;
