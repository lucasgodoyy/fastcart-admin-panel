export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  parentName?: string | null;
  active: boolean;
  description?: string | null;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  googleShoppingCategory?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCategoryRequest = {
  name: string;
  parentId?: number | null;
};

export type UpdateCategoryRequest = {
  name: string;
  parentId?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  googleShoppingCategory?: string | null;
  active?: boolean;
};
