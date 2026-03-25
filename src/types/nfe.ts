export type NfeProvider = 'NFEIO' | 'TINY' | 'BLING' | 'MANUAL';
export type NfeStatus = 'PENDING' | 'PROCESSING' | 'ISSUED' | 'CANCELLED' | 'ERROR';

export interface NfeConfig {
  id: number;
  storeId: number;
  provider: NfeProvider;
  hasApiKey: boolean;
  companyName: string | null;
  cnpj: string | null;
  stateRegistration: string | null;
  cityRegistration: string | null;
  autoIssue: boolean;
  defaultCfop: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NfeInvoice {
  id: number;
  storeId: number;
  orderId: number;
  status: NfeStatus;
  nfeNumber: string | null;
  nfeKey: string | null;
  nfeSeries: string | null;
  totalAmount: number;
  pdfUrl: string | null;
  xmlUrl: string | null;
  errorMessage: string | null;
  issuedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}
