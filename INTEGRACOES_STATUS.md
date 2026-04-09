# STATUS DAS INTEGRAÇÕES — Lojaki
> Auditoria: 09/04/2026

---

## ✅ FUNCIONANDO (código completo, só precisa de credenciais)

### 💳 Stripe Connect
- OAuth Express completo: cria conta, onboarding, status dinâmico, dashboard link
- Checkout com destination charges + taxa de plataforma (1% configurável)
- Webhook handler: `checkout.session.completed`, `.expired`
- **Env vars obrigatórias:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### 💳 Mercado Pago Marketplace
- OAuth completo com refresh automático de token (renova quando falta < 24h)
- Preference com `marketplace_fee` (2% configurável)
- Webhook IPN com validação HMAC
- **Env vars obrigatórias:** `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_CLIENT_SECRET`, `MERCADO_PAGO_REDIRECT_URI`
- ⚠️ APP_ID tem valor padrão de teste (`4905999120192227`) — **trocar em produção**

### 🚚 Melhor Envio
- OAuth completo com refresh automático a cada 6h
- Cotação, geração e impressão de etiquetas
- **Env vars obrigatórias:** `MELHOR_ENVIO_CLIENT_ID`, `MELHOR_ENVIO_CLIENT_SECRET`, `MELHOR_ENVIO_REDIRECT_URI`, `MELHOR_ENVIO_STATE_SECRET`
- ⚠️ URLs padrão apontam para **sandbox** — trocar para produção no `application-prod.yml`:
  ```
  melhor-envio.oauth-authorize-url=https://melhorenvio.com.br/oauth/authorize
  melhor-envio.oauth-token-url=https://melhorenvio.com.br/oauth/token
  melhor-envio.api-base-url=https://melhorenvio.com.br
  ```
- ⚠️ CPF hardcoded `"12345678909"` em `MelhorEnvioLabelAutomationService.java:257` — **trocar para CPF real do lojista**

### 📧 Resend (email transacional)
- Envio real via API Resend, log de status por email, retry manual
- **Env vars obrigatórias:** `RESEND_API_KEY`
- ⚠️ From padrão: `noreply@rapidocart.com.br` — **trocar para domínio da lojista em produção**

### 🔗 Zapier / Webhooks de saída
- Eventos: `order.paid`, `order.shipped`, `order.delivered`, `order.cancelled`, `customer.created`
- Assinatura HMAC `X-Lojaki-Signature`, limite 20 webhooks por loja
- ⚠️ **Sem retry** — falha na entrega é ignorada silenciosamente

---

## ⚠️ PARCIAL (existe, mas incompleto)

### 📊 Mailchimp
- **Frontend:** UI para salvar API key, List ID, Server — existe e salva no banco
- **Backend:** ZERO — credenciais gravadas mas nunca usadas. Nenhum cliente é sincronizado
- **Falta:** Serviço Java que use a API do Mailchimp para sync de lista

---

## ❌ NÃO IMPLEMENTADO

### 📄 NF-e (Nota Fiscal Eletrônica)
- Só salva config e cria registro `PENDING` no banco
- **Não faz nada** — zero comunicação com SEFAZ ou qualquer provider
- Falta: integrar Focus NFe / Enotas / WebmaniaBR, submeter XML, gerar DANFE

### 🛡️ Stripe Radar (antifraude)
- PaymentIntent criado sem nenhuma configuração de fraude
- Falta: `risk_control`, 3D Secure / SCA, verificação de endereço (AVS)
- No dashboard Stripe: ativar Radar, criar regras básicas de bloqueio

---

## 📋 LISTA DO QUE FALTA FAZER

### Urgente (antes de ir para produção)
- [ ] Trocar APP_ID do Mercado Pago para o real no `.env`
- [ ] Trocar URLs do Melhor Envio de sandbox para produção no `application-prod.yml`
- [ ] Substituir CPF hardcoded `12345678909` em `MelhorEnvioLabelAutomationService.java:257`
- [ ] Configurar `RESEND_DEFAULT_FROM_EMAIL` com domínio próprio (verificado no Resend)
- [ ] Confirmar que `STRIPE_WEBHOOK_SECRET` e `MELHOR_ENVIO_STATE_SECRET` estão no servidor

### Melhorias importantes
- [ ] Adicionar retry com backoff exponencial no `ZapierWebhookService` para entregas que falham
- [ ] Implementar backend do Mailchimp (sync de clientes ao criar conta ou confirmar pedido)

### Backlog / Não bloqueante
- [ ] Integrar NF-e com provider real (Focus NFe / Enotas)
- [ ] Configurar Stripe Radar no dashboard + adicionar `risk_control` no PaymentIntent
- [ ] 3D Secure / SCA enforcement para pagamentos europeus (se necessário)
