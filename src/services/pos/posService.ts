import apiClient from '@/lib/api';
import type {
  OpenCashRegisterRequest,
  CloseCashRegisterRequest,
  CashMovementRequest,
  CashRegisterResponse,
  CashMovementResponse,
  CashRegisterSummaryResponse,
  PosSaleRequest,
  PosSaleResponse,
  PosProductResponse,
} from '@/types/pos';

const posService = {
  // ─── Cash Register ─────────────────────────────────────────────

  openRegister: async (data: OpenCashRegisterRequest): Promise<CashRegisterResponse> => {
    const res = await apiClient.post('/pos/cash-register/open', data);
    return res.data;
  },

  closeRegister: async (data: CloseCashRegisterRequest): Promise<CashRegisterResponse> => {
    const res = await apiClient.post('/pos/cash-register/close', data);
    return res.data;
  },

  getCurrentRegister: async (): Promise<CashRegisterResponse> => {
    const res = await apiClient.get('/pos/cash-register/current');
    return res.data;
  },

  getRegisterSummary: async (): Promise<CashRegisterSummaryResponse> => {
    const res = await apiClient.get('/pos/cash-register/summary');
    return res.data;
  },

  addCashMovement: async (data: CashMovementRequest): Promise<CashMovementResponse> => {
    const res = await apiClient.post('/pos/cash-register/movement', data);
    return res.data;
  },

  getRegisterHistory: async (): Promise<CashRegisterResponse[]> => {
    const res = await apiClient.get('/pos/cash-register/history');
    return res.data;
  },

  // ─── Sales ─────────────────────────────────────────────────────

  createSale: async (data: PosSaleRequest): Promise<PosSaleResponse> => {
    const res = await apiClient.post('/pos/sale', data);
    return res.data;
  },

  getSalesHistory: async (startDate?: string, endDate?: string): Promise<PosSaleResponse[]> => {
    const res = await apiClient.get('/pos/sales', {
      params: { startDate, endDate },
    });
    return res.data;
  },

  getSaleById: async (id: number): Promise<PosSaleResponse> => {
    const res = await apiClient.get(`/pos/sales/${id}`);
    return res.data;
  },

  reverseSale: async (id: number): Promise<PosSaleResponse> => {
    const res = await apiClient.post(`/pos/sales/${id}/reverse`);
    return res.data;
  },

  // ─── Products ──────────────────────────────────────────────────

  searchProducts: async (query?: string, categoryId?: number): Promise<PosProductResponse[]> => {
    const res = await apiClient.get('/pos/products', {
      params: { query, categoryId },
    });
    return res.data;
  },
};

export default posService;
