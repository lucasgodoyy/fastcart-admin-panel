'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Package,
  ShoppingBag,
  Megaphone,
  Plug,
  CreditCard,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Rocket,
  Star,
  Truck,
  Globe,
  TicketPercent,
  Mail,
  Handshake,
  Timer,
  RefreshCw,
  Zap,
  HelpCircle,
  FileText,
  Headphones,
  Receipt,
  Settings,
} from 'lucide-react';
import { t } from '@/lib/admin-language';

interface TutorialCategory {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  articles: number;
}

interface QuickTip {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const categories: TutorialCategory[] = [
  {
    title: t('Primeiros Passos', 'Getting Started'),
    description: t(
      'Configure sua loja do zero: dados do negócio, logo, domínio e primeira venda.',
      'Set up your store from scratch: business data, logo, domain, and first sale.'
    ),
    href: '/admin/tutorials',
    icon: <Rocket className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600',
    articles: 8,
  },
  {
    title: t('Produtos e Catálogo', 'Products & Catalog'),
    description: t(
      'Aprenda a cadastrar produtos, variações, estoque, categorias e coleções.',
      'Learn to register products, variations, inventory, categories, and collections.'
    ),
    href: '/admin/tutorials/products',
    icon: <Package className="h-6 w-6" />,
    color: 'from-emerald-500 to-emerald-600',
    articles: 12,
  },
  {
    title: t('Pedidos e Vendas', 'Orders & Sales'),
    description: t(
      'Gerencie pedidos, devoluções, carrinhos abandonados e PDV passo a passo.',
      'Manage orders, returns, abandoned carts, and POS step by step.'
    ),
    href: '/admin/tutorials/orders',
    icon: <ShoppingBag className="h-6 w-6" />,
    color: 'from-orange-500 to-orange-600',
    articles: 10,
  },
  {
    title: t('Marketing e Promoções', 'Marketing & Promotions'),
    description: t(
      'Cupons, promoções, e-mail marketing, afiliados, upsell, fidelidade e mais.',
      'Coupons, promotions, email marketing, affiliates, upsell, loyalty, and more.'
    ),
    href: '/admin/tutorials/marketing',
    icon: <Megaphone className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600',
    articles: 14,
  },
  {
    title: t('Integrações e Canais', 'Integrations & Channels'),
    description: t(
      'Conecte Facebook, Instagram, TikTok, Google Ads, Analytics e mais.',
      'Connect Facebook, Instagram, TikTok, Google Ads, Analytics, and more.'
    ),
    href: '/admin/tutorials/integrations',
    icon: <Plug className="h-6 w-6" />,
    color: 'from-indigo-500 to-indigo-600',
    articles: 9,
  },
  {
    title: t('Pagamentos e Financeiro', 'Payments & Finance'),
    description: t(
      'Configure meios de pagamento, entenda taxas, notas fiscais e fluxo de caixa.',
      'Configure payment methods, understand fees, invoices, and cash flow.'
    ),
    href: '/admin/tutorials/payments',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'from-pink-500 to-pink-600',
    articles: 7,
  },
];

const gettingStartedSteps = [
  {
    step: 1,
    title: t('Configure os dados do negócio', 'Configure business data'),
    description: t(
      'Acesse Configurações > Dados do negócio. Preencha o nome da loja, descrição SEO, telefone, fuso horário e segmento. Isso aparecerá na sua loja virtual e nos resultados de busca.',
      'Go to Settings > Business Data. Fill in store name, SEO description, phone, timezone, and segment.'
    ),
    link: '/admin/settings/business-data',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    step: 2,
    title: t('Adicione as informações fiscais', 'Add fiscal information'),
    description: t(
      'Em Configurações > Dados Fiscais, insira CPF/CNPJ e endereço completo. Necessário para emissão de notas fiscais e credibilidade da loja.',
      'In Settings > Fiscal Data, enter your tax ID and full address. Required for invoices.'
    ),
    link: '/admin/settings/fiscal-data',
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    step: 3,
    title: t('Configure o meio de pagamento', 'Set up payment method'),
    description: t(
      'Em Configurações > Meios de Pagamento, conecte o Stripe para aceitar cartões, PIX e boleto. Siga o passo a passo na tela de integração.',
      'In Settings > Payment Methods, connect Stripe to accept cards, PIX, and boleto.'
    ),
    link: '/admin/settings/payment-methods',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    step: 4,
    title: t('Configure o frete', 'Set up shipping'),
    description: t(
      'Em Configurações > Meios de Envio, conecte o Melhor Envio ou adicione frete customizado. Defina centros de distribuição para cálculo correto.',
      'In Settings > Shipping Methods, connect Melhor Envio or add custom shipping.'
    ),
    link: '/admin/settings/shipping-methods',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    step: 5,
    title: t('Cadastre seu primeiro produto', 'Register your first product'),
    description: t(
      'Acesse Catálogo > Todos os Produtos > Novo produto. Adicione título, descrição, fotos, preço, estoque e variações (tamanho, cor, etc).',
      'Go to Catalog > All Products > New Product. Add title, description, photos, price, stock.'
    ),
    link: '/admin/products/new',
    icon: <Package className="h-5 w-5" />,
  },
  {
    step: 6,
    title: t('Personalize a loja virtual', 'Customize your store'),
    description: t(
      'Em Canais de Venda > Loja Virtual > Tema e Layout, escolha cores, logo e organize as seções da sua loja. Use o Editor de Layout para arrastar blocos.',
      'In Sales Channels > Online Store > Theme & Layout, choose colors, logo, and organize sections.'
    ),
    link: '/admin/online-store/layout-theme',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    step: 7,
    title: t('Conecte seu domínio', 'Connect your domain'),
    description: t(
      'Em Configurações > Domínios, adicione seu domínio personalizado (ex: minhaloja.com.br). Siga as instruções de DNS para apontar corretamente.',
      'In Settings > Domains, add your custom domain and follow DNS instructions.'
    ),
    link: '/admin/settings/domains',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    step: 8,
    title: t('Publique e faça sua primeira venda!', 'Publish and make your first sale!'),
    description: t(
      'Desative o modo manutenção em Loja Virtual > Manutenção. Compartilhe o link da loja nas redes sociais e comece a vender!',
      'Disable maintenance mode in Online Store > Maintenance. Share your store link on social media!'
    ),
    link: '/admin/online-store/under-construction',
    icon: <Rocket className="h-5 w-5" />,
  },
];

const quickTips: QuickTip[] = [
  {
    title: t('Fotos vendem mais', 'Photos sell more'),
    description: t(
      'Use fotos de alta qualidade com fundo branco. Produtos com 4+ fotos têm 60% mais conversões.',
      'Use high quality photos with white background. Products with 4+ photos get 60% more conversions.'
    ),
    icon: <Star className="h-5 w-5 text-amber-500" />,
  },
  {
    title: t('Recupere carrinhos abandonados', 'Recover abandoned carts'),
    description: t(
      'Ative e-mails de recuperação em Marketing > E-mail Marketing. Recupere até 15% dos carrinhos.',
      'Enable recovery emails in Marketing > Email Marketing. Recover up to 15% of carts.'
    ),
    icon: <Mail className="h-5 w-5 text-blue-500" />,
  },
  {
    title: t('Cupons de primeira compra', 'First purchase coupons'),
    description: t(
      'Crie um cupom de desconto para novos clientes em Promoções > Cupons. Estratégia comprovada de conversão.',
      'Create a discount coupon for new customers in Promotions > Coupons.'
    ),
    icon: <TicketPercent className="h-5 w-5 text-emerald-500" />,
  },
  {
    title: t('SEO faz diferença', 'SEO makes a difference'),
    description: t(
      'Preencha a descrição SEO em cada produto e nos dados do negócio. Apareça nas buscas do Google gratuitamente.',
      'Fill in SEO description for each product and business data. Appear in Google searches for free.'
    ),
    icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
  },
];

const featureExplanations = [
  {
    title: t('Cupons e Promoções', 'Coupons & Promotions'),
    description: t(
      'Crie cupons com % ou valor fixo de desconto, limite de uso, data de validade e valor mínimo de compra. Promoções aplicam desconto automaticamente.',
      'Create coupons with % or fixed discount, usage limits, expiration, and minimum order. Promotions apply discounts automatically.'
    ),
    link: '/admin/discounts/coupons',
    icon: <TicketPercent className="h-4 w-4" />,
  },
  {
    title: t('Programa de Afiliados', 'Affiliate Program'),
    description: t(
      'Permite que parceiros promovam sua loja e ganhem comissão por venda. Configure a taxa de comissão, acompanhe cliques e conversões.',
      'Lets partners promote your store and earn commission per sale. Configure rates, track clicks and conversions.'
    ),
    link: '/admin/marketing/affiliates',
    icon: <Handshake className="h-4 w-4" />,
  },
  {
    title: t('Programa de Fidelidade', 'Loyalty Program'),
    description: t(
      'Seus clientes acumulam pontos a cada compra e trocam por descontos. Incentiva recompra e aumenta o ticket médio.',
      'Customers earn points per purchase and redeem for discounts. Encourages repurchase and increases average ticket.'
    ),
    link: '/admin/loyalty',
    icon: <Star className="h-4 w-4" />,
  },
  {
    title: t('Upsell e Cross-sell', 'Upsell & Cross-sell'),
    description: t(
      'Sugira produtos complementares ou upgrades durante o checkout e na página do produto. Aumente o valor médio do carrinho.',
      'Suggest complementary products or upgrades at checkout and product page. Increase average cart value.'
    ),
    link: '/admin/upsell',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    title: t('Contadores Regressivos', 'Countdown Timers'),
    description: t(
      'Crie urgência com contadores na página do produto e checkout. Ideal para promoções relâmpago e lançamentos.',
      'Create urgency with timers on product pages and checkout. Ideal for flash sales.'
    ),
    link: '/admin/countdown-timers',
    icon: <Timer className="h-4 w-4" />,
  },
  {
    title: t('Assinaturas de Produtos', 'Product Subscriptions'),
    description: t(
      'Ofereça compras recorrentes (mensal, quinzenal, semanal). Ideal para consumíveis, cosméticos e alimentos.',
      'Offer recurring purchases (monthly, biweekly, weekly). Ideal for consumables, cosmetics, and food.'
    ),
    link: '/admin/product-subscriptions',
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    title: t('E-mail Marketing', 'Email Marketing'),
    description: t(
      'Envie campanhas de e-mail para sua base de clientes. Templates prontos para carrinhos abandonados, novidades e promoções.',
      'Send email campaigns to your customer base. Ready templates for abandoned carts, news, and promotions.'
    ),
    link: '/admin/marketing/email-campaigns',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    title: t('Notas Fiscais (NF-e)', 'Invoices (NF-e)'),
    description: t(
      'Emita notas fiscais eletrônicas diretamente pelo painel. Configure dados fiscais e acompanhe o status das notas.',
      'Issue electronic invoices directly from the panel. Configure fiscal data and track invoice status.'
    ),
    link: '/admin/nfe',
    icon: <FileText className="h-4 w-4" />,
  },
];

export function TutorialsClient() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t('Central de Ajuda e Tutoriais', 'Help Center & Tutorials')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            'Guias objetivos para configurar rotinas operacionais, catálogo, vendas e integrações.',
            'Objective guides to set up operations, catalog, sales, and integrations.'
          )}
        </p>
      </div>

      {/* Category Cards */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {t('Categorias de Tutoriais', 'Tutorial Categories')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/20 hover:bg-muted/20"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-foreground">
                {cat.icon}
              </div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground">
                  {cat.title}
                </h3>
                <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {cat.articles}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {cat.description}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {t('Abrir categoria', 'Open category')}
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Getting Started Steps */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Rocket className="h-4 w-4 text-muted-foreground" />
          {t('Primeiros Passos', 'Getting Started')}
        </h2>
        <div className="space-y-3">
          {gettingStartedSteps.map((step) => (
            <Link
              key={step.step}
              href={step.link}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/20 hover:bg-muted/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{step.icon}</span>
                  <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Tips */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          {t('Dicas Rápidas', 'Quick Tips')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickTips.map((tip) => (
            <div
              key={tip.title}
              className="rounded-lg border border-border bg-muted/20 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                {tip.icon}
                <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Explanations */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          {t('O que cada funcionalidade faz?', 'What does each feature do?')}
        </h2>
        <div className="grid gap-2">
          {featureExplanations.map((feat) => (
            <Link
              key={feat.title}
              href={feat.link}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/20 hover:bg-muted/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-foreground">
                {feat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-foreground">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Help Footer */}
      <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
          {t('Ainda precisa de ajuda?', 'Still need help?')}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
          {t(
            'Quando precisar de atendimento humano, abra o suporte com o contexto do problema e a tela em que ele acontece.',
            'When you need human help, open support with the issue context and the screen where it happens.'
          )}
              </p>
            </div>
          </div>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Headphones className="h-3.5 w-3.5 text-muted-foreground" />
            {t('Abrir suporte', 'Open support')}
          </Link>
        </div>
      </div>
    </div>
  );
}
