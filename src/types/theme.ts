/* ──────────────────────────────────────────────────────────
 *  Theme Sections — Types for the layout editor
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
  logoPosition: 'left' | 'center';
  showSearch: boolean;
  showCart: boolean;
  transparentOnHero: boolean;
  stickyHeader: boolean;
  announcementBar: AnnouncementBar;
}

// ── Hero Slide ────────────────────────────────────────────
export interface HeroSlide {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
}

export interface HeroSection {
  enabled: boolean;
  type: 'slideshow' | 'single' | 'video';
  slides: HeroSlide[];
  height: 'small' | 'medium' | 'large' | 'full';
  overlayOpacity: number;
}

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
  showFilters: boolean;
  showSort: boolean;
  productsPerPage: number;
  quickView: boolean;
  hoverEffect: 'none' | 'zoom' | 'swap';
}

// ── Product Detail ────────────────────────────────────────
export interface ProductDetailSection {
  enabled: boolean;
  imagePosition: 'left' | 'right';
  showRelated: boolean;
  showReviews: boolean;
  showShareButtons: boolean;
  stickyAddToCart: boolean;
  zoomOnHover: boolean;
}

// ── Cart ──────────────────────────────────────────────────
export interface CartSection {
  enabled: boolean;
  style: 'drawer' | 'page' | 'popup';
  showShippingEstimate: boolean;
  showCouponField: boolean;
  showCrossSell: boolean;
}

// ── Footer ────────────────────────────────────────────────
export interface FooterSection {
  enabled: boolean;
  columns: 2 | 3 | 4;
  showNewsletter: boolean;
  showSocialLinks: boolean;
  showPaymentIcons: boolean;
  copyrightText: string;
  bgColor: string;
  textColor: string;
}

// ── Full Theme Sections Config ────────────────────────────
export interface ThemeSections {
  header: HeaderSection;
  hero: HeroSection;
  featuredProducts: FeaturedProductsSection;
  productList: ProductListSection;
  productDetail: ProductDetailSection;
  cart: CartSection;
  footer: FooterSection;
  customCss: string;
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
export type SectionKey = keyof Omit<ThemeSections, 'customCss'>;

export interface SectionMeta {
  key: SectionKey | 'customCss';
  label: string;
  icon: string; // Lucide icon name
  group: 'brand' | 'basic' | 'advanced';
}

export const SECTION_REGISTRY: SectionMeta[] = [
  { key: 'header', label: 'Cabeçalho', icon: 'ArrowUp', group: 'basic' },
  { key: 'hero', label: 'Página inicial', icon: 'Home', group: 'basic' },
  { key: 'featuredProducts', label: 'Lista de produtos', icon: 'LayoutGrid', group: 'basic' },
  { key: 'productDetail', label: 'Detalhe do produto', icon: 'ScanSearch', group: 'basic' },
  { key: 'cart', label: 'Carrinho de compras', icon: 'ShoppingCart', group: 'basic' },
  { key: 'footer', label: 'Rodapé da página', icon: 'ArrowDown', group: 'basic' },
  { key: 'customCss', label: 'Edição de css', icon: 'Code2', group: 'advanced' },
];

// ── Default theme sections ────────────────────────────────
export const DEFAULT_THEME_SECTIONS: ThemeSections = {
  header: {
    enabled: true,
    logoPosition: 'left',
    showSearch: true,
    showCart: true,
    transparentOnHero: false,
    stickyHeader: true,
    announcementBar: { enabled: false, text: '', bgColor: '#000000', textColor: '#FFFFFF' },
  },
  hero: {
    enabled: true,
    type: 'slideshow',
    slides: [],
    height: 'medium',
    overlayOpacity: 0.3,
  },
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
    showFilters: true,
    showSort: true,
    productsPerPage: 24,
    quickView: true,
    hoverEffect: 'zoom',
  },
  productDetail: {
    enabled: true,
    imagePosition: 'left',
    showRelated: true,
    showReviews: false,
    showShareButtons: true,
    stickyAddToCart: true,
    zoomOnHover: true,
  },
  cart: {
    enabled: true,
    style: 'drawer',
    showShippingEstimate: true,
    showCouponField: true,
    showCrossSell: true,
  },
  footer: {
    enabled: true,
    columns: 4,
    showNewsletter: true,
    showSocialLinks: true,
    showPaymentIcons: true,
    copyrightText: '',
    bgColor: '#111111',
    textColor: '#FFFFFF',
  },
  customCss: '',
};

// ── Template-specific presets ─────────────────────────────

/** Patagonia — editorial / premium brand layout */
export const PATAGONIA_THEME_SECTIONS: ThemeSections = {
  header: {
    enabled: true,
    logoPosition: 'center',
    showSearch: true,
    showCart: true,
    transparentOnHero: true,
    stickyHeader: true,
    announcementBar: { enabled: true, text: 'Frete grátis acima de R$299', bgColor: '#1a1a2e', textColor: '#e0e0e0' },
  },
  hero: {
    enabled: true,
    type: 'video',
    slides: [],
    height: 'full',
    overlayOpacity: 0.4,
  },
  featuredProducts: {
    enabled: true,
    title: 'Coleção em destaque',
    maxProducts: 6,
    columns: 2,
    showPrice: true,
    showBadge: false,
  },
  productList: {
    enabled: true,
    defaultView: 'grid',
    columns: 2,
    showFilters: true,
    showSort: true,
    productsPerPage: 12,
    quickView: false,
    hoverEffect: 'swap',
  },
  productDetail: {
    enabled: true,
    imagePosition: 'left',
    showRelated: true,
    showReviews: false,
    showShareButtons: true,
    stickyAddToCart: true,
    zoomOnHover: true,
  },
  cart: {
    enabled: true,
    style: 'drawer',
    showShippingEstimate: true,
    showCouponField: true,
    showCrossSell: false,
  },
  footer: {
    enabled: true,
    columns: 3,
    showNewsletter: true,
    showSocialLinks: true,
    showPaymentIcons: true,
    copyrightText: '',
    bgColor: '#1a1a2e',
    textColor: '#f5f5f5',
  },
  customCss: '',
};

/** Aurora — tech / electronics modern layout */
export const AURORA_THEME_SECTIONS: ThemeSections = {
  header: {
    enabled: true,
    logoPosition: 'left',
    showSearch: true,
    showCart: true,
    transparentOnHero: false,
    stickyHeader: true,
    announcementBar: { enabled: true, text: '⚡ Ofertas relâmpago — até 40% OFF', bgColor: '#ff4d4d', textColor: '#ffffff' },
  },
  hero: {
    enabled: true,
    type: 'slideshow',
    slides: [],
    height: 'large',
    overlayOpacity: 0.2,
  },
  featuredProducts: {
    enabled: true,
    title: 'Mais vendidos',
    maxProducts: 12,
    columns: 3,
    showPrice: true,
    showBadge: true,
  },
  productList: {
    enabled: true,
    defaultView: 'grid',
    columns: 3,
    showFilters: true,
    showSort: true,
    productsPerPage: 24,
    quickView: true,
    hoverEffect: 'zoom',
  },
  productDetail: {
    enabled: true,
    imagePosition: 'right',
    showRelated: true,
    showReviews: false,
    showShareButtons: false,
    stickyAddToCart: true,
    zoomOnHover: true,
  },
  cart: {
    enabled: true,
    style: 'popup',
    showShippingEstimate: true,
    showCouponField: true,
    showCrossSell: true,
  },
  footer: {
    enabled: true,
    columns: 4,
    showNewsletter: true,
    showSocialLinks: true,
    showPaymentIcons: true,
    copyrightText: '',
    bgColor: '#0f0f13',
    textColor: '#e8e8ed',
  },
  customCss: '',
};

/** Glamour — beauty / cosmetics luxury layout (Kylie Cosmetics inspired) */
export const GLAMOUR_THEME_SECTIONS: ThemeSections = {
  header: {
    enabled: true,
    logoPosition: 'center',
    showSearch: true,
    showCart: true,
    transparentOnHero: true,
    stickyHeader: true,
    announcementBar: { enabled: true, text: '✨ Frete grátis em compras acima de R$149 ✨', bgColor: '#1a1a1a', textColor: '#f5e6e0' },
  },
  hero: {
    enabled: true,
    type: 'slideshow',
    slides: [],
    height: 'full',
    overlayOpacity: 0.25,
  },
  featuredProducts: {
    enabled: true,
    title: 'Best Sellers',
    maxProducts: 8,
    columns: 4,
    showPrice: true,
    showBadge: true,
  },
  productList: {
    enabled: true,
    defaultView: 'grid',
    columns: 4,
    showFilters: true,
    showSort: true,
    productsPerPage: 20,
    quickView: true,
    hoverEffect: 'swap',
  },
  productDetail: {
    enabled: true,
    imagePosition: 'left',
    showRelated: true,
    showReviews: false,
    showShareButtons: true,
    stickyAddToCart: true,
    zoomOnHover: true,
  },
  cart: {
    enabled: true,
    style: 'drawer',
    showShippingEstimate: true,
    showCouponField: true,
    showCrossSell: true,
  },
  footer: {
    enabled: true,
    columns: 4,
    showNewsletter: true,
    showSocialLinks: true,
    showPaymentIcons: true,
    copyrightText: '',
    bgColor: '#1a1a1a',
    textColor: '#f5e6e0',
  },
  customCss: '',
};

/** Map template ID → default sections preset */
export const TEMPLATE_PRESETS: Record<string, ThemeSections> = {
  'template-1': DEFAULT_THEME_SECTIONS,
  'template-2': PATAGONIA_THEME_SECTIONS,
  'template-3': AURORA_THEME_SECTIONS,
  'template-4': GLAMOUR_THEME_SECTIONS,
};
