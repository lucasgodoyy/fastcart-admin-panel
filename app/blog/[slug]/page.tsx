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

/* -- Static blog content (placeholder) -- */
const articles: Record<string, { title: string; category: string; readTime: string; date: string; gradient: string; content: string }> = {
  'como-criar-loja-virtual-2026': {
    title: 'Como criar sua loja virtual em 2026 � Guia completo',
    category: 'Guias',
    readTime: '12 min',
    date: '2026-03-01',
    gradient: 'from-primary to-emerald-400',
    content: `
      <h2>1. Escolha a plataforma certa</h2>
      <p>A escolha da plataforma � o primeiro passo mais importante. Voc� precisa de algo que seja f�cil de usar, escal�vel e que ofere�a todas as ferramentas necess�rias para vender online.</p>
      <p>A Lojaki � uma plataforma brasileira que combina simplicidade com funcionalidades avan�adas � perfeita para quem est� come�ando e para quem j� vende bastante.</p>
      
      <h2>2. Configure seus produtos</h2>
      <p>Cadastre seus produtos com fotos de alta qualidade, descri��es detalhadas e pre�os competitivos. Use varia��es para oferecer tamanhos, cores e outros atributos.</p>
      <p>Dica: invista em fotos com fundo branco e descri��es que respondam as principais d�vidas do cliente.</p>
      
      <h2>3. Configure os pagamentos</h2>
      <p>Ofere�a m�ltiplas op��es de pagamento: PIX (confirma��o instant�nea), cart�o de cr�dito com parcelamento, boleto e carteiras digitais. Quanto mais op��es, maior a convers�o.</p>
      
      <h2>4. Configure o frete</h2>
      <p>Integre com o Melhor Envio para calcular frete automaticamente e oferecer m�ltiplas transportadoras. Configure frete gr�tis condicional para pedidos acima de determinado valor.</p>
      
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
      <p>O mercado de e-commerce no Brasil n�o para de crescer. Escolher a plataforma certa � fundamental para o sucesso do seu neg�cio online.</p>
      
      <h2>Shopify</h2>
      <p>L�der global, mas com pre�os em d�lar e suporte limitado em portugu�s. Boa para opera��es internacionais.</p>
      
      <h2>Nuvemshop</h2>
      <p>Popular na Am�rica Latina, com foco no mercado brasileiro. Boa variedade de temas.</p>
      
      <h2>Lojaki</h2>
      <p>Plataforma brasileira moderna com painel administrativo completo, integra��o nativa com meios de pagamento brasileiros e frete via Melhor Envio. Destaque para o plano gratuito que permite come�ar sem investimento.</p>
      
      <h2>Conclus�o</h2>
      <p>A melhor plataforma depende do seu momento e necessidade. Para quem est� come�ando no Brasil, a Lojaki oferece o melhor custo-benef�cio.</p>
    `,
  },
};

const defaultArticle = {
  title: 'Artigo em breve',
  category: 'Blog',
  readTime: '5 min',
  date: '2026-03-01',
  gradient: 'from-gray-400 to-gray-500',
  content: '<p>Este artigo est� sendo produzido e ser� publicado em breve. Fique de olho!</p>',
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const article = articles[slug] || { ...defaultArticle, title: slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Artigo' };

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-emerald-400 shadow-lg shadow-primary/25">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Lojaki</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="/signup" className="rounded-lg bg-linear-to-r from-primary to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25">
              Come�ar gr�tis
            </Link>
          </div>
        </nav>
      </header>

      {/* Article */}
      <article className="pt-28 pb-20">
        {/* Header */}
        <div className={`relative overflow-hidden bg-linear-to-br ${article.gradient} py-16 md:py-24`}>
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
              prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* CTA */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">Pronto para criar sua loja?</h2>
          <p className="mt-3 text-muted-foreground">Comece gr�tis e ponha em pr�tica tudo que voc� leu.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
              Come�ar gr�tis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/blog" className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground/80 hover:bg-muted transition-colors">
              Mais artigos
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground/70">� {new Date().getFullYear()} Lojaki. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
