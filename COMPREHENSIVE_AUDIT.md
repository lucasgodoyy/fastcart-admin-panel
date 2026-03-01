# AUDITORIA COMPLETA — FastCart Admin Panel + Super Admin + Backend

> Gerado automaticamente — Deep Audit de todos os menus, rotas, páginas e endpoints  
> Data: Junho 2025

---

## ÍNDICE

1. [Sidebar Admin — Menu Completo](#1-sidebar-admin--menu-completo)
2. [Sidebar Super Admin — Menu Completo](#2-sidebar-super-admin--menu-completo)
3. [Status de Cada Página Admin](#3-status-de-cada-página-admin)
4. [Status de Cada Página Super Admin](#4-status-de-cada-página-super-admin)
5. [Backend — Controllers e Endpoints](#5-backend--controllers-e-endpoints)
6. [Gap Analysis — O Que Falta](#6-gap-analysis--o-que-falta)
7. [Tarefas Prioritárias](#7-tarefas-prioritárias)
8. [Dependências Externas](#8-dependências-externas)

---

## 1. Sidebar Admin — Menu Completo

```
📊 Painel (Dashboard)                    → /admin
📈 Estatísticas                           → /admin/statistics
   ├── Visão geral                        → /admin/statistics
   ├── Pagamentos                         → /admin/statistics/payments
   ├── Envio                              → /admin/statistics/shipping
   ├── Produtos                           → /admin/statistics/products
   └── Fontes de tráfego                  → /admin/statistics/traffic

── COMÉRCIO ──
🛒 Pedidos                                → /admin/sales
   ├── Todos os pedidos                   → /admin/sales
   ├── Pedidos manuais                    → /admin/sales/manual-orders
   └── Carrinhos abandonados              → /admin/sales/abandoned-carts
📦 Catálogo                               → /admin/products
   ├── Todos os produtos                  → /admin/products
   ├── Estoque                            → /admin/products/inventory
   ├── Categorias                         → /admin/products/categories
   └── Tabelas de preço                   → /admin/products/price-tables
💰 Financeiro                             → /admin/payments
🚚 Logística                              → /admin/shipping
💬 Caixa de entrada                       → /admin/chat
👥 Pessoas                                → /admin/customers
   ├── Todos os clientes                  → /admin/customers
   └── Mensagens                          → /admin/customers/messages

── CRESCIMENTO ──
🎟️ Promoções                              → /admin/discounts
   ├── Cupons                             → /admin/discounts/coupons
   ├── Frete grátis                       → /admin/discounts/free-shipping
   └── Campanhas                          → /admin/discounts/promotions
📢 Marketing                              → /admin/marketing

── CANAIS ──
🌐 Loja virtual                           → /admin/online-store
   ├── Tema e layout                      → /admin/online-store/layout-theme
   ├── Páginas                            → /admin/online-store/pages
   ├── Blog                               → /admin/online-store/blog
   ├── Navegação                          → /admin/online-store/menus
   ├── Filtros                            → /admin/online-store/filters
   ├── Links sociais                      → /admin/online-store/social-links
   └── Manutenção                         → /admin/online-store/under-construction
💳 Ponto de venda                         → /admin/pos
🔍 Google Shopping                        → /admin/google-shopping

── EXPANSÃO ──
🧩 Integrações                            → /admin/apps
🧾 Assinatura                             → /admin/billing

── RODAPÉ ──
⚙️ Configurações                          → /admin/settings
   ├── Informação de contato              → /admin/settings/contact-info
   ├── Checkout                           → /admin/settings/checkout
   ├── Métodos de pagamento               → /admin/settings/payment-methods
   ├── Métodos de envio                   → /admin/settings/shipping-methods
   ├── E-mails                            → /admin/settings/emails
   ├── Domínios                           → /admin/settings/domains
   ├── Idiomas                            → /admin/settings/languages
   ├── Integrações                        → /admin/settings/integrations
   ├── Redirecionamentos                  → /admin/settings/redirects
   ├── Mensagens                          → /admin/settings/messages
   ├── Centros de distribuição            → /admin/settings/distribution-centers
   ├── Usuários                           → /admin/settings/users
   └── Campos personalizados              → /admin/settings/custom-fields
```

**Páginas EXTRAS que existem no admin mas NÃO estão na sidebar:**
- `/admin/instagram-facebook` — Canal Instagram/Facebook
- `/admin/tiktok` — Canal TikTok
- `/admin/pinterest` — Canal Pinterest
- `/admin/marketplaces` — Canal Marketplaces
- `/admin/products/new` — Criar produto
- `/admin/products/[id]` — Editar produto
- `/admin/sales/[id]` — Detalhe do pedido
- `/admin/customers/new` — Criar cliente
- `/admin/customers/[id]` — Detalhe do cliente

---

## 2. Sidebar Super Admin — Menu Completo

```
── PRINCIPAL ──
📊 Dashboard                              → /super-admin
📈 Analytics                              → /super-admin/analytics
⚡ Atividade                              → /super-admin/activity

── GESTÃO ──
🏢 Lojas                                  → /super-admin/stores
   ├── Todas as Lojas                     → /super-admin/stores
   ├── Aprovações                         → /super-admin/stores/approvals
   └── Performance                        → /super-admin/stores/performance
👤 Usuários                               → /super-admin/users
   ├── Todos os Usuários                  → /super-admin/users
   ├── Roles & Permissões                 → /super-admin/users/roles
   └── Sessões Ativas                     → /super-admin/users/sessions
💳 Assinaturas                            → /super-admin/subscriptions
   ├── Planos                             → /super-admin/subscriptions
   ├── Assinantes                         → /super-admin/subscriptions/subscribers
   └── Faturamento                        → /super-admin/subscriptions/billing

── MARKETING & AFILIADOS ──
🔗 Afiliados                              → /super-admin/affiliates
   ├── Programa                           → /super-admin/affiliates
   ├── Partners                           → /super-admin/affiliates/partners
   ├── Comissões                          → /super-admin/affiliates/commissions
   └── Links & Tracking                   → /super-admin/affiliates/tracking
📢 Marketing                              → /super-admin/marketing
   ├── Campanhas                          → /super-admin/marketing
   ├── Push Notifications                 → /super-admin/marketing/push
   └── Banners                            → /super-admin/marketing/banners

── COMUNICAÇÃO ──
✉️ E-mails                                → /super-admin/emails
   ├── Logs de Envio                      → /super-admin/emails
   ├── Templates                          → /super-admin/emails/templates
   └── Configuração SMTP                  → /super-admin/emails/config
🔔 Notificações                           → /super-admin/notifications
🎧 Suporte                                → /super-admin/support

── FINANCEIRO ──
💰 Finanças                               → /super-admin/finance
   ├── Visão Geral                        → /super-admin/finance
   ├── Transações                         → /super-admin/finance/transactions
   ├── Repasses                           → /super-admin/finance/payouts
   └── Taxas                              → /super-admin/finance/fees
📋 Relatórios                             → /super-admin/reports
   ├── Receita                            → /super-admin/reports
   ├── Crescimento                        → /super-admin/reports/growth
   └── Exportar                           → /super-admin/reports/export

── PLATAFORMA ──
⚙️ Configurações                          → /super-admin/settings
   ├── Geral                              → /super-admin/settings
   ├── Integrações                        → /super-admin/settings/integrations
   └── API Keys                           → /super-admin/settings/api-keys
🛡️ Segurança                              → /super-admin/security
🎨 Aparência                              → /super-admin/appearance
🌐 Domínios                               → /super-admin/domains
🖥️ Infraestrutura                         → /super-admin/infrastructure
```

---

## 3. Status de Cada Página Admin

### Legenda
| Status | Significado |
|--------|-------------|
| ✅ REAL | Conectado ao backend via useQuery/useMutation — dados reais |
| ⚠️ HARDCODED | UI existe mas dados são locais/mockados — salvamentos não persistem |
| 🔲 STATIC | Página placeholder sem dados ("Em breve" ou links de navegação) |
| ↩️ REDIRECT | Redireciona para outra rota |

### Dashboard & Estatísticas

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin` | ✅ REAL | DashboardClient | `GET /orders/store/stats`, `GET /orders/store` |
| `/admin/statistics` | 🔲 STATIC | RoutePlaceholderPage | — |
| `/admin/statistics/payments` | 🔲 STATIC | RoutePlaceholderPage | — |
| `/admin/statistics/shipping` | 🔲 STATIC | RoutePlaceholderPage | — |
| `/admin/statistics/products` | 🔲 STATIC | RoutePlaceholderPage | — |
| `/admin/statistics/traffic` | 🔲 STATIC | RoutePlaceholderPage | — |

### Comércio — Pedidos

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/sales` | ✅ REAL | OrderListClient | `GET /orders/store`, `GET /orders/store/stats` |
| `/admin/sales/[id]` | ✅ REAL | OrderDetailClient | `GET /orders/store/{id}`, `PATCH dispatch/deliver` |
| `/admin/sales/manual-orders` | 🔲 STATIC | RoutePlaceholderPage | — |
| `/admin/sales/abandoned-carts` | ✅ REAL | AbandonedCartsClient | `GET /admin/abandoned-carts`, `GET /admin/abandoned-carts/stats` |

### Comércio — Catálogo

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/products` | ✅ REAL | ProductClient | `GET /products`, `DELETE/POST/PATCH` |
| `/admin/products/new` | ✅ REAL | CreateProductClient | `POST /products` |
| `/admin/products/[id]` | ✅ REAL | EditProductClient | `GET/PUT /products/{id}` |
| `/admin/products/inventory` | ✅ REAL | InventoryClient | `GET /products`, `PATCH /products/{id}/inventory` |
| `/admin/products/categories` | ✅ REAL | CategoryClient | `GET/POST/PUT/DELETE /categories` |
| `/admin/products/price-tables` | 🔲 STATIC | RoutePlaceholderPage | ❌ Sem backend |

### Comércio — Finanças, Logística, Chat, Clientes

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/payments` | ✅ REAL | IntegrationsClient | Stripe Connect + Melhor Envio status |
| `/admin/shipping` | ✅ REAL | ShippingLabelsClient | `GET /shipping-labels/melhor-envio/*` |
| `/admin/chat` | ✅ REAL | ChatClient | `GET/POST /admin/chat/conversations`, `/messages`, `/stats` |
| `/admin/customers` | ✅ REAL | CustomerClient | `GET /customers/store/{storeId}` |
| `/admin/customers/new` | ✅ REAL | CreateCustomerClient | `POST /customers` |
| `/admin/customers/[id]` | ✅ REAL | CustomerDetailClient | `GET/PUT /customers/{storeId}/{id}` |
| `/admin/customers/messages` | 🔲 STATIC | RoutePlaceholderPage | — |

### Crescimento — Promoções & Marketing

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/discounts` | 🔲 STATIC | Navigation hub | — |
| `/admin/discounts/coupons` | ✅ REAL | CouponsClient | `GET/POST/PUT/PATCH /coupons` |
| `/admin/discounts/free-shipping` | ✅ REAL | FreeShippingClient | `GET/POST/PUT /shipping-offers` |
| `/admin/discounts/promotions` | ✅ REAL | PromotionsClient | `GET/POST/PUT/PATCH /promotions` |
| `/admin/marketing` | ✅ REAL | MarketingClient | `GET/POST/PUT/DELETE /marketing/*` (13 endpoints) |

### Canais — Loja Virtual

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/online-store` | ↩️ REDIRECT | → layout-theme | — |
| `/admin/online-store/layout-theme` | ✅ REAL | OnlineStoreLayoutClient | `GET/PUT /admin/stores/me/sales-channels` |
| `/admin/online-store/pages` | ✅ REAL | OnlineStorePagesClient | sales-channels (JSON) |
| `/admin/online-store/blog` | ✅ REAL | BlogManagementClient | `GET/POST/PUT/DELETE /admin/blog/posts` |
| `/admin/online-store/menus` | ✅ REAL | OnlineStoreMenusClient | sales-channels (JSON) |
| `/admin/online-store/filters` | ✅ REAL | OnlineStoreFiltersClient | sales-channels (JSON) |
| `/admin/online-store/social-links` | ✅ REAL | SocialLinksClient | sales-channels (JSON) |
| `/admin/online-store/under-construction` | 🔲 STATIC | UnderConstructionClient | — |
| `/admin/pos` | ✅ REAL | ChannelLinkClient | sales-channels |
| `/admin/google-shopping` | ✅ REAL | ChannelLinkClient | sales-channels |
| `/admin/instagram-facebook` | ✅ REAL | ChannelLinkClient | sales-channels |
| `/admin/tiktok` | ✅ REAL | ChannelLinkClient | sales-channels |
| `/admin/pinterest` | ✅ REAL | ChannelLinkClient | sales-channels |
| `/admin/marketplaces` | ✅ REAL | ChannelLinkClient | sales-channels |

### Expansão

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/apps` | 🔲 STATIC | RoutePlaceholderPage | — |
| `/admin/billing` | ✅ REAL | BillingClient | `GET /admin/billing` |

### Configurações

| Rota | Status | Componente | Backend Endpoint |
|------|--------|------------|------------------|
| `/admin/settings` | 🔲 STATIC | SettingsClient (nav grid) | — |
| `/admin/settings/contact-info` | ✅ REAL | ContactInfoClient | `GET/PUT /admin/stores/me` via storeSettingsService |
| `/admin/settings/checkout` | ✅ REAL | CheckoutClient | `GET/PUT /admin/stores/me` (checkoutSettingsJson) |
| `/admin/settings/payment-methods` | 🔲 STATIC | PaymentMethodsClient | Link → integrations |
| `/admin/settings/shipping-methods` | 🔲 STATIC | ShippingMethodsClient | ❌ Backend existe: `GET /shipping-offers` |
| `/admin/settings/emails` | ✅ REAL | EmailsClient | `GET/PUT /email/*` via emailService |
| `/admin/settings/domains` | ⚠️ HARDCODED | DomainsClient | ❌ Sem backend |
| `/admin/settings/languages` | ✅ REAL | LanguagesClient | `GET/PUT /admin/stores/me` (storeCurrency) |
| `/admin/settings/integrations` | ✅ REAL | IntegrationsSettingsClient | Stripe + Melhor Envio |
| `/admin/settings/redirects` | ⚠️ HARDCODED | RedirectsClient | ❌ Sem backend. Precisa nova tabela |
| `/admin/settings/messages` | ✅ REAL | MessagesClient | `GET/PUT /admin/stores/me` (customerMessageJson) |
| `/admin/settings/distribution-centers` | ⚠️ HARDCODED | DistributionCentersClient | ❌ Sem backend. Precisa nova tabela |
| `/admin/settings/users` | ✅ REAL (read) | UsersClient | `GET /admin/stores/me/users` via storeSettingsService |
| `/admin/settings/custom-fields` | 🔲 STATIC | CustomFieldsClient | ❌ `customProductAttributesJson` na store |

---

## 4. Status de Cada Página Super Admin

| Rota | Status | Componente | Backend? |
|------|--------|------------|----------|
| `/super-admin` (Dashboard) | ✅ REAL | SaDashboardPage | overview + subscriptionStats + activityLogs |
| `/super-admin/analytics` | ⚠️ HARDCODED | SaAnalyticsPage | ❌ Sem backend analytics |
| `/super-admin/activity` | ✅ REAL | SaActivityPage | listActivityLogs |
| `/super-admin/stores` | ✅ REAL | SaStoresPage | overview + listStores + toggleStatus |
| `/super-admin/stores/approvals` | ✅ REAL | (reusa SaStoresPage) | " |
| `/super-admin/stores/performance` | ✅ REAL | (reusa SaStoresPage) | " |
| `/super-admin/users` | ✅ REAL | SaUsersPage | overview + listUsers + toggleStatus |
| `/super-admin/users/roles` | ✅ REAL | (reusa SaUsersPage) | " |
| `/super-admin/users/sessions` | ✅ REAL | (reusa SaUsersPage) | " |
| `/super-admin/subscriptions` | ✅ REAL | SaSubscriptionsPage | plans + subscriptions + stats |
| `/super-admin/subscriptions/subscribers` | ✅ REAL | (reusa SaSubscriptionsPage) | " |
| `/super-admin/subscriptions/billing` | ✅ REAL | (reusa SaSubscriptionsPage) | " |
| `/super-admin/affiliates` | ✅ REAL | SaAffiliatesPage | stats + affiliates + conversions + payouts |
| `/super-admin/affiliates/partners` | ✅ REAL | (reusa SaAffiliatesPage) | " |
| `/super-admin/affiliates/commissions` | ✅ REAL | (reusa SaAffiliatesPage) | " |
| `/super-admin/affiliates/tracking` | ✅ REAL | (reusa SaAffiliatesPage) | " |
| `/super-admin/marketing` | ✅ REAL | SaMarketingPage | stats + campaigns + banners |
| `/super-admin/marketing/push` | ✅ REAL | (reusa SaMarketingPage) | " |
| `/super-admin/marketing/banners` | ✅ REAL | (reusa SaMarketingPage) | " |
| `/super-admin/emails` | ✅ REAL | SaEmailsPage | logs + templates + overview |
| `/super-admin/emails/templates` | ✅ REAL | (reusa SaEmailsPage) | " |
| `/super-admin/emails/config` | ✅ REAL | (reusa SaEmailsPage) | config tab hardcoded |
| `/super-admin/notifications` | ✅ REAL | SaNotificationsPage | stats + notifications |
| `/super-admin/support` | ✅ REAL | SaSupportPage | overview + supportTickets |
| `/super-admin/finance` | ✅ PARCIAL | SaFinancePage | subscriptionStats (overview OK, tabs parcial) |
| `/super-admin/finance/transactions` | ⚠️ PLACEHOLDER | (reusa SaFinancePage) | "Stripe não configurado" |
| `/super-admin/finance/payouts` | ⚠️ PLACEHOLDER | (reusa SaFinancePage) | "Stripe não configurado" |
| `/super-admin/finance/fees` | ⚠️ HARDCODED | (reusa SaFinancePage) | Fee rates inline |
| `/super-admin/reports` | ⚠️ HARDCODED | SaReportsPage | ❌ Sem backend reports |
| `/super-admin/reports/growth` | ⚠️ HARDCODED | (reusa SaReportsPage) | " |
| `/super-admin/reports/export` | ⚠️ HARDCODED | (reusa SaReportsPage) | " |
| `/super-admin/settings` | ✅ REAL (parcial) | SaSettingsPage | `GET /super-admin/settings/general` (Geral tab wired) |
| `/super-admin/settings/integrations` | ⚠️ HARDCODED | (reusa SaSettingsPage) | " |
| `/super-admin/settings/api-keys` | ⚠️ HARDCODED | (reusa SaSettingsPage) | " |
| `/super-admin/security` | ⚠️ HARDCODED | SaSecurityPage | ❌ Sem backend |
| `/super-admin/appearance` | ⚠️ HARDCODED | SaAppearancePage | ❌ Sem backend |
| `/super-admin/domains` | ⚠️ HARDCODED | SaDomainsPage | ❌ Sem backend |
| `/super-admin/infrastructure` | ⚠️ HARDCODED | SaInfrastructurePage | ❌ Sem backend |

---

## 5. Backend — Controllers e Endpoints (210+ endpoints)

### Cobertura de Frontend

| Controller | Base Path | Admin Service? | SA Service? |
|------------|-----------|---------------|-------------|
| AuthController | `/auth` | ✅ auth.ts | — |
| UserController | `/users` | — | — |
| ProductController | `/products` | ✅ product.ts | — |
| CategoryController | `/categories` | ✅ categoryService.ts | — |
| BrandController | `/brands` | ✅ brand.ts (parcial - só list) | — |
| ProductVariantController | `/products/{pid}/variants` | ✅ via product.ts | — |
| ProductImageController | `/products/{pid}/images` | ✅ via product.ts | — |
| OrderController | `/orders` | ✅ orderService.ts | — |
| CustomerController | `/customers` | ✅ customerService.ts | — |
| CouponController | `/coupons` | ✅ couponService.ts | — |
| PromotionController | `/promotions` | ✅ promotionService.ts | — |
| PaymentController | `/payments` | ✅ (checkout flow) | — |
| **NotificationController** | `/notifications` | ❌ **SEM SERVICE** | — |
| **MarketingController** | `/marketing` | ❌ **SEM SERVICE** | — |
| **EmailAdminController** | `/email` | ❌ **SEM SERVICE** | — |
| **ChatAdminController** | `/admin/chat` | ❌ **SEM SERVICE** | — |
| **AffiliateController** | `/affiliates` | ❌ **SEM SERVICE** | — |
| **AbandonedCartAdminController** | `/admin/abandoned-carts` | ❌ **SEM SERVICE** | — |
| **ShippingOfferController** | `/shipping-offers` | ❌ **SEM SERVICE** | — |
| BlogPostAdminController | `/admin/blog/posts` | ✅ blogService.ts | — |
| ShippingLabelController | `/shipping-labels/melhor-envio` | ✅ shippingLabelsService.ts | — |
| ShippingAccountController | `/shipping-accounts/melhor-envio` | ✅ integrationService.ts | — |
| StoreManagementController | `/admin/stores` | ✅ storeSettingsService (parcial) | ✅ superAdminService |
| StoreBillingController | `/admin/billing` | ✅ billingService.ts | — |
| StoreSalesChannelSettingsController | `/admin/stores/me/sales-channels` | ✅ salesChannels.ts | — |
| UserManagementController | `/admin/users` | ✅ storeSettingsService (parcial) | ✅ superAdminService |
| SuperAdminOperationsController | `/super-admin` | — | ✅ superAdminService |
| SubscriptionManagementController | `/super-admin/subscriptions` | — | ✅ superAdminService |
| SuperAdminNotificationController | `/super-admin/notifications` | — | ✅ superAdminService |
| SuperAdminMarketingController | `/super-admin/marketing` | — | ✅ superAdminService |
| SuperAdminAffiliateController | `/super-admin/affiliates` | — | ✅ superAdminService |

---

## 6. Gap Analysis — O Que Falta

### 🔴 PRIORIDADE ALTA — Backend EXISTE mas frontend NÃO conecta

Estas são vitórias rápidas — o backend já tem os endpoints, só precisa:
1. Criar o service file no frontend
2. Conectar a página existente (ou criar uma)

| Funcionalidade | Backend Endpoints | Frontend Page | O Que Fazer |
|----------------|-------------------|---------------|-------------|
| **Chat/Inbox** | 8 endpoints em `/admin/chat/*` | `/admin/chat` (placeholder) | Criar `chatService.ts` + conectar página |
| **Marketing Admin** | 13 endpoints em `/marketing/*` | `/admin/marketing` (placeholder) | Criar `marketingService.ts` + conectar página |
| **Notificações Admin** | 7 endpoints em `/notifications/*` | Sem página no admin | Criar `notificationService.ts` + adicionar sino no header |
| **E-mails Admin** | 5 endpoints em `/email/*` | `/admin/settings/emails` (hardcoded) | Criar `emailService.ts` + conectar |
| **Carrinhos Abandonados** | 3 endpoints em `/admin/abandoned-carts/*` | `/admin/sales/abandoned-carts` (placeholder) | Criar `abandonedCartService.ts` + conectar |
| **Frete Grátis / Shipping Offers** | 4 endpoints em `/shipping-offers/*` | `/admin/discounts/free-shipping` (placeholder) | Criar `shippingOfferService.ts` + conectar |
| **Afiliados Admin** | 15 endpoints em `/affiliates/*` | Sem página dedicada no admin | Criar `affiliateService.ts` + página |
| **Usuários da Loja** | `storeSettingsService.ts` existe | `/admin/settings/users` (hardcoded) | Conectar ao `storeSettingsService` existente |

### 🟡 PRIORIDADE MÉDIA — Backend PARCIAL ou dados na Store entity (JSON)

| Funcionalidade | Backend Status | Frontend Page | O Que Fazer |
|----------------|---------------|---------------|-------------|
| **Contact Info** | `GET/PUT /admin/stores/me` já retorna nome, email, phone, address | `/admin/settings/contact-info` (hardcoded) | Wiring puro — usar `storeSettingsService.getMyStore()` + `.updateMyStore()` |
| **Checkout Settings** | `checkoutSettingsJson` coluna na store | `/admin/settings/checkout` (hardcoded) | Wiring — parse/save JSON via `updateMyStore()` |
| **Customer Messages** | `customerMessageJson` coluna na store | `/admin/settings/messages` (hardcoded) | Wiring — parse/save JSON via `updateMyStore()` |
| **Languages/Currency** | `storeCurrency` coluna na store | `/admin/settings/languages` (hardcoded) | Wiring — ler/atualizar `storeCurrency` via `updateMyStore()` |
| **Custom Fields** | `productAttributeSettingsJson` + `customProductAttributesJson` na store | `/admin/settings/custom-fields` (static) | Wiring — ler/atualizar JSON via `updateMyStore()` |
| **SA Settings (Geral)** | `GET /super-admin/settings/general` existe | `/super-admin/settings` (hardcoded) | Wiring usando `superAdminService.getGeneralSettings()` que já existe |
| **SA Finance Transactions** | Precisa Stripe API | `/super-admin/finance/transactions` (placeholder) | Precisa Stripe Dashboard integration |
| **SA Finance Payouts** | Precisa Stripe API | `/super-admin/finance/payouts` (placeholder) | Precisa Stripe Payouts API |

### 🟠 PRIORIDADE BAIXA — Backend NÃO existe, precisa criar

| Funcionalidade | O Que Precisa no Backend | Frontend Page |
|----------------|-------------------------|---------------|
| **Estatísticas (5 sub-páginas)** | Analytics service com métricas de conversão, receita por período, tráfego. Precisa tracking de eventos. | 5 placeholders em `/admin/statistics/*` |
| **Pedidos Manuais** | Endpoint `POST /orders/store` para criar pedido manual | `/admin/sales/manual-orders` |
| **Tabelas de Preço** | Entidade `PriceTable` + CRUD endpoints | `/admin/products/price-tables` |
| **Manutenção (Under Construction)** | Flag `underConstruction: boolean` na store (ou no JSON) | `/admin/online-store/under-construction` |
| **Integrações (Apps)** | App store / marketplace de integrações | `/admin/apps` |
| **Domínios (Admin)** | Entidade `CustomDomain` + tabela + validação DNS | `/admin/settings/domains` |
| **Redirecionamentos** | Entidade `UrlRedirect` + tabela + CRUD | `/admin/settings/redirects` |
| **Centros de Distribuição** | Entidade `DistributionCenter` + tabela + CRUD | `/admin/settings/distribution-centers` |
| **Métodos de Envio** | Tela de configuração de shipping offers | `/admin/settings/shipping-methods` |
| **SA Analytics** | Analytics aggregation service para cross-store | `/super-admin/analytics` |
| **SA Reports** | Report generation + export (PDF/CSV) | 3 páginas `/super-admin/reports/*` |
| **SA Security** | Security audit log, 2FA config, IP whitelist | `/super-admin/security` |
| **SA Appearance** | Tema/branding do painel admin customizável | `/super-admin/appearance` |
| **SA Domains** | Gestão de domínios da plataforma | `/super-admin/domains` |
| **SA Infrastructure** | Health monitoring, métricas de servidor | `/super-admin/infrastructure` |

---

## 7. Tarefas Prioritárias

### FASE 1 — Wiring Puro (só frontend, backend já existe) ⚡

> Sem mudanças no backend. Apenas criar services e conectar páginas.

| # | Tarefa | Complexidade | Arquivos |
|---|--------|-------------|----------|
| 1.1 | **Conectar Settings > Contact Info** ao `storeSettingsService` | 🟢 Fácil | `settings/contact-info` page |
| 1.2 | **Conectar Settings > Checkout** ao `storeSettingsService` (checkoutSettingsJson) | 🟢 Fácil | `settings/checkout` page |
| 1.3 | **Conectar Settings > Messages** ao `storeSettingsService` (customerMessageJson) | 🟢 Fácil | `settings/messages` page |
| 1.4 | **Conectar Settings > Languages** ao `storeSettingsService` (storeCurrency) | 🟢 Fácil | `settings/languages` page |
| 1.5 | **Conectar Settings > Users** ao `storeSettingsService` (listUsers/createUser/deleteUser) | 🟡 Médio | `settings/users` page |
| 1.6 | **Criar `notificationService.ts`** + adicionar bell icon no admin header | 🟡 Médio | Novo service + header.tsx |
| 1.7 | **Criar `emailService.ts`** + conectar Settings > Emails | 🟡 Médio | Novo service + `settings/emails` page |
| 1.8 | **Criar `abandonedCartService.ts`** + conectar Abandoned Carts page | 🟡 Médio | Novo service + `sales/abandoned-carts` page |
| 1.9 | **Criar `shippingOfferService.ts`** + conectar Free Shipping page | 🟡 Médio | Novo service + `discounts/free-shipping` page |
| 1.10 | **Criar `chatService.ts`** + construir Chat/Inbox page | 🔴 Alto | Novo service + reescrever `chat` page |
| 1.11 | **Criar `marketingService.ts`** + construir Marketing admin page | 🔴 Alto | Novo service + reescrever `marketing` page |
| 1.12 | **Criar `affiliateService.ts`** + construir Affiliates admin page | 🔴 Alto | Novo service + nova página (não está na sidebar) |
| 1.13 | **Conectar SA Settings** ao endpoint `getGeneralSettings` já existente | 🟡 Médio | `sa-settings-page.tsx` |
| 1.14 | **Conectar Settings > Custom Fields** ao store JSON | 🟢 Fácil | `settings/custom-fields` page |
| 1.15 | **Conectar Settings > Shipping Methods** ao `/shipping-offers` | 🟡 Médio | `settings/shipping-methods` page |

### FASE 2 — Backend Simples (tabelas/endpoints novos)

| # | Tarefa | Backend | Frontend |
|---|--------|---------|----------|
| 2.1 | **Domínios Admin** — criar `custom_domains` table + CRUD controller | Migration + Entity + Controller | Conectar `settings/domains` |
| 2.2 | **Redirecionamentos** — criar `url_redirects` table + CRUD | Migration + Entity + Controller | Conectar `settings/redirects` |
| 2.3 | **Centros de Distribuição** — criar `distribution_centers` table + CRUD | Migration + Entity + Controller | Conectar `settings/distribution-centers` |
| 2.4 | **Pedidos Manuais** — endpoint `POST /orders/store` | Controller method + Service | Conectar `sales/manual-orders` |
| 2.5 | **Under Construction flag** — add col to store or use JSON | Migration (se col) | Conectar page |
| 2.6 | **Tabelas de Preço** — criar `price_tables` + `price_table_entries` | Migration + Entity + Controller | Conectar page |

### FASE 3 — Features Complexas (requer design significativo)

| # | Tarefa | Complexidade | Depende de |
|---|--------|-------------|------------|
| 3.1 | **Estatísticas Admin (5 páginas)** — aggregate order/product/shipping analytics | 🔴 | Tracking events, time-series queries |
| 3.2 | **SA Analytics** — cross-store analytics dashboard | 🔴 | Same as above + store aggregation |
| 3.3 | **SA Reports + Export** — generate/export PDF/CSV reports | 🔴 | Analytics data + file generation |
| 3.4 | **SA Finance Transactions/Payouts** — read from Stripe Connect | 🔴 | Stripe API integration |
| 3.5 | **SA Security** — audit logging, 2FA, IP whitelist | 🔴 | Spring Security extension |
| 3.6 | **SA Infrastructure** — health monitoring dashboard | 🟡 | Spring Boot Actuator |
| 3.7 | **SA Appearance** — customizable admin branding | 🟡 | Store entity JSON + theme system |
| 3.8 | **SA Domains** — domain management + DNS verification | 🔴 | DNS API, cert management |
| 3.9 | **Apps/Integrações marketplace** | 🔴 | App registration system |

---

## 8. Dependências Externas

### ✅ Já Integrado
| Serviço | Status | Usado Em |
|---------|--------|----------|
| **Stripe Payments** | ✅ Checkout flow funciona | PaymentController, checkout na store |
| **Stripe Connect** | ✅ Onboarding + Dashboard | StoreManagementController, admin payments page |
| **Melhor Envio** | ✅ OAuth + Labels | ShippingAccountController, ShippingLabelController |
| **Resend (Email)** | ✅ Transactional emails | EmailAdminController, webhook |

### 🟡 Parcialmente Configurado
| Serviço | Status | Necessário Para |
|---------|--------|-----------------|
| **Stripe Connect Payouts** | 🟡 Conta conectada existe, falta ler payouts | SA Finance > Transactions/Payouts |

### ❌ Não Configurado — Precisa de Credenciais/Setup
| Serviço | Necessário Para | Dados Que Você Precisa |
|---------|-----------------|----------------------|
| **Google Analytics API** | Admin Statistics > Traffic Sources | GA4 Property ID + Service Account key |
| **Facebook/Meta Business API** | Instagram/Facebook channel, Ads | App ID, App Secret, Access Token |
| **Google Merchant Center** | Google Shopping | Merchant Center ID + API key |
| **TikTok Business API** | TikTok channel | App ID, Secret |
| **Pinterest Business API** | Pinterest channel | App ID, Secret |
| **Firebase Cloud Messaging (FCM)** | Push Notifications (SA + Admin) | Firebase project + service account |
| **Custom DNS Provider API** | Domain management (SA Domains) | DNS API credentials (CloudFlare, etc.) |
| **Let's Encrypt / ACME** | SSL for custom domains | Automatic (via DNS verification) |
| **AWS S3 / CloudFront** | File storage (production) | Bucket name, access key, secret |
| **Sentry / Error tracking** | SA Infrastructure monitoring | DSN key |
| **Uptime monitoring API** | SA Infrastructure | External service (Uptime Robot, etc.) |
| **SMTP (alternativo ao Resend)** | SA Emails > SMTP Config | SMTP host, port, user, pass |

---

## Resumo Quantitativo (ATUALIZADO)

| Métrica | Valor |
|---------|-------|
| **Total de páginas Admin** | 58 |
| **Admin — Conectadas ao backend (REAL)** | 38 (66%) |
| **Admin — Hardcoded (não salva)** | 3 (5%) |
| **Admin — Static/Placeholder** | 16 (27%) |
| **Admin — Redirect** | 1 (2%) |
| | |
| **Total de páginas Super Admin** | 38 |
| **SA — Conectadas ao backend (REAL)** | 28 (74%) |
| **SA — Hardcoded** | 10 (26%) |
| | |
| **Backend endpoints totais** | ~210 |
| **Admin services com cobertura** | 19 services |
| **Admin endpoints SEM service frontend** | ~13 (affiliate parcial) |
| **Backend controllers sem frontend** | 0 (todos cobertos) |
| | |
| **Tarefas Fase 1 (wiring puro)** | 15 (10 CONCLUÍDAS) |
| **Tarefas Fase 2 (backend simples)** | 6 |
| **Tarefas Fase 3 (complexas)** | 9 |
| **Total de tarefas** | **30** |

---

## 9. Implementações Realizadas (Log)

### Services criados

| Service | Arquivo | Endpoints cobertos |
|---------|---------|-------------------|
| abandonedCartService | `src/services/abandonedCartService.ts` | 3 endpoints: stats, list, getById |
| shippingOfferService | `src/services/shippingOfferService.ts` | 4 endpoints: list, create, update, toggleActive |
| notificationService | `src/services/notificationService.ts` | 7 endpoints: list, unreadCount, markRead, markAllRead, types, prefs, updatePref |
| marketingService | `src/services/marketingService.ts` | 15+ endpoints: stats, campaigns CRUD, banners CRUD, push CRUD, ads accounts CRUD |
| chatService | `src/services/chatService.ts` | 8 endpoints: conversations CRUD, messages, sendMessage, markRead, stats |
| affiliateService | `src/services/affiliateService.ts` | 15 endpoints: settings, affiliates CRUD, links, conversions, payouts, stats |

### Páginas conectadas ao backend (antes eram placeholder/hardcoded)

| Página | Componente | O que foi feito |
|--------|-----------|----------------|
| `/admin/sales/abandoned-carts` | AbandonedCartsClient | Stats cards + tabela + paginação + filtro de status |
| `/admin/discounts/free-shipping` | FreeShippingClient | Lista de ofertas + toggle ativo + dialog de criação |
| `/admin/marketing` | MarketingClient | Stats + tabs (Campanhas/Banners) + CRUD campanhas + tabela banners |
| `/admin/chat` | ChatClient | Stats + lista de conversas + painel de mensagens + envio + status |
| `/admin/settings/languages` | LanguagesClient | Agora lê storeCurrency do backend + salva com updateMyStore |
| `/admin/settings/contact-info` | (já existia) | Verificado: já estava wired via storeSettingsService |
| `/admin/settings/checkout` | (já existia) | Verificado: já estava wired com checkoutSettingsJson |
| `/admin/settings/emails` | (já existia) | Verificado: já estava wired via emailService |
| `/admin/settings/messages` | (já existia) | Verificado: já estava wired com customerMessageJson |
| `/admin/settings/users` | (já existia) | Verificado: já estava wired (read-only) via storeSettingsService |

### Componentes UI criados

| Componente | Arquivo |
|-----------|---------|
| AbandonedCartsClient | `src/components/features/sales/AbandonedCartsClient.tsx` |
| FreeShippingClient | `src/components/features/discounts/FreeShippingClient.tsx` |
| MarketingClient | `src/components/features/marketing/MarketingClient.tsx` |
| ChatClient | `src/components/features/chat/ChatClient.tsx` |

### Upgrades em componentes existentes

| Componente | O que mudou |
|-----------|-------------|
| Admin Header (`header.tsx`) | Sino de notificação agora mostra count real + dropdown com notificações recentes + "marcar todas lidas" |
| SA Settings Page (`sa-settings-page.tsx`) | Tab "Geral" agora carrega dados reais de `GET /super-admin/settings/general` |
| LanguagesClient | Reescrito: agora usa useQuery + useMutation com storeSettingsService para storeCurrency |

### Páginas que permanecem placeholder (sem backend)

Estas 8 páginas NÃO TÊM endpoints no backend — precisam de novas tabelas/controllers:

1. `/admin/statistics` (5 sub-páginas) — precisa backend de analytics
2. `/admin/sales/manual-orders` — precisa lógica de criação manual de pedidos
3. `/admin/products/price-tables` — precisa tabela price_tables
4. `/admin/customers/messages` — pode ser migrado para redirecionar ao Chat
5. `/admin/apps` — marketplace de apps (futuro)

