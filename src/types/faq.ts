export interface FaqCategory {
  id: number;
  storeId: number;
  name: string;
  sortOrder: number;
  active: boolean;
  items: FaqItem[];
  createdAt: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
}
