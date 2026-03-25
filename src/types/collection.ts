export type Collection = {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type: 'MANUAL' | 'AUTOMATIC';
  rulesJson?: string | null;
  sortOrder: number;
  active: boolean;
  productIds: number[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CollectionRequest = {
  name: string;
  description?: string;
  imageUrl?: string;
  type?: 'MANUAL' | 'AUTOMATIC';
  rulesJson?: string;
  sortOrder?: number;
  active?: boolean;
  productIds?: number[];
};
