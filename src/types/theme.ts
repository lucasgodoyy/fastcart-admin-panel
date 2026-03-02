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
