'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
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
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (index: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1] as const,
    },
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

const heroStats = [
  { value: '3x', label: 'mais velocidade para colocar a loja no ar' },
  { value: '12 min', label: 'para publicar catalogo, pagamento e frete' },
  { value: '24/7', label: 'visao da operacao com vendas e suporte ativo' },
];

const commandMetrics = [
  { label: 'Receita hoje', value: 'R$ 18.420', change: '+14,8%', tone: 'text-emerald-300' },
  { label: 'Pedidos pagos', value: '128', change: '+9,2%', tone: 'text-lime-300' },
  { label: 'Conversao', value: '4,7%', change: '+0,6%', tone: 'text-teal-300' },
  { label: 'CAC medio', value: 'R$ 21', change: '-11,4%', tone: 'text-emerald-300' },
];

const pillars = [
  {
    icon: LayoutDashboard,
    title: 'Controle comercial em tempo real',
    description:
      'Pedidos, estoque, pagamentos, campanhas e performance reunidos numa mesa de comando unica.',
  },
  {
    icon: Store,
    title: 'Lojas com cara de marca grande',
    description:
      'Templates premium, paginas leves e componentes que valorizam produto, ticket medio e recorrencia.',
  },
  {
    icon: Rocket,
    title: 'Infra pronta para crescer',
    description:
      'Operacao estruturada para trafego pago, social commerce, equipe e picos de demanda sem improviso.',
  },
];

const commerceCards = [
  {
    icon: CreditCard,
    title: 'Checkout direto ao ponto',
    text: 'PIX, cartao, boleto e recuperacao de abandono com menos friccao na hora de fechar o pedido.',
  },
  {
    icon: Truck,
    title: 'Frete e logistica plugados',
    text: 'Regras de envio, cotacao automatica e fluxo operacional conectado com o que acontece no caixa.',
  },
  {
    icon: Search,
    title: 'Catalogo pensado para vender',
    text: 'SEO, colecoes, vitrines, busca e navegacao desenhados para encurtar o caminho ate a compra.',
  },
  {
    icon: MessageSquare,
    title: 'Relacao com cliente ativa',
    text: 'Campanhas, remarketing e mensagens alinhadas ao historico real de compra e comportamento.',
  },
];

const channelCards = [
  {
    title: 'Loja principal',
    subtitle: 'Seu dominio, sua experiencia, sua margem.',
    accent: 'from-emerald-500/30 to-emerald-300/5',
  },
  {
    title: 'Instagram e social',
    subtitle: 'Produtos e campanhas coordenados com a operacao.',
    accent: 'from-teal-500/25 to-transparent',
  },
  {
    title: 'Marketplace e catalogos',
    subtitle: 'Sortimento e precificacao ajustados por canal.',
    accent: 'from-lime-500/20 to-transparent',
  },
  {
    title: 'Equipe comercial',
    subtitle: 'Painel unico para atendimento, pedidos e insights.',
    accent: 'from-emerald-500/20 to-transparent',
  },
];

const steps = [
  {
    step: '01',
    title: 'Estruture a base da sua marca',
    text: 'Escolha o visual, organize o catalogo e defina a proposta comercial sem depender de setup complexo.',
  },
  {
    step: '02',
    title: 'Conecte pagamentos, frete e canais',
    text: 'Ligue as partes que fazem a operacao girar e acompanhe tudo por um painel que mostra o que importa.',
  },
  {
    step: '03',
    title: 'Otimize e escale com dados',
    text: 'Ajuste criativos, colecoes, mix de produtos e campanha com base no que esta trazendo receita de verdade.',
  },
];

const testimonials = [
  {
    quote:
      'A virada nao foi so estetica. A operacao ficou mais clara, o time responde mais rapido e a loja passou a converter melhor.',
    author: 'Marina Farias',
    role: 'Fundadora, Marea Studio',
  },
  {
    quote:
      'Antes eu tinha ferramenta demais e controle de menos. Agora a marca tem uma estrutura que parece empresa grande, mas continua simples de operar.',
    author: 'Leonardo Braga',
    role: 'Diretor, North Supply',
  },
  {
    quote:
      'A melhor parte foi sair do visual generico. A loja ganhou mais presenca, e a administracao deixou de ser uma colcha de retalhos.',
    author: 'Camila Rezende',
    role: 'CEO, Casa Aurora',
  },
];

const plans = [
  {
    name: 'Start',
    price: 'R$ 59',
    description: 'Para colocar a operacao no ar com base profissional.',
    featured: false,
    items: ['Catalogo completo', 'Checkout integrado', 'Temas premium', 'Relatorios essenciais'],
  },
  {
    name: 'Growth',
    price: 'R$ 129',
    description: 'Para marcas que querem crescer com mais margem e controle.',
    featured: true,
    items: ['Automacoes', 'Cupons e campanhas', 'Equipe e permissoes', 'Insights avancados', 'Suporte prioritario'],
  },
  {
    name: 'Scale',
    price: 'Sob consulta',
    description: 'Para operacoes que exigem acompanhamento, performance e estrutura.',
    featured: false,
    items: ['Multioperacao', 'Fluxos customizados', 'SLA dedicado', 'Acompanhamento estrategico'],
  },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 shadow-[0_0_40px_rgba(16,185,129,0.18)] transition-transform group-hover:scale-105">
            <Zap className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-white">Lojaki</span>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-white/45">commerce operating system</span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#plataforma" className="text-sm font-medium text-white/65 transition-colors hover:text-white">
            Plataforma
          </a>
          <a href="#operacao" className="text-sm font-medium text-white/65 transition-colors hover:text-white">
            Operacao
          </a>
          <a href="#depoimentos" className="text-sm font-medium text-white/65 transition-colors hover:text-white">
            Resultados
          </a>
          <a href="#planos" className="text-sm font-medium text-white/65 transition-colors hover:text-white">
            Planos
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_16px_40px_rgba(52,211,153,0.28)] transition-all hover:-translate-y-0.5 hover:bg-emerald-300"
          >
            Testar gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-full border border-white/10 p-2 text-white md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-white/10 bg-black/80 px-6 pb-5 md:hidden"
        >
          <div className="flex flex-col gap-3 py-4">
            <a href="#plataforma" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-white/70">
              Plataforma
            </a>
            <a href="#operacao" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-white/70">
              Operacao
            </a>
            <a href="#depoimentos" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-white/70">
              Resultados
            </a>
            <a href="#planos" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-white/70">
              Planos
            </a>
            <Link href="/login" className="py-2 text-sm font-medium text-white/70">
              Entrar
            </Link>
            <Link href="/signup" className="mt-2 rounded-full bg-emerald-400 px-4 py-3 text-center text-sm font-semibold text-emerald-950">
              Testar gratis
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#040705] pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(110,231,183,0.14),transparent_22%),radial-gradient(circle_at_50%_110%,rgba(8,145,178,0.12),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[72px_72px] opacity-40" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#040705] to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200"
          >
            <Sparkles className="h-4 w-4" />
            Nova direcao visual para marcas que querem parecer grandes desde o primeiro clique
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl"
          >
            Monte a operacao.
            <br />
            <span className="text-white/70">Venda com clareza.</span>
            <br />
            <span className="bg-linear-to-r from-emerald-200 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
              Escale sem caos.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 max-w-2xl text-lg leading-8 text-white/66 md:text-xl"
          >
            A Lojaki deixa de parecer um construtor generico e passa a se apresentar como infraestrutura de e-commerce.
            Loja, pagamentos, marketing e leitura de performance num visual mais premium, escuro e objetivo.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-4 text-base font-bold text-emerald-950 shadow-[0_24px_60px_rgba(52,211,153,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Criar minha loja
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#plataforma"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-7 py-4 text-base font-semibold text-white/84 transition-colors hover:bg-white/8"
            >
              Ver a plataforma
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mt-12 grid gap-4 md:grid-cols-3"
          >
            {heroStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                custom={index}
                className="rounded-3xl border border-white/10 bg-white/4.5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur"
              >
                <div className="text-2xl font-black tracking-tight text-white">{stat.value}</div>
                <p className="mt-2 text-sm leading-6 text-white/58">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="relative"
        >
          <div className="absolute -left-8 top-12 hidden h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl lg:block" />
          <div className="absolute -bottom-10 right-0 hidden h-48 w-48 rounded-full bg-teal-400/10 blur-3xl lg:block" />

          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#08110d]/90 p-3 shadow-[0_30px_140px_rgba(0,0,0,0.55)]">
            <div className="rounded-[28px] border border-white/8 bg-[#0b1511]">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  </div>
                  <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/45">
                    command center
                  </div>
                </div>
                <div className="text-xs text-white/40">lojaki.com.br/admin</div>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="space-y-4 rounded-3xl border border-white/8 bg-black/20 p-4">
                  <div className="rounded-2xl border border-emerald-400/18 bg-emerald-400/8 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/40">Radar comercial</p>
                        <p className="mt-2 text-2xl font-black text-white">Campanha de inverno</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-300/15 p-3">
                        <Rocket className="h-5 w-5 text-emerald-200" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/58">
                      Catalogo novo publicado, checkout ativo e remarketing disparado para recuperar abandono.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Fila de pedidos</p>
                      <div className="mt-3 space-y-3">
                        {['Pago e separado', 'Etiqueta emitida', 'Aguardando retirada'].map((item, index) => (
                          <div key={item} className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2.5">
                            <span className="text-sm text-white/74">{item}</span>
                            <span className="text-xs font-semibold text-emerald-300">0{index + 4}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/35">Saude da operacao</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Checkout', '99.98%'],
                          ['Pagamentos', 'Estavel'],
                          ['Frete', 'Sincronizado'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between text-sm text-white/68">
                            <span>{label}</span>
                            <span className="font-semibold text-emerald-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {commandMetrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/38">{metric.label}</p>
                        <p className="mt-2 text-2xl font-black text-white">{metric.value}</p>
                        <p className={`mt-2 text-sm font-semibold ${metric.tone}`}>{metric.change}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/35">Volume de receita</p>
                        <h3 className="mt-2 text-lg font-bold text-white">Ultimos 7 dias</h3>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">Atualizado agora</div>
                    </div>
                    <div className="mt-6 flex h-48 items-end gap-3">
                      {[42, 58, 50, 76, 64, 82, 96].map((height, index) => (
                        <motion.div
                          key={height}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: `${height}%`, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.35 + index * 0.07, ease: 'easeOut' }}
                          className="relative flex-1 rounded-t-[18px] bg-linear-to-t from-emerald-400 via-emerald-300 to-lime-200"
                        >
                          <div className="absolute inset-x-0 top-0 h-10 rounded-t-[18px] bg-white/10" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between text-xs uppercase tracking-[0.2em] text-white/30">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PlatformSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section id="plataforma" ref={ref} className="relative overflow-hidden bg-[#06110c] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_80%_80%,rgba(132,204,22,0.09),transparent_22%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/8 px-4 py-2 text-sm font-medium text-emerald-200">
            <Shield className="h-4 w-4" />
            Plataforma redesenhada para passar mais autoridade
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="mt-6 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
            Menos cara de template.
            <br />
            Mais cara de sistema serio.
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">
            A pesquisa mostrou um padrao claro nas melhores plataformas: hero forte, contraste alto, narrativa de operacao e interface que transmite solidez.
            Essa home segue exatamente essa direcao, mas com identidade propria.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              variants={scaleIn}
              custom={index}
              className="rounded-[28px] border border-white/10 bg-white/4.5 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.18)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <pillar.icon className="h-6 w-6 text-emerald-200" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/58">{pillar.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CommerceSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section id="operacao" ref={ref} className="bg-[#f5f7f4] py-24 text-slate-950 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-700/12 bg-emerald-600/8 px-4 py-2 text-sm font-medium text-emerald-700">
            <Globe className="h-4 w-4" />
            Toda a jornada comercial alinhada
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="mt-6 text-4xl font-black tracking-[-0.04em] md:text-5xl">
            A homepage agora vende uma ideia maior:
            <span className="block text-slate-500">sua loja como centro da operacao.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Em vez de parecer apenas um site bonito, a narrativa passa a mostrar que a Lojaki organiza produto, equipe, campanhas e caixa.
            Isso melhora a percepcao de valor antes mesmo do usuario entrar no admin.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-3">
            {['Visual premium', 'Tom mais estrategico', 'Mais contraste', 'Mais credibilidade'].map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="grid gap-4 sm:grid-cols-2">
          {commerceCards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={scaleIn}
              custom={index}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ChannelsSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#050806] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(16,185,129,0.14),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200">
              <ShoppingBag className="h-4 w-4" />
              Canais e times conectados
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="mt-6 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              O layout agora conversa com crescimento de verdade.
            </motion.h2>
          </div>

          <motion.p variants={fadeUp} custom={2} className="max-w-xl text-base leading-8 text-white/60">
            O padrao de pesquisa mais forte foi esse: plataformas vencedoras nao mostram apenas features, elas mostram como a marca opera melhor.
            Por isso a home foi reorganizada em fluxos e sistemas, nao em blocos genericos.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-14 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <motion.div variants={scaleIn} className="rounded-4xl border border-white/10 bg-white/4.5 p-6 shadow-[0_28px_100px_rgba(0,0,0,0.25)]">
            <div className="grid gap-5 md:grid-cols-2">
              {channelCards.map((card, index) => (
                <div key={card.title} className="relative overflow-hidden rounded-3xl border border-white/8 bg-black/20 p-5">
                  <div className={`absolute inset-0 bg-linear-to-br ${card.accent}`} />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-emerald-200">
                      {[Store, Users, Globe, Palette][index] && (() => {
                        const Icon = [Store, Users, Globe, Palette][index];
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">{card.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={scaleIn} custom={1} className="rounded-4xl border border-white/10 bg-linear-to-br from-emerald-400 to-lime-300 p-px">
            <div className="h-full rounded-[31px] bg-[#09110d] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/65">Growth board</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">Camadas de evolucao</h3>
                </div>
                <LineChart className="h-6 w-6 text-emerald-200" />
              </div>

              <div className="mt-8 space-y-4">
                {[
                  ['Visual da vitrine', 'Alto impacto', 'bg-emerald-400'],
                  ['Fluxo de compra', 'Otimizado', 'bg-lime-300'],
                  ['Retencao e campanha', 'Ativo', 'bg-teal-300'],
                  ['Leitura de dados', 'Centralizada', 'bg-emerald-200'],
                ].map(([label, status, tone]) => (
                  <div key={label} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="mt-1 text-sm text-white/52">Estrutura que cresce sem depender de remendo operacional.</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/72">
                        <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
                        {status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StepsSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section ref={ref} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Package className="h-4 w-4" />
            Um caminho de ativacao mais claro
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
            Do setup ao crescimento sem pular etapas.
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={scaleIn}
              custom={index}
              className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[#f7faf8] p-8"
            >
              <div className="absolute right-5 top-5 text-6xl font-black tracking-[-0.06em] text-slate-200">{step.step}</div>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
                  {[Users, CreditCard, LineChart][index] && (() => {
                    const Icon = [Users, CreditCard, LineChart][index];
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <h3 className="mt-10 max-w-xs text-2xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section id="depoimentos" ref={ref} className="relative overflow-hidden bg-[#06110c] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.12),transparent_26%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200">
              <Star className="h-4 w-4" />
              Prova social com mais presenca visual
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="mt-6 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
              O visual mudou para sustentar uma conversa de valor.
            </motion.h2>
          </div>
          <motion.p variants={fadeUp} custom={2} className="max-w-xl text-base leading-8 text-white/58">
            Layout premium funciona melhor quando o texto, a prova social e a narrativa apontam para confianca, crescimento e controle.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              variants={scaleIn}
              custom={index}
              className="rounded-[30px] border border-white/10 bg-white/4.5 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center gap-1 text-emerald-300">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-white/72">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                <p className="mt-1 text-sm text-white/46">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section id="planos" ref={ref} className="bg-[#f5f7f4] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Planos com leitura mais premium
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-5xl">
            Comece leve. Cresca com estrutura.
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            O redesenho tambem reorganiza a apresentacao comercial para deixar a oferta mais clara, aspiracional e facil de comparar.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              custom={index}
              className={`rounded-4xl border p-8 ${
                plan.featured
                  ? 'border-emerald-300 bg-slate-950 text-white shadow-[0_28px_90px_rgba(16,185,129,0.18)]'
                  : 'border-slate-200 bg-white text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.06)]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className={`mt-3 text-sm leading-7 ${plan.featured ? 'text-white/62' : 'text-slate-600'}`}>{plan.description}</p>
                </div>
                {plan.featured && (
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-950">
                    recomendado
                  </span>
                )}
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                {!plan.price.includes('Sob') && <span className={plan.featured ? 'pb-1 text-white/45' : 'pb-1 text-slate-500'}>/mes</span>}
              </div>

              <div className="mt-8 space-y-4">
                {plan.items.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${plan.featured ? 'bg-emerald-400/14 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className={plan.featured ? 'text-sm text-white/74' : 'text-sm text-slate-700'}>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={`mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition-all ${
                  plan.featured
                    ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
                }`}
              >
                Escolher plano
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalSection() {
  const { ref, inView } = useAnimateInView();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#040705] py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="overflow-hidden rounded-[36px] border border-white/10 bg-white/4.5 px-8 py-14 text-center shadow-[0_28px_120px_rgba(0,0,0,0.28)] md:px-16 md:py-20"
        >
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-200/70">reposicionamento visual + estrutura comercial</p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              A primeira impressao agora combina mais com a ambicao do produto.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/60">
              Se a ideia e parecer mais profissional, moderna e forte sem cair em copia direta de outras plataformas, esse novo caminho esta bem mais alinhado.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-4 text-base font-bold text-emerald-950 shadow-[0_24px_60px_rgba(52,211,153,0.2)] transition-all hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Testar a nova experiencia
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-7 py-4 text-base font-semibold text-white/84 transition-colors hover:bg-white/8"
              >
                Comparar planos
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15">
              <Zap className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-white">Lojaki</span>
              <span className="block text-[11px] uppercase tracking-[0.24em] text-white/40">commerce operating system</span>
            </div>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/50">
            Plataforma para marcas que querem uma operacao mais profissional, com visual mais forte e leitura comercial mais clara.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-white/56">
          <Link href="/blog" className="transition-colors hover:text-white">
            Blog
          </Link>
          <Link href="/features" className="transition-colors hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/login" className="transition-colors hover:text-white">
            Entrar
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/34">
        © {new Date().getFullYear()} Lojaki. Todos os direitos reservados.
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <PlatformSection />
        <CommerceSection />
        <ChannelsSection />
        <StepsSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalSection />
      </main>
      <Footer />
    </div>
  );
}
