'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  LayoutDashboard,
  LineChart,
  Menu,
  MessageSquare,
  Package,
  Palette,
  Rocket,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function useAnimateInView() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return { ref, inView };
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════ */
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-emerald-400 shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">RapidoCart</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Funcionalidades
          </a>
          <a href="#como-funciona" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Como funciona
          </a>
          <a href="#planos" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Planos
          </a>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Preços
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            Começar grátis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-700">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden border-t border-gray-100 bg-white px-6 pb-4"
        >
          <div className="flex flex-col gap-3 py-3">
            <a href="#funcionalidades" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2">Funcionalidades</a>
            <a href="#como-funciona" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2">Como funciona</a>
            <a href="#planos" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2">Planos</a>
            <Link href="/pricing" className="text-sm font-medium text-gray-700 py-2">Preços</Link>
            <hr className="my-1 border-gray-100" />
            <Link href="/login" className="text-sm font-medium text-gray-700 py-2">Entrar</Link>
            <Link href="/signup" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white text-center">
              Começar grátis
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-linear-to-b from-primary/8 via-emerald-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-linear-to-bl from-teal-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-50/50 to-transparent rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb20_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb20_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma de e-commerce completa
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Crie sua loja online{' '}
            <span className="relative">
              <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                em minutos
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 md:text-xl leading-relaxed"
          >
            Tudo que você precisa para vender online — produtos, pedidos, pagamentos e envios.
            Simples, rápido e sem complicações.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-primary to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <span className="relative flex items-center gap-2">
                Começar grátis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              Como funciona
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </a>
          </motion.div>

          {/* Social proof mini */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {[
                'bg-linear-to-br from-amber-400 to-orange-500',
                'bg-linear-to-br from-blue-400 to-indigo-500',
                'bg-linear-to-br from-pink-400 to-rose-500',
                'bg-linear-to-br from-emerald-400 to-teal-500',
                'bg-linear-to-br from-violet-400 to-purple-500',
              ].map((bg, i) => (
                <div key={i} className={`h-8 w-8 rounded-full ${bg} ring-2 ring-white flex items-center justify-center`}>
                  <Users className="h-3.5 w-3.5 text-white/90" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">2.500+</span> lojistas já usam
              </p>
            </div>
          </motion.div>
        </div>

        {/* Hero visual — dashboard mockup */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="relative rounded-2xl border border-gray-200/80 bg-white p-2 shadow-2xl shadow-gray-200/60 ring-1 ring-gray-100">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="ml-4 flex-1 rounded-lg bg-gray-50 px-4 py-1.5 text-xs text-gray-400 font-mono">
                app.rapidocart.com.br/admin/dashboard
              </div>
            </div>
            {/* Dashboard mockup content */}
            <div className="grid grid-cols-12 gap-3 p-4">
              {/* Sidebar */}
              <div className="col-span-3 hidden md:block rounded-xl bg-gray-900 p-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">RapidoCart</span>
                </div>
                {['Dashboard', 'Produtos', 'Pedidos', 'Clientes', 'Marketing'].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 mb-1 text-xs font-medium ${
                      i === 0
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {[LayoutDashboard, Package, ShoppingBag, Users, LineChart][i] &&
                      (() => {
                        const Icon = [LayoutDashboard, Package, ShoppingBag, Users, LineChart][i];
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                    {item}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="col-span-12 md:col-span-9 space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Vendas hoje', value: 'R$ 4.280', change: '+12%', color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Pedidos', value: '34', change: '+8%', color: 'text-blue-600 bg-blue-50' },
                    { label: 'Visitantes', value: '1.247', change: '+22%', color: 'text-violet-600 bg-violet-50' },
                    { label: 'Conversão', value: '3.2%', change: '+0.4%', color: 'text-amber-600 bg-amber-50' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-3">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">{stat.value}</p>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${stat.color}`}>
                        {stat.change}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-700">Vendas (últimos 7 dias)</p>
                    <span className="text-[10px] text-gray-400">Atualizado agora</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-24">
                    {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                        className="flex-1 rounded-md bg-gradient-to-t from-primary to-emerald-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute -left-4 top-1/3 hidden lg:flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Novo pedido!</p>
              <p className="text-[10px] text-gray-400">R$ 189,90 — agora</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute -right-4 top-1/4 hidden lg:flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Pagamento confirmado</p>
              <p className="text-[10px] text-gray-400">PIX • R$ 340,00</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRUST BAR — STATS
   ═══════════════════════════════════════════════════════════ */
function TrustBar() {
  const { ref, inView } = useAnimateInView();

  const stats = [
    { value: '2.500+', label: 'Lojas criadas' },
    { value: '150k+', label: 'Produtos cadastrados' },
    { value: '99.9%', label: 'Uptime garantido' },
    { value: '24/7', label: 'Suporte ativo' },
  ];

  return (
    <section ref={ref} className="relative bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-teal-400/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
              <p className="text-3xl font-extrabold text-white md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-emerald-100">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURES SECTION
   ═══════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const { ref, inView } = useAnimateInView();

  const features = [
    {
      icon: Store,
      title: 'Loja personalizável',
      description: 'Temas profissionais prontos para usar. Personalize cores, fontes e layout sem precisar programar.',
      color: 'from-primary to-emerald-400',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Package,
      title: 'Gestão de produtos',
      description: 'Cadastre produtos com variações, estoque, imagens e SEO. Importe em massa via CSV.',
      color: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: CreditCard,
      title: 'Pagamentos integrados',
      description: 'PIX, cartão de crédito, boleto e mais. Integração com Mercado Pago, Stripe e PagSeguro.',
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      icon: Truck,
      title: 'Envio inteligente',
      description: 'Melhor Envio integrado com cálculo automático de frete. Correios, Jadlog, Loggi e mais.',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: LineChart,
      title: 'Analytics e relatórios',
      description: 'Dashboard completo com vendas, visitantes, conversão e ticket médio em tempo real.',
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      icon: Search,
      title: 'SEO otimizado',
      description: 'Meta tags, sitemap, URLs amigáveis e performance otimizada para aparecer no Google.',
      color: 'from-teal-500 to-cyan-500',
      bg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ];

  return (
    <section id="funcionalidades" ref={ref} className="relative py-24 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-linear-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Rocket className="h-3.5 w-3.5" />
            Funcionalidades
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Tudo que sua loja precisa{' '}
            <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              em um só lugar
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-gray-500">
            Ferramentas poderosas para criar, gerenciar e escalar seu e-commerce.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              custom={i}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:shadow-xl hover:shadow-gray-100/80 hover:-translate-y-1"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
              {/* Hover gradient line */}
              <div className={`absolute bottom-0 left-0 h-0.5 w-0 bg-linear-to-r ${feature.color} transition-all duration-500 group-hover:w-full`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════ */
function HowItWorks() {
  const { ref, inView } = useAnimateInView();

  const steps = [
    {
      step: '01',
      title: 'Crie sua conta',
      description: 'Cadastre-se em segundos. Sem cartão de crédito, sem taxa de setup.',
      icon: Users,
      color: 'from-primary to-emerald-400',
    },
    {
      step: '02',
      title: 'Configure sua loja',
      description: 'Escolha um tema, adicione seus produtos e configure pagamentos.',
      icon: Palette,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      step: '03',
      title: 'Comece a vender',
      description: 'Publique sua loja e comece a receber pedidos imediatamente.',
      icon: Rocket,
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <section id="como-funciona" ref={ref} className="relative py-24 md:py-32 bg-gradient-to-br from-emerald-800 via-green-700 to-teal-800 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Simples e rápido
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Comece a vender em{' '}
            <span className="text-emerald-200">3 passos</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-emerald-100/80">
            Sem complicações. Crie sua loja virtual e comece a faturar.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div key={step.step} variants={fadeUp} custom={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-linear-to-r from-white/20 to-white/5" />
              )}
              <div className={`relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg`}>
                <step.icon className="h-10 w-10 text-white" />
                <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-800 shadow-md">
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 mx-auto max-w-xs text-sm text-emerald-100/80 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT SHOWCASE — STOREFRONT PREVIEW
   ═══════════════════════════════════════════════════════════ */
function ProductShowcase() {
  const { ref, inView } = useAnimateInView();

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Globe className="h-3.5 w-3.5" />
              Sua loja, do seu jeito
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Storefronts profissionais que{' '}
              <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                vendem
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-gray-500 leading-relaxed">
              Seus clientes terão uma experiência de compra incrível. Responsivo, rápido e otimizado para conversão.
            </motion.p>

            <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="mt-8 space-y-4">
              {[
                'Temas modernos e responsivos',
                'Carrinho e checkout otimizados',
                'Busca inteligente de produtos',
                'Avaliações de clientes',
                'Domínio personalizado',
              ].map((item, i) => (
                <motion.div key={item} variants={fadeUp} custom={i + 3} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} custom={8} className="mt-8">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Criar minha loja
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Store mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="relative"
          >
            <div className="rounded-2xl border border-gray-200/80 bg-white p-2 shadow-2xl shadow-gray-200/60 ring-1 ring-gray-100">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-gray-50 px-4 py-1.5 text-xs text-gray-400 font-mono">
                  minhaloja.rapidocart.com.br
                </div>
              </div>
              {/* Store content */}
              <div className="p-5">
                {/* Store nav */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-gray-900">Moda Elegante</span>
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <ShoppingBag className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {/* Product grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Camiseta Premium', price: 'R$ 89,90', color: 'from-slate-200 to-slate-300' },
                    { name: 'Vestido Midi', price: 'R$ 159,90', color: 'from-rose-200 to-rose-300' },
                    { name: 'Jaqueta Jeans', price: 'R$ 219,90', color: 'from-blue-200 to-blue-300' },
                    { name: 'Tênis Sport', price: 'R$ 299,90', color: 'from-emerald-200 to-emerald-300' },
                  ].map((product) => (
                    <div key={product.name} className="group cursor-pointer">
                      <div className={`aspect-[4/5] rounded-xl bg-linear-to-br ${product.color} mb-2 transition-transform group-hover:scale-[1.02]`} />
                      <p className="text-xs font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <LineChart className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Conversão</p>
                  <p className="text-sm font-bold text-gray-900">4.8% <span className="text-emerald-500 text-xs">↑</span></p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTEGRATIONS
   ═══════════════════════════════════════════════════════════ */
function IntegrationsSection() {
  const { ref, inView } = useAnimateInView();

  const integrations = [
    { name: 'Mercado Pago', category: 'Pagamento' },
    { name: 'PIX', category: 'Pagamento' },
    { name: 'Stripe', category: 'Pagamento' },
    { name: 'PagSeguro', category: 'Pagamento' },
    { name: 'Melhor Envio', category: 'Envio' },
    { name: 'Correios', category: 'Envio' },
    { name: 'Jadlog', category: 'Envio' },
    { name: 'Google Analytics', category: 'Analytics' },
    { name: 'Meta Pixel', category: 'Marketing' },
    { name: 'Google Shopping', category: 'Vendas' },
    { name: 'Instagram', category: 'Vendas' },
    { name: 'Mailchimp', category: 'Email' },
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-400/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-100">
            <Shield className="h-3.5 w-3.5" />
            Integrações
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Conecte com suas{' '}
            <span className="text-emerald-200">
              ferramentas favoritas
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-emerald-100/80">
            Pagamentos, envios, marketing e mais — tudo integrado nativamente.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              variants={scaleIn}
              custom={i}
              className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-all hover:bg-white/20 hover:-translate-y-1 hover:border-white/25"
            >
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <span className="text-lg font-bold text-white/70 group-hover:text-white transition-colors">
                  {integration.name.charAt(0)}
                </span>
              </div>
              <p className="text-xs font-semibold text-white text-center">{integration.name}</p>
              <span className="text-[10px] text-emerald-200/70">{integration.category}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const { ref, inView } = useAnimateInView();

  const testimonials = [
    {
      quote: 'Migrei minha loja para a RapidoCart e em 2 semanas já tinha dobrado minha conversão. A plataforma é incrivelmente intuitiva.',
      name: 'Ana Beatriz Costa',
      role: 'Fundadora, Bella Store',
      initials: 'AC',
      color: 'from-rose-400 to-pink-500',
    },
    {
      quote: 'O suporte é sensacional. Toda vez que preciso de ajuda, a equipe resolve rápido. Melhor plataforma que já usei.',
      name: 'Carlos Mendes',
      role: 'CEO, TechWear Brasil',
      initials: 'CM',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      quote: 'Com a RapidoCart consegui colocar minha loja no ar em um dia. O checkout integrado com PIX foi um game changer.',
      name: 'Juliana Ferreira',
      role: 'Proprietária, JF Acessórios',
      initials: 'JF',
      color: 'from-amber-400 to-orange-500',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-linear-to-r from-primary/3 via-emerald-100/20 to-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            Depoimentos
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Quem usa,{' '}
            <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              recomenda
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={scaleIn}
              custom={i}
              className="relative rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:shadow-xl hover:shadow-gray-100/80"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600 mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING SECTION
   ═══════════════════════════════════════════════════════════ */
function PricingSection() {
  const { ref, inView } = useAnimateInView();

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      popular: false,
      features: [
        '1 loja',
        'Até 10 produtos',
        'Checkout integrado',
        'Suporte por email',
        'Temas básicos',
        'SSL grátis',
      ],
    },
    {
      name: 'Pro',
      price: 'R$ 79',
      period: '/mês',
      description: 'Para quem quer crescer',
      popular: true,
      features: [
        'Até 3 lojas',
        'Produtos ilimitados',
        'Domínio personalizado',
        'Relatórios avançados',
        'Suporte prioritário',
        'Temas premium',
        'Cupons e promoções',
        'Google Shopping',
      ],
    },
    {
      name: 'Enterprise',
      price: 'R$ 199',
      period: '/mês',
      description: 'Para grandes operações',
      popular: false,
      features: [
        'Lojas ilimitadas',
        'Produtos ilimitados',
        'API dedicada',
        'Gerente de conta',
        'SLA garantido',
        'Multi-usuário',
        'Relatórios customizados',
        'Suporte 24/7',
      ],
    },
  ];

  return (
    <section id="planos" ref={ref} className="relative py-24 md:py-32 bg-gradient-to-br from-emerald-800 via-green-700 to-teal-800 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Planos
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Escolha o plano{' '}
            <span className="text-emerald-200">
              ideal para você
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-emerald-100/80">
            Comece grátis. Escale quando precisar. Sem surpresas.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              custom={i}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-primary/30 bg-white shadow-lg shadow-primary/5 ring-1 ring-primary/10 scale-[1.02]'
                  : 'border-gray-100 bg-white hover:shadow-gray-100/80'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-primary to-emerald-500 px-4 py-1 text-[11px] font-bold text-white shadow-lg shadow-primary/25">
                  Mais popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <Check className={`h-3 w-3 ${plan.popular ? 'text-primary' : 'text-gray-500'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                  plan.popular
                    ? 'bg-linear-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════ */
function FinalCTA() {
  const { ref, inView } = useAnimateInView();

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-16 md:px-16 md:py-24 text-center"
        >
          {/* Background effects */}
          <div className="absolute inset-0 -z-0">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[80px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          </div>

          <div className="relative z-10">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={0}
              className="text-3xl font-extrabold text-white md:text-5xl lg:text-6xl"
            >
              Pronto para criar sua{' '}
              <span className="bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                loja online?
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={1}
              className="mx-auto mt-4 max-w-xl text-lg text-gray-400"
            >
              Junte-se a milhares de lojistas que já vendem com a RapidoCart. Comece grátis — não precisa de cartão.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={2}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-primary to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Começar grátis agora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-800/50 px-8 py-4 text-base font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-all"
              >
                Ver funcionalidades
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer() {
  const links = {
    Produto: [
      { label: 'Funcionalidades', href: '#funcionalidades' },
      { label: 'Planos', href: '#planos' },
      { label: 'Preços', href: '/pricing' },
      { label: 'Integrações', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
    Recursos: [
      { label: 'Blog', href: '/blog' },
      { label: 'Central de ajuda', href: '#' },
      { label: 'Guias', href: '#' },
      { label: 'API Docs', href: '#' },
      { label: 'Status', href: '#' },
    ],
    Empresa: [
      { label: 'Sobre nós', href: '#' },
      { label: 'Carreiras', href: '#' },
      { label: 'Contato', href: '#' },
      { label: 'Parceiros', href: '#' },
    ],
    Legal: [
      { label: 'Termos de uso', href: '#' },
      { label: 'Privacidade', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-emerald-400 shadow-lg shadow-primary/25">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">RapidoCart</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              A plataforma de e-commerce mais simples do Brasil. Crie, gerencie e escale sua loja online.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} RapidoCart. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Feito com ❤️ no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <HowItWorks />
        <ProductShowcase />
        <IntegrationsSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
