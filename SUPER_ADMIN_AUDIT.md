# Super Admin Panel — Audit Completo & Plano de Correções

**Data:** 15/03/2026  
**Status:** Em execução  

---

## Resumo Executivo

O painel Super Admin tem **46 rotas** (26 componentes únicos), **19 itens no sidebar**, e chama **66 endpoints** no backend. O backend tem todos os **67 endpoints reais** (sem mocks). Porém, **~17 rotas frontend não têm API correspondente** e diversas seções estão incompletas ou com layout ruim.

---

## Classificação das Páginas

### ✅ FUNCIONAM PONTA A PONTA (manter e melhorar)

| Rota | Status | Notas |
|------|--------|-------|
| `/super-admin` (Dashboard) | ⚠️ Parcial | Métricas "Conversão Loja→Pago" não faz sentido p/ SaaS. Ajustar. |
| `/super-admin/activity` | ✅ OK | Log de atividades funciona. |
| `/super-admin/stores` | ⚠️ Layout ruim | Lista funciona mas layout precisa melhorar. "Ver loja" / "Ver detalhes" não funciona. |
| `/super-admin/stores/[id]` | ⚠️ Parcial | Toggle status funciona, mas info limitada. |
| `/super-admin/users` | ✅ OK | Lista, toggle status, busca. |
| `/super-admin/users/roles` | ✅ OK | updateUserRole funciona no backend. |
| `/super-admin/users/sessions` | ✅ OK | Backend tem endpoints reais. Verificar se funciona e2e. |
| `/super-admin/subscriptions` | ✅ OK | CRUD de planos, listagem de assinantes. |
| `/super-admin/subscriptions/plans/new` | ✅ OK | Criar plano funciona. Form já corrigido. |
| `/super-admin/subscriptions/plans/[id]` | ✅ OK | Editar plano funciona. Form já corrigido. |
| `/super-admin/emails` | ⚠️ Parcial | Logs e envio funcionam. Templates e config SMTP sem backend. |
| `/super-admin/emails/campaigns` | ✅ OK | CRUD completo no backend. |
| `/super-admin/support` | ✅ OK | Tickets, reply, status update. |
| `/super-admin/messages` | ✅ OK | Chat com backend completo. |
| `/super-admin/notifications` | ✅ OK | List, stats, create. |
| `/super-admin/marketing` | ⚠️ Parcial | Stats, campaigns, banners com backend. Criação precisa testar. |

### ❌ NÃO FUNCIONAM / SEM BACKEND

| Rota | Problema |
|------|----------|
| `/super-admin/analytics` | Sem backend dedicado. Usa overview/stats existentes mas mistura dados. |
| `/super-admin/stores/approvals` | Mesmo componente que stores, sem filtro de aprovação real. |
| `/super-admin/stores/performance` | Mesmo componente que stores, sem dados de performance reais. |
| `/super-admin/subscriptions/billing` | Aba de faturamento sem endpoint no backend. |
| `/super-admin/subscriptions/subscribers` | Aba de assinantes funciona parcial (lista subscriptions). |
| `/super-admin/affiliates/*` (4 rotas) | Backend tem 4 endpoints mas dados provavelmente vazios. Sem integração real. |
| `/super-admin/finance/*` (4 rotas) | ZERO backend. Tudo fake/vazio. |
| `/super-admin/reports/*` (3 rotas) | ZERO backend dedicado. Usa endpoints existentes. |
| `/super-admin/settings/integrations` | Sem backend. |
| `/super-admin/settings/api-keys` | Sem backend. |
| `/super-admin/security` | Sem backend dedicado. |
| `/super-admin/infrastructure` | Sem backend. Dashboard fake. |
| `/super-admin/domains` | Usa listStores mas sem gestão de domínios real. |
| `/super-admin/appearance` | Funciona local (tema). Sem API. OK assim. |
| `/super-admin/backlog` | Dados hardcoded. Ferramenta interna. |
| `/super-admin/roadmap` | Dados hardcoded. Ferramenta interna. |

---

## Plano de Ação — Prioridade

### FASE 1: Correções Imediatas (fazer agora)

- [x] ~~Fix Input/Textarea bg-white → bg-background~~ (feito sessão anterior)
- [x] **1.1** Corrigir `bg-white/70` no plan editor icon → `bg-[hsl(var(--sa-accent-subtle))]`
- [x] **1.2** Dashboard: remover trends fake (12%, 8%, -5%, 15%) — dados agora sem mentiras
- [x] **1.3** Stores page: reescrito com layout tabela, "Ver Detalhes" funciona, paginação
- [x] **1.4** Consolidar Aprovações + Performance na stores (removidos do sidebar)
- [x] **1.5** Sessions: mantida (backend real), removido Security duplicado do sidebar
- [x] **1.6** Emails config: inputs do compose dialog com classes SA, textarea com tema correto
- [x] **1.7** Google Analytics e Facebook Pixel adicionados em Settings/Integrações

### FASE 2: Limpeza do Sidebar (remover o que não funciona)

- [x] **2.1** Remover do sidebar: Analytics (duplica Dashboard)
- [x] **2.2** Remover do sidebar: Performance (dados fake)
- [x] **2.3** Remover do sidebar: Affiliates (sem integração real)
- [x] **2.4** Remover do sidebar: Finance inteiro (sem backend)
- [x] **2.5** Remover do sidebar: Reports (sem backend dedicado)
- [x] **2.6** Remover do sidebar: Infrastructure (dashboard fake)
- [x] **2.7** Remover do sidebar: Security (duplica Sessions)
- [x] **2.8** Remover do sidebar: Domains (sem gestão real)
- [x] **2.9** Simplificar Settings (só Geral + Integrações)
- [x] **2.10** Remover do sidebar: Backlog + Roadmap (dev interno)
- [x] **2.11** Remover Marketing → Push (sem implementação)
- [x] **2.12** Simplificar Subscriptions (remover aba Billing vazia)

### FASE 3: Melhorias Visuais + Funcionalidade

- [x] **3.1** Email compose dialog com tema SA + fix lojaki.store → rapidocart.com.br
- [x] **3.2** Settings page: removidos tabs fake (Aparência, Segurança, Notificações, Infra)
- [x] **3.3** Settings Integrações: Resend (não "Amazon SES"), + GA4 + Facebook Pixel
- [x] **3.4** Marketing page: CRUD completo (criar/editar campanha, criar banner, toggle ativo, mudar status)
- [x] **3.5** Email campaigns: placeholders "lojaki" → "rapidocart.com.br"
- [x] **3.6** Dashboard: removidos percentuais de trend hardcoded

### PENDENTE (implementar no futuro, não agora)

- Finance: precisaria de integração com Stripe para dados reais
- Reports avançados: exportação CSV, gráficos reais
- Affiliates: programa completo de afiliados (tracking, cookies, comissões)
- Domains: gestão de Custom Domains com certificados SSL
- Infrastructure: monitoramento real de servidores

---

## Sidebar FINAL após limpeza

```
PRINCIPAL
  Dashboard
  Atividade

GESTÃO
  Lojas
    - Todas as Lojas
    - Aprovações
  Usuários
    - Todos os Usuários
    - Roles & Permissões
    - Sessões Ativas
  Assinaturas
    - Planos
    - Assinantes

MARKETING
  Campanhas
  E-mail Campaigns
  Banners

COMUNICAÇÃO
  Mensagens
  E-mails (Logs + Templates)
  Notificações
  Suporte

PLATAFORMA
  Configurações
    - Geral
    - Integrações (GA + Pixel)
  Aparência
```
