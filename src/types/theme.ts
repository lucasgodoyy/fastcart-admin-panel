/* ──────────────────────────────────────────────────────────
 *  Theme Sections — Types for the layout editor (Nuvemshop-style)
 * ────────────────────────────────────────────────────────── */

// ── Announcement Bar ──────────────────────────────────────
export interface AnnouncementBar {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
}

// ── Header Section ────────────────────────────────────────
export interface HeaderSection {
  enabled: boolean;
  // Colors
  useCustomColors: boolean;
  bgColor: string;
  textColor: string;
  // Logo
  logoPosition: 'left' | 'center';
  logoSize: 'small' | 'medium' | 'large';
  // Features
  showSearch: boolean;
  showCart: boolean;
  showLanguagesAndCurrencies: boolean;
  // Transparent
  transparentOnHero: boolean;
  transparentApplyOver: 'banners' | 'banners-video';
  useAlternativeColorsOnTransparent: boolean;
  alternativeTextColor: string;
  // Sticky
  stickyHeader: boolean;
  // Mobile
  mobileLogoPosition: 'left' | 'center';
  mobileLinksStyle: 'text' | 'icons';
  mobileSearchDisplay: 'icon' | 'open';
  // Announcement bar
  announcementBar: AnnouncementBar;
}

// ── Hero Slide ────────────────────────────────────────────
export interface HeroSlide {
  imageUrl: string;
  mobileImageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
}

export interface HeroSection {
  enabled: boolean;
  type: 'slideshow' | 'single' | 'video';
  slides: HeroSlide[];
  videoUrl: string;
  height: 'small' | 'medium' | 'large' | 'full';
  overlayOpacity: number;
  autoplay: boolean;
  autoplayInterval: number;
}

// ── Home Page Section (Drag & Drop) ───────────────────────
export type HomeSectionType =
  | 'hero'
  | 'featuredProducts'
  | 'promoBanners'
  | 'newProducts'
  | 'saleProducts'
  | 'categoryBanners'
  | 'newsBanners'
  | 'imageText'
  | 'brandBanners'
  | 'video'
  | 'newsletter'
  | 'mainProduct'
  | 'instagramPosts'
  | 'testimonials';

export interface HomeSectionItem {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  title: string;
  // Type-specific config stored as flat fields
  maxProducts?: number;
  columns?: number;
  // Banner items (promo, category, brand, news)
  banners?: { imageUrl: string; mobileImageUrl: string; linkUrl: string; altText: string }[];
  // Image + Text
  imageUrl?: string;
  text?: string;
  textPosition?: 'left' | 'right';
  // Video
  videoUrl?: string;
  // Newsletter
  newsletterTitle?: string;
  newsletterDescription?: string;
  // Main product
  productId?: number;
  // Instagram
  instagramUsername?: string;
  // Testimonials
  testimonials?: { name: string; text: string; rating: number; avatarUrl: string }[];
}

export const HOME_SECTION_LABELS: Record<HomeSectionType, string> = {
  hero: 'Banners rotativos',
  featuredProducts: 'Produtos em destaque',
  promoBanners: 'Banners promocionais',
  newProducts: 'Produtos novos',
  saleProducts: 'Produtos em promoção',
  categoryBanners: 'Banners de categorias',
  newsBanners: 'Banners de novidades',
  imageText: 'Módulo de imagem e texto',
  brandBanners: 'Banners das marcas',
  video: 'Vídeo',
  newsletter: 'Newsletter',
  mainProduct: 'Produto principal',
  instagramPosts: 'Postagens do Instagram',
  testimonials: 'Depoimentos',
};

// ── Featured Products ─────────────────────────────────────
export interface FeaturedProductsSection {
  enabled: boolean;
  title: string;
  maxProducts: number;
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showBadge: boolean;
}

// ── Product List ──────────────────────────────────────────
export interface ProductListSection {
  enabled: boolean;
  defaultView: 'grid' | 'list';
  columns: 2 | 3 | 4;
  mobileColumns: 1 | 2;
  showFilters: boolean;
  filtersPosition: 'left' | 'right';
  showSort: boolean;
  productsPerPage: number;
  navigation: 'pagination' | 'infinite-scroll';
  quickView: boolean;
  quickBuy: boolean;
  showIrregularGrid: boolean;
  hoverEffect: 'none' | 'zoom' | 'swap';
  categoryBannerUrl: string;
}

// ── Product Detail ────────────────────────────────────────
export interface ProductDetailSection {
  enabled: boolean;
  imagePosition: 'left' | 'right';
  zoomOnHover: boolean;
  showShippingCalculator: boolean;
  variantDisplay: 'dropdown' | 'buttons' | 'color-swatches';
  showRelated: boolean;
  showReviews: boolean;
  showShareButtons: boolean;
  stickyAddToCart: boolean;
  showSku: boolean;
}

// ── Cart ──────────────────────────────────────────────────
export interface CartSection {
  enabled: boolean;
  style: 'drawer' | 'page' | 'popup';
  showShippingEstimate: boolean;
  showCouponField: boolean;
  showCrossSell: boolean;
  showOrderNotes: boolean;
  showFreeShippingBar: boolean;
}

// ── Footer ────────────────────────────────────────────────
export interface FooterSection {
  enabled: boolean;
  useCustomColors: boolean;
  bgColor: string;
  textColor: string;
  columns: 2 | 3 | 4;
  showLogo: boolean;
  // Newsletter
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  // Social
  showSocialLinks: boolean;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
    pinterest: string;
    linkedin: string;
  };
  // Contact info
  showContactInfo: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  // Navigation links
  navigationLinks: { label: string; url: string }[];
  // Seals & payment
  showPaymentIcons: boolean;
  showSecuritySeals: boolean;
  showShippingIcons: boolean;
  copyrightText: string;
}

// ── Colors ─────────────────────────────────────────────────
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// ── Typography ────────────────────────────────────────────
export type FontFamily = 'inter' | 'georgia' | 'system' | 'poppins' | 'playfair';

export interface ThemeTypography {
  headingFont: FontFamily;
  bodyFont: FontFamily;
  baseFontSize: 'small' | 'medium' | 'large';
}

// ── Design Options ────────────────────────────────────────
export interface ThemeDesign {
  logoUrl: string;
  faviconUrl: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  buttonStyle: 'filled' | 'outline' | 'pill';
  containerWidth: 'narrow' | 'default' | 'wide';
}

// ── Full Theme Sections Config ────────────────────────────
export interface ThemeSections {
  header: HeaderSection;
  hero: HeroSection;
  homeSections: HomeSectionItem[];
  featuredProducts: FeaturedProductsSection;
  productList: ProductListSection;
  productDetail: ProductDetailSection;
  cart: CartSection;
  footer: FooterSection;
  customCss: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  design: ThemeDesign;
}

// ── API Response/Request ──────────────────────────────────
export interface ThemeSectionsResponse {
  storeId: number;
  templateId: string;
  themeSectionsJson: string;
  themeDraftJson: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  onlineStoreAppearanceJson: string | null;
  updatedAt: string;
}

export interface UpdateThemeSectionsRequest {
  themeSectionsJson?: string;
  publishDraft?: boolean;
  logoUrl?: string;
  faviconUrl?: string;
}

// ── Section metadata for the sidebar ──────────────────────
export type SectionKey = 'header' | 'hero' | 'homeSections' | 'featuredProducts' | 'productList' | 'productDetail' | 'cart' | 'footer';

export interface SectionMeta {
  key: SectionKey | 'customCss';
  label: string;
  icon: string; // Lucide icon name
  group: 'basic' | 'advanced';
}

export const SECTION_REGISTRY: SectionMeta[] = [
  { key: 'header', label: 'Cabeçalho', icon: 'ArrowUp', group: 'basic' },
  { key: 'homeSections', label: 'Página inicial', icon: 'Home', group: 'basic' },
  { key: 'productList', label: 'Lista de produtos', icon: 'LayoutGrid', group: 'basic' },
  { key: 'productDetail', label: 'Detalhe do produto', icon: 'ScanSearch', group: 'basic' },
  { key: 'cart', label: 'Carrinho de compras', icon: 'ShoppingCart', group: 'basic' },
  { key: 'footer', label: 'Rodapé da página', icon: 'ArrowDown', group: 'basic' },
  { key: 'customCss', label: 'Edição de CSS avançada', icon: 'Code2', group: 'advanced' },
];

// ── Default home sections ordering ────────────────────────
export const DEFAULT_HOME_SECTIONS: HomeSectionItem[] = [
  { id: 'hero-1', type: 'hero', enabled: true, title: 'Banners rotativos' },
  { id: 'feat-1', type: 'featuredProducts', enabled: true, title: 'Produtos em destaque', maxProducts: 8, columns: 4 },
  { id: 'promo-1', type: 'promoBanners', enabled: false, title: 'Banners promocionais', banners: [] },
  { id: 'new-1', type: 'newProducts', enabled: false, title: 'Produtos novos', maxProducts: 8, columns: 4 },
  { id: 'sale-1', type: 'saleProducts', enabled: false, title: 'Produtos em promoção', maxProducts: 8, columns: 4 },
  { id: 'cat-1', type: 'categoryBanners', enabled: false, title: 'Banners de categorias', banners: [] },
  { id: 'news-1', type: 'newsBanners', enabled: false, title: 'Banners de novidades', banners: [] },
  { id: 'imgtxt-1', type: 'imageText', enabled: false, title: 'Módulo de imagem e texto', imageUrl: '', text: '', textPosition: 'right' },
  { id: 'brand-1', type: 'brandBanners', enabled: false, title: 'Banners das marcas', banners: [] },
  { id: 'video-1', type: 'video', enabled: false, title: 'Vídeo', videoUrl: '' },
  { id: 'news-2', type: 'newsletter', enabled: false, title: 'Newsletter', newsletterTitle: 'Fique por dentro', newsletterDescription: 'Receba novidades e promoções' },
  { id: 'main-1', type: 'mainProduct', enabled: false, title: 'Produto principal' },
  { id: 'insta-1', type: 'instagramPosts', enabled: false, title: 'Postagens do Instagram', instagramUsername: '' },
  { id: 'test-1', type: 'testimonials', enabled: false, title: 'Depoimentos', testimonials: [] },
];

// ── Default values ────────────────────────────────────────
export const DEFAULT_COLORS: ThemeColors = {
  primary: '#000000',
  secondary: '#4b5563',
  accent: '#ef4444',
  background: '#ffffff',
  text: '#111111',
};

export const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  headingFont: 'inter',
  bodyFont: 'inter',
  baseFontSize: 'medium',
};

export const DEFAULT_DESIGN: ThemeDesign = {
  logoUrl: '',
  faviconUrl: '',
  borderRadius: 'medium',
  buttonStyle: 'filled',
  containerWidth: 'default',
};

export const DEFAULT_FOOTER: FooterSection = {
  enabled: true,
  useCustomColors: false,
  bgColor: '#111111',
  textColor: '#FFFFFF',
  columns: 4,
  showLogo: false,
  showNewsletter: true,
  newsletterTitle: 'Newsletter',
  newsletterDescription: 'Cadastre-se para receber novidades e ofertas exclusivas.',
  showSocialLinks: true,
  socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '', pinterest: '', linkedin: '' },
  showContactInfo: false,
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  navigationLinks: [],
  showPaymentIcons: true,
  showSecuritySeals: false,
  showShippingIcons: false,
  copyrightText: '',
};

export const DEFAULT_HEADER: HeaderSection = {
  enabled: true,
  useCustomColors: false,
  bgColor: '#ffffff',
  textColor: '#111111',
  logoPosition: 'left',
  logoSize: 'medium',
  showSearch: true,
  showCart: true,
  showLanguagesAndCurrencies: false,
  transparentOnHero: false,
  transparentApplyOver: 'banners',
  useAlternativeColorsOnTransparent: false,
  alternativeTextColor: '#ffffff',
  stickyHeader: true,
  mobileLogoPosition: 'left',
  mobileLinksStyle: 'icons',
  mobileSearchDisplay: 'icon',
  announcementBar: { enabled: false, text: '', bgColor: '#000000', textColor: '#FFFFFF' },
};

export const DEFAULT_THEME_SECTIONS: ThemeSections = {
  header: { ...DEFAULT_HEADER },
  hero: {
    enabled: true,
    type: 'slideshow',
    slides: [],
    videoUrl: '',
    height: 'medium',
    overlayOpacity: 0.3,
    autoplay: true,
    autoplayInterval: 5,
  },
  homeSections: [...DEFAULT_HOME_SECTIONS],
  featuredProducts: {
    enabled: true,
    title: 'Destaques',
    maxProducts: 8,
    columns: 4,
    showPrice: true,
    showBadge: true,
  },
  productList: {
    enabled: true,
    defaultView: 'grid',
    columns: 4,
    mobileColumns: 2,
    showFilters: true,
    filtersPosition: 'left',
    showSort: true,
    productsPerPage: 24,
    navigation: 'pagination',
    quickView: true,
    quickBuy: false,
    showIrregularGrid: false,
    hoverEffect: 'zoom',
    categoryBannerUrl: '',
  },
  productDetail: {
    enabled: true,
    imagePosition: 'left',
    zoomOnHover: true,
    showShippingCalculator: true,
    variantDisplay: 'buttons',
    showRelated: true,
    showReviews: false,
    showShareButtons: true,
    stickyAddToCart: true,
    showSku: false,
  },
  cart: {
    enabled: true,
    style: 'drawer',
    showShippingEstimate: true,
    showCouponField: true,
    showCrossSell: true,
    showOrderNotes: false,
    showFreeShippingBar: true,
  },
  footer: { ...DEFAULT_FOOTER },
  customCss: '',
  colors: { ...DEFAULT_COLORS },
  typography: { ...DEFAULT_TYPOGRAPHY },
  design: { ...DEFAULT_DESIGN },
};

// ── Helper: create a preset by overriding defaults ────────
function makePreset(overrides: Omit<Partial<ThemeSections>, 'header' | 'footer'> & { header?: Partial<HeaderSection>; footer?: Partial<FooterSection> }): ThemeSections {
  return {
    ...DEFAULT_THEME_SECTIONS,
    ...overrides,
    header: { ...DEFAULT_HEADER, ...(overrides.header || {}) } as HeaderSection,
    footer: { ...DEFAULT_FOOTER, ...(overrides.footer || {}) } as FooterSection,
    homeSections: overrides.homeSections || [...DEFAULT_HOME_SECTIONS],
    colors: { ...DEFAULT_COLORS, ...(overrides.colors || {}) },
    typography: { ...DEFAULT_TYPOGRAPHY, ...(overrides.typography || {}) },
    design: { ...DEFAULT_DESIGN, ...(overrides.design || {}) },
  };
}

/** Nova — modern brand / storytelling layout */
export const NOVA_THEME_SECTIONS: ThemeSections = makePreset({
  header: { logoPosition: 'center', transparentOnHero: true, announcementBar: { enabled: true, text: 'Envio grátis acima de R$199', bgColor: '#0f172a', textColor: '#e2e8f0' } },
  hero: { enabled: true, type: 'video', slides: [], videoUrl: '', height: 'full', overlayOpacity: 0.35, autoplay: true, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Coleção em destaque', maxProducts: 6, columns: 3, showPrice: true, showBadge: false },
  productList: { enabled: true, defaultView: 'grid', columns: 3, mobileColumns: 2, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 12, navigation: 'pagination', quickView: false, quickBuy: false, showIrregularGrid: false, hoverEffect: 'swap', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'left', showRelated: true, showReviews: true, showShareButtons: true, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: true, variantDisplay: 'buttons', showSku: false },
  cart: { enabled: true, style: 'drawer', showShippingEstimate: true, showCouponField: true, showCrossSell: false, showOrderNotes: false, showFreeShippingBar: true },
  footer: { bgColor: '#0f172a', textColor: '#f1f5f9', columns: 3 },
  colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#f59e0b', background: '#fafaf9', text: '#0f172a' },
  typography: { headingFont: 'playfair', bodyFont: 'inter', baseFontSize: 'medium' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'small', buttonStyle: 'outline', containerWidth: 'narrow' },
});

/** Vogue — fashion / editorial visual layout */
export const VOGUE_THEME_SECTIONS: ThemeSections = makePreset({
  header: { logoPosition: 'center', transparentOnHero: true, announcementBar: { enabled: true, text: 'Nova coleção disponível ✨', bgColor: '#1c1917', textColor: '#fafaf9' } },
  hero: { enabled: true, type: 'slideshow', slides: [], videoUrl: '', height: 'full', overlayOpacity: 0.25, autoplay: true, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Coleção', maxProducts: 8, columns: 2, showPrice: true, showBadge: false },
  productList: { enabled: true, defaultView: 'grid', columns: 2, mobileColumns: 1, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 12, navigation: 'pagination', quickView: false, quickBuy: false, showIrregularGrid: true, hoverEffect: 'swap', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'left', showRelated: true, showReviews: false, showShareButtons: true, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: true, variantDisplay: 'color-swatches', showSku: false },
  footer: { bgColor: '#1c1917', textColor: '#fafaf9' },
  colors: { primary: '#1c1917', secondary: '#44403c', accent: '#e11d48', background: '#fafaf9', text: '#1c1917' },
  typography: { headingFont: 'playfair', bodyFont: 'poppins', baseFontSize: 'medium' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'none', buttonStyle: 'filled', containerWidth: 'default' },
});

/** Boost — conversion / dropshipping layout */
export const BOOST_THEME_SECTIONS: ThemeSections = makePreset({
  header: { announcementBar: { enabled: true, text: '⚡ FRETE GRÁTIS — por tempo limitado', bgColor: '#059669', textColor: '#ffffff' } },
  hero: { enabled: true, type: 'single', slides: [], videoUrl: '', height: 'large', overlayOpacity: 0.2, autoplay: true, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Mais Vendidos', maxProducts: 12, columns: 3, showPrice: true, showBadge: true },
  productList: { enabled: true, defaultView: 'grid', columns: 3, mobileColumns: 2, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 24, navigation: 'pagination', quickView: true, quickBuy: true, showIrregularGrid: false, hoverEffect: 'zoom', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'right', showRelated: true, showReviews: true, showShareButtons: true, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: true, variantDisplay: 'buttons', showSku: true },
  cart: { enabled: true, style: 'popup', showShippingEstimate: true, showCouponField: true, showCrossSell: true, showOrderNotes: false, showFreeShippingBar: true },
  footer: { bgColor: '#111827', textColor: '#f3f4f6' },
  colors: { primary: '#059669', secondary: '#111827', accent: '#f59e0b', background: '#ffffff', text: '#111827' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'medium', buttonStyle: 'filled', containerWidth: 'wide' },
});

/** Bulk — catalog / wholesale layout */
export const BULK_THEME_SECTIONS: ThemeSections = makePreset({
  header: { announcementBar: { enabled: true, text: 'Desconto progressivo: compre mais, pague menos', bgColor: '#0f172a', textColor: '#e2e8f0' } },
  hero: { enabled: true, type: 'single', slides: [], videoUrl: '', height: 'small', overlayOpacity: 0.15, autoplay: true, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Destaques', maxProducts: 16, columns: 4, showPrice: true, showBadge: true },
  productList: { enabled: true, defaultView: 'grid', columns: 4, mobileColumns: 2, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 32, navigation: 'pagination', quickView: true, quickBuy: true, showIrregularGrid: false, hoverEffect: 'none', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'left', showRelated: true, showReviews: false, showShareButtons: false, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: true, variantDisplay: 'dropdown', showSku: true },
  cart: { enabled: true, style: 'page', showShippingEstimate: true, showCouponField: true, showCrossSell: true, showOrderNotes: true, showFreeShippingBar: true },
  footer: { bgColor: '#0f172a', textColor: '#e2e8f0', columns: 3 },
  colors: { primary: '#1d4ed8', secondary: '#0f172a', accent: '#0ea5e9', background: '#f8fafc', text: '#0f172a' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'small', buttonStyle: 'filled', containerWidth: 'wide' },
});

/** Map template ID → default sections preset */
export const TEMPLATE_PRESETS: Record<string, ThemeSections> = {
  'template-1': DEFAULT_THEME_SECTIONS,
  'template-2': NOVA_THEME_SECTIONS,
  'template-3': VOGUE_THEME_SECTIONS,
  'template-4': BOOST_THEME_SECTIONS,
  'template-5': BULK_THEME_SECTIONS,
};