'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

/* ── Static blog content (placeholder) ── */
const articles: Record<string, { title: string; category: string; readTime: string; date: string; gradient: string; content: string }> = {
  'como-criar-loja-virtual-2026': {
    title: 'Como criar sua loja virtual em 2026 — Guia completo',
    category: 'Guias',
    readTime: '12 min',
    date: '2026-03-01',
    gradient: 'from-primary to-emerald-400',
    content: `
      <h2>1. Escolha a plataforma certa</h2>
      <p>A escolha da plataforma é o primeiro passo mais importante. Você precisa de algo que seja fácil de usar, escalável e que ofereça todas as ferramentas necessárias para vender online.</p>
      <p>A Lojaki é uma plataforma brasileira que combina simplicidade com funcionalidades avançadas — perfeita para quem está começando e para quem já vende bastante.</p>
      
      <h2>2. Configure seus produtos</h2>
      <p>Cadastre seus produtos com fotos de alta qualidade, descrições detalhadas e preços competitivos. Use variações para oferecer tamanhos, cores e outros atributos.</p>
      <p>Dica: invista em fotos com fundo branco e descrições que respondam as principais dúvidas do cliente.</p>
      
      <h2>3. Configure os pagamentos</h2>
      <p>Ofereça múltiplas opções de pagamento: PIX (confirmação instantânea), cartão de crédito com parcelamento, boleto e carteiras digitais. Quanto mais opções, maior a conversão.</p>
      
      <h2>4. Configure o frete</h2>
      <p>Integre com o Melhor Envio para calcular frete automaticamente e oferecer múltiplas transportadoras. Configure frete grátis condicional para pedidos acima de determinado valor.</p>
      
      <h2>5. Publique e divulgue</h2>
      <p>Com tudo configurado, publique sua loja! Compartilhe nas redes sociais, invista em Google Ads e SEO para atrair clientes.</p>
    `,
  },
  'melhores-plataformas-ecommerce': {
    title: 'Melhores plataformas de e-commerce para 2026',
    category: 'Comparativos',
    readTime: '8 min',
    date: '2026-02-25',
    gradient: 'from-blue-500 to-indigo-500',
    content: `
      <h2>Panorama do mercado em 2026</h2>
      <p>O mercado de e-commerce no Brasil não para de crescer. Escolher a plataforma certa é fundamental para o sucesso do seu negócio online.</p>
      
      <h2>Shopify</h2>
      <p>Líder global, mas com preços em dólar e suporte limitado em português. Boa para operações internacionais.</p>
      
      <h2>Nuvemshop</h2>
      <p>Popular na América Latina, com foco no mercado brasileiro. Boa variedade de temas.</p>
      
      <h2>Lojaki</h2>
      <p>Plataforma brasileira moderna com painel administrativo completo, integração nativa com meios de pagamento brasileiros e frete via Melhor Envio. Destaque para o plano gratuito que permite começar sem investimento.</p>
      
      <h2>Conclusão</h2>
      <p>A melhor plataforma depende do seu momento e necessidade. Para quem está começando no Brasil, a Lojaki oferece o melhor custo-benefício.</p>
    `,
  },
};

const defaultArticle = {
  title: 'Artigo em breve',
  category: 'Blog',
  readTime: '5 min',
  date: '2026-03-01',
  gradient: 'from-gray-400 to-gray-500',
  content: '<p>Este artigo está sendo produzido e será publicado em breve. Fique de olho!</p>',
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const article = articles[slug] || { ...defaultArticle, title: slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Artigo' };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 shadow-lg shadow-primary/25">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Lojaki</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="/signup" className="rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25">
              Começar grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* Article */}
      <article className="pt-28 pb-20">
        {/* Header */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${article.gradient} py-16 md:py-24`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-6">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao blog
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex items-center justify-center gap-3 mb-4">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{article.category}</span>
              <span className="flex items-center gap-1 text-xs text-white/70"><Clock className="h-3 w-3" /> {article.readTime}</span>
              <span className="flex items-center gap-1 text-xs text-white/70"><Calendar className="h-3 w-3" /> {formatDate(article.date)}</span>
            </motion.div>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-3xl font-extrabold md:text-5xl leading-tight">
              {article.title}
            </motion.h1>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-6 mt-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="prose prose-gray prose-lg max-w-none
              prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Pronto para criar sua loja?</h2>
          <p className="mt-3 text-gray-500">Comece grátis e ponha em prática tudo que você leu.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
              Começar grátis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/blog" className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Mais artigos
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-8 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Lojaki. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
