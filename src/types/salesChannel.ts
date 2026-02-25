export type OnlineStorePageItem = {
  title: string;
  slug: string;
  active: boolean;
};

export type OnlineStoreMenuItem = {
  label: string;
  url: string;
};

export type OnlineStoreFilterItem = {
  label: string;
  active: boolean;
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

export type SalesChannelSettings = {
  storeId: number;
  templateId: string;
  pages: OnlineStorePageItem[];
  menus: OnlineStoreMenuItem[];
  filters: OnlineStoreFilterItem[];
  socialLinks: SocialLinks;
  channelLinks: ChannelLinks;
  updatedAt?: string;
};

export type UpdateSalesChannelSettingsRequest = Partial<{
  templateId: string;
  pages: OnlineStorePageItem[];
  menus: OnlineStoreMenuItem[];
  filters: OnlineStoreFilterItem[];
  socialLinks: SocialLinks;
  channelLinks: ChannelLinks;
}>;
