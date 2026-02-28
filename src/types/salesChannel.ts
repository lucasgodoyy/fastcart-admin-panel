export type OnlineStorePageItem = {
  title: string;
  slug: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  addToMenu?: boolean;
  active: boolean;
};

export type OnlineStoreMenuItem = {
  label: string;
  url: string;
  active: boolean;
};

export type OnlineStoreFilterItem = {
  label: string;
  active: boolean;
};

export type AppearanceSettings = {
  fontFamily: string;
  primaryColor: string;
  heroBannerUrl?: string | null;
  heroBannerText?: string | null;
};

export type SocialLinks = {
  instagram?: string | null;
  instagramToken?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  pinterest?: string | null;
  pinterestTag?: string | null;
  blog?: string | null;
};

export type ChannelLinks = {
  onlineStore?: string | null;
  pointOfSale?: string | null;
  instagramFacebook?: string | null;
  googleShopping?: string | null;
  tiktok?: string | null;
  pinterest?: string | null;
  marketplaces?: string | null;
};

export type ProductAttributeSetting = {
  key: string;
  label: string;
  enabled: boolean;
  required: boolean;
};

export type CustomProductAttribute = {
  key: string;
  label: string;
  inputType: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
};

export type SalesChannelSettings = {
  storeId: number;
  templateId: string;
  storeNiche: string;
  layoutPreset: string;
  pages: OnlineStorePageItem[];
  menus: OnlineStoreMenuItem[];
  filters: OnlineStoreFilterItem[];
  appearanceSettings: AppearanceSettings;
  socialLinks: SocialLinks;
  channelLinks: ChannelLinks;
  productAttributes: ProductAttributeSetting[];
  customProductAttributes: CustomProductAttribute[];
  updatedAt?: string;
};

export type UpdateSalesChannelSettingsRequest = Partial<{
  templateId: string;
  storeNiche: string;
  layoutPreset: string;
  pages: OnlineStorePageItem[];
  menus: OnlineStoreMenuItem[];
  filters: OnlineStoreFilterItem[];
  appearanceSettings: AppearanceSettings;
  socialLinks: SocialLinks;
  channelLinks: ChannelLinks;
  productAttributes: ProductAttributeSetting[];
  customProductAttributes: CustomProductAttribute[];
}>;
