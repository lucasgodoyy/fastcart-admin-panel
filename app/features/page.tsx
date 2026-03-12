'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CreditCard,
  Globe,
  Layers,
  LayoutDashboard,
  LineChart,
  Mail,
  MessageSquare,
  Package,
  Palette,
  Percent,
  Rocket,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  Users,
  Zap,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Category data ─── */
const categories = [
  {
    title: 'Gestão da Loja',
    description: 'Tudo para montar e configurar sua loja virtual profissional.',
    icon: Store,
    color: 'from-primary to-emerald-400',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    features: [
      { icon: Palette, name: 'Temas personalizáveis', desc: 'Escolha entre dezenas de temas modernos e adapte cores, fontes e layout.' },
      { icon: Globe, name: 'Domínio personalizado', desc: 'Conecte seu próprio domínio para uma presença profissional.' },
      { icon: Smartphone, name: 'Design responsivo', desc: 'Sua loja fica perfeita em celular, tablet e desktop.' },
      { icon: Search, name: 'SEO integrado', desc: 'Meta tags, sitemap automático, URLs amigáveis e schema markup.' },
    ],
  },
  {
    title: 'Produtos e Catálogo',
    description: 'Gerencie milhares de produtos com facilidade.',
    icon: Package,
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    features: [
      { icon: Package, name: 'Variações de produto', desc: 'Tamanho, cor, material — crie quantas variações precisar.' },
      { icon: Tag, name: 'Categorias e tags', desc: 'Organize seu catálogo com categorias hierárquicas e tags.' },
      { icon: Layers, name: 'Importação em massa', desc: 'Importe produtos via CSV e sincronize com marketplaces.' },
      { icon: Star, name: 'Avaliações de clientes', desc: 'Permita que compradores avaliem e comentem seus produtos.' },
    ],
  },
  {
    title: 'Pagamentos',
    description: 'Aceite todos os meios de pagamento populares do Brasil.',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    features: [
      { icon: CreditCard, name: 'Cartão de crédito', desc: 'Parcelamento automático com as melhores taxas do mercado.' },
      { icon: Zap, name: 'PIX instantâneo', desc: 'Receba com PIX e confirme pagamentos em segundos.' },
      { icon: Shield, name: 'Checkout seguro', desc: 'Certificado SSL, antifraude integrado e PCI compliance.' },
      { icon: Percent, name: 'Cupons e descontos', desc: 'Crie cupons, promoções relâmpago e desconto progressivo.' },
    ],
  },
  {
    title: 'Envio e Logística',
    description: 'Frete calculado automaticamente com as melhores opções.',
    icon: Truck,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    features: [
      { icon: Truck, name: 'Melhor Envio', desc: 'Integração nativa com cálculo automático de frete e rastreio.' },
      { icon: Package, name: 'Múltiplas transportadoras', desc: 'Correios, Jadlog, Loggi, Azul Cargo e mais.' },
      { icon: Settings, name: 'Frete grátis condicional', desc: 'Configure frete grátis por valor mínimo, região ou cupom.' },
      { icon: Bell, name: 'Rastreamento em tempo real', desc: 'Notificações automáticas de status do envio para o cliente.' },
    ],
  },
  {
    title: 'Marketing e Vendas',
    description: 'Ferramentas para atrair clientes e aumentar vendas.',
    icon: LineChart,
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    features: [
      { icon: Mail, name: 'Email marketing', desc: 'Campanhas automáticas de carrinho abandonado e pós-venda.' },
      { icon: ShoppingBag, name: 'Google Shopping', desc: 'Exporte feed de produtos para o Google Merchant Center.' },
      { icon: MessageSquare, name: 'Instagram e Facebook', desc: 'Integre catálogo com Meta para vender nas redes sociais.' },
      { icon: BarChart3, name: 'Analytics avançado', desc: 'Dashboard com métricas de conversão, funil e LTV.' },
    ],
  },
  {
    title: 'Gestão de Pedidos',
    description: 'Acompanhe cada pedido do início ao fim.',
    icon: ShoppingCart,
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    features: [
      { icon: LayoutDashboard, name: 'Dashboard de pedidos', desc: 'Visualize, filtre e exporte pedidos com facilidade.' },
      { icon: Users, name: 'Gestão de clientes', desc: 'Perfil completo com histórico de compras e segmentação.' },
      { icon: Bell, name: 'Notificações automáticas', desc: 'Emails automáticos de confirmação, envio e entrega.' },
      { icon: Rocket, name: 'Automação de status', desc: 'Fluxos automáticos de processamento e fulfillment.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-emerald-400 shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Lojaki</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#funcionalidades" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Funcionalidades</Link>
            <Link href="/#planos" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Planos</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Preços</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">Entrar</Link>
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Começar grátis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-linear-to-b from-primary/8 via-emerald-100/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb20_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb20_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        <div className="mx-auto max-w-4xl text-center px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Todas as funcionalidades
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Ferramentas profissionais para{' '}
            <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              seu e-commerce
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 md:text-xl leading-relaxed">
            De produtos a pagamentos, envio a marketing — tudo o que você precisa para construir uma loja online de sucesso.
          </motion.p>
        </div>
      </section>

      {/* ── Feature Categories ── */}
      <main className="pb-24">
        {categories.map((cat, catIndex) => (
          <Section key={cat.title} className={`py-16 md:py-24 ${catIndex % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-12">
                <motion.div variants={fadeUp} className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}>
                  <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                </motion.div>
                <motion.h2 variants={fadeUp} custom={1} className="text-2xl font-extrabold text-gray-900 md:text-4xl">{cat.title}</motion.h2>
                <motion.p variants={fadeUp} custom={2} className="mt-2 text-gray-500 max-w-xl">{cat.description}</motion.p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cat.features.map((feature, fi) => (
                  <motion.div
                    key={feature.name}
                    variants={scaleIn}
                    custom={fi}
                    className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-xl hover:shadow-gray-100/80 hover:-translate-y-1"
                  >
                    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cat.bg}`}>
                      <feature.icon className={`h-5 w-5 ${cat.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{feature.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        ))}
      </main>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl">
            Pronto para{' '}
            <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">começar?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Crie sua loja grátis e explore todas as funcionalidades. Sem cartão de crédito.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-primary to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
              Começar grátis agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-8 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Lojaki. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
