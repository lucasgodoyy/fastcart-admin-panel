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
  logoSize: 'preset' | 'small' | 'medium' | 'large';
  // Features
  menuStyle: 'horizontal' | 'mega';
  showSearch: boolean;
  showCart: boolean;
  showLanguagesAndCurrencies: boolean;
  // Transparent header
  transparentOnHero: boolean;
  transparentApplyOver: 'banners' | 'banners-video' | 'entire-store';
  useAlternativeColorsOnTransparent: boolean;
  alternativeTextColor: string;
  alternativeLogoUrl: string;
  // Sticky
  stickyHeader: boolean;
  // Mobile
  mobileLogoPosition: 'left' | 'center' | 'center-below-icons';
  mobileLinksStyle: 'text' | 'icons';
  mobileSearchDisplay: 'icon' | 'open' | 'hidden';
  // Desktop
  desktopLogoPosition: 'left' | 'center';
  desktopSearchStyle: 'none' | 'bar-left' | 'bar-center' | 'bar-below-icons';
  desktopIconSize: 'normal' | 'large' | 'hidden';
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
  | 'testimonials'
  | 'welcomeMessage'
  | 'mainCategories'
  | 'institutionalMessage'
  | 'shippingPaymentInfo'
  | 'promoPopup';

export interface HomeSectionItem {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  title: string;

  // ── Common text fields ──
  subtitle?: string;
  titleItalic?: boolean;
  linkUrl?: string;
  buttonText?: string;
  fullWidth?: boolean;

  // ── Product sections (featuredProducts, newProducts, saleProducts) ──
  maxProducts?: number;
  columns?: number;
  mobileColumns?: number;
  desktopColumns?: number;
  displayMode?: 'grid' | 'carousel';
  productIds?: number[];

  // ── Banner sections (promo, category, brand, news, hero) ──
  banners?: { imageUrl: string; mobileImageUrl: string; linkUrl: string; altText: string; title?: string; description?: string; buttonText?: string; buttonUrl?: string }[];
  showTextOutside?: boolean;
  showAsCarousel?: boolean;
  sameHeight?: boolean;
  removeSpacing?: boolean;
  textAlignment?: 'left' | 'center' | 'right';
  bannersPerRow?: number;
  useMobileImages?: boolean;
  parallaxEffect?: boolean;

  // ── Image + Text modules ──
  imageUrl?: string;
  text?: string;
  textPosition?: 'left' | 'right';
  modules?: { imageUrl: string; title?: string; description?: string; linkUrl?: string }[];

  // ── Video ──
  videoUrl?: string;
  playbackType?: 'auto-muted' | 'click';
  videoThumbnailUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  videoButtonText?: string;
  videoButtonUrl?: string;
  verticalOnMobile?: boolean;

  // ── Newsletter ──
  newsletterTitle?: string;
  newsletterDescription?: string;
  useCustomColors?: boolean;
  bgColor?: string;
  textColor?: string;

  // ── Main product ──
  productId?: number;
  displayOrder?: 'first' | 'selected';

  // ── Instagram ──
  instagramUsername?: string;
  instagramToken?: string;
  showOnHome?: boolean;

  // ── Testimonials ──
  testimonials?: { name: string; text: string; rating: number; avatarUrl: string }[];
  descriptionsItalic?: boolean;

  // ── Welcome / Institutional messages ──
  welcomeText?: string;
  institutionalText?: string;

  // ── Shipping / Payment info ──
  shippingInfoItems?: { icon: string; title: string; description: string; imageUrl?: string; linkUrl?: string }[];

  // ── Promo popup ──
  popupImageUrl?: string;
  popupTitle?: string;
  popupDescription?: string;
  popupButtonText?: string;
  popupButtonUrl?: string;
  popupDelay?: number;
  showPopup?: boolean;
  allowNewsletter?: boolean;

  // ── Main categories ──
  categoryIds?: number[];
  maxCategories?: number;
  categoryImages?: { imageUrl: string; categoryName?: string }[];
}

export const HOME_SECTION_LABELS: Record<HomeSectionType, string> = {
  hero: 'Banners rotativos',
  featuredProducts: 'Produtos em destaque',
  promoBanners: 'Banners promocionais',
  newProducts: 'Produtos novos',
  saleProducts: 'Produtos em promoção',
  categoryBanners: 'Banners de categorias',
  newsBanners: 'Banners de novidades',
  imageText: 'Módulos de imagem e texto',
  brandBanners: 'Marcas',
  video: 'Vídeo',
  newsletter: 'Newsletter',
  mainProduct: 'Produto principal',
  instagramPosts: 'Postagens do Instagram',
  testimonials: 'Depoimentos',
  welcomeMessage: 'Mensagem de boas vindas',
  mainCategories: 'Categorias principais',
  institutionalMessage: 'Mensagem institucional',
  shippingPaymentInfo: 'Informações de frete, pagamento e compra',
  promoPopup: 'Pop-up promocional',
};

// ── Featured Products ─────────────────────────────────────
export interface FeaturedProductsSection {
  enabled: boolean;
  title: string;
  maxProducts: number;
  columns: 2 | 3 | 4 | 5;
  showPrice: boolean;
  showBadge: boolean;
}

// ── Product List ──────────────────────────────────────────
export interface ProductListSection {
  enabled: boolean;
  defaultView: 'grid' | 'list';
  columns: 2 | 3 | 4 | 5;
  mobileColumns: 1 | 2;
  showFilters: boolean;
  filtersPosition: 'left' | 'right';
  showSort: boolean;
  defaultSort: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'bestselling';
  productsPerPage: number;
  navigation: 'pagination' | 'infinite-scroll';
  quickView: boolean;
  quickBuy: boolean;
  showIrregularGrid: boolean;
  hoverEffect: 'none' | 'zoom' | 'swap';
  categoryBannerUrl: string;
  // Product card features
  showColorVariants: boolean;
  showSecondImageOnHover: boolean;
  showImageCarousel: boolean;
  showInstallments: boolean;
}

// ── Product Detail ────────────────────────────────────────
export interface ProductDetailSection {
  enabled: boolean;
  imagePosition: 'left' | 'right';
  zoomOnHover: boolean;
  // Shipping
  showShippingCalculator: boolean;
  showPhysicalStores: boolean;
  // Installments
  showInstallments: boolean;
  // Payment discounts
  showPaymentDiscount: boolean;
  paymentDiscountPercent: number;
  paymentDiscountMethod: string;
  // Variants
  variantDisplay: 'dropdown' | 'buttons' | 'color-swatches';
  showColorVariantPhoto: boolean;
  // Size guide
  showSizeGuide: boolean;
  sizeGuideUrl: string;
  // SKU
  showSku: boolean;
  // Stock
  showStock: boolean;
  showLastUnitMessage: boolean;
  lastUnitMessage: string;
  // Description
  fullWidthDescription: boolean;
  // Facebook comments
  showFacebookComments: boolean;
  facebookProfileId: string;
  // Related & complementary
  showRelated: boolean;
  relatedTitle: string;
  showComplementary: boolean;
  complementaryTitle: string;
  // Other
  showReviews: boolean;
  showShareButtons: boolean;
  stickyAddToCart: boolean;
}

// ── Cart ──────────────────────────────────────────────────
export interface CartSection {
  enabled: boolean;
  style: 'drawer' | 'page' | 'popup';
  showShippingEstimate: boolean;
  showPhysicalStoresInCart: boolean;
  showCouponField: boolean;
  showCrossSell: boolean;
  showOrderNotes: boolean;
  showFreeShippingBar: boolean;
  // Cart features
  showViewMoreButton: boolean;
  minimumOrderValue: number;
  addToCartAction: 'notification' | 'open-cart';
  showProductRecommendations: boolean;
}

// ── Footer ────────────────────────────────────────────────
export interface FooterSection {
  enabled: boolean;
  useCustomColors: boolean;
  bgColor: string;
  textColor: string;
  columns: 2 | 3 | 4;
  // Logo
  showLogo: boolean;
  logoUrl: string;
  // Languages & currencies
  showLanguagesAndCurrencies: boolean;
  // Menu
  showMenu: boolean;
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
  // Custom seals
  customSealImageUrl: string;
  customSealCode: string;
  copyrightText: string;
}

// ── Colors ─────────────────────────────────────────────────
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  // Primary button
  buttonBg: string;
  buttonText: string;
  // Promo badges / sale labels
  promoBadgeBg: string;
  promoBadgeText: string;
}

// ── Typography ────────────────────────────────────────────
export type FontFamily =
  | 'inter'
  | 'poppins'
  | 'playfair'
  | 'georgia'
  | 'system'
  | 'piazzolla'
  | 'instrument-sans'
  | 'dm-sans'
  | 'lora'
  | 'raleway'
  | 'nunito';

export interface ThemeTypography {
  headingFont: FontFamily;
  headingSize: number;
  headingBold: boolean;
  bodyFont: FontFamily;
  bodySize: number;
  baseFontSize: 'small' | 'medium' | 'large';
}

// ── Design Options ────────────────────────────────────────
export interface ThemeDesign {
  logoUrl: string;
  faviconUrl: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  buttonStyle: 'filled' | 'outline' | 'pill';
  containerWidth: number | 'narrow' | 'default' | 'wide';
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
  { id: 'maincat-1', type: 'mainCategories', enabled: false, title: 'Categorias principais', maxCategories: 6, categoryImages: [] },
  { id: 'welcome-1', type: 'welcomeMessage', enabled: false, title: 'Mensagem de boas vindas', subtitle: '', titleItalic: false, linkUrl: '', buttonText: '' },
  { id: 'feat-1', type: 'featuredProducts', enabled: true, title: 'Produtos em destaque', displayMode: 'grid', mobileColumns: 2, desktopColumns: 3, maxProducts: 8 },
  { id: 'hero-1', type: 'hero', enabled: true, title: 'Banners rotativos', fullWidth: false, parallaxEffect: false },
  { id: 'instit-1', type: 'institutionalMessage', enabled: false, title: 'Mensagem institucional', subtitle: '', titleItalic: false, linkUrl: '', buttonText: '' },
  { id: 'main-1', type: 'mainProduct', enabled: false, title: 'Produto principal', displayOrder: 'first' },
  { id: 'promo-1', type: 'promoBanners', enabled: false, title: 'Banners promocionais', banners: [], showTextOutside: false, showAsCarousel: false, sameHeight: false, removeSpacing: false, textAlignment: 'center', bannersPerRow: 2, useMobileImages: false },
  { id: 'test-1', type: 'testimonials', enabled: false, title: 'Depoimentos', testimonials: [], descriptionsItalic: false },
  { id: 'video-1', type: 'video', enabled: false, title: 'Vídeo', videoUrl: '', fullWidth: false, playbackType: 'auto-muted', verticalOnMobile: false },
  { id: 'shipping-1', type: 'shippingPaymentInfo', enabled: false, title: 'Informações de frete, pagamento e compra', shippingInfoItems: [{ icon: 'truck', title: '', description: '' }, { icon: 'credit-card', title: '', description: '' }, { icon: 'shield', title: '', description: '' }, { icon: 'refresh', title: '', description: '' }], useCustomColors: false },
  { id: 'news-2', type: 'newsletter', enabled: false, title: 'Newsletter', newsletterTitle: 'Newsletter', newsletterDescription: 'Cadastre-se e receba nossas ofertas.', fullWidth: false, useCustomColors: false },
  { id: 'new-1', type: 'newProducts', enabled: false, title: 'Produtos novos', displayMode: 'carousel', mobileColumns: 2, desktopColumns: 4, maxProducts: 8 },
  { id: 'insta-1', type: 'instagramPosts', enabled: false, title: 'Postagens do Instagram', instagramUsername: '', instagramToken: '', showOnHome: true },
  { id: 'sale-1', type: 'saleProducts', enabled: false, title: 'Produtos em oferta', displayMode: 'carousel', mobileColumns: 2, desktopColumns: 4, maxProducts: 8 },
  { id: 'cat-1', type: 'categoryBanners', enabled: false, title: 'Banners de categorias', banners: [], showTextOutside: false, showAsCarousel: false, sameHeight: false, removeSpacing: false, textAlignment: 'center', bannersPerRow: 4, useMobileImages: false },
  { id: 'news-1', type: 'newsBanners', enabled: false, title: 'Banners de novidades', banners: [], showTextOutside: false, showAsCarousel: false, sameHeight: false, removeSpacing: false, textAlignment: 'center', bannersPerRow: 1, useMobileImages: false },
  { id: 'imgtxt-1', type: 'imageText', enabled: false, title: 'Módulos de imagem e texto', modules: [], showAsCarousel: false, sameHeight: false, removeSpacing: false },
  { id: 'brand-1', type: 'brandBanners', enabled: false, title: 'Marcas', banners: [], displayMode: 'carousel' },
  { id: 'popup-1', type: 'promoPopup', enabled: false, title: 'Pop-up promocional', showPopup: true, popupTitle: '', popupDescription: '', popupButtonText: 'Ver ofertas', popupButtonUrl: '', popupDelay: 3, allowNewsletter: false },
];

// ── Default values ────────────────────────────────────────
export const DEFAULT_COLORS: ThemeColors = {
  primary: '#000000',
  secondary: '#4b5563',
  accent: '#ef4444',
  background: '#ffffff',
  text: '#111111',
  buttonBg: '#000000',
  buttonText: '#ffffff',
  promoBadgeBg: '#ef4444',
  promoBadgeText: '#ffffff',
};

export const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  headingFont: 'inter',
  headingSize: 28,
  headingBold: true,
  bodyFont: 'inter',
  bodySize: 14,
  baseFontSize: 'medium',
};

export const DEFAULT_DESIGN: ThemeDesign = {
  logoUrl: '',
  faviconUrl: '',
  borderRadius: 'medium',
  buttonStyle: 'filled',
  containerWidth: 1260,
};

export const DEFAULT_FOOTER: FooterSection = {
  enabled: true,
  useCustomColors: false,
  bgColor: '#111111',
  textColor: '#FFFFFF',
  columns: 4,
  showLogo: false,
  logoUrl: '',
  showLanguagesAndCurrencies: false,
  showMenu: true,
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
  customSealImageUrl: '',
  customSealCode: '',
  copyrightText: '',
};

export const DEFAULT_HEADER: HeaderSection = {
  enabled: true,
  useCustomColors: false,
  bgColor: '#ffffff',
  textColor: '#111111',
  logoPosition: 'left',
  logoSize: 'preset',
  menuStyle: 'horizontal',
  showSearch: true,
  showCart: true,
  showLanguagesAndCurrencies: false,
  transparentOnHero: false,
  transparentApplyOver: 'banners-video',
  useAlternativeColorsOnTransparent: false,
  alternativeTextColor: '#ffffff',
  alternativeLogoUrl: '',
  stickyHeader: true,
  mobileLogoPosition: 'left',
  mobileLinksStyle: 'icons',
  mobileSearchDisplay: 'icon',
  desktopLogoPosition: 'left',
  desktopSearchStyle: 'none',
  desktopIconSize: 'normal',
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
    defaultSort: 'newest',
    productsPerPage: 24,
    navigation: 'pagination',
    quickView: true,
    quickBuy: false,
    showIrregularGrid: false,
    hoverEffect: 'zoom',
    categoryBannerUrl: '',
    showColorVariants: true,
    showSecondImageOnHover: true,
    showImageCarousel: true,
    showInstallments: false,
  },
  productDetail: {
    enabled: true,
    imagePosition: 'left',
    zoomOnHover: true,
    showShippingCalculator: true,
    showPhysicalStores: false,
    showInstallments: true,
    showPaymentDiscount: false,
    paymentDiscountPercent: 10,
    paymentDiscountMethod: 'Pix',
    variantDisplay: 'buttons',
    showColorVariantPhoto: true,
    showSizeGuide: false,
    sizeGuideUrl: '',
    showSku: false,
    showStock: false,
    showLastUnitMessage: false,
    lastUnitMessage: 'Atenção, última peça!',
    fullWidthDescription: false,
    showFacebookComments: false,
    facebookProfileId: '',
    showRelated: true,
    relatedTitle: 'Produtos similares',
    showComplementary: true,
    complementaryTitle: 'Para comprar com esse produto',
    showReviews: false,
    showShareButtons: true,
    stickyAddToCart: true,
  },
  cart: {
    enabled: true,
    style: 'drawer',
    showShippingEstimate: true,
    showPhysicalStoresInCart: false,
    showCouponField: true,
    showCrossSell: true,
    showOrderNotes: false,
    showFreeShippingBar: true,
    showViewMoreButton: true,
    minimumOrderValue: 0,
    addToCartAction: 'open-cart',
    showProductRecommendations: false,
  },
  footer: { ...DEFAULT_FOOTER },
  customCss: '',
  colors: { ...DEFAULT_COLORS },
  typography: { ...DEFAULT_TYPOGRAPHY },
  design: { ...DEFAULT_DESIGN },
};

// ── Helper: create a preset by overriding defaults ────────
function makePreset(overrides: Omit<Partial<ThemeSections>, 'header' | 'footer' | 'productDetail' | 'productList' | 'cart' | 'featuredProducts' | 'hero' | 'colors' | 'typography' | 'design'> & { header?: Partial<HeaderSection>; footer?: Partial<FooterSection>; productDetail?: Partial<ProductDetailSection>; productList?: Partial<ProductListSection>; cart?: Partial<CartSection>; featuredProducts?: Partial<FeaturedProductsSection>; hero?: Partial<HeroSection>; colors?: Partial<ThemeColors>; typography?: Partial<ThemeTypography>; design?: Partial<ThemeDesign> }): ThemeSections {
  return {
    ...DEFAULT_THEME_SECTIONS,
    ...overrides,
    header: { ...DEFAULT_HEADER, ...(overrides.header || {}) } as HeaderSection,
    footer: { ...DEFAULT_FOOTER, ...(overrides.footer || {}) } as FooterSection,
    homeSections: overrides.homeSections || [...DEFAULT_HOME_SECTIONS],
    colors: { ...DEFAULT_COLORS, ...(overrides.colors || {}) },
    typography: { ...DEFAULT_TYPOGRAPHY, ...(overrides.typography || {}) },
    design: { ...DEFAULT_DESIGN, ...(overrides.design || {}) },
    // Merge sub-sections so new fields in defaults propagate to presets automatically
    productList: { ...DEFAULT_THEME_SECTIONS.productList, ...(overrides.productList || {}) } as ProductListSection,
    productDetail: { ...DEFAULT_THEME_SECTIONS.productDetail, ...(overrides.productDetail || {}) } as ProductDetailSection,
    cart: { ...DEFAULT_THEME_SECTIONS.cart, ...(overrides.cart || {}) } as CartSection,
    featuredProducts: { ...DEFAULT_THEME_SECTIONS.featuredProducts, ...(overrides.featuredProducts || {}) } as FeaturedProductsSection,
    hero: { ...DEFAULT_THEME_SECTIONS.hero, ...(overrides.hero || {}) } as HeroSection,
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

/** Atlântico — dark tech / premium layout */
export const ATLANTICO_THEME_SECTIONS: ThemeSections = makePreset({
  header: { useCustomColors: true, bgColor: '#0a0a0a', textColor: '#ffffff', logoPosition: 'left', stickyHeader: true, announcementBar: { enabled: true, text: '✨ Bem-vindo ao tema Atlântico', bgColor: '#06b6d4', textColor: '#0a0a0a' } },
  hero: { enabled: true, type: 'slideshow', slides: [], videoUrl: '', height: 'medium', overlayOpacity: 0.3, autoplay: true, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Destaques', maxProducts: 8, columns: 4, showPrice: true, showBadge: true },
  productList: { enabled: true, defaultView: 'grid', columns: 4, mobileColumns: 2, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 24, navigation: 'pagination', quickView: true, quickBuy: true, showIrregularGrid: false, hoverEffect: 'zoom', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'left', showRelated: true, showReviews: false, showShareButtons: true, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: true, variantDisplay: 'buttons', showSku: true },
  cart: { enabled: true, style: 'drawer', showShippingEstimate: true, showCouponField: true, showCrossSell: true, showOrderNotes: false, showFreeShippingBar: true },
  footer: { bgColor: '#0a0a0a', textColor: '#ffffff', columns: 4 },
  colors: { primary: '#0a0a0a', secondary: '#141414', accent: '#06b6d4', background: '#0a0a0a', text: '#ffffff' },
  typography: { headingFont: 'inter', bodyFont: 'inter', baseFontSize: 'medium' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'large', buttonStyle: 'filled', containerWidth: 'default' },
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

/** Vitrine — marketplace fashion / sneakers layout */
export const VITRINE_THEME_SECTIONS: ThemeSections = makePreset({
  header: { useCustomColors: true, bgColor: '#0f0f0f', textColor: '#ffffff', logoPosition: 'left', stickyHeader: true, announcementBar: { enabled: false, text: '', bgColor: '#0d9f6e', textColor: '#ffffff' } },
  hero: { enabled: false, type: 'single', slides: [], videoUrl: '', height: 'small', overlayOpacity: 0, autoplay: false, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Mais Procurados', maxProducts: 8, columns: 4, showPrice: true, showBadge: true },
  productList: { enabled: true, defaultView: 'grid', columns: 4, mobileColumns: 2, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 24, navigation: 'pagination', quickView: false, quickBuy: true, showIrregularGrid: false, hoverEffect: 'zoom', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'left', showRelated: true, showReviews: false, showShareButtons: true, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: false, variantDisplay: 'buttons', showSku: false },
  cart: { enabled: true, style: 'drawer', showShippingEstimate: true, showCouponField: true, showCrossSell: true, showOrderNotes: false, showFreeShippingBar: true },
  footer: { bgColor: '#0f0f0f', textColor: '#9ca3af', columns: 4 },
  colors: { primary: '#111111', secondary: '#f5f5f5', accent: '#0d9f6e', background: '#f5f5f5', text: '#111111' },
  typography: { headingFont: 'inter', bodyFont: 'inter', baseFontSize: 'medium' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'large', buttonStyle: 'filled', containerWidth: 'default' },
});

/** Stock — StockX-style marketplace layout */
export const STOCK_THEME_SECTIONS: ThemeSections = makePreset({
  header: { useCustomColors: true, bgColor: '#ffffff', textColor: '#000000', logoPosition: 'left', stickyHeader: true, announcementBar: { enabled: false, text: '', bgColor: '#16a34a', textColor: '#ffffff' } },
  hero: { enabled: false, type: 'single', slides: [], videoUrl: '', height: 'medium', overlayOpacity: 0, autoplay: false, autoplayInterval: 5 },
  featuredProducts: { enabled: true, title: 'Featured', maxProducts: 10, columns: 5, showPrice: true, showBadge: true },
  productList: { enabled: true, defaultView: 'grid', columns: 5, mobileColumns: 2, showFilters: true, filtersPosition: 'left', showSort: true, productsPerPage: 25, navigation: 'pagination', quickView: false, quickBuy: true, showIrregularGrid: false, hoverEffect: 'zoom', categoryBannerUrl: '' },
  productDetail: { enabled: true, imagePosition: 'left', showRelated: true, showReviews: false, showShareButtons: true, stickyAddToCart: true, zoomOnHover: true, showShippingCalculator: false, variantDisplay: 'buttons', showSku: true },
  cart: { enabled: true, style: 'drawer', showShippingEstimate: true, showCouponField: true, showCrossSell: true, showOrderNotes: false, showFreeShippingBar: true },
  footer: { bgColor: '#000000', textColor: '#9ca3af', columns: 4 },
  colors: { primary: '#000000', secondary: '#f9fafb', accent: '#16a34a', background: '#ffffff', text: '#000000' },
  typography: { headingFont: 'inter', bodyFont: 'inter', baseFontSize: 'medium' },
  design: { logoUrl: '', faviconUrl: '', borderRadius: 'full', buttonStyle: 'filled', containerWidth: 'default' },
});

/** Map template ID → default sections preset */
export const TEMPLATE_PRESETS: Record<string, ThemeSections> = {
  'limpo': DEFAULT_THEME_SECTIONS,
  'template-6': ATLANTICO_THEME_SECTIONS,
  'template-7': VITRINE_THEME_SECTIONS,
};