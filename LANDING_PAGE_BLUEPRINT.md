# 🚀 LANDING PAGE BLUEPRINT — RapidoCart

> Documento completo para construir a landing page de alta conversão.
> Referência: Nuvemshop, Shopify, Loja Integrada, Tray.
> Stack: Next.js 14 + Tailwind CSS + Framer Motion

---

## 📐 ARQUITETURA DE ROTAS

```
app/
├── page.tsx                          ← Landing page principal (HOME)
├── pricing/page.tsx                  ← Planos e preços
├── features/page.tsx                 ← Hub de funcionalidades
├── blog/page.tsx                     ← Blog hub
├── blog/[slug]/page.tsx              ← Artigo individual
│
├── (landing)/                        ← NOVAS ROTAS A CRIAR
│   ├── loja-virtual/page.tsx         ← /loja-virtual (Sua loja online)
│   ├── canais/page.tsx               ← /canais (Canais de venda)
│   ├── canais/redes-sociais/page.tsx ← /canais/redes-sociais
│   ├── canais/marketplace/page.tsx   ← /canais/marketplace
│   ├── solucoes/page.tsx             ← /solucoes (Hub de soluções)
│   ├── solucoes/pagamentos/page.tsx  ← /solucoes/pagamentos
│   ├── solucoes/envio/page.tsx       ← /solucoes/envio
│   ├── solucoes/marketing/page.tsx   ← /solucoes/marketing
│   ├── solucoes/pos/page.tsx         ← /solucoes/pos (PDV)
│   ├── solucoes/ia/page.tsx          ← /solucoes/ia (IA)
│   ├── integracoes/page.tsx          ← /integracoes (Integrações)
│   ├── temas/page.tsx                ← /temas (Galeria de temas)
│   ├── comparar/page.tsx             ← /comparar (Comparar plataformas)
│   ├── dropshipping/page.tsx         ← /dropshipping
│   ├── segmentos/page.tsx            ← /segmentos (Segmentos de mercado)
│   ├── segmentos/moda/page.tsx       ← /segmentos/moda
│   ├── segmentos/alimentos/page.tsx  ← /segmentos/alimentos
│   ├── segmentos/eletronicos/page.tsx← /segmentos/eletronicos
│   ├── segmentos/cosmeticos/page.tsx ← /segmentos/cosmeticos
│   ├── ferramentas/page.tsx          ← /ferramentas (Ferramentas grátis)
│   ├── sobre/page.tsx                ← /sobre (Sobre nós)
│   ├── parceiros/page.tsx            ← /parceiros (Seja parceiro)
│   └── contato/page.tsx              ← /contato
│
├── (auth)/
│   ├── login/page.tsx                ← Login (já existe)
│   ├── signup/page.tsx               ← Cadastro (já existe)
│   └── forgot-password/page.tsx      ← Recuperar senha (já existe)
```

---

## 🎨 IDENTIDADE VISUAL

### Paleta de Cores

```css
/* ── Cores primárias ── */
--rc-green-900: #064E3B;    /* Verde escuro principal (hero, navbar) */
--rc-green-800: #065F46;    /* Verde escuro alternativo */
--rc-green-700: #047857;    /* Verde médio */
--rc-green-600: #059669;    /* Verde vibrante (CTAs hover) */
--rc-green-500: #10B981;    /* Verde primário (CTAs, links, icons) */
--rc-green-400: #34D399;    /* Verde claro (badges, destaques) */
--rc-green-100: #D1FAE5;    /* Verde super claro (backgrounds) */
--rc-green-50:  #ECFDF5;    /* Verde quase branco (bg sections alt) */

/* ── Neutros ── */
--rc-gray-950: #0A0A0A;     /* Texto principal */
--rc-gray-900: #171717;     /* Headings */
--rc-gray-700: #404040;     /* Texto secundário */
--rc-gray-500: #737373;     /* Texto muted */
--rc-gray-200: #E5E5E5;     /* Borders */
--rc-gray-100: #F5F5F5;     /* Background alt sections */
--rc-gray-50:  #FAFAFA;     /* Background principal */
--rc-white:    #FFFFFF;      /* Cards, navbar */

/* ── Accent / Highlight ── */
--rc-emerald:  #34D399;     /* Destaque gradient end */
--rc-teal:     #14B8A6;     /* Accent secundário */
--rc-cyan:     #06B6D4;     /* Links, interactive */

/* ── Feedback ── */
--rc-red:      #EF4444;     /* Erro */
--rc-amber:    #F59E0B;     /* Warning */
--rc-blue:     #3B82F6;     /* Info */
```

### Tipografia
```
Font primária: Inter (Google Fonts)
Font display/heading: Inter com font-weight 800-900
Font monospace: JetBrains Mono (para código/preços)
```

### Gradientes recorrentes
```css
/* Hero / CTAs */
background: linear-gradient(135deg, #064E3B, #059669);
background: linear-gradient(135deg, #10B981, #34D399);

/* Texto gradient */
background: linear-gradient(90deg, #10B981, #34D399, #14B8A6);
-webkit-background-clip: text;

/* Glow effect */
box-shadow: 0 0 80px rgba(16, 185, 129, 0.15);

/* Dark overlay com textura */
background: linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%);
/* + noise texture SVG overlay para efeito granulado */
```

### Textura de fundo (Noise grain)
```css
/* Usar SVG inline como background overlay p/ textura granulada no hero */
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
```

---

## 📄 SEÇÃO POR SEÇÃO — LANDING PAGE PRINCIPAL (`/`)

### SEÇÃO 0: ANNOUNCEMENT BAR (topo fixo)
```
┌──────────────────────────────────────────────────────────┐
│ 🔥 Black Friday: 40% OFF no plano anual → Aproveitar    │
└──────────────────────────────────────────────────────────┘
```
- Fundo: `--rc-green-500` ou gradiente `green-500 → emerald-400`
- Texto: branco, 13px, bold
- Ícone animado (pulse)
- Link para `/pricing`
- Botão X para fechar (salva cookie)
- **Configurável pelo Super Admin** (texto, link, ativo/inativo)

---

### SEÇÃO 1: NAVBAR (sticky)
```
┌──────────────────────────────────────────────────────────┐
│ ⚡ RapidoCart   Soluções▼  Canais▼  Preços  Blog        │
│                                      [Entrar] [Criar✨]  │
└──────────────────────────────────────────────────────────┘
```

**Estrutura:**
- Logo: Ícone ⚡ + "RapidoCart" (bold, 20px)
- Links com hover underline animado
- Dropdowns mega-menu:
  - **Soluções**: Pagamentos, Envio, Marketing, PDV, IA
  - **Canais**: Loja Online, Redes Sociais, Marketplace
- CTA primário: "Criar loja grátis" (bg verde 500, branco, shadow)
- CTA secundário: "Entrar" (ghost, borda)
- Mobile: hamburger → drawer lateral

**Navbar scroll behavior:**
- Transparente no topo → bg-white/blur ao rolar
- Shadow aparece ao rolar

---

### SEÇÃO 2: HERO (acima do fold)
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  [Badge: ✨ +2.500 lojas criadas]                       │
│                                                          │
│  Mais do que loja online.                                │
│  A base para sua marca  [typewriter: vender mais |       │
│                          receber na hora |                │
│                          crescer rápido]                  │
│                                                          │
│  Tudo que você precisa para vender online — da loja      │
│  ao pagamento, do marketing ao envio. Comece grátis.     │
│                                                          │
│  [🚀 Criar loja grátis]   [▶ Como funciona]             │
│                                                          │
│  ┌─────────────── IMAGEM ────────────────┐              │
│  │                                        │              │
│  │  📸 Screenshot do dashboard admin      │              │
│  │  Tamanho: 1200x750px                   │              │
│  │  Formato: WebP                         │              │
│  │  Alt: "Dashboard do painel admin"      │              │
│  │                                        │              │
│  └────────────────────────────────────────┘              │
│                                                          │
│  Floating cards animados:                                │
│  ┌──────────────┐  ┌───────────────┐                    │
│  │ 💰 +R$4.280  │  │ 📦 Novo pedido│                    │
│  │ vendas hoje   │  │ há 2 min      │                    │
│  └──────────────┘  └───────────────┘                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Fundo: `--rc-green-900` com textura noise → gradiente suave
- Texto: branco
- Typewriter effect (3 frases rotativas a cada 3s)
- IMAGEM CENTRAL: `public/landing/hero-dashboard.webp` — **1200×750px**
  - Borda arredondada, sombra `0 25px 50px rgba(0,0,0,0.25)`
  - Animação: fade-up + scale ao entrar na viewport
- Cards flutuantes com glassmorphism: `bg-white/10 backdrop-blur-lg border-white/20`
- Badge no topo: `bg-white/10 text-white border-white/20`

**Social proof abaixo do CTA:**
```
⭐⭐⭐⭐⭐ 4.9 avaliação média · Confiável por +2.500 lojistas
```

---

### SEÇÃO 3: TRUST BAR / SOCIAL PROOF
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  +2.500          +150.000       99.9%        24/7        │
│  Lojas ativas    Produtos       Uptime       Suporte     │
│                  cadastrados    garantido                 │
│                                                          │
│  ─── Logos de marcas que usam (carousel) ───             │
│  📸 logo1.svg  📸 logo2.svg  📸 logo3.svg ...          │
│  Tamanho logos: 120×40px cada, grayscale com hover color │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
- Fundo: branco ou `gray-50`
- Números com animação CountUp (0 → 2.500)
- Logos: carousel infinito (marquee CSS) — **6-10 logos**
  - Cada logo: `120×40px`, SVG preferível
  - Placeholder: ícones de `Building2` do Lucide

---

### SEÇÃO 4: CANAIS DE VENDA (estilo Nuvemshop — tabs interativos)
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Venda onde seu cliente está,                            │
│  com tudo conectado                                      │
│                                                          │
│  [Loja Online] [Redes Sociais] [PDV] [Marketplace]      │
│                ← tabs/pills ─→                           │
│                                                          │
│  ┌─────────────────┬───────────────────────┐            │
│  │                 │  Loja online de alta   │            │
│  │  📸 IMAGEM      │  performance           │            │
│  │  600×450px      │                        │            │
│  │  Screenshot     │  Personalize, gerencie │            │
│  │  da loja        │  e evolua sua loja com │            │
│  │  storefront     │  autonomia.            │            │
│  │                 │                        │            │
│  │                 │  ✓ Temas personalizáv. │            │
│  │                 │  ✓ Domínio próprio     │            │
│  │                 │  ✓ SEO otimizado       │            │
│  │                 │  ✓ Mobile-first        │            │
│  │                 │                        │            │
│  │                 │  [Saiba mais →]        │            │
│  └─────────────────┴───────────────────────┘            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Imagens necessárias (uma por tab):**
| Tab | Arquivo | Tamanho | Descrição |
|-----|---------|---------|-----------|
| Loja Online | `public/landing/channel-store.webp` | 600×450px | Screenshot da storefront |
| Redes Sociais | `public/landing/channel-social.webp` | 600×450px | Instagram/Facebook shopping |
| PDV | `public/landing/channel-pos.webp` | 600×450px | Tela do PDV |
| Marketplace | `public/landing/channel-marketplace.webp` | 600×450px | Feed de produtos |

**Cada tab tem:**
- Título + descrição (2 linhas)
- 4 bulletpoints com check icon (verde)
- Link "Saiba mais →" apontando para `/canais/{slug}`

---

### SEÇÃO 5: SHOWCASE DE LOJAS
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  RapidoCart é a plataforma favorita                      │
│  das marcas que mais crescem                             │
│                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ 📸   │ │ 📸   │ │ 📸   │ │ 📸   │                   │
│  │400×  │ │400×  │ │400×  │ │400×  │                   │
│  │300   │ │300   │ │300   │ │300   │                   │
│  │      │ │      │ │      │ │      │                   │
│  │Loja 1│ │Loja 2│ │Loja 3│ │Loja 4│                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│             ← carousel swipeable →                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Imagens:** 4-8 screenshots de lojas reais
| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| `public/landing/showcase-1.webp` | 400×300px | Screenshot loja moda |
| `public/landing/showcase-2.webp` | 400×300px | Screenshot loja esportes |
| `public/landing/showcase-3.webp` | 400×300px | Screenshot loja alimentos |
| `public/landing/showcase-4.webp` | 400×300px | Screenshot loja eletrônicos |
| `public/landing/showcase-5.webp` | 400×300px | Screenshot loja cosméticos |
| `public/landing/showcase-6.webp` | 400×300px | Screenshot loja acessórios |

- Fundo: `--rc-green-900` com textura noise
- Texto: branco
- Hover: escala 1.05 + sombra
- Link: "Visitar loja" aparece no hover overlay

---

### SEÇÃO 6: SOLUÇÕES (cards horizontais grandes — estilo Nuvemshop)
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  💳 Pagamentos integrados                    │        │
│  │                                              │        │
│  │  Receba por PIX, cartão, boleto e mais.     │        │
│  │  Mercado Pago e Stripe integrados com        │        │
│  │  checkout de alta conversão.                 │        │
│  │                                              │        │
│  │  [Saiba mais →]    📸 IMAGEM 500×320px      │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  📸 IMAGEM        🚚 Envio inteligente       │        │
│  │  500×320px                                   │        │
│  │                   Melhor Envio integrado com  │        │
│  │                   cálculo automático. Correios│        │
│  │                   Jadlog, Loggi e mais.       │        │
│  │                                              │        │
│  │                   [Saiba mais →]             │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  📧 Marketing inteligente                    │        │
│  │                                              │        │
│  │  Recupere carrinhos, envie campanhas,        │        │
│  │  conecte Facebook/Google Ads e aumente       │        │
│  │  suas vendas em até 30%.                     │        │
│  │                                              │        │
│  │  [Saiba mais →]    📸 IMAGEM 500×320px      │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  📸 IMAGEM        🤖 IA que vende            │        │
│  │  500×320px                                   │        │
│  │                   Gere descrições, títulos e  │        │
│  │                   tags de SEO automaticamente │        │
│  │                   com IA. Economize horas.    │        │
│  │                                              │        │
│  │                   [Saiba mais →]             │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Imagens necessárias:**
| Solução | Arquivo | Tamanho |
|---------|---------|---------|
| Pagamentos | `public/landing/solution-payments.webp` | 500×320px |
| Envio | `public/landing/solution-shipping.webp` | 500×320px |
| Marketing | `public/landing/solution-marketing.webp` | 500×320px |
| IA | `public/landing/solution-ai.webp` | 500×320px |

- Cada bloco alterna imagem esquerda/direita (zigzag layout)
- Borda sutil, hover com shadow-xl
- Animação: slide-in from left/right ao entrar na viewport

---

### SEÇÃO 7: FUNCIONALIDADES GRID
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Sua loja, do seu jeito                                  │
│                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │🎨      │ │📦      │ │💳      │ │🚚      │           │
│  │Temas   │ │Catálogo│ │Checkout│ │Frete   │           │
│  │persona-│ │ilimita-│ │otimiza-│ │automá- │           │
│  │lizáveis│ │do      │ │do      │ │tico    │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │📊      │ │🔍      │ │📱      │ │🛡️      │           │
│  │Analyt- │ │SEO     │ │Mobile- │ │SSL     │           │
│  │ics     │ │integra-│ │first   │ │grátis  │           │
│  │avançado│ │do      │ │        │ │        │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │⭐      │ │🎫      │ │💰      │ │🔄      │           │
│  │Avalia- │ │Cupons  │ │Afilia- │ │Assinat.│           │
│  │ções    │ │e promo-│ │dos     │ │recor-  │           │
│  │        │ │ções    │ │        │ │rentes  │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                          │
│  [Ver todas as funcionalidades →]                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**12 feature cards** — cada um com:
- Ícone Lucide (40×40px, verde)
- Título (14px bold)
- Descrição curta (13px muted, 2 linhas max)
- Hover: translate-y + shadow

**Features para mostrar:**
1. **Temas personalizáveis** — Editor visual drag-and-drop
2. **Catálogo completo** — Variações, estoque, importação
3. **Checkout otimizado** — 1-página, alta conversão
4. **Frete automático** — Melhor Envio, Correios, Jadlog
5. **Analytics avançado** — Google Analytics, painel nativo
6. **SEO integrado** — Meta tags, sitemap, rich snippets
7. **Mobile-first** — Design responsivo nativo
8. **SSL grátis** — Certificado e domínio personalizado
9. **Avaliações** — Reviews de clientes
10. **Cupons e promoções** — Descontos, frete grátis
11. **Programa de afiliados** — Comissões automáticas
12. **Assinaturas** — Produtos recorrentes

---

### SEÇÃO 8: INTEGRAÇÕES
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Conecte com o que você já usa                           │
│                                                          │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐             │
│  │MP│ │St│ │ME│ │GA│ │FB│ │TT│ │MC│ │GS│              │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘             │
│  Mercado Stripe Melhor Google Facebook TikTok Mail- Google│
│  Pago         Envio  Analytics Pixel  Pixel  chimp Shopping│
│                                                          │
│  +15 integrações disponíveis                             │
│  [Ver todas →]                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Logos de integrações:** `48×48px` cada
| Integração | Arquivo |
|------------|---------|
| Mercado Pago | `public/landing/integrations/mercadopago.svg` |
| Stripe | `public/landing/integrations/stripe.svg` |
| Melhor Envio | `public/landing/integrations/melhorenvio.svg` |
| Google Analytics | `public/landing/integrations/google-analytics.svg` |
| Facebook | `public/landing/integrations/facebook.svg` |
| TikTok | `public/landing/integrations/tiktok.svg` |
| Mailchimp | `public/landing/integrations/mailchimp.svg` |
| Google Shopping | `public/landing/integrations/google-shopping.svg` |
| Correios | `public/landing/integrations/correios.svg` |
| Hotjar | `public/landing/integrations/hotjar.svg` |
| Google Ads | `public/landing/integrations/google-ads.svg` |
| Google Tag Manager | `public/landing/integrations/gtm.svg` |

- Grid animado com hover scale
- Marquee/carousel contínuo
- Hover mostra nome + badge "Integrado"

---

### SEÇÃO 9: PLANOS E PREÇOS
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Escolha o plano ideal para seu negócio                  │
│                                                          │
│  [Mensal] [Anual -15%]    ← toggle switch               │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Gratuito │ │⭐Starter │ │ Plus     │ │ Pro      │  │
│  │          │ │ POPULAR  │ │          │ │          │  │
│  │ R$0/mês  │ │ R$49/mês │ │ R$99/mês │ │ R$149/mês│  │
│  │          │ │          │ │          │ │          │  │
│  │ 50 prod. │ │ 500 prod.│ │ 5k prod. │ │ Ilimitado│  │
│  │ 1 admin  │ │ 2 admins │ │ 5 admins │ │ Ilimitado│  │
│  │ 1 loja   │ │ 1 loja   │ │ 2 lojas  │ │ Ilimitado│  │
│  │          │ │          │ │          │ │          │  │
│  │ [Começar]│ │[Testar✨]│ │ [Testar] │ │ [Testar] │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  [Comparar todos os planos ↓]                            │
│                                                          │
│  ── TABELA COMPARATIVA EXPANDIDA ──                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Plano "Starter" com badge "MAIS POPULAR" e borda verde
- Toggle mensal/anual com desconto animado
- CTA dos planos pagos vai para `/signup?plan=starter`
- Tabela comparativa colapsável com todas as features
- **Dados dos planos vêm da API** (configurados pelo Super Admin)

---

### SEÇÃO 10: DEPOIMENTOS / SOCIAL PROOF
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  O que nossos lojistas dizem                             │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ ⭐⭐⭐⭐⭐            │  │ ⭐⭐⭐⭐⭐            │             │
│  │ "Em 2 meses      │  │ "Migrei da       │             │
│  │  triplicamos      │  │  Nuvemshop e     │             │
│  │  nossas vendas"   │  │  não me arrependo"│             │
│  │                   │  │                   │             │
│  │ 📸 40×40px avatar │  │ 📸 40×40px avatar │             │
│  │ Maria Silva       │  │ João Santos       │             │
│  │ CEO, Loja X       │  │ Fundador, Loja Y  │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ← ● ● ● → (carousel dots)                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Avatares:** `40×40px` round, com fallback de iniciais
- 4-6 depoimentos em carousel
- Fundo claro com cards com sombra sutil
- Aspas decorativas em verde claro

---

### SEÇÃO 11: COMPARAR PLATAFORMAS
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Por que escolher o RapidoCart?                           │
│                                                          │
│             │RapidoCart│Nuvemshop│Shopify│Loja Integ.│   │
│  ───────────┼─────────┼─────────┼───────┼───────────│   │
│  Preço      │ R$0-149 │ R$59-382│ R$160+│ R$49-249  │   │
│  Tx transaç │ 0-1%    │ 1-2.5%  │ 0.5-2%│ 1-2.5%   │   │
│  PDV        │ ✅       │ ❌      │ ✅    │ ❌        │   │
│  IA integr. │ ✅       │ ✅      │ ✅    │ ❌        │   │
│  Afiliados  │ ✅       │ via app │ via app│ ❌       │   │
│  NFe nativa │ ✅       │ via app │ ❌    │ via app   │   │
│  Frete auto │ ✅       │ ✅      │ ❌    │ ✅        │   │
│  Suporte BR │ ✅       │ ✅      │ ❌    │ ✅        │   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### SEÇÃO 12: FAQ
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Perguntas frequentes                                    │
│                                                          │
│  ▸ O RapidoCart é realmente gratuito?                    │
│  ▸ Posso usar meu próprio domínio?                       │
│  ▸ Quais formas de pagamento estão disponíveis?          │
│  ▸ Como funciona o frete?                                │
│  ▸ Posso migrar de outra plataforma?                     │
│  ▸ Tem suporte em português?                             │
│  ▸ Preciso de conhecimento técnico?                      │
│  ▸ Posso cancelar a qualquer momento?                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
- Accordion com animação suave (Framer Motion)
- Borda sutil, hover highlight

---

### SEÇÃO 13: CTA FINAL
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Fundo: gradient verde escuro 900 → 700 + textura noise │
│                                                          │
│  Comece a vender online hoje                             │
│  Crie sua loja grátis em menos de 5 minutos.             │
│                                                          │
│  [🚀 Criar loja grátis]   [Falar com vendas]            │
│                                                          │
│  ✓ Sem cartão   ✓ 14 dias grátis   ✓ Cancele quando    │
│                                        quiser            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### SEÇÃO 14: FOOTER
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ⚡ RapidoCart                                            │
│  A plataforma de e-commerce mais completa do Brasil.     │
│                                                          │
│  Produto          Soluções        Recursos    Empresa    │
│  Loja Virtual     Pagamentos      Blog        Sobre      │
│  Canais           Envio           Ferramentas Parceiros  │
│  Integrações      Marketing       E-books     Contato    │
│  Temas            PDV             Tutoriais   Carreiras  │
│  Preços           IA                                     │
│                                                          │
│  ── Redes Sociais ──                                     │
│  [Instagram] [YouTube] [LinkedIn] [TikTok]               │
│                                                          │
│  © 2026 RapidoCart. Todos os direitos reservados.        │
│  Termos · Privacidade · Cookies                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📸 LISTA COMPLETA DE IMAGENS NECESSÁRIAS

### Hero & Dashboard
| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| `public/landing/hero-dashboard.webp` | 1200×750px | Screenshot do dashboard admin |
| `public/landing/hero-mobile.webp` | 400×800px | Versão mobile do dashboard |

### Canais (4)
| `public/landing/channel-store.webp` | 600×450px | Storefront screenshot |
| `public/landing/channel-social.webp` | 600×450px | Instagram Shop mockup |
| `public/landing/channel-pos.webp` | 600×450px | PDV interface screenshot |
| `public/landing/channel-marketplace.webp` | 600×450px | Marketplace feed |

### Soluções (4)
| `public/landing/solution-payments.webp` | 500×320px | Checkout/pagamento screenshot |
| `public/landing/solution-shipping.webp` | 500×320px | Shipping labels UI |
| `public/landing/solution-marketing.webp` | 500×320px | Email campaign UI |
| `public/landing/solution-ai.webp` | 500×320px | AI content generation UI |

### Showcase lojas (6)
| `public/landing/showcase-1.webp` — `showcase-6.webp` | 400×300px cada | Lojas reais |

### Integrations logos (12+)
| `public/landing/integrations/*.svg` | 48×48px | Logos das integrações |

### Testimonial avatars (6)
| `public/landing/testimonials/avatar-*.webp` | 80×80px | Fotos de clientes |

### Ícones de segmento
| `public/landing/segments/*.webp` | 300×200px | Fotos representando segmentos |

### Open Graph / SEO
| `public/og-image.webp` | 1200×630px | Imagem para compartilhamento social |
| `public/favicon.ico` | 32×32px | Favicon |
| `public/apple-touch-icon.png` | 180×180px | Apple touch icon |

---

## ⚙️ CONFIGURAÇÕES VIA SUPER ADMIN

O Super Admin deve poder controlar estes elementos da landing page sem deploy:

### Tabela: `platform_landing_config`
```sql
CREATE TABLE platform_landing_config (
    id BIGSERIAL PRIMARY KEY,
    
    -- Announcement Bar
    announcement_active BOOLEAN DEFAULT false,
    announcement_text VARCHAR(200),
    announcement_link VARCHAR(500),
    announcement_bg_color VARCHAR(20) DEFAULT '#10B981',
    
    -- Hero
    hero_title VARCHAR(200) DEFAULT 'Mais do que loja online.',
    hero_subtitle VARCHAR(500),
    hero_typewriter_phrases TEXT, -- JSON array: ["vender mais","receber na hora"]
    hero_cta_text VARCHAR(50) DEFAULT 'Criar loja grátis',
    hero_cta_link VARCHAR(200) DEFAULT '/signup',
    
    -- Social Proof Numbers
    stats_stores_count INTEGER DEFAULT 2500,
    stats_products_count INTEGER DEFAULT 150000,
    stats_uptime VARCHAR(10) DEFAULT '99.9%',
    
    -- Testimonials (JSON array of objects)
    testimonials TEXT, -- JSON: [{name, role, company, quote, avatar_url}]
    
    -- Showcase stores (JSON array)
    showcase_stores TEXT, -- JSON: [{name, url, image_url, category}]
    
    -- Footer
    footer_instagram VARCHAR(200),
    footer_youtube VARCHAR(200),
    footer_linkedin VARCHAR(200),
    footer_tiktok VARCHAR(200),
    
    -- SEO
    seo_title VARCHAR(200) DEFAULT 'RapidoCart — Crie sua loja virtual grátis',
    seo_description VARCHAR(500),
    seo_og_image VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Endpoints Super Admin
```
GET  /api/v1/super-admin/landing-config       → Buscar config
PUT  /api/v1/super-admin/landing-config       → Atualizar config
GET  /api/v1/public/landing-config            → Config pública (sem secrets)
```

### Tela Super Admin: "Configurações da Landing Page"
- Seção **Barra de Anúncio**: toggle ativo/inativo, texto, link, cor
- Seção **Hero**: título, subtítulo, frases do typewriter
- Seção **Números**: contadores (lojas, produtos, uptime)
- Seção **Depoimentos**: CRUD de depoimentos com avatar upload
- Seção **Showcase**: CRUD de lojas destaque com screenshot upload
- Seção **Redes Sociais**: links do footer
- Seção **SEO**: título, descrição, OG image

---

## 🛣️ ROTAS SECUNDÁRIAS — SPECS

### `/loja-virtual` — Loja Online
- Hero com screenshot da storefront
- Features: temas, domínio, SEO, mobile, SSL
- Galeria de temas (3-4 screenshots)
- CTA: "Criar sua loja"

### `/canais/redes-sociais` — Redes Sociais
- Como funciona: Instagram Shopping, Facebook Shop
- Benefícios: catálogo sincronizado, pedidos centralizados
- CTA: "Conectar redes sociais"

### `/solucoes/pagamentos` — Pagamentos
- Hero: "Receba de qualquer forma"
- Cards: PIX, Cartão, Boleto, Mercado Pago, Stripe
- Checkout transparente vs redirect
- Taxas comparativas
- CTA: "Configurar pagamentos"

### `/solucoes/envio` — Envio
- Hero: "Envie com inteligência"
- Melhor Envio integrado
- Transportadoras: Correios, Jadlog, Loggi, Azul
- Etiquetas automáticas
- Rastreamento em tempo real
- CTA: "Configurar frete"

### `/solucoes/marketing` — Marketing
- Hero: "Venda mais para quem já te conhece"
- Email marketing, carrinho abandonado
- Facebook Pixel, Google Ads, TikTok Pixel
- Programa de afiliados
- Cupons e promoções
- CTA: "Ativar marketing"

### `/solucoes/pos` — PDV
- Hero: "Sua loja física e online, juntas"
- Estoque unificado
- Vendas no balcão
- Recibos e controle
- CTA: "Ativar PDV"

### `/solucoes/ia` — Inteligência Artificial
- Hero: "IA que trabalha para você"
- Geração de descrições
- Títulos otimizados para SEO
- Tags automáticas
- CTA: "Experimentar IA"

### `/integracoes` — Integrações
- Grid com todas as 15+ integrações
- Filtro por categoria: Pagamento, Marketing, Envio, Analytics
- Card de cada integração com status "Nativo" vs "Via App"
- CTA: "Ver todas"

### `/temas` — Galeria de Temas
- 4-6 templates disponíveis
- Preview interativo (desktop/mobile toggle)
- Cores customizáveis
- CTA: "Usar este tema"

### `/comparar` — Comparar Plataformas
- Tabela comparativa detalhada
- RapidoCart vs Nuvemshop vs Shopify vs Loja Integrada vs Tray
- Categorias: preço, features, suporte, integrações
- CTA: "Migrar para RapidoCart"

### `/dropshipping` — Dropshipping
- O que é dropshipping
- Como funciona no RapidoCart
- Fornecedores parceiros
- CTA: "Começar dropshipping"

### `/segmentos/{slug}` — Segmentos
- Página para cada nicho (moda, alimentos, eletrônicos, etc.)
- Cases de sucesso do segmento
- Features relevantes para o nicho
- CTA: "Criar loja de {segmento}"

### `/ferramentas` — Ferramentas Grátis
- Gerador de nome para loja
- Calculadora de markup
- Calculadora de frete
- Gerador de política de privacidade
- CTA: "Usar ferramenta"

### `/sobre` — Sobre Nós
- Missão e visão
- Time (fotos + cargos)
- Números da empresa
- Timeline/história

### `/parceiros` — Seja Parceiro
- Programa de afiliados da plataforma
- Benefícios para agências
- Como se tornar parceiro
- CTA: "Aplicar agora"

---

## 📋 PRIORIDADE DE IMPLEMENTAÇÃO

### Fase 1 — MVP Critical (1-2 semanas)
1. ✅ Landing page principal (`/`) — todas as seções
2. ✅ Página de preços (`/pricing`) — atualizar
3. ✅ NavBar com mega-menu
4. ✅ Footer completo
5. ✅ SEO meta tags (OG, Twitter, structured data)
6. ✅ Mobile responsivo perfeito
7. ✅ Super Admin: config de landing page básica

### Fase 2 — Rotas Soluções (1 semana)
8. `/solucoes/pagamentos`
9. `/solucoes/envio`
10. `/solucoes/marketing`
11. `/loja-virtual`
12. `/integracoes`

### Fase 3 — Rotas Canais & Comparação (1 semana)
13. `/canais/redes-sociais`
14. `/comparar`
15. `/solucoes/pos`
16. `/solucoes/ia`
17. `/temas`

### Fase 4 — Conteúdo & Growth (ongoing)
18. `/dropshipping`
19. `/segmentos/*`
20. `/ferramentas`
21. `/sobre`
22. `/parceiros`
23. Blog com conteúdo real

---

## 🔧 COMPONENTES REUTILIZÁVEIS A CRIAR

```
src/components/landing/
├── LandingNavbar.tsx           ← Navbar com mega-menu
├── LandingFooter.tsx           ← Footer completo
├── AnnouncementBar.tsx         ← Barra de anúncio (Super Admin)
├── HeroSection.tsx             ← Hero com typewriter
├── TrustBar.tsx                ← Números + logos
├── ChannelTabs.tsx             ← Tabs de canais de venda
├── ShowcaseCarousel.tsx        ← Carousel de lojas
├── SolutionCard.tsx            ← Card de solução (zigzag)
├── FeatureGrid.tsx             ← Grid de funcionalidades
├── IntegrationGrid.tsx         ← Grid de integrações
├── PricingTable.tsx            ← Tabela de preços com toggle
├── TestimonialCarousel.tsx     ← Depoimentos carousel
├── ComparisonTable.tsx         ← Tabela comparativa
├── FaqAccordion.tsx            ← Accordion FAQ
├── CtaSection.tsx              ← CTA final
├── ImagePlaceholder.tsx        ← Placeholder para imagens
├── CountUpNumber.tsx           ← Número com animação count-up
├── TypewriterText.tsx          ← Texto com efeito typewriter
└── MegaMenu.tsx                ← Dropdown mega-menu da navbar
```

---

## 📱 BREAKPOINTS RESPONSIVOS

```
Mobile:   < 640px   → 1 coluna, navbar hamburger, cards empilhados
Tablet:   640-1024px → 2 colunas, navbar condensada
Desktop:  > 1024px  → Layout completo, mega-menu, 3-4 colunas
Wide:     > 1280px  → max-width 1280px, conteúdo centralizado
```

---

## 🚀 PERFORMANCE TARGETS

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- Imagens: WebP, lazy loading, responsive srcset
- Fonts: Inter via `next/font` (no layout shift)
- Animations: Framer Motion com `viewport={{ once: true }}`
- Bundle: Code splitting por rota

---

## 🏷️ SEO STRUCTURED DATA

Cada página deve incluir JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "RapidoCart",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "149",
    "priceCurrency": "BRL"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "2500"
  }
}
```

---

*Documento criado em 28/03/2026. Atualizar conforme novas features forem adicionadas.*
