export interface FaqCategory {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqItem {
  id: number;
  storeId: number;
  categoryId: number | null;
  categoryName: string | null;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
  helpfulYes: number;
  helpfulNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqCategoryPayload {
  name: string;
  slug: string;
  sortOrder?: number;
  active?: boolean;
}

export interface FaqItemPayload {
  categoryId?: number | null;
  question: string;
  answer: string;
  sortOrder?: number;
  active?: boolean;
}
