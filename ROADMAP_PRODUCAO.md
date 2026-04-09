# 🚀 ROADMAP PARA PRODUÇÃO — Lojaki SaaS

> Gerado em 09/04/2026 — Auditoria completa dos 3 repositórios  
> **Última atualização:** 09/04/2026 — Sprint de implementação  
> **Meta:** Colocar a plataforma em produção e começar a vender

---

## 📊 STATUS GERAL POR REPOSITÓRIO

| Repo | Stack | Completude | Blocker Crítico |
|------|-------|-----------|----------------|
| **lojaki-backend** | Java 17 / Spring Boot 3.4.1 | ~85% | ~~CI/CD sem testes~~ ✅ Resolvido |
| **fastcart-admin-panel** | Next.js 16 / TypeScript | ~90% | ~~0% code splitting~~ ✅ Resolvido |
| **lojaki-store** | Next.js 16 / TypeScript | ~82% | 0% testes E2E |

---

## 🔴 FASE 0 — BLOQUEADORES PARA PRODUÇÃO (Semana 1-2)

Sem estes itens, **NÃO É SEGURO fazer deploy para clientes reais.**

### 0.1 CI/CD Pipeline com Testes (Backend) ✅ FEITO
- **Status:** ✅ Implementado — job `test` com `mvn clean verify` (JDK 17) adicionado ANTES do deploy; deploy agora `needs: test`
- **Arquivo modificado:** `.github/workflows/deploy.yml`
- **Prioridade:** 🔴 P0
- **Pendente:** staging environment com approval gate

### 0.2 Backup Automático do Banco
- **Status:** ❌ Zero — nenhum script de backup
- **O que fazer:**
  - Se usar AWS RDS: ativar automated backups (35 dias retenção)
  - Se usar EC2 + Docker: criar cron job:
    ```bash
    # Diário 2AM — backup + upload S3
    pg_dump -U postgres lojaki_db | gzip | aws s3 cp - s3://lojaki-backups/db-$(date +%Y%m%d).sql.gz
    ```
  - Testar restore pelo menos 1x antes de ir para produção
- **Prioridade:** 🔴 P0
- **Esforço:** 2-4 horas

### 0.3 Monitoramento de Erros (Sentry) ✅ PARCIAL
- **Status Admin Panel:** ✅ `@sentry/nextjs` instalado, `sentry.client.config.ts` + `sentry.server.config.ts` criados, `next.config.ts` wrappado com `withSentryConfig`, `error.tsx` envia para Sentry
- **Status Storefront:** ✅ `@sentry/nextjs` instalado, configs criados
- **Status Backend:** ⬜ Pendente — adicionar `sentry-spring-boot-starter-jakarta`
- **Pendente:** Criar projeto no sentry.io, configurar DSN nas env vars (`NEXT_PUBLIC_SENTRY_DSN`)
- **Prioridade:** 🔴 P0

### 0.4 SSL/HTTPS + Domínio
- **Status:** Parcial — configuração pronta, não ativada
- **O que fazer:**
  - AWS ACM: gerar certificado wildcard `*.lojaki.com.br`
  - Configurar ALB/CloudFront com SSL termination
  - Forçar redirect HTTP → HTTPS no nginx
- **Prioridade:** 🔴 P0
- **Esforço:** 2-4 horas

---

## 🟠 FASE 1 — ESSENCIAL PARA VENDER (Semana 2-4)

### 1.1 Quotas / Limites de Plano na UI ✅ PARCIAL
- **Status Backend:** ✅ PlanLimitsService já checa produtos, pedidos, staff, IA
- **Status Admin:** ✅ `<QuotaWarningBanner />` criado em `src/components/shared/QuotaWarningBanner.tsx` e integrado no `app/admin/layout.tsx`
  - Mostra aviso âmbar quando uso > 80%
  - Mostra alerta vermelho quando uso = 100%
  - Botão "Fazer Upgrade" → `/admin/billing`
  - Dismissível por sessão
- **Pendente:**
  - Modal "Limite atingido" quando API retorna erro de quota
  - Badge no sidebar mostrando "12/15 produtos"
- **Prioridade:** 🟠 P1

### 1.2 Ajuda Contextual (Tooltips)
- **Status:** Componente `FieldHelper` existe, SISTEMA_AJUDA_CONTEXTUAL.md tem 250+ tooltips mapeados, ~20% conectado
- **O que fazer:**
  - Implementar sistematicamente em todas as telas de formulário
  - Começar pelas mais usadas: Produto, Pedido, Configurações
  - Cada tooltip já tem texto no .md — só precisa conectar
- **Prioridade:** 🟠 P1
- **Esforço:** 3-5 dias

### 1.3 Code Splitting no Admin Panel ✅ FEITO
- **Status:** ✅ 8 páginas pesadas convertidas para `dynamic(() => import(...))`:
  - Dashboard, Products, Sales/Orders, Customers, Statistics, Payments, Marketing, Settings
  - Cada uma com skeleton loading enquanto carrega
- **Pendente:** Bundle analyzer (`@next/bundle-analyzer`) para medir impacto
- **Prioridade:** 🟠 P1

### 1.4 Otimização de Imagens no Admin Panel ✅ FEITO
- **Status:** ✅ Domínios restritos (`*.amazonaws.com`, `*.cloudinary.com`, `images.unsplash.com`, `*.googleusercontent.com`, `*.lojaki.com.br`, `localhost`)
- ✅ Formatos otimizados: `['image/avif', 'image/webp']`
- **Pendente:** CDN (CloudFront/Cloudinary) para cache em produção
- **Prioridade:** 🟠 P1

### 1.5 CSV Export para Usuários ✅ FEITO
- **Status:** ✅ Utilitário genérico `downloadCSV()` criado em `src/lib/csv-export.ts` (BOM para Excel, column mapping, filename com data)
- ✅ Botão "Exportar CSV" adicionado em:
  - **Produtos** — já tinha (reimplementado com novo utilitário)
  - **Pedidos** — já tinha
  - **Clientes** — ✅ NOVO: botão adicionado no header do `CustomerClient.tsx`
- **Prioridade:** 🟠 P1

---

## 🟡 FASE 2 — FEATURES DE RECEITA (Semana 4-8)

### 2.1 Testes Automatizados
O investimento em testes NÃO precisa ser 100% cobertura. Comece pelo caminho crítico.

#### Backend (121 testes já existem!)
- **Status:** ✅ 121 arquivos de teste, boa cobertura de services
- **O que falta:**
  - Integrar no CI (`mvn verify`)
  - Adicionar testes de integração para fluxo de pagamento (Stripe mock)
  - Adicionar testes de integração para fluxo de pedido completo
- **Esforço:** 3-5 dias

#### Admin Panel (0 testes)
- **O que fazer:**
  - Instalar Vitest + React Testing Library
  - Testar: AuthContext, BillingClient, OrderForm, ProductForm
  - Adicionar script `"test": "vitest"` no package.json
  - Testar fluxos E2E com Playwright (login → criar produto → ver na loja)
- **Esforço:** 1-2 semanas (incremental)

#### Storefront (0 testes)
- **O que fazer:**
  - Instalar Playwright
  - Testar: navegação, busca, carrinho, checkout (mock de pagamento)
- **Esforço:** 1 semana

### 2.2 Gift Cards — Concluir Fluxo
- **Status Backend:** ✅ Entity, Service, DTOs, Tests existem
- **Status Admin:** Parcial — UI de gerenciamento existe?
- **O que fazer:**
  - Validar fluxo: admin cria → cliente compra → código gerado → email enviado → cliente resgata no checkout
  - Testar: saldo, transações, expiração
- **Prioridade:** 🟡 P2
- **Esforço:** 2-3 dias

### 2.3 Assinaturas de Produto (Recurring)
- **Status Backend:** ✅ ProductSubscriptionService com Stripe + MP
- **Status Frontend:** Parcial
- **O que fazer:**
  - Validar botão "Assinar" na página do produto (storefront)
  - Testar ciclo: ativa → cobra automático → renova / cancela
  - Testar webhooks de renovação
- **Prioridade:** 🟡 P2
- **Esforço:** 2-3 dias

### 2.4 Landing Pages da Plataforma
- **Status:** 4 de ~20 páginas implementadas
- **O que fazer (por prioridade):**
  1. `/solutions` — páginas por nicho (moda, food, tech)
  2. `/channels` — marketplace, social commerce
  3. `/comparisons` — vs Shopify, vs Nuvemshop
  4. `/case-studies` — social proof
  5. `/partners` — programa de afiliados/parceiros
- **Prioridade:** 🟡 P2
- **Esforço:** 3-5 dias (por lote de 4 páginas)

### 2.5 NF-e — Integração Real com Sefaz
- **Status:** Framework completo (entities, service, config, tests)
- **O que fazer:**
  - Integrar com provider real (Focus NFe, Enotas, ou WebmaniaBR)
  - Testar emissão em ambiente de homologação
  - Automatizar emissão após pagamento confirmado
- **Prioridade:** 🟡 P2 (obrigatório legal no Brasil)
- **Esforço:** 3-5 dias (depende do provider)

### 2.6 Devoluções/Trocas — UI Completa
- **Status Backend:** ✅ ReturnService com status tracking completo
- **Status Frontend:** Parcial
- **O que fazer:**
  - Tela do cliente para solicitar devolução
  - Tela do admin para aprovar/rejeitar + reembolso automático
  - Email automático informando status
- **Prioridade:** 🟡 P2
- **Esforço:** 2-3 dias

---

## 🟢 FASE 3 — MELHORIAS E CRESCIMENTO (Semana 8+)

### 3.1 2FA / Autenticação Multifator
- **Status:** Colunas no banco (`twoFactorEnabled`, `twoFactorSecret`), zero lógica
- **O que fazer:**
  - Adicionar lib TOTP (ex: `com.google.auth:google-auth-library-otp` ou `jakarta.security`)
  - Endpoints: habilitar 2FA, gerar QR code, verificar código
  - UI no admin: Settings → Segurança → Ativar 2FA
- **Esforço:** 3-5 dias

### 3.2 LGPD / GDPR — Export e Exclusão de Dados
- **Status:** ❌ Zero — nenhuma implementação
- **O que fazer:**
  - Endpoint `GET /api/v1/customers/me/export` → JSON com todos os dados pessoais
  - Endpoint `DELETE /api/v1/customers/me` → anonimiza PII, mantém pedidos
  - Checkbox de consentimento no cadastro
  - Política de retenção de dados (auto-cleanup após X meses sem atividade)
- **Esforço:** 3-5 dias

### 3.3 XSS Prevention / Content Security Policy ✅ PARCIAL
- **Status CSP:** ✅ Headers de segurança adicionados via `next.config.ts` (admin) e `next.config.mjs` (storefront):
  - `Content-Security-Policy` com `default-src 'self'`, domínios restritos para scripts/imgs/fonts/connect
  - `X-Frame-Options: DENY` (admin) / `SAMEORIGIN` (storefront)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Pendente:**
  - OWASP HTML Sanitizer no backend para campos de texto rico
  - Review de campos que aceitam HTML livre
- **Esforço restante:** 1 dia

### 3.4 Rate Limiting Distribuído
- **Status:** Funciona em memória (ConcurrentHashMap), perde dados no restart
- **O que fazer:**
  - Migrar para Redis (já que o deploy é em Docker)
  - Usar Spring Cache ou Bucket4j com RedisProxyManager
- **Esforço:** 1 dia

### 3.5 Mais Templates de Loja
- **Status:** 4 templates prontos (limpo, patagonia, atlântico, vitrine)
- **O que fazer:** Criar mais 4 templates focados em nichos:
  - Gastronômico (food delivery)
  - Tecnologia (gadgets/eletrônicos)
  - Serviços/Digital (cursos, ebooks)
  - Luxo (joalheria, cosméticos premium)
- **Esforço:** 3-5 dias cada

### 3.6 Web Push Notifications
- **Status:** ❌ Zero — email/SMS existe, browser push não
- **O que fazer:**
  - Implementar Web Push API + Firebase Cloud Messaging
  - Eventos: pedido despachado, carrinho abandonado, promoção
- **Esforço:** 3-5 dias

### 3.7 Error Boundaries no Admin Panel ✅ FEITO
- **Status:** ✅ Componente `<AdminSectionError>` criado em `src/components/shared/AdminSectionError.tsx` com Sentry integration
- ✅ `error.tsx` criado em 8 seções: products, sales, customers, settings, statistics, payments, marketing, integrations
- Cada seção mostra erro isolado com botão "Tentar novamente" sem derrubar a página inteira

### 3.8 White-Label (Remover Branding)
- **Status:** 90% — falta review final
- **O que fazer:**
  - Buscar qualquer menção hardcoded de "Rapidocart", "Lojaki", "FastCart" 
  - Substituir por variáveis configuráveis pelo Super Admin
- **Esforço:** meio dia

### 3.9 Antifraude (Stripe Radar)
- **Status:** Não configurado
- **O que fazer:**
  - Ativar Stripe Radar (vem junto do Stripe, configuração no dashboard)
  - Adicionar `payment_method_options.card.radar_options` no PaymentIntent
- **Esforço:** meio dia

### 3.10 Dunning (Retry de Cobrança)
- **Status:** Não implementado
- **O que fazer:**
  - Configurar Stripe Smart Retries no dashboard
  - Tratar webhook `invoice.payment_failed` para notificar cliente
  - Após X falhas, suspender loja (BlockedAt)
- **Esforço:** 1-2 dias

---

## 📋 CHECKLIST RESUMIDO POR ORDEM DE EXECUÇÃO

### Semana 1 — Infraestrutura Obrigatória
- [ ] Backup automático do banco (cron + S3)
- [x] CI/CD: testes antes do deploy ✅
- [x] Sentry nos 2 frontends ✅ (backend pendente)
- [ ] SSL/HTTPS ativo
- [x] Restringir domínios de imagem no admin panel ✅

### Semana 2 — UX Essencial
- [x] Quota warnings na UI (QuotaWarningBanner) ✅
- [x] Code splitting no admin panel (8 dynamic imports) ✅
- [ ] Tooltips nas telas mais usadas (Produto, Pedido, Config)
- [x] CSV export (Produtos, Pedidos, Clientes) ✅

### Semana 3-4 — Testes & Estabilidade
- [x] Integrar testes no CI (backend `mvn verify`) ✅
- [ ] Vitest + Testing Library no admin panel (5-10 testes críticos)
- [ ] Playwright no storefront (3-5 fluxos E2E)
- [x] Error boundaries por seção no admin ✅

### Semana 5-6 — Features de Receita
- [ ] Gift cards: validar fluxo completo
- [ ] Assinaturas de produto: testar ciclo de cobrança
- [ ] NF-e: integrar provider real
- [ ] Devoluções: UI completa no admin + storefront

### Semana 7-8 — Aquisição & Compliance
- [ ] Landing pages (lotes de 4): solutions, comparisons, partners
- [ ] LGPD: export + exclusão de dados
- [ ] 2FA para contas de admin
- [x] CSP security headers (admin + storefront) ✅
- [ ] XSS sanitization em campos de texto rico (backend)

### Contínuo (Pós-Launch)
- [ ] Mais 4 templates de loja
- [ ] Web Push notifications
- [ ] Rate limiting com Redis
- [ ] Antifraude (Stripe Radar)
- [ ] Dunning (retry de cobrança)
- [ ] White-label review final
- [ ] Mobile app (React Native)

---

## 💰 O QUE JÁ FUNCIONA PARA VENDER HOJE

Se precisar lançar AMANHÃ com o mínimo viável (com Fase 0 feita):

| Funcionalidade | Pronto? |
|---|---|
| Criar loja com template | ✅ |
| Cadastrar produtos com variantes | ✅ |
| Receber pagamento (Stripe) | ✅ |
| Receber pagamento (Mercado Pago) | ✅ |
| Calcular frete (Melhor Envio) | ✅ |
| Gerar etiqueta de envio | ✅ |
| Carrinho + Checkout completo | ✅ |
| Cupons de desconto | ✅ |
| SEO (sitemap, meta, schema.org) | ✅ |
| Google Analytics / FB Pixel | ✅ |
| CRM (conta cliente, histórico, wishlist) | ✅ |
| Multi-tenant com roles | ✅ |
| Planos de assinatura (SaaS billing) | ✅ |
| Dashboard com métricas | ✅ |
| Emails automáticos (Resend) | ✅ |
| PWA (manifest + service worker) | ✅ |
| Super Admin (gestão de lojas) | ✅ |

**Conclusão:** A plataforma é surpreendentemente completa. O gap principal é infraestrutura de confiabilidade (backup, monitoring, CI), não features. Com ~2 semanas de Fase 0 + Fase 1, está pronta para beta fechado com primeiros clientes.
