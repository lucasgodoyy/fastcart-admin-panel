import apiClient from "@/lib/api";

export interface AiGenerateRequest {
  productName: string;
  category?: string;
  keywords?: string;
  language?: "pt" | "en";
  tone?: "professional" | "casual" | "fun";
  extraContext?: string;
}

export interface AiGenerateResponse {
  content: string;
  tokensUsed: number;
  usedThisMonth: number;
  monthlyLimit: number;
}

export interface AiSeoResponse {
  seoTitle: string;
  metaDescription: string;
  tokensUsed: number;
  usedThisMonth: number;
  monthlyLimit: number;
}

export interface AiUsageResponse {
  usedThisMonth: number;
  monthlyLimit: number;
  remaining: number;
}

const aiService = {
  generateDescription: (data: AiGenerateRequest) =>
    apiClient.post<AiGenerateResponse>("/admin/ai/generate-description", data).then((r) => r.data),

  generateSeo: (data: AiGenerateRequest) =>
    apiClient.post<AiSeoResponse>("/admin/ai/generate-seo", data).then((r) => r.data),

  generateBlogPost: (data: AiGenerateRequest) =>
    apiClient.post<AiGenerateResponse>("/admin/ai/generate-blog-post", data).then((r) => r.data),

  getUsage: () =>
    apiClient.get<AiUsageResponse>("/admin/ai/usage").then((r) => r.data),
};

export default aiService;
