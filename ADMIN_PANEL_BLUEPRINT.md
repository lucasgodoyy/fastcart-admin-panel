# ADMIN PANEL & SUPER ADMIN — BLUEPRINT VISUAL COMPLETO

> **Versão:** 1.0  
> **Data:** 28 de Março de 2026  
> **Referências:** Shopify Admin, Nuvemshop, WooCommerce, BigCommerce  
> **Escopo:** Sidebar, Rotas, Hierarquia, Configurações, Espaçamento, Layout visual de ponta a ponta

---

## ÍNDICE

1. [Diagnóstico do Estado Atual](#1-diagnóstico-do-estado-atual)
2. [Princípios de Design (Baseado em Líderes)](#2-princípios-de-design)
3. [ADMIN — Nova Sidebar (Definitiva)](#3-admin--nova-sidebar-definitiva)
4. [ADMIN — Mapa de Rotas Completo](#4-admin--mapa-de-rotas-completo)
5. [ADMIN — Configurações (Settings Hub)](#5-admin--configurações-settings-hub)
6. [ADMIN — Header](#6-admin--header)
7. [SUPER ADMIN — Nova Sidebar (Definitiva)](#7-super-admin--nova-sidebar-definitiva)
8. [SUPER ADMIN — Mapa de Rotas Completo](#8-super-admin--mapa-de-rotas-completo)
9. [Separação Admin vs Super Admin](#9-separação-admin-vs-super-admin)
10. [Especificação Visual Detalhada](#10-especificação-visual-detalhada)
11. [Checklist de Implementação](#11-checklist-de-implementação)

---

## 1. DIAGNÓSTICO DO ESTADO ATUAL

### 1.1 Problemas Críticos Encontrados

#### Admin Sidebar — 45+ itens com 6 seções (EXCESSIVO)
| Problema | Detalhe |
|----------|---------|
| **Itens demais na sidebar** | 45+ itens visíveis, causando scroll infinito. Shopify tem ~12 itens de nível 1. |
| **Seções desproporcionais** | "Canais de Venda" tem 4 entradas com sub-menus (14 itens). Deveria ser 1 entrada expandível. |
| **Marketing fragmentado** | Opções de marketing espalhadas entre "Canais de Venda" e "Marketing" — são 7+7 = 14 itens sobre marketing. |
| **Ferramentas não são ferramentas** | FAQ, NFe, Integrações, Apps e Atividade foram jogados numa seção "Ferramentas" genérica. |
| **Comunicação não justifica seção** | "Mensagens", "Notificações" e "Suporte" são 3 itens — não precisam de seção própria. |
| **Itens que não deveriam existir** | `countdown-timers`, `product-subscriptions`, `upsell` como itens de sidebar próprios — são sub-funcionalidades. |
| **PDV como item solto** | PDV é um módulo completo que fica perdido entre "Pedidos" e "Catálogo". |
| **Duplicações** | `abandoned-carts` existe como rota `/admin/abandoned-carts/` E como sub-rota `/admin/sales/abandoned-carts/`. |
| **Configurações repetidas** | Domínios aparece em Integrações > Domínios e em Settings > Domínios. |

#### Rotas Inconsistentes
| Rota no Sidebar | Rota no Filesystem | Status |
|-----------------|-------------------|--------|
| `/admin/statistics` | `/admin/statistics/page.tsx` | ✅ OK |
| `/admin/discounts` | `/admin/discounts/page.tsx` | ⚠️ Redireciona? Deveria ter listagem |
| `/admin/online-store` | Redirect → `/admin/online-store/layout-theme` | ⚠️ Confuso — deveria ser overview |
| `/admin/marketing/meta-ads` | `/admin/marketing/meta-ads/page.tsx` | ⚠️ Meta Ads dentro de Marketing mas sidebar diz "Canais de Venda" |
| `/admin/integrations/facebook-pixel` | `/admin/integrations/facebook-pixel/` | ⚠️ Pixel do Facebook dentro de Integrações mas sidebar diz "Facebook e Instagram" |
| `/admin/abandoned-carts` | `/admin/abandoned-carts/page.tsx` | ⚠️ DUPLICADO — também existe em `/admin/sales/abandoned-carts/` |
| `/admin/countdown-timers` | `/admin/countdown-timers/page.tsx` | ⚠️ Item solto — deveria estar em Marketing |
| `/admin/product-subscriptions` | `/admin/product-subscriptions/page.tsx` | ⚠️ Item solto — deveria estar em Catálogo ou Settings |
| `/admin/upsell` | `/admin/upsell/page.tsx` | ⚠️ Item solto — deveria estar em Marketing |

#### Super Admin — Seções desnecessárias
| Problema | Detalhe |
|----------|---------|
| **Planejamento (Backlog/Roadmap)** | São ferramentas internas de dev, NÃO fazem sentido num painel admin |
| **Infraestrutura** | Genérico demais, deveria estar dentro de Configurações |
| **Logs de Erro** | Deveria estar dentro de Relatórios ou Configurações |
| **Aparência separada** | Deveria ser sub-item de Configurações |

---

## 2. PRINCÍPIOS DE DESIGN

### 2.1 Princípio Shopify: Simplicidade Radical
```
Shopify Admin Sidebar (12 itens de nível 1):
├── Home
├── Orders
├── Products
├── Customers
├── Content
├── Finances
├── Analytics
├── Marketing
├── Discounts
├── Online Store (+ Sales Channels)
├── Apps
└── Settings (link no rodapé)
```

### 2.2 Princípio Nuvemshop: Agrupamento Funcional
```
Nuvemshop Admin Sidebar (~10 itens):
├── Início
├── Vendas
├── Produtos
├── Clientes
├── Marketing
├── Canais de venda
├── Relatórios
├── Configurações
└── Plano (link no rodapé)
```

### 2.3 Regras de Ouro para Nossa Sidebar

1. **Máximo 12 itens de nível 1** — O usuário deve ver TODOS sem scrollar
2. **Sub-menus máximo 5 filhos** — Se precisar de mais, crie uma página interna com tabs
3. **Settings absorve tudo que é configuração** — Domínios, integrações, pagamento, checkout, NFe
4. **Marketing agrupa TUDO de marketing** — E-mail, afiliados, cupons, promoções, upsell, fidelidade
5. **Canais de venda é 1 item, não 4** — Google, Facebook, TikTok são sub-itens
6. **Comunicação se dilui** — Chat vai para Pedidos (contexto), Suporte para Settings, Notificações para Header
7. **Ferramentas não existe** — FAQ e Tutoriais vão para "Central de Ajuda" no rodapé

---

## 3. ADMIN — NOVA SIDEBAR (DEFINITIVA)

### Estrutura proposta (11 itens nível 1 + 2 no rodapé)

```
╔═══════════════════════════════════════════╗
║  ⚡ RapidoCart                             ║
╠═══════════════════════════════════════════╣
║                                           ║
║  🏠  Início (Dashboard)                   ║
║  📦  Pedidos                        ▸     ║
║      ├── Todos os pedidos                 ║
║      ├── Rascunhos                        ║
║      ├── Carrinhos abandonados            ║
║      └── Devoluções                       ║
║  📋  Produtos                       ▸     ║
║      ├── Todos os produtos                ║
║      ├── Estoque                          ║
║      ├── Categorias                       ║
║      ├── Coleções                         ║
║      └── Avaliações                       ║
║  👥  Clientes                              ║
║  💰  Financeiro                            ║
║  📊  Relatórios                     ▸     ║
║      ├── Visão geral                      ║
║      ├── Vendas                           ║
║      ├── Tráfego                          ║
║      └── Produtos                         ║
║  📣  Marketing                      ▸     ║
║      ├── Campanhas                        ║
║      ├── Cupons e promoções               ║
║      ├── E-mail marketing                 ║
║      ├── Automações                       ║
║      └── Afiliados                        ║
║  🛒  Canais de venda               ▸     ║
║      ├── Loja virtual                     ║
║      ├── Google Shopping                  ║
║      ├── Facebook & Instagram             ║
║      └── TikTok                           ║
║  🖥️  PDV (Ponto de Venda)                 ║
║  🧩  Aplicativos                           ║
║                                           ║
╠═══════════════════════════════════════════╣
║  ── rodapé ──────────                     ║
║  🎓  Central de ajuda                     ║
║  💳  Meu plano                            ║
║  ⚙️   Configurações                       ║
║  🌙  Tema                                 ║
╚═══════════════════════════════════════════╝
```

### Regra de contagem
| Seção | Itens nível 1 | Sub-itens | Total |
|-------|---------------|-----------|-------|
| Principal | 1 (Início) | 0 | 1 |
| Pedidos | 1 | 4 | 5 |
| Produtos | 1 | 5 | 6 |
| Clientes | 1 | 0 | 1 |
| Financeiro | 1 | 0 | 1 |
| Relatórios | 1 | 4 | 5 |
| Marketing | 1 | 5 | 6 |
| Canais de venda | 1 | 4 | 5 |
| PDV | 1 | 0 | 1 |
| Aplicativos | 1 | 0 | 1 |
| **Rodapé** | 3 | 0 | 3 |
| **TOTAL** | **13** | **22** | **35** |

> **Antes:** 45+ itens visíveis | **Depois:** 13 itens visíveis (35 com sub-menus expandidos)

### Detalhamento e justificativa de cada mudança

#### O que FOI REMOVIDO da sidebar:

| Item removido | Para onde foi | Justificativa |
|---------------|---------------|---------------|
| Estatísticas (seção separada) | Renomeado → "Relatórios" | Shopify usa "Analytics", Nuvemshop usa "Relatórios". Mais claro. |
| PDV dentro de "Comércio" | Promovido para nível 1 | PDV é módulo grande, merece destaque como Shopify POS. |
| Loja Virtual (item com 8 sub-menus) | Canais de venda > Loja virtual (links internos via tabs dentro da página) | 8 sub-menus é demais. Tema, Editor, Páginas, Menus, Blog = tudo acessível por tabs na página /online-store. |
| Facebook & Instagram (item próprio) | Canais de venda > Facebook & Instagram | Era item de nível 1, agora sub-item. |
| TikTok (item próprio) | Canais de venda > TikTok | Era item de nível 1, agora sub-item. |
| Google (item próprio) | Canais de venda > Google Shopping | Era item de nível 1, agora sub-item. |
| Promoções (seção Marketing separada) | Marketing > Cupons e promoções | Cupons + Promoções + Frete grátis ficam numa única página com tabs. |
| E-mail Marketing (item separado) | Marketing > E-mail marketing | Agora sub-item. |
| Afiliados (item separado) | Marketing > Afiliados | Agora sub-item. |
| Upsell (item próprio na sidebar) | Marketing > Automações | Upsell é tipo de automação de marketing. |
| Fidelidade (item próprio na sidebar) | Marketing > Automações (ou Aplicativos) | Loyalty é feature avançada, não merece slot na sidebar. |
| Contadores/Countdown (item próprio) | Marketing > Campanhas | Contadores são parte de campanhas de marketing. |
| Assinaturas de produto (item próprio) | Aplicativos (ou Catálogo > Assinaturas como tab) | Feature avançada, não merece slot próprio. |
| Mensagens/Chat | Pedidos (botão dentro do pedido) | Chat sempre está no contexto de um pedido ou cliente. |
| Notificações (item separado) | Ícone no Header (🔔) | Notificações são consumidas pelo header, não pela sidebar. |
| Suporte | Central de ajuda (rodapé) | Suporte vai junto com tutoriais. |
| FAQ (item separado) | Central de ajuda > FAQ | FAQ é conteúdo de ajuda. |
| Notas Fiscais/NFe | Configurações > Fiscal | NFe é configuração fiscal, não ferramenta do dia a dia. |
| Integrações (item separado com sub-menus) | Configurações > Integrações | Toda integração (domínios, Pixel, GTM, etc.) vive em Settings. |
| Atividade/Activity | Configurações > Atividade | Log de atividade é configuração de auditoria. |

#### O que foi MANTIDO:

| Item | Justificativa |
|------|---------------|
| Início/Dashboard | Página principal, obrigatório. |
| Pedidos | Core do negócio. |
| Produtos | Core do negócio. |
| Clientes | Core do negócio. |
| Financeiro | Essencial para gestão. |
| PDV | Módulo importante, merece destaque. |
| Aplicativos | Ecossistema de extensões. |

#### O que foi ADICIONADO:

| Item | Justificativa |
|------|---------------|
| Coleções (sub-item de Produtos) | Existe a rota mas não estava na sidebar. Similar ao Shopify "Collections". |
| Avaliações (sub-item de Produtos) | Movido de Clientes > Avaliações para Produtos (faz mais sentido contextualmente). |
| Automações (sub-item de Marketing) | Agrupa Upsell, Fidelidade, Contadores — features de automação de marketing. |
| Campanhas (sub-item de Marketing) | Nome mais profissional para agrupar promoções pontuais. |

---

## 4. ADMIN — MAPA DE ROTAS COMPLETO

### 4.1 Rotas Primárias

```
/admin                              → Dashboard (DashboardClient)
/admin/orders                       → Lista de pedidos (antes /admin/sales)
/admin/orders/[id]                  → Detalhe do pedido
/admin/orders/drafts                → Rascunhos de pedido
/admin/orders/abandoned             → Carrinhos abandonados
/admin/orders/returns               → Devoluções
/admin/products                     → Lista de produtos
/admin/products/new                 → Criar produto
/admin/products/[id]                → Editar produto
/admin/products/inventory           → Estoque
/admin/products/categories          → Categorias
/admin/products/collections         → Coleções
/admin/products/reviews             → Avaliações
/admin/customers                    → Lista de clientes
/admin/customers/[id]               → Detalhe do cliente
/admin/customers/new                → Criar cliente
/admin/finances                     → Financeiro (antes /admin/payments)
/admin/analytics                    → Relatórios - Visão geral (antes /admin/statistics)
/admin/analytics/sales              → Relatórios - Vendas (antes /admin/statistics/payments)
/admin/analytics/traffic            → Relatórios - Tráfego
/admin/analytics/products           → Relatórios - Produtos
/admin/marketing                    → Marketing Hub
/admin/marketing/campaigns          → Campanhas (promoções, contadores, etc.)
/admin/marketing/coupons            → Cupons e promoções (antes /admin/discounts)
/admin/marketing/email              → E-mail marketing (antes /admin/marketing/email-campaigns)
/admin/marketing/automations        → Automações (upsell, fidelidade, assinaturas)
/admin/marketing/affiliates         → Programa de afiliados
/admin/channels                     → Canais de venda HUB
/admin/channels/online-store        → Loja virtual (com tabs internas: Tema, Editor, Páginas, Menus, Blog, Filtros, Social, Manutenção)
/admin/channels/google              → Google Shopping + Ads + Analytics
/admin/channels/meta                → Facebook & Instagram + Pixel
/admin/channels/tiktok              → TikTok Shop + Pixel
/admin/pos                          → PDV (Ponto de Venda)
/admin/pos/cash-register            → Caixa registradora
/admin/pos/history                  → Histórico de vendas
/admin/apps                         → Aplicativos / App Store
```

### 4.2 Configurações (Settings)

```
/admin/settings                     → Hub de configurações (grid de cards)
/admin/settings/general             → Dados da loja
/admin/settings/account             → Minha conta
/admin/settings/security            → Segurança (2FA, senhas)
/admin/settings/users               → Usuários e permissões
/admin/settings/business            → Dados empresariais (antes business-data)
/admin/settings/fiscal              → Dados fiscais + NFe (antes /admin/nfe)
/admin/settings/contact             → Informações de contato (antes contact-info)
/admin/settings/checkout            → Opções de checkout
/admin/settings/payments            → Métodos de pagamento (antes payment-methods)
/admin/settings/shipping            → Métodos de envio (antes shipping-methods)
/admin/settings/locations           → Centros de distribuição (antes distribution-centers)
/admin/settings/domains             → Domínios customizados
/admin/settings/emails              → E-mails automáticos
/admin/settings/emails/[templateKey] → Editor de template de e-mail
/admin/settings/notifications       → Preferências de notificação
/admin/settings/languages           → Idiomas e moedas
/admin/settings/integrations        → Todas as integrações (GTM, Pixel, Analytics, etc.)
/admin/settings/custom-fields       → Campos customizados
/admin/settings/redirects           → Redirecionamentos 301
/admin/settings/features            → Features do plano
/admin/settings/activity            → Log de atividade (antes /admin/activity)
/admin/settings/messages            → Mensagens automáticas para clientes
```

### 4.3 Rodapé

```
/admin/help                         → Central de ajuda (antes /admin/tutorials)
/admin/help/faq                     → FAQ (antes /admin/faq)
/admin/help/guides                  → Guias/Tutoriais
/admin/help/support                 → Contato com suporte (antes /admin/support)
/admin/billing                      → Meu plano / Assinatura
```

### 4.4 Rotas a ELIMINAR (redirects ou merge)

| Rota antiga | Ação | Rota nova |
|-------------|------|-----------|
| `/admin/sales` | Rename | `/admin/orders` |
| `/admin/sales/[id]` | Rename | `/admin/orders/[id]` |
| `/admin/sales/abandoned-carts` | Rename | `/admin/orders/abandoned` |
| `/admin/sales/drafts` | Rename | `/admin/orders/drafts` |
| `/admin/sales/manual` | Merge | `/admin/orders/drafts` (flag "manual") |
| `/admin/sales/returns` | Rename | `/admin/orders/returns` |
| `/admin/statistics` | Rename | `/admin/analytics` |
| `/admin/statistics/payments` | Rename | `/admin/analytics/sales` |
| `/admin/statistics/traffic` | Rename | `/admin/analytics/traffic` |
| `/admin/statistics/products` | Rename | `/admin/analytics/products` |
| `/admin/statistics/shipping` | Merge | `/admin/analytics` (tab dentro de overview) |
| `/admin/payments` | Rename | `/admin/finances` |
| `/admin/shipping` | Move | `/admin/settings/shipping` |
| `/admin/abandoned-carts` | DELETE | Duplicado de `/admin/orders/abandoned` |
| `/admin/discounts` | Move | `/admin/marketing/coupons` |
| `/admin/discounts/coupons` | Move | `/admin/marketing/coupons` (tab Cupons) |
| `/admin/discounts/promotions` | Move | `/admin/marketing/coupons` (tab Promoções) |
| `/admin/discounts/free-shipping` | Move | `/admin/marketing/coupons` (tab Frete grátis) |
| `/admin/marketing/email-campaigns` | Rename | `/admin/marketing/email` |
| `/admin/marketing/meta-ads` | Move | `/admin/channels/meta` |
| `/admin/marketing/google-ads` | Move | `/admin/channels/google` |
| `/admin/online-store` | Rename | `/admin/channels/online-store` |
| `/admin/online-store/layout-theme` | Merge | `/admin/channels/online-store` (tab Tema) |
| `/admin/online-store/layout-editor` | Merge | `/admin/channels/online-store` (tab Editor) |
| `/admin/online-store/pages` | Merge | `/admin/channels/online-store` (tab Páginas) |
| `/admin/online-store/menus` | Merge | `/admin/channels/online-store` (tab Menus) |
| `/admin/online-store/filters` | Merge | `/admin/channels/online-store` (tab Filtros) |
| `/admin/online-store/blog` | Merge | `/admin/channels/online-store` (tab Blog) |
| `/admin/online-store/social-links` | Merge | `/admin/channels/online-store` (tab Social) |
| `/admin/online-store/under-construction` | Merge | `/admin/channels/online-store` (tab Manutenção) |
| `/admin/online-store/tiktok-shop` | Move | `/admin/channels/tiktok` |
| `/admin/online-store/google-shopping` | Move | `/admin/channels/google` |
| `/admin/integrations` | Move | `/admin/settings/integrations` |
| `/admin/integrations/domains` | Move | `/admin/settings/domains` |
| `/admin/integrations/facebook-pixel` | Move | `/admin/settings/integrations` (seção Pixels) |
| `/admin/integrations/tiktok-pixel` | Move | `/admin/settings/integrations` (seção Pixels) |
| `/admin/integrations/google-analytics` | Move | `/admin/settings/integrations` (seção Analytics) |
| `/admin/integrations/*` (todos os 15 sub) | Move | `/admin/settings/integrations` |
| `/admin/upsell` | Move | `/admin/marketing/automations` (tab Upsell) |
| `/admin/loyalty` | Move | `/admin/marketing/automations` (tab Fidelidade) |
| `/admin/countdown-timers` | Move | `/admin/marketing/campaigns` (tab Contadores) |
| `/admin/product-subscriptions` | Move | `/admin/marketing/automations` (tab Assinaturas) |
| `/admin/chat` | Move | Dentro de pedidos ou remover |
| `/admin/notifications` | Move | Header icon bell + `/admin/settings/notifications` (config) |
| `/admin/support` | Move | `/admin/help/support` |
| `/admin/faq` | Move | `/admin/help/faq` |
| `/admin/nfe` | Move | `/admin/settings/fiscal` |
| `/admin/activity` | Move | `/admin/settings/activity` |
| `/admin/tutorials` | Rename | `/admin/help` |
| `/admin/tutorials/*` | Rename | `/admin/help/guides/*` |
| `/admin/customers/reviews` | Move | `/admin/products/reviews` |
| `/admin/settings/business-data` | Rename | `/admin/settings/business` |
| `/admin/settings/contact-info` | Rename | `/admin/settings/contact` |
| `/admin/settings/payment-methods` | Rename | `/admin/settings/payments` |
| `/admin/settings/shipping-methods` | Rename | `/admin/settings/shipping` |
| `/admin/settings/distribution-centers` | Rename | `/admin/settings/locations` |
| `/admin/settings/fiscal-data` | Rename | `/admin/settings/fiscal` |

---

## 5. ADMIN — CONFIGURAÇÕES (SETTINGS HUB)

### 5.1 Página /admin/settings — Layout Grid de Cards

A página de configurações deve ser um GRID de cards responsivo (similar ao Shopify Settings), NÃO uma sidebar dentro de sidebar.

```
┌─────────────────────────────────────────────────────┐
│  ⚙️  Configurações                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 🏪 Geral     │  │ 👤 Conta     │  │ 🔒 Segur.  │ │
│  │ Nome, logo,  │  │ Meu perfil,  │  │ 2FA, senha │ │
│  │ informações  │  │ e-mail       │  │ sessões    │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 🏢 Empresa   │  │ 📄 Fiscal    │  │ 📞 Contato │ │
│  │ CNPJ, razão  │  │ NFe, regime  │  │ Telefone,  │ │
│  │ social       │  │ tributário   │  │ endereço   │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 👥 Usuários  │  │ 💳 Pagamento │  │ 🚚 Envio   │ │
│  │ Equipe e     │  │ Meios de     │  │ Métodos de │ │
│  │ permissões   │  │ pagamento    │  │ entrega    │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 📍 Locais    │  │ 🛒 Checkout  │  │ 🌐 Domínios│ │
│  │ Centros de   │  │ Opções de    │  │ Domínios   │ │
│  │ distribuição │  │ checkout     │  │ custom     │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 📧 E-mails   │  │ 🔔 Notific.  │  │ 🌍 Idiomas │ │
│  │ Templates    │  │ Preferências │  │ Idiomas e  │ │
│  │ automáticos  │  │ de alertas   │  │ moedas     │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ 🔌 Integraç. │  │ 📋 Campos    │  │ ↩️ Redirects│ │
│  │ GA, GTM,     │  │ Campos       │  │ Redirect   │ │
│  │ Pixel, etc.  │  │ customizados │  │ 301        │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ ✨ Features   │  │ 📝 Atividade │  │ 💬 Mensag. │ │
│  │ Recursos do  │  │ Log de       │  │ Mensagens  │ │
│  │ plano        │  │ auditoria    │  │ automáticas│ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Cada card do Settings leva para uma sub-página

O grid tem **18 cards** organizados em 6 linhas de 3. Cada card é clicável e leva para a sub-página correspondente.

**Layout das sub-páginas:** Formulário/lista com breadcrumb `Configurações > [Nome]`. Sem sidebar extra. Voltar com botão ou breadcrumb.

---

## 6. ADMIN — HEADER

### 6.1 Layout do Header

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [☰]  [◀▶]  Pedidos > Todos os pedidos       [Ver loja ↗]  [🔍]  [🔔]  [👤] │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Elemento | Posição | Função |
|----------|---------|--------|
| ☰ Hamburger | Esquerda (mobile) | Abre sidebar mobile |
| ◀▶ Collapse | Esquerda (desktop) | Expande/colapsa sidebar |
| Breadcrumbs | Centro-esquerda | Navegação contextual |
| Ver loja ↗ | Centro-direita | Abre storefront em nova aba |
| 🔍 Busca | Direita | Busca global (⌘K) |
| 🔔 Notificações | Direita | Dropdown de notificações recentes |
| 👤 Perfil | Direita | Dropdown com perfil + logout |

### 6.2 Mantém-se o header atual
O header atual está BEM construído. Apenas requer:
- Atualizar breadcrumbLabelMap com novos nomes de rota
- Remover entrada "Notificações" da sidebar (já existe no header)

---

## 7. SUPER ADMIN — NOVA SIDEBAR (DEFINITIVA)

### Estrutura proposta (8 itens nível 1 + 1 rodapé)

```
╔═══════════════════════════════════════════╗
║  🛡️  RapidoCart                            ║
║      Super Admin                          ║
╠═══════════════════════════════════════════╣
║                                           ║
║  🔍 Buscar no menu...                     ║
║                                           ║
║  ── Principal ──                          ║
║  🏠  Dashboard                             ║
║  📊  Analytics                             ║
║                                           ║
║  ── Gestão ──                             ║
║  🏪  Lojas                          ▸     ║
║      ├── Todas as lojas                   ║
║      ├── Aprovações                       ║
║      └── Performance                      ║
║  👥  Usuários                       ▸     ║
║      ├── Todos os usuários                ║
║      ├── Roles & permissões               ║
║      └── Sessões ativas                   ║
║  💳  Assinaturas                    ▸     ║
║      ├── Planos                           ║
║      ├── Assinantes                       ║
║      └── Faturamento                      ║
║  💰  Financeiro                     ▸     ║
║      ├── Visão geral                      ║
║      ├── Transações                       ║
║      ├── Pagamentos                       ║
║      └── Taxas                            ║
║                                           ║
║  ── Marketing ──                          ║
║  📰  Landing Page                          ║
║  📣  Campanhas                      ▸     ║
║      ├── Campanhas                        ║
║      ├── Banners                          ║
║      └── Push                             ║
║  🤝  Afiliados                      ▸     ║
║      ├── Visão geral                      ║
║      ├── Parceiros                        ║
║      ├── Comissões                        ║
║      └── Pagamentos                       ║
║                                           ║
║  ── Operações ──                          ║
║  📧  E-mails                        ▸     ║
║      ├── Logs de envio                    ║
║      ├── Templates                        ║
║      └── Configurações                    ║
║  💬  Suporte                               ║
║  📈  Relatórios                     ▸     ║
║      ├── Visão geral                      ║
║      ├── Crescimento                      ║
║      └── Exportar                         ║
║                                           ║
║  ── Plataforma ──                         ║
║  ⚙️   Configurações                 ▸     ║
║      ├── Geral                            ║
║      ├── Integrações                      ║
║      ├── API Keys                         ║
║      ├── Segurança                        ║
║      ├── Aparência                        ║
║      └── Domínios                         ║
║                                           ║
╠═══════════════════════════════════════════╣
║  ← Painel do Lojista                     ║
╚═══════════════════════════════════════════╝
```

### O que mudou no Super Admin

| Item | Mudança | Justificativa |
|------|---------|---------------|
| Atividade | REMOVIDO | Log de atividade é feature de settings/auditoria |
| Domínios (item separado) | Movido para Configurações > Domínios | Domínio é configuração |
| Segurança (item separado) | Movido para Configurações > Segurança | Segurança = settings |
| Infraestrutura | REMOVIDO | Não faz sentido em painel admin, é DevOps |
| Logs de Erro | REMOVIDO | Tool de desenvolvimento, não admin panel |
| Aparência (item separado) | Movido para Configurações > Aparência | Theme é settings |
| Backlog | REMOVIDO | Ferramenta de dev, usar Jira/Linear |
| Roadmap | REMOVIDO | Ferramenta de dev, usar Jira/Linear |
| Notificações (item separado) | REMOVIDO | Usa ícone 🔔 no header |
| Mensagens > Equipe | Merge | Suporte absorve mensagens |
| E-mail Marketing (duplicado com E-mails) | Merge | E-mails > Campanhas (tab dentro da página) |
| Comunicação (seção inteira) | REMOVIDO como seção | E-mails e Suporte movidos para "Operações" |
| Planejamento (seção inteira) | REMOVIDO | Não pertence a admin panel |

### Resultado:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Seções | 7 | 4 |
| Itens nível 1 | 24 | 14 |
| Sub-itens | 22 | 20 |
| Total itens visíveis (tudo expandido) | 46 | 34 |

---

## 8. SUPER ADMIN — MAPA DE ROTAS COMPLETO

```
/super-admin                                → Dashboard
/super-admin/analytics                      → Analytics
/super-admin/stores                         → Todas as lojas
/super-admin/stores/[id]                    → Detalhe da loja
/super-admin/stores/approvals               → Aprovações
/super-admin/stores/performance             → Performance
/super-admin/users                          → Todos os usuários
/super-admin/users/roles                    → Roles & permissões
/super-admin/users/sessions                 → Sessões ativas
/super-admin/subscriptions                  → Planos
/super-admin/subscriptions/subscribers      → Assinantes
/super-admin/subscriptions/billing          → Faturamento
/super-admin/subscriptions/plans/new        → Criar plano
/super-admin/subscriptions/plans/[id]       → Editar plano
/super-admin/finance                        → Visão geral financeiro
/super-admin/finance/transactions           → Transações
/super-admin/finance/payouts                → Pagamentos
/super-admin/finance/fees                   → Taxas
/super-admin/landing                        → Editor Landing Page
/super-admin/marketing                      → Campanhas
/super-admin/marketing/banners              → Banners
/super-admin/marketing/push                 → Push notifications
/super-admin/affiliates                     → Visão geral afiliados
/super-admin/affiliates/partners            → Parceiros
/super-admin/affiliates/commissions         → Comissões
/super-admin/affiliates/payouts             → Pagamentos
/super-admin/emails                         → Logs de envio
/super-admin/emails/templates               → Templates
/super-admin/emails/config                  → Configurações de e-mail
/super-admin/support                        → Suporte (tickets, mensagens)
/super-admin/reports                        → Relatórios visão geral
/super-admin/reports/growth                 → Crescimento
/super-admin/reports/export                 → Exportar dados
/super-admin/settings                       → Configurações gerais
/super-admin/settings/integrations          → Integrações da plataforma
/super-admin/settings/api-keys              → API Keys
/super-admin/settings/security              → Segurança (antes item separado)
/super-admin/settings/appearance            → Aparência (antes item separado)
/super-admin/settings/domains               → Domínios (antes item separado)
```

### Rotas Super Admin a ELIMINAR

| Rota antiga | Ação |
|-------------|------|
| `/super-admin/activity` | REMOVER — desnecessário |
| `/super-admin/domains` | MOVER → `/super-admin/settings/domains` |
| `/super-admin/security` | MOVER → `/super-admin/settings/security` |
| `/super-admin/infrastructure` | REMOVER — ferramenta DevOps |
| `/super-admin/error-logs` | REMOVER — ferramenta DevOps |
| `/super-admin/appearance` | MOVER → `/super-admin/settings/appearance` |
| `/super-admin/backlog` | REMOVER — usar ferramentas externas |
| `/super-admin/roadmap` | REMOVER — usar ferramentas externas |
| `/super-admin/notifications` | REMOVER — header icon |
| `/super-admin/messages/team` | MERGE → `/super-admin/support` |
| `/super-admin/emails/campaigns` | MERGE → `/super-admin/emails` (tab) |
| `/super-admin/affiliates/tracking` | MERGE → `/super-admin/affiliates` (tab) |
| `/super-admin/affiliates/settings` | MERGE → `/super-admin/affiliates` (tab) |
| `/super-admin/settings/meta-ads` | MERGE → `/super-admin/settings/integrations` |
| `/super-admin/settings/tiktok` | MERGE → `/super-admin/settings/integrations` |

---

## 9. SEPARAÇÃO ADMIN vs SUPER ADMIN

### 9.1 Regra Fundamental

| Responsabilidade | Admin (Lojista) | Super Admin (Plataforma) |
|-----------------|-----------------|-------------------------|
| **Escopo** | UMA loja | TODAS as lojas da plataforma |
| **Produtos** | ✅ Gerencia seus produtos | ❌ Não gerencia produtos |
| **Pedidos** | ✅ Gerencia seus pedidos | ❌ Não gerencia pedidos (só relatórios) |
| **Clientes** | ✅ Seus clientes | ❌ Não acessa clientes individuais |
| **Marketing** | ✅ Marketing da sua loja | ✅ Marketing da plataforma |
| **Financeiro** | ✅ Receita da loja | ✅ Receita da plataforma (taxas, assinaturas) |
| **Configurações** | ✅ Config da loja | ✅ Config da plataforma |
| **Lojas** | ❌ | ✅ Gerencia todas as lojas |
| **Usuários** | ✅ Equipe da loja | ✅ Todos os usuários do sistema |
| **Assinaturas/Planos** | ❌ (vê apenas "Meu Plano") | ✅ Cria/edita planos, gerencia assinantes |

### 9.2 O que NÃO deve estar no Admin

Items que são RESPONSABILIDADE EXCLUSIVA do Super Admin e NÃO devem existir no painel Admin:

- Gerenciamento de lojas (multi-tenant)
- Gerenciamento de planos/assinaturas da plataforma
- Landing page da plataforma
- Taxas e fees da plataforma
- Roles & permissões globais
- Infraestrutura/DevOps
- Logs de erro do sistema
- API Keys da plataforma

### 9.3 O que NÃO deve estar no Super Admin

Items que são RESPONSABILIDADE EXCLUSIVA do Lojista:

- Catálogo de produtos
- Gestão de pedidos individuais
- Gestão de clientes individuais
- Checkout e carrinho
- PDV (ponto de venda)
- Blog da loja
- Tema e personalização da loja

---

## 10. ESPECIFICAÇÃO VISUAL DETALHADA

### 10.1 Sidebar — Dimensões e Espaçamento

```
SIDEBAR EXPANDIDA
├── Largura: 256px (w-64) — [ATUAL: 248px ✗ → MUDAR para 256px]
├── Padding horizontal: 12px (px-3)
├── Logo:
│   ├── Padding top: 20px (py-5)
│   ├── Ícone: 32×32px (h-8 w-8) com rounded-lg
│   ├── Gap logo-texto: 10px (gap-2.5)
│   └── Texto: 15px font-bold tracking-tight
├── Seções:
│   ├── Separador: divider text 11px font-semibold uppercase tracking-wide
│   ├── Padding top: 8px (pt-2)
│   ├── Padding bottom: 6px (pb-1.5)
│   └── Cor: sidebar-muted (cinza fraco)
├── Item de navegação:
│   ├── Altura: 36px (py-2 + conteúdo)
│   ├── Padding: px-3 py-2
│   ├── Rounded: rounded-lg (8px)
│   ├── Ícone: 18×18px (h-4.5 w-4.5)
│   ├── Gap ícone-texto: 12px (gap-3)
│   ├── Font: 13px (text-[13px])
│   ├── Estado normal: sidebar-foreground
│   ├── Estado hover: bg-sidebar-accent + text-sidebar-accent-foreground
│   ├── Estado ativo: bg-sidebar-accent + text-sidebar-primary + font-semibold
│   └── Gap entre itens: 2px (space-y-0.5)
├── Sub-item (expandido):
│   ├── Recuo esquerdo: 30px (ml-7.5)
│   ├── Border-left: 2px sidebar-border
│   ├── Padding-left: 12px (pl-3)
│   ├── Font: 13px (text-[13px])
│   ├── Padding: px-3 py-1.5
│   ├── Estado ativo: text-sidebar-primary + font-semibold
│   └── Estado normal: text-sidebar-muted
├── Rodapé:
│   ├── Border-top: 1px sidebar-border
│   ├── Padding: py-3 px-3
│   └── Mesma estilização dos itens normais
└── Scroll: overflow-y-auto (com scrollbar customizado)

SIDEBAR COLAPSADA
├── Largura: 64px (w-16)
├── Ícones centralizados: p-2.5
├── Tooltip: side="right", sideOffset=8px
└── Separadores: h-px bg-sidebar-border mx-1.5 my-2
```

### 10.2 Cores — Admin (Light Mode Default)

```css
/* Sidebar */
--sidebar-bg:              oklch(0.16 0.02 160);    /* Navy escuro */
--sidebar-foreground:      oklch(0.90 0.01 250);    /* Branco suave */
--sidebar-muted:           oklch(0.55 0.01 250);    /* Cinza medio */
--sidebar-accent:          oklch(0.20 0.02 160);    /* Navy um pouco mais claro */
--sidebar-accent-foreground: oklch(0.95 0.01 250);  /* Branco puro */
--sidebar-primary:         oklch(0.55 0.17 160);    /* Verde primary */
--sidebar-border:          oklch(0.22 0.02 160);    /* Borda sutil */

/* Conteúdo */
--background:              oklch(0.98 0.002 210);   /* Quase branco */
--muted:                   oklch(0.95 0.005 250);   /* Cinza claríssimo */
--card:                    oklch(1 0 0);             /* Branco puro */
--primary:                 oklch(0.55 0.17 160);     /* Verde */
--foreground:              oklch(0.15 0.01 250);     /* Quase preto */
```

### 10.3 Cores — Super Admin (Dark Neon)

```css
/* Sidebar */
--sa-sidebar:       220 25% 10%;    /* Azul escuro profundo */
--sa-bg:            220 20% 8%;     /* Background quase preto */
--sa-surface:       220 20% 13%;    /* Cards */
--sa-accent:        155 100% 50%;   /* Verde neon (#00FF9F) */
--sa-info:          200 100% 55%;   /* Azul info */
--sa-text:          220 15% 92%;    /* Texto claro */
--sa-text-muted:    220 15% 45%;    /* Texto secundário */
--sa-border:        220 15% 18%;    /* Bordas */
```

### 10.4 Espaçamento do Conteúdo Principal

```
ADMIN MAIN CONTENT
├── Background: bg-muted/30 (overlay sutil sobre cinza)
├── Padding: p-6 lg:p-8 (24px mobile, 32px desktop)
├── Max-width: nenhum (full width)
├── Page Header:
│   ├── margin-bottom: 24px (mb-6)
│   ├── Título: text-2xl (24px) font-bold
│   ├── Descrição: text-sm text-muted-foreground
│   └── Actions: flex gap-3 (botões à direita)
├── Cards:
│   ├── Padding: p-6 (24px)
│   ├── Rounded: rounded-xl (12px)
│   ├── Border: 1px border
│   ├── Shadow: shadow-sm
│   └── Gap entre cards: gap-6 (24px)
├── Tabelas:
│   ├── Dentro de Card
│   ├── Header: text-xs font-medium text-muted-foreground uppercase
│   ├── Row height: 48px (py-3)
│   └── Border-bottom em cada row
└── Grid de dashboards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

SUPER ADMIN MAIN CONTENT
├── Background: sa-dot-pattern (dots sobre sa-bg)
├── Padding: p-4 md:p-6 lg:p-10 (16/24/40px)
├── Page transitions: framer-motion fade-in + slide-up
└── Cards: sa-glass (glassmorphism com blur-[16px])
```

### 10.5 Responsividade

| Breakpoint | Sidebar | Layout |
|------------|---------|--------|
| < 1024px (mobile/tablet) | Hidden, abre via hamburger como Sheet/Drawer | Stack vertical |
| ≥ 1024px (desktop) | Fixa à esquerda, colapsável | Sidebar + Content lado a lado |

---

## 11. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Reestruturação de Rotas (Alta prioridade)

- [ ] Renomear `/admin/sales` → `/admin/orders` (todos os sub-paths)
- [ ] Renomear `/admin/statistics` → `/admin/analytics`
- [ ] Renomear `/admin/payments` → `/admin/finances`
- [ ] Mover `/admin/online-store/*` → `/admin/channels/online-store` (página com tabs)
- [ ] Mover `/admin/marketing/meta-ads` → `/admin/channels/meta`
- [ ] Mover `/admin/online-store/google-shopping` → `/admin/channels/google`
- [ ] Mover `/admin/online-store/tiktok-shop` → `/admin/channels/tiktok`
- [ ] Mover `/admin/discounts/*` → `/admin/marketing/coupons` (tabs: Cupons, Promoções, Frete grátis)
- [ ] Mover `/admin/marketing/email-campaigns` → `/admin/marketing/email`
- [ ] Mover `/admin/upsell` + `/admin/loyalty` + `/admin/product-subscriptions` + `/admin/countdown-timers` → `/admin/marketing/automations` (tabs)
- [ ] Mover `/admin/integrations/*` → `/admin/settings/integrations`
- [ ] Mover `/admin/nfe` → `/admin/settings/fiscal`
- [ ] Mover `/admin/activity` → `/admin/settings/activity`
- [ ] Mover `/admin/faq` → `/admin/help/faq`
- [ ] Mover `/admin/support` → `/admin/help/support`
- [ ] Mover `/admin/tutorials` → `/admin/help`
- [ ] Mover `/admin/customers/reviews` → `/admin/products/reviews`
- [ ] Deletar `/admin/abandoned-carts` (duplicado)
- [ ] Deletar `/admin/notifications` (moved to header)
- [ ] Deletar `/admin/chat` (contextual, se necessário bot em pedidos)
- [ ] Deletar `/admin/shipping` (moved to settings/shipping)
- [ ] Criar redirects 301 de todas as rotas antigas para as novas

### Fase 2: Reescrever Sidebar (Alta prioridade)

- [ ] Atualizar `src/components/admin/sidebar.tsx` com nova estrutura de navigation[]
- [ ] Remover seção "Canais de Venda" com 4 itens → 1 item expandível
- [ ] Remover seção "Comunicação" inteiramente
- [ ] Remover seção "Ferramentas" inteiramente
- [ ] Renomear seção "Comércio" → remover seção (itens ficam no topo sem label)
- [ ] Adicionar "Marketing" como seção com sub-itens
- [ ] Mover "Notificações" para o header
- [ ] Ajustar largura sidebar: w-62 → w-64 (256px)
- [ ] Manter rodapé com Central de ajuda, Meu plano, Configurações, Tema

### Fase 3: Criar Páginas com Tabs (Média prioridade)

- [ ] `/admin/channels/online-store` — Tabs: Tema, Editor, Páginas, Menus, Blog, Filtros, Social, Manutenção
- [ ] `/admin/marketing/coupons` — Tabs: Cupons, Promoções, Frete grátis
- [ ] `/admin/marketing/automations` — Tabs: Upsell, Fidelidade, Contadores, Assinaturas
- [ ] `/admin/channels/google` — Tabs: Shopping, Ads, Analytics
- [ ] `/admin/channels/meta` — Tabs: Loja & Catálogo, Pixel
- [ ] `/admin/channels/tiktok` — Tabs: TikTok Shop, Pixel

### Fase 4: Super Admin Cleanup (Média prioridade)

- [ ] Remover rotas: activity, infrastructure, error-logs, backlog, roadmap
- [ ] Mover domínios, segurança, aparência para settings sub-pages
- [ ] Merge: notifications → header, messages → support
- [ ] Atualizar `sa-sidebar-data.ts` com nova estrutura
- [ ] Reduzir de 7 → 4 seções

### Fase 5: Settings Hub (Baixa prioridade)

- [ ] Renomear sub-rotas de settings para slugs mais curtos
- [ ] Verificar que SettingsClient.tsx reflete os 18 cards do blueprint
- [ ] Adicionar ícones consistentes para cada card
- [ ] Grid responsivo: 1 col mobile, 2 cols tablet, 3 cols desktop

### Fase 6: Breadcrumbs & Header (Baixa prioridade)

- [ ] Atualizar `breadcrumbLabelMap` no header.tsx com novos nomes de rota
- [ ] Adicionar suporte a breadcrumbs para novas rotas (/channels, /analytics, /orders, etc.)
- [ ] Verificar que breadcrumbs mostram nomes PT-BR corretos

### Fase 7: Polish Visual (Baixa prioridade)

- [ ] Verificar contraste WCAG AA em todos os temas
- [ ] Hover states consistentes (150ms transition)
- [ ] Focus states visíveis em todos os links de sidebar
- [ ] Ícones: todos 18×18px (h-4.5 w-4.5)
- [ ] Espaçamento uniforme entre seções (space-y-4 entre groups)

---

## APÊNDICE A: NAVIGATION DATA FINAL (Admin)

```typescript
const navigation: NavSection[] = [
  {
    items: [
      { label: t("Início", "Home"), href: "/admin", icon: <LayoutDashboard /> },
      { label: t("Pedidos", "Orders"), href: "/admin/orders", icon: <ShoppingBag />, children: [
        { label: t("Todos os pedidos", "All orders"), href: "/admin/orders" },
        { label: t("Rascunhos", "Drafts"), href: "/admin/orders/drafts" },
        { label: t("Carrinhos abandonados", "Abandoned carts"), href: "/admin/orders/abandoned" },
        { label: t("Devoluções", "Returns"), href: "/admin/orders/returns" },
      ]},
      { label: t("Produtos", "Products"), href: "/admin/products", icon: <Package />, children: [
        { label: t("Todos os produtos", "All products"), href: "/admin/products" },
        { label: t("Estoque", "Inventory"), href: "/admin/products/inventory" },
        { label: t("Categorias", "Categories"), href: "/admin/products/categories" },
        { label: t("Coleções", "Collections"), href: "/admin/products/collections" },
        { label: t("Avaliações", "Reviews"), href: "/admin/products/reviews" },
      ]},
      { label: t("Clientes", "Customers"), href: "/admin/customers", icon: <Users2 /> },
      { label: t("Financeiro", "Finances"), href: "/admin/finances", icon: <Wallet /> },
    ],
  },
  {
    title: t("Insights", "Insights"),
    items: [
      { label: t("Relatórios", "Analytics"), href: "/admin/analytics", icon: <TrendingUp />, children: [
        { label: t("Visão geral", "Overview"), href: "/admin/analytics" },
        { label: t("Vendas", "Sales"), href: "/admin/analytics/sales" },
        { label: t("Tráfego", "Traffic"), href: "/admin/analytics/traffic" },
        { label: t("Produtos", "Products"), href: "/admin/analytics/products" },
      ]},
    ],
  },
  {
    title: t("Marketing", "Marketing"),
    items: [
      { label: t("Marketing", "Marketing"), href: "/admin/marketing", icon: <Megaphone />, children: [
        { label: t("Campanhas", "Campaigns"), href: "/admin/marketing/campaigns" },
        { label: t("Cupons e promoções", "Coupons & promotions"), href: "/admin/marketing/coupons" },
        { label: t("E-mail marketing", "Email marketing"), href: "/admin/marketing/email" },
        { label: t("Automações", "Automations"), href: "/admin/marketing/automations" },
        { label: t("Afiliados", "Affiliates"), href: "/admin/marketing/affiliates" },
      ]},
    ],
  },
  {
    title: t("Canais", "Channels"),
    items: [
      { label: t("Canais de venda", "Sales channels"), href: "/admin/channels", icon: <Globe />, external: true, children: [
        { label: t("Loja virtual", "Online store"), href: "/admin/channels/online-store" },
        { label: "Google Shopping", href: "/admin/channels/google" },
        { label: "Facebook & Instagram", href: "/admin/channels/meta" },
        { label: "TikTok", href: "/admin/channels/tiktok" },
      ]},
      { label: t("PDV", "POS"), href: "/admin/pos", icon: <Monitor /> },
      { label: t("Aplicativos", "Apps"), href: "/admin/apps", icon: <AppWindow /> },
    ],
  },
]
```

## APÊNDICE B: NAVIGATION DATA FINAL (Super Admin)

```typescript
export const saSidebarSections: SASidebarSection[] = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
      { title: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Lojas", href: "/super-admin/stores", icon: Building2, children: [
        { title: "Todas as Lojas", href: "/super-admin/stores" },
        { title: "Aprovações", href: "/super-admin/stores/approvals" },
        { title: "Performance", href: "/super-admin/stores/performance" },
      ]},
      { title: "Usuários", href: "/super-admin/users", icon: Users, children: [
        { title: "Todos os Usuários", href: "/super-admin/users" },
        { title: "Roles & Permissões", href: "/super-admin/users/roles" },
        { title: "Sessões Ativas", href: "/super-admin/users/sessions" },
      ]},
      { title: "Assinaturas", href: "/super-admin/subscriptions", icon: CreditCard, children: [
        { title: "Planos", href: "/super-admin/subscriptions" },
        { title: "Assinantes", href: "/super-admin/subscriptions/subscribers" },
        { title: "Faturamento", href: "/super-admin/subscriptions/billing" },
      ]},
      { title: "Financeiro", href: "/super-admin/finance", icon: DollarSign, children: [
        { title: "Visão Geral", href: "/super-admin/finance" },
        { title: "Transações", href: "/super-admin/finance/transactions" },
        { title: "Pagamentos", href: "/super-admin/finance/payouts" },
        { title: "Taxas", href: "/super-admin/finance/fees" },
      ]},
    ],
  },
  {
    label: "Marketing",
    items: [
      { title: "Landing Page", href: "/super-admin/landing", icon: PanelTop },
      { title: "Campanhas", href: "/super-admin/marketing", icon: Megaphone, children: [
        { title: "Campanhas", href: "/super-admin/marketing" },
        { title: "Banners", href: "/super-admin/marketing/banners" },
        { title: "Push", href: "/super-admin/marketing/push" },
      ]},
      { title: "Afiliados", href: "/super-admin/affiliates", icon: Handshake, children: [
        { title: "Visão Geral", href: "/super-admin/affiliates" },
        { title: "Parceiros", href: "/super-admin/affiliates/partners" },
        { title: "Comissões", href: "/super-admin/affiliates/commissions" },
        { title: "Pagamentos", href: "/super-admin/affiliates/payouts" },
      ]},
    ],
  },
  {
    label: "Operações",
    items: [
      { title: "E-mails", href: "/super-admin/emails", icon: Mail, children: [
        { title: "Logs de Envio", href: "/super-admin/emails" },
        { title: "Templates", href: "/super-admin/emails/templates" },
        { title: "Configurações", href: "/super-admin/emails/config" },
      ]},
      { title: "Suporte", href: "/super-admin/support", icon: Headset },
      { title: "Relatórios", href: "/super-admin/reports", icon: BarChart3, children: [
        { title: "Visão Geral", href: "/super-admin/reports" },
        { title: "Crescimento", href: "/super-admin/reports/growth" },
        { title: "Exportar", href: "/super-admin/reports/export" },
      ]},
      { title: "Configurações", href: "/super-admin/settings", icon: Settings, children: [
        { title: "Geral", href: "/super-admin/settings" },
        { title: "Integrações", href: "/super-admin/settings/integrations" },
        { title: "API Keys", href: "/super-admin/settings/api-keys" },
        { title: "Segurança", href: "/super-admin/settings/security" },
        { title: "Aparência", href: "/super-admin/settings/appearance" },
        { title: "Domínios", href: "/super-admin/settings/domains" },
      ]},
    ],
  },
];
```

## APÊNDICE C: COMPARATIVO VISUAL ANTES/DEPOIS

### Admin Sidebar — Antes vs Depois

```
ANTES (45+ itens, 6 seções)              DEPOIS (13 itens, 4 seções)
─────────────────────────                 ──────────────────────────
📊 Painel                                🏠 Início
📈 Estatísticas ▸ (5 sub)               📦 Pedidos ▸ (4 sub)
── Comércio ──                           📋 Produtos ▸ (5 sub)
🛒 Pedidos ▸ (5 sub)                    👥 Clientes
🖥️ PDV                                   💰 Financeiro
📦 Catálogo ▸ (3 sub)                   ── Insights ──
👥 Clientes ▸ (2 sub)                   📊 Relatórios ▸ (4 sub)
💰 Financeiro                            ── Marketing ──
🚚 Logística                             📣 Marketing ▸ (5 sub)
── Canais de Venda ──                    ── Canais ──
🌐 Loja Virtual ▸ (8 sub)              🛒 Canais de venda ▸ (4 sub)
📱 Facebook e Instagram ▸ (2 sub)       🖥️ PDV
🎵 TikTok ▸ (2 sub)                    🧩 Aplicativos
🔍 Google ▸ (3 sub)                     ── rodapé ──
── Marketing ──                          🎓 Central de ajuda
🏷️ Promoções ▸ (3 sub)                 💳 Meu plano
📧 E-mail Marketing                     ⚙️ Configurações
📣 Afiliados
⚡ Upsell
⭐ Fidelidade
⏱️ Contadores
🔄 Assinaturas
── Comunicação ──
💬 Mensagens
🔔 Notificações
🎧 Suporte
── Ferramentas ──
❓ FAQ
📄 Notas Fiscais
🔌 Integrações ▸ (2 sub)
🧩 Aplicativos
📋 Atividade
── rodapé ──
🎓 Central de ajuda
💳 Meu plano
⚙️ Configurações
🌙 Tema
```

### Resultado: Redução de 65% dos itens visíveis, sem perder NENHUMA funcionalidade.

---

*Documento gerado em 28/03/2026. Deve ser atualizado quando novas funcionalidades forem adicionadas.*
