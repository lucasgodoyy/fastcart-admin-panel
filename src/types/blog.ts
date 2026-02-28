export type BlogPost = {
  id: number;
  storeId: number;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  featuredImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostUpsertRequest = {
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
};
