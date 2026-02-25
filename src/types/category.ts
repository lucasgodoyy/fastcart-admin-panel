export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  parentName?: string | null;
  active: boolean;
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
};
