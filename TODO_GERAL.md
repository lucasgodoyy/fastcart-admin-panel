# TUDO QUE FALTA — Lojaki Platform
> Auditoria completa: 09/04/2026 | Repos: lojaki-backend, fastcart-admin-panel, lojaki-store

---

## 1. SEGURANÇA (CRÍTICO)

1. **JWT secret usa fallback fraco** — `application.properties` tem `lojaki-dev-secret-key-64-bytes...` como default. Se `JWT_SECRET` não estiver setado em produção, qualquer pessoa forja tokens. Solução: fail-fast no profile prod se env var ausente.

2. **`.env` com credenciais de teste no repo** — `sk_test_...`, `whsec_...`, `re_Kvz...` estão no `.env` do backend. Verificar se `.gitignore` exclui. Rotacionar todas as chaves imediatamente.

3. **CORS permite `*.vercel.app`** — Qualquer deploy na Vercel (inclusive de terceiros/concorrentes) pode fazer requests autenticados. Restringir para domínios específicos.

4. **Rate limiting in-memory** — `RateLimitFilter.java` usa `ConcurrentHashMap`. Se tiver 2+ instâncias atrás de load balancer, rate limit é burlável. Migrar para Redis.

5. **Sem OWASP Dependency Check** — `pom.xml` não tem plugin de scan de vulnerabilidades em dependências. Adicionar `org.owasp:dependency-check-maven`.

6. **OWASP HTML Sanitizer ausente** — Campos de texto rico (descrição de produto, blog) aceitam HTML sem sanitização no backend. Adicionar `owasp-java-html-sanitizer` nos DTOs relevantes.

7. **Token no localStorage (admin panel)** — `src/lib/api.ts` guarda JWT em `localStorage`, vulnerável a XSS. Ideal: migrar para cookie `HttpOnly` + `Secure` + `SameSite=Strict`.

8. **Cookie consent incompleto (storefront)** — Banner de LGPD existe mas é binário (aceitar/rejeitar). GTM/GA/Facebook carregam independente da escolha. Implementar consentimento granular por categoria.

9. **CSP permite `unsafe-eval` e `unsafe-inline`** — Headers CSP no `next.config.ts` do admin e store usam diretivas fracas. Migrar para nonces quando possível.

10. **Nginx sem rate limiting** — `nginx/lojaki.conf` não tem `limit_req_zone`. Um DDoS simples passa direto. Adicionar rate limit a nível de nginx.

11. **`client_max_body_size` 50M no nginx** — Muito alto, facilita upload abuse. Reduzir para 10M.

12. **Sem antivírus em uploads** — Arquivos aceitos via API não passam por scan. Avaliar ClamAV ou similar para imagens.

13. **Dev token impresso no stdout** — `LojakiBackendApplication.java` gera token de super admin no startup e printa nos logs. Remover ou proteger com `@Profile("dev")`.

14. **Seed admin com senha fraca** — `DatabaseSeeder.java` cria `admin@lojaki.com / 123456`. Remover em prod ou forçar troca de senha no primeiro login.

---

## 2. INFRAESTRUTURA & DEVOPS

15. **Backup do banco inexistente** — Zero scripts de backup. Se banco corrompe, perde tudo. Configurar backup automático (RDS automated backups ou cron `pg_dump` → S3).

16. **SSL/HTTPS não ativado** — Certs não configurados no deploy. Gerar wildcard `*.lojaki.com.br` no ACM + configurar ALB/CloudFront.

17. **Sentry faltando no backend** — Frontends têm `@sentry/nextjs`, backend não tem monitoring. Adicionar `sentry-spring-boot-starter-jakarta` no `pom.xml`.

18. **Sem structured logging** — Backend usa logging Spring Boot default (texto plano). Adicionar `logback.xml` com output JSON para facilitar agregação (ELK/Datadog).

19. **Sem health indicators customizados** — `/actuator/health` existe mas só checa banco. Adicionar health checks para Stripe, MP, Melhor Envio, Resend.

20. **Docker health check ausente nos frontends** — Dockerfiles do admin e store não têm `HEALTHCHECK`. Adicionar verificação de porta/resposta.

21. **Sem staging environment** — CI/CD faz deploy direto para produção. Adicionar environment `staging` com approval gate no GitHub Actions.

22. **Sem graceful shutdown** — Dockerfile do backend não tem handler de SIGTERM. Requests em andamento podem ser cortados no deploy.

23. **Sem volume persistence para uploads** — Docker compose precisa de volume nomeado para `/uploads/` senão perde imagens no restart.

24. **Sem bundle analyzer** — Admin panel não tem `@next/bundle-analyzer`. Impossível medir impacto do code splitting. Adicionar script `"analyze"`.

---

## 3. TESTES

25. **Admin panel: 0 testes** — Nenhum arquivo de teste. Nenhum test runner instalado. Instalar Vitest + React Testing Library. Prioridade: AuthContext, ProductForm, OrderForm, BillingClient.

26. **Storefront: 0 testes** — Mesma situação. Instalar Playwright para E2E. Prioridade: fluxo completo carrinho → checkout → pagamento → confirmação.

27. **Backend: testes de pagamento insuficientes** — Stripe tem testes básicos (validação), mas falta: webhook processing, falha de pagamento, refund, subscription lifecycle.

28. **Backend: 0 testes pro Mercado Pago** — `MercadoPagoPaymentServiceTest.java` não existe. Todo o fluxo OAuth + pagamento sem cobertura.

29. **Backend: testes de integração faltando** — Falta testar fluxo completo: criar pedido → pagar → webhook → atualizar status → enviar email.

30. **Sem pre-commit hooks** — Nenhum projeto tem `husky` ou `lint-staged`. Código com lint errors pode ser commitado livremente.

---

## 4. INTEGRAÇÕES INCOMPLETAS

31. **NF-e é stub** — `NfeService.java` salva config e cria registro PENDING, mas não emite nota. Zero comunicação com SEFAZ. Integrar com Focus NFe / Enotas / WebmaniaBR.

32. **Mailchimp é UI-only** — Admin panel salva API key e List ID, backend nunca usa. Nenhum cliente é sincronizado. Criar `MailchimpSyncService.java`.

33. **Stripe Radar não configurado** — PaymentIntent criado sem `risk_control`, sem 3D Secure, sem verificação de endereço (AVS). Ativar Radar no dashboard Stripe + adicionar opções no código.

34. **Zapier webhooks sem retry** — `ZapierWebhookService.java` dispara e esquece. Se endpoint do cliente estiver fora, perde o evento. Adicionar retry com backoff exponencial + dead letter queue.

35. **Melhor Envio CPF hardcoded** — `MelhorEnvioLabelAutomationService.java:257` usa `"12345678909"`. Trocar para CPF real do lojista (puxar da config da loja).

36. **Melhor Envio URLs sandbox por padrão** — `application.properties` aponta para `sandbox.melhorenvio.com.br`. Em produção, trocar para `melhorenvio.com.br` no `application-prod.properties`.

37. **MP App ID hardcoded** — Default `4905999120192227` é ID de teste. Remover fallback, exigir env var.

38. **Resend FROM genérico** — Default `noreply@rapidocart.com.br`. Configurar domínio próprio verificado.

39. **Dunning (retry de cobrança) inexistente** — Quando Stripe/MP falha ao cobrar assinatura, nada acontece. Implementar handler para `invoice.payment_failed` + notificar cliente + suspender loja após X falhas.

---

## 5. FRONTEND — ADMIN PANEL

40. **Token sem refresh automático** — `src/lib/api.ts` recebe 401, joga pra login. Sem refresh token strategy. Implementar interceptor com retry usando refresh token.

41. **Blog é placeholder** — `app/blog/[slug]/page.tsx` tem conteúdo estático hardcoded. Conectar com backend CMS ou remover.

42. **Sem SEO por página** — Só layout raiz tem metadata. Páginas de produto/categoria/blog sem meta tags dinâmicas, sem og:image, sem structured data.

43. **16+ imagens com `<img>` nativo** — `ProductClient.tsx`, `LayoutEditorPage.tsx`, `AbandonedCartDetailClient.tsx` usam `<img>` em vez de `next/image`. Perdem otimização, lazy load, WebP.

44. **Acessibilidade mínima** — Quase zero `aria-label`, sem `role` em componentes customizados, sem gestão de foco em modais/drawers.

45. **i18n artesanal** — Usa `t()` customizado com ternários inline. Impossível escalar. Migrar para `next-intl` ou `i18next` com arquivos de tradução.

46. **Proxy.ts sem RBAC** — Só checa se tem token pra `/admin/*`. Não verifica role. Qualquer usuário logado acessa admin.

47. **Tooltips de ajuda contextual ~20% conectados** — `SISTEMA_AJUDA_CONTEXTUAL.md` tem 250+ tooltips mapeados, só ~50 implementados. Falta ligar os restantes.

48. **QuotaWarningBanner precisa de modal** — Banner de 80%/100% existe, mas falta modal de bloqueio quando API retorna erro 429 de quota.

49. **Sidebar sem badge de uso** — Falta indicador "12/15 produtos" nos itens do sidebar pra dar visibilidade ao lojista.

---

## 6. FRONTEND — STOREFRONT (LOJA)

50. **0 skeleton loaders** — Nenhum componente de Skeleton/Shimmer. Telas ficam em branco enquanto carregam. Adicionar skeletons em: grid de produtos, página de produto, carrinho, checkout.

51. **Categorias hardcoded na home** — `template-home-sections.tsx:274` tem array fixo `['Todos', 'Mais vendidos', ...]` em vez de buscar do backend.

52. **Shipping hardcoded no checkout** — `checkout-page.tsx` tem `BASE_SHIPPING_OPTIONS` fixas. Deveria vir dinamicamente do Melhor Envio/config da loja.

53. **Product Spotlight nunca renderiza** — `home-section-renderer.tsx:532` tem TODO: fetch product by ID. Feature não implementada.

54. **18+ imagens com `<img>` nativo** — Mesma issue do admin. `home-section-renderer.tsx`, templates Patagonia/Vitrine, footer, blog usam `<img>` direto.

55. **ARIA quase inexistente** — Só 6 instâncias de `aria-label` no storefront inteiro. Sem roles, sem labels em formulários, sem keyboard nav testada.

56. **Moeda hardcoded BRL** — `Intl.NumberFormat('pt-BR', { currency: 'BRL' })` em 50+ lugares. Se expandir pra outros países, precisa refatorar tudo.

57. **StoreContext.tsx tem 726 linhas** — Contexto gigante, faz tudo. Quebrar em contextos menores ou migrar para React Query.

58. **Sem retry em API calls** — Erros de rede silenciados com `.catch(() => null)`. Sem retry automático, sem timeout handling.

59. **Sem parsing de `X-RateLimit` headers** — Quando backend retorna rate limit, frontend não trata. Deveria mostrar mensagem amigável ou fazer retry com delay.

60. **PIX não aparece no checkout** — Backend suporta PIX (via MP), mas storefront só mostra Stripe card e MP card form. Falta opção de PIX QR code.

61. **Default store slug hardcoded** — `produtos/[slug]/layout.tsx:10` tem `STORE_SLUG='glue-streetwear'`. Deveria vir de contexto/env.

62. **Offline fallback mínimo** — `offline.html` é página em branco. PWA precisa de fallback decente com mensagem e botão de retry.

63. **JSON-LD incompleto** — Produto tem schema parcial (sem preço). Faltam: Organization, LocalBusiness, Breadcrumb, BlogPosting.

64. **Sem background sync** — Service worker não sincroniza carrinho/wishlist offline quando conexão volta.

---

## 7. BANCO DE DADOS & PERFORMANCE

65. **Pouquíssimos índices** — Só 1 CREATE INDEX encontrado nas 115 migrations. Faltam índices em: `products(store_id, active)`, `orders(store_id, created_at)`, `orders(customer_id)`, `product_variants(product_id)`, `cart_items(cart_id)`, `abandoned_carts(store_id)`, `email_campaigns(store_id)`.

66. **Sem timeout de transação** — `@Transactional` sem timeout configurado. Long-running queries podem travar conexões do pool.

67. **Scheduler thread pool = 5** — Default pequeno. Com 12+ scheduled tasks rodando, pode ter gargalo. Prod já usa 10, mas monitorar.

68. **Sem monitoramento de filas de scheduler** — Se tasks acumulam, ninguém sabe. Adicionar métricas de queue depth.

---

## 8. UX & FEATURES PENDENTES

69. **2FA zero lógica** — Colunas `twoFactorEnabled` e `twoFactorSecret` existem no banco, zero implementação. Adicionar TOTP com QR code na tela Settings → Segurança.

70. **LGPD export/exclusão de dados** — Zero implementação. Faltam endpoints `GET /customers/me/export` e `DELETE /customers/me` com anonimização.

71. **Abandoned cart email com nome fixo** — `AbandonedCartEmailBuilder.java:121-122` hardcoda `"Lojaki Store"` e `"support@lojaki.store"` em vez de puxar nome/email da loja real.

72. **Mais templates de loja** — 4 existem (limpo, patagonia, atlântico, vitrine). Faltam nichos: gastronomia, tecnologia, serviços/digital, luxo.

73. **Landing pages da plataforma** — 4 de ~20 existem. Faltam: `/solutions` (nichos), `/comparisons` (vs Shopify/Nuvemshop), `/case-studies`, `/partners`.

74. **Web Push Notifications** — Zero implementação. Falta Firebase Cloud Messaging ou Web Push API para: pedido despachado, carrinho abandonado, promoção.

75. **White-label review** — 90% feito, mas pode ter menções hardcoded de "Rapidocart" / "Lojaki" / "FastCart" em código. Fazer busca e substituir por variáveis.

76. **Devoluções/Trocas UI** — Backend `ReturnService` completo, mas falta: tela do cliente para solicitar devolução + tela do admin para aprovar/rejeitar.

77. **Gift cards validação E2E** — Backend implementado, mas falta testar fluxo completo: admin cria → cliente compra → código gerado → email → resgate no checkout.

78. **Assinaturas de produto testar ciclo** — `ProductSubscriptionService` existe, mas falta validar: ativa → cobra automático → renova/cancela → webhook de renovação.

---

## 9. QUALIDADE DE CÓDIGO

79. **ESLint básico demais (admin)** — Config só tem regras core Next.js. Faltam: import sorting, complexity checks, unused variable detection, no-console.

80. **Sem ESLint no storefront** — Mesma situação.

81. **Sem Prettier configurado** — Nenhum projeto tem `.prettierrc`. Formatação inconsistente entre devs.

82. **Dead code provável** — 180+ componentes no admin sem tree-shaking verificado. Rodar eslint `no-unused-vars` e remover.

83. **Sem type-checking rigoroso** — `tsconfig.json` pode não ter `strict: true`. Verificar e ativar.

---

## 10. DOCUMENTAÇÃO

84. **Sem README de onboarding** — Novo dev não sabe como rodar o projeto. Criar: pré-requisitos, setup banco, env vars obrigatórias, comandos de start.

85. **Sem documentação de API** — Swagger existe mas só em dev. Criar OpenAPI spec exportável ou manter docs em Postman/Insomnia compartilhado.

86. **Env vars não documentadas** — Cada projeto tem 15-30 env vars sem um `.env.example` completo e comentado.

87. **Sem runbook de produção** — Nenhum documento dizendo: como fazer deploy, como fazer rollback, como verificar logs, como escalar.

---

## RESUMO RÁPIDO POR PRIORIDADE

| Prioridade | Qtd | Itens |
|-----------|-----|-------|
| 🔴 Bloqueador | 14 | #1-14 (segurança) |
| 🔴 Infra | 10 | #15-24 |
| 🟠 Testes | 6 | #25-30 |
| 🟠 Integrações | 9 | #31-39 |
| 🟡 Admin Panel | 10 | #40-49 |
| 🟡 Storefront | 15 | #50-64 |
| 🟡 Banco/Perf | 4 | #65-68 |
| 🟢 UX/Features | 10 | #69-78 |
| 🟢 Código | 5 | #79-83 |
| 🟢 Docs | 4 | #84-87 |
| **Total** | **87** | |
