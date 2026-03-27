'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

/* --- Static blog posts --- */
const posts = [
  {
    slug: 'como-criar-loja-virtual-2026',
    title: 'Como criar sua loja virtual em 2026 � Guia completo',
    excerpt: 'Passo a passo para montar sua loja online do zero: plataforma, produtos, pagamentos e primeiras vendas.',
    category: 'Guias',
    readTime: '12 min',
    date: '2026-03-01',
    gradient: 'from-primary to-emerald-400',
    featured: true,
  },
  {
    slug: 'melhores-plataformas-ecommerce',
    title: 'Melhores plataformas de e-commerce para 2026',
    excerpt: 'Comparativo das principais plataformas para criar sua loja. Shopify, Nuvemshop, Lojaki e mais.',
    category: 'Comparativos',
    readTime: '8 min',
    date: '2026-02-25',
    gradient: 'from-blue-500 to-indigo-500',
    featured: false,
  },
  {
    slug: 'como-vender-pelo-instagram',
    title: 'Como vender pelo Instagram em 2026',
    excerpt: 'Estrat�gias para usar o Instagram como canal de vendas: cat�logo, stories, reels e shopping.',
    category: 'Marketing',
    readTime: '7 min',
    date: '2026-02-20',
    gradient: 'from-violet-500 to-purple-500',
    featured: false,
  },
  {
    slug: 'aumentar-conversao-ecommerce',
    title: '10 t�cnicas para aumentar a convers�o da sua loja',
    excerpt: 'Otimiza��es simples que podem dobrar sua taxa de convers�o: checkout, fotos, descri��es e mais.',
    category: 'Convers�o',
    readTime: '10 min',
    date: '2026-02-15',
    gradient: 'from-amber-500 to-orange-500',
    featured: false,
  },
  {
    slug: 'seo-para-ecommerce',
    title: 'SEO para e-commerce: guia definitivo',
    excerpt: 'Como aparecer no Google: palavras-chave, meta tags, conte�do e backlinks para lojas virtuais.',
    category: 'SEO',
    readTime: '15 min',
    date: '2026-02-10',
    gradient: 'from-teal-500 to-cyan-500',
    featured: false,
  },
  {
    slug: 'pix-para-ecommerce',
    title: 'PIX no e-commerce: vantagens e como implementar',
    excerpt: 'Por que o PIX � o meio de pagamento mais usado no Brasil e como integr�-lo na sua loja.',
    category: 'Pagamentos',
    readTime: '6 min',
    date: '2026-02-05',
    gradient: 'from-rose-500 to-pink-500',
    featured: false,
  },
  {
    slug: 'frete-ecommerce-brasil',
    title: 'Frete no e-commerce: como reduzir custos',
    excerpt: 'Dicas para diminuir gastos com frete e aumentar a satisfa��o do cliente com envios no Brasil.',
    category: 'Log�stica',
    readTime: '9 min',
    date: '2026-01-28',
    gradient: 'from-emerald-500 to-green-500',
    featured: false,
  },
  {
    slug: 'email-marketing-ecommerce',
    title: 'Email marketing para e-commerce: o guia pr�tico',
    excerpt: 'Automa��es essenciais: carrinho abandonado, p�s-venda, recompra e campanhas sazonais.',
    category: 'Marketing',
    readTime: '11 min',
    date: '2026-01-20',
    gradient: 'from-indigo-500 to-blue-500',
    featured: false,
  },
  {
    slug: 'dropshipping-brasil',
    title: 'Dropshipping no Brasil: vale a pena em 2026?',
    excerpt: 'An�lise completa do modelo de dropshipping: fornecedores, margens, prazos e melhores nichos.',
    category: 'Neg�cios',
    readTime: '13 min',
    date: '2026-01-15',
    gradient: 'from-pink-500 to-rose-500',
    featured: false,
  },
];

const categories = ['Todos', 'Guias', 'Marketing', 'Comparativos', 'SEO', 'Pagamentos', 'Convers�o', 'Log�stica', 'Neg�cios'];

export default function BlogPage() {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const featured = posts.find((p) => p.featured);
  const filtered = posts
    .filter((p) => !p.featured)
    .filter((p) => filter === 'Todos' || p.category === filter)
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()));

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* -- Navbar -- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-emerald-400 shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Lojaki</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pre�os</Link>
            <Link href="/blog" className="text-sm font-medium text-primary transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors">Entrar</Link>
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25">
              Come�ar gr�tis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* -- Hero -- */}
      <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-linear-to-b from-primary/8 via-emerald-100/30 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Blog Lojaki
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Dicas e guias para{' '}
            <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              vender mais
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Conte�do pr�tico sobre e-commerce, marketing digital, SEO e muito mais para impulsionar suas vendas.
          </motion.p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        {/* -- Featured post -- */}
        {featured && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mb-12">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-2xl hover:shadow-muted/60">
                <div className="grid md:grid-cols-2">
                  <div className={`aspect-[16/10] md:aspect-auto bg-linear-to-br ${featured.gradient} flex items-center justify-center`}>
                    <BookOpen className="h-20 w-20 text-white/30" />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{featured.category}</span>
                      <span className="text-xs text-muted-foreground/70 flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                      Ler artigo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* -- Filters -- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === cat
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* -- Articles grid -- */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <motion.div
              key={post.slug}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-xl hover:shadow-muted/80 hover:-translate-y-1">
                  <div className={`aspect-[16/9] bg-linear-to-br ${post.gradient} flex items-center justify-center`}>
                    <Tag className="h-10 w-10 text-white/20" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{post.category}</span>
                      <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs text-muted-foreground leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                      Ler mais <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
          </div>
        )}
      </main>

      {/* -- CTA -- */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-foreground md:text-4xl">
            Quer colocar em pr�tica?
          </h2>
          <p className="mt-3 text-muted-foreground">Crie sua loja gr�tis e aplique tudo que aprendeu aqui.</p>
          <div className="mt-6">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
              Come�ar gr�tis agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="border-t border-border bg-card px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground/70">� {new Date().getFullYear()} Lojaki. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
