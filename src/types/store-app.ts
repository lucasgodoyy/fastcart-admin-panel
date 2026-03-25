export interface StoreApp {
  id: number;
  storeId: number;
  appKey: string;
  enabled: boolean;
  settings: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}
