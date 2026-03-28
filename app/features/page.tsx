'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
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

/* --- Category data --- */
const categories = [
  {
    title: 'GestÃ£o da Loja',
    description: 'Tudo para montar e configurar sua loja virtual profissional.',
    icon: Store,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    features: [
      { icon: Palette, name: 'Temas personalizÃ¡veis', desc: 'Escolha entre dezenas de temas modernos e adapte cores, fontes e layout.' },
      { icon: Globe, name: 'DomÃ­nio personalizado', desc: 'Conecte seu prÃ³prio domÃ­nio para uma presenÃ§a profissional.' },
      { icon: Smartphone, name: 'Design responsivo', desc: 'Sua loja fica perfeita em celular, tablet e desktop.' },
      { icon: Search, name: 'SEO integrado', desc: 'Meta tags, sitemap automÃ¡tico, URLs amigÃ¡veis e schema markup.' },
    ],
  },
  {
    title: 'Produtos e CatÃ¡logo',
    description: 'Gerencie milhares de produtos com facilidade.',
    icon: Package,
    color: 'from-emerald-500 to-cyan-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    features: [
      { icon: Package, name: 'VariaÃ§Ãµes de produto', desc: 'Tamanho, cor, material Â crie quantas variaÃ§Ãµes precisar.' },
      { icon: Tag, name: 'Categorias e tags', desc: 'Organize seu catÃ¡logo com categorias hierÃ¡rquicas e tags.' },
      { icon: Layers, name: 'ImportaÃ§Ã£o em massa', desc: 'Importe produtos via CSV e sincronize com marketplaces.' },
      { icon: Star, name: 'AvaliaÃ§Ãµes de clientes', desc: 'Permita que compradores avaliem e comentem seus produtos.' },
    ],
  },
  {
    title: 'Pagamentos',
    description: 'Aceite todos os meios de pagamento populares do Brasil.',
    icon: CreditCard,
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-700',
    features: [
      { icon: CreditCard, name: 'CartÃ£o de crÃ©dito', desc: 'Parcelamento automÃ¡tico com as melhores taxas do mercado.' },
      { icon: Zap, name: 'PIX instantÃ¢neo', desc: 'Receba com PIX e confirme pagamentos em segundos.' },
      { icon: Shield, name: 'Checkout seguro', desc: 'Certificado SSL, antifraude integrado e PCI compliance.' },
      { icon: Percent, name: 'Cupons e descontos', desc: 'Crie cupons, promoÃ§Ãµes relÃ¢mpago e desconto progressivo.' },
    ],
  },
  {
    title: 'Envio e LogÃ­stica',
    description: 'Frete calculado automaticamente com as melhores opÃ§Ãµes.',
    icon: Truck,
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    features: [
      { icon: Truck, name: 'Melhor Envio', desc: 'IntegraÃ§Ã£o nativa com cÃ¡lculo automÃ¡tico de frete e rastreio.' },
      { icon: Package, name: 'MÃºltiplas transportadoras', desc: 'Correios, Jadlog, Loggi, Azul Cargo e mais.' },
      { icon: Settings, name: 'Frete grÃ¡tis condicional', desc: 'Configure frete grÃ¡tis por valor mÃ­nimo, regiÃ£o ou cupom.' },
      { icon: Bell, name: 'Rastreamento em tempo real', desc: 'NotificaÃ§Ãµes automÃ¡ticas de status do envio para o cliente.' },
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
      { icon: Mail, name: 'Email marketing', desc: 'Campanhas automÃ¡ticas de carrinho abandonado e pÃ³s-venda.' },
      { icon: ShoppingBag, name: 'Google Shopping', desc: 'Exporte feed de produtos para o Google Merchant Center.' },
      { icon: MessageSquare, name: 'Instagram e Facebook', desc: 'Integre catÃ¡logo com Meta para vender nas redes sociais.' },
      { icon: BarChart3, name: 'Analytics avanÃ§ado', desc: 'Dashboard com mÃ©tricas de conversÃ£o, funil e LTV.' },
    ],
  },
  {
    title: 'GestÃ£o de Pedidos',
    description: 'Acompanhe cada pedido do inÃ­cio ao fim.',
    icon: ShoppingCart,
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    features: [
      { icon: LayoutDashboard, name: 'Dashboard de pedidos', desc: 'Visualize, filtre e exporte pedidos com facilidade.' },
      { icon: Users, name: 'GestÃ£o de clientes', desc: 'Perfil completo com histÃ³rico de compras e segmentaÃ§Ã£o.' },
      { icon: Bell, name: 'NotificaÃ§Ãµes automÃ¡ticas', desc: 'Emails automÃ¡ticos de confirmaÃ§Ã£o, envio e entrega.' },
      { icon: Rocket, name: 'AutomaÃ§Ã£o de status', desc: 'Fluxos automÃ¡ticos de processamento e fulfillment.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* -- Navbar -- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Lojaki</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planos</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">PreÃ§os</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors">Entrar</Link>
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
              ComeÃ§ar grÃ¡tis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* -- Hero -- */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-150 w-200 -translate-x-1/2 rounded-full bg-linear-to-b from-emerald-100/60 via-teal-50/40 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb20_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb20_1px,transparent_1px)] bg-size-[4rem_4rem]" />
        </div>
        <div className="mx-auto max-w-4xl text-center px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Todas as funcionalidades
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Ferramentas profissionais para{' '}
            <span className="bg-linear-to-r from-emerald-700 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              seu e-commerce
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            De produtos a pagamentos, envio a marketing Â tudo o que vocÃª precisa para construir uma loja online de sucesso.
          </motion.p>
        </div>
      </section>

      {/* -- Feature Categories -- */}
      <main className="pb-24">
        {categories.map((cat, catIndex) => (
          <Section key={cat.title} className={`py-16 md:py-24 ${catIndex % 2 === 1 ? 'bg-muted/30' : ''}`}>
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-12">
                <motion.div variants={fadeUp} className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${cat.bg}`}>
                  <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                </motion.div>
                <motion.h2 variants={fadeUp} custom={1} className="text-2xl font-extrabold text-foreground md:text-4xl">{cat.title}</motion.h2>
                <motion.p variants={fadeUp} custom={2} className="mt-2 text-muted-foreground max-w-xl">{cat.description}</motion.p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cat.features.map((feature, fi) => (
                  <motion.div
                    key={feature.name}
                    variants={scaleIn}
                    custom={fi}
                    className="group rounded-lg border border-border bg-card p-6 transition-all hover:shadow-xl hover:shadow-muted/80 hover:-translate-y-1"
                  >
                    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cat.bg}`}>
                      <feature.icon className={`h-5 w-5 ${cat.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{feature.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        ))}
      </main>

      {/* -- CTA -- */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-foreground md:text-5xl">
            Pronto para{' '}
            <span className="bg-linear-to-r from-emerald-700 to-teal-500 bg-clip-text text-transparent">começar?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Crie sua loja grÃ¡tis e explore todas as funcionalidades. Sem cartÃ£o de crÃ©dito.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
              ComeÃ§ar grÃ¡tis agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="border-t border-border bg-card px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground/70">Â© {new Date().getFullYear()} Lojaki. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
