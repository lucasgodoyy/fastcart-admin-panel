# SISTEMA DE ROLES & AFILIADOS — Blueprint Completo

> **Versão:** 1.0  
> **Data:** 29/03/2026  
> **Status:** Frontend implementado, backend precisa de ajustes para AFFILIATE e MANAGER roles

---

## 1. Visão Geral da Arquitetura de Roles

O sistema agora suporta **6 roles** com painéis separados:

| Role | Painel | Rota Base | Descrição |
|------|--------|-----------|-----------|
| `SUPER_ADMIN` | Super Admin | `/super-admin` | Controle total da plataforma |
| `ADMIN` | Admin (Lojista) | `/admin` | Dono da loja — gerencia sua loja |
| `STAFF` | Admin (Lojista) | `/admin` | Funcionário da loja — acesso limitado |
| `AFFILIATE` | Painel Afiliado | `/affiliate` | Parceiro de vendas — links, comissões |
| `MANAGER` | Painel Gerente | `/manager` | Equipe interna — visão operacional |
| `CUSTOMER` | Frontend | `/account` | Cliente final |

---

## 2. Fluxo de Login por Role

```
Usuário faz login → Backend retorna { token, role }
  ├─ SUPER_ADMIN → redirect /super-admin
  ├─ ADMIN → redirect /admin
  ├─ STAFF → redirect /admin
  ├─ AFFILIATE → redirect /affiliate
  ├─ MANAGER → redirect /manager
  └─ CUSTOMER → redirect (store frontend)
```

**Arquivos alterados:**
- `src/lib/auth-role.ts` — adicionadas roles AFFILIATE e MANAGER
- `src/types/auth.d.ts` — tipo User atualizado
- `src/components/features/auth/loginForm.tsx` — redirect por role

---

## 3. Painel do Afiliado (`/affiliate`)

### Estrutura de Rotas
```
/affiliate                → Dashboard (stats, links recentes, conversões recentes)
/affiliate/links          → Meus Links (CRUD de links com UTM)
/affiliate/conversions    → Minhas Conversões (histórico completo)
/affiliate/payouts        → Meus Pagamentos (saldo, histórico)
/affiliate/support        → Suporte (chat, email, FAQ)
/affiliate/settings       → Meu Perfil (dados, conta)
```

### Componentes
- `src/components/affiliate/affiliate-sidebar.tsx` — Sidebar com navegação
- `src/components/affiliate/affiliate-header.tsx` — Header com avatar e logout
- `app/affiliate/layout.tsx` — Layout com guard de role AFFILIATE

### O que o Afiliado pode ver:
- ✅ Seus próprios cliques, conversões e comissões
- ✅ Criar e gerenciar seus links de afiliado
- ✅ Ver histórico de pagamentos e saldo
- ✅ Acessar suporte da plataforma
- ✅ Ver seu perfil

### O que o Afiliado NÃO pode ver:
- ❌ Dados de outros afiliados
- ❌ Painel administrativo da plataforma
- ❌ Configurações do programa de afiliados
- ❌ Dados financeiros da plataforma
- ❌ Lojas, usuários, assinaturas

---

## 4. Painel do Gerente (`/manager`)

### Estrutura de Rotas
```
/manager                  → Dashboard (overview da plataforma)
/manager/stores           → Lojas (lista, status — somente leitura)
/manager/subscriptions    → Assinaturas (lista, stats — somente leitura)
/manager/affiliates       → Afiliados (stats e lista — somente leitura)
/manager/reports          → Relatórios (métricas consolidadas)
/manager/support          → Suporte (comunicação com super admin)
```

### Componentes
- `src/components/manager/manager-sidebar.tsx` — Sidebar com navegação
- `src/components/manager/manager-header.tsx` — Header com avatar e logout
- `app/manager/layout.tsx` — Layout com guard de role MANAGER

### O que o Gerente pode ver:
- ✅ Métricas gerais (lojas, assinantes, tickets)
- ✅ Lista de lojas e status
- ✅ Lista de assinaturas e planos
- ✅ Performance do programa de afiliados
- ✅ Relatórios consolidados
- ✅ Canal de suporte com equipe

### O que o Gerente NÃO pode ver:
- ❌ Configurações da plataforma
- ❌ Segurança e infraestrutura
- ❌ API Keys e integrações
- ❌ Backlog/roadmap de desenvolvimento
- ❌ Aparência e temas do SA
- ❌ Gestão de roles e permissões
- ❌ Ações destrutivas (deletar, suspender)

---

## 5. Mudança no Lojista — Afiliados Removidos

### O que mudou:
- Removido "Afiliados" da sidebar do admin (`/admin/marketing/affiliates`)
- A rota `/admin/marketing/affiliates` agora mostra uma página informativa
  explicando que afiliados serão oferecidos via Apps Externos
- Link para a loja de aplicativos (`/admin/apps`)

### Motivo:
- Programa de afiliados é complexo para cada lojista gerenciar individualmente
- Futuramente será integrado via marketplace de apps
- O programa de afiliados da PLATAFORMA (SaaS level) continua no Super Admin

---

## 6. O que precisa ser feito no Backend (Java/Spring Boot)

### 6.1. Criar as Roles AFFILIATE e MANAGER

```java
// Em RoleEnum.java ou similar
public enum Role {
    SUPER_ADMIN,
    ADMIN,
    STAFF,
    AFFILIATE,  // NOVO
    MANAGER,    // NOVO
    CUSTOMER
}
```

### 6.2. Configurar Spring Security

```java
// SecurityConfig.java — adicionar regras de acesso
.requestMatchers("/api/v1/affiliate/**").hasRole("AFFILIATE")
.requestMatchers("/api/v1/manager/**").hasRole("MANAGER")
.requestMatchers("/api/v1/super-admin/**").hasAnyRole("SUPER_ADMIN", "MANAGER")
```

> **IMPORTANTE:** O MANAGER acessa endpoints de `/super-admin/` em modo leitura.
> Idealmente, separe os endpoints ou adicione uma verificação para impedir writes.

### 6.3. Criar endpoints para o Afiliado

O afiliado precisa de endpoints próprios (não os de store):

```
GET  /api/v1/affiliate/me/stats         → Stats do afiliado logado
GET  /api/v1/affiliate/me/links         → Links do afiliado logado
POST /api/v1/affiliate/me/links         → Criar link
GET  /api/v1/affiliate/me/conversions   → Conversões do afiliado logado
GET  /api/v1/affiliate/me/payouts       → Pagamentos do afiliado logado
GET  /api/v1/affiliate/me/profile       → Perfil do afiliado
```

### 6.4. Vincular Afiliado ao Usuário

Cada afiliado deve ter um `userId` no `AffiliateEntity` que é o mesmo ID do usuário autenticado.
Quando o afiliado faz login, o backend verifica o userId e retorna apenas dados dele.

### 6.5. Seed de Usuários de Teste

```sql
-- Criar usuários para teste
INSERT INTO users (email, password, role, name) VALUES 
  ('gerente@lojaki.com', '$2a$10$...', 'MANAGER', 'Gerente Lojaki'),
  ('afiliado1@lojaki.com', '$2a$10$...', 'AFFILIATE', 'Afiliado 1');

-- Vincular afiliado ao usuário
UPDATE affiliates SET user_id = (SELECT id FROM users WHERE email = 'afiliado1@lojaki.com')
WHERE email = 'afiliado1@lojaki.com';
```

---

## 7. Cenários de Uso

### Cenário 1: Você (Super Admin) adiciona um amigo como afiliado
1. Vai em **Super Admin > Afiliados > Novo Parceiro**
2. Cadastra nome, email, comissão (%)
3. Em **Super Admin > Usuários**, cria um user com role `AFFILIATE`
4. O amigo faz login e vê o painel `/affiliate` com seus dados

### Cenário 2: Você contrata um gerente
1. Em **Super Admin > Usuários**, cria um user com role `MANAGER`
2. O gerente faz login e vê `/manager` com visão geral da plataforma
3. Ele pode acompanhar vendas, lojas, assinantes e afiliados (somente leitura)

### Cenário 3: Um afiliado gera uma venda
1. Afiliado cria um link no painel `/affiliate/links`
2. Divulga o link nas redes sociais
3. Alguém clica → cookie é setado
4. Compra é realizada → conversão registrada automaticamente
5. Super Admin aprova a conversão
6. No dia de pagamento, cria-se um payout (PIX)

### Cenário 4: Gerente acompanha a plataforma
1. Gerente acessa `/manager`
2. Vê dashboard com lojas ativas, assinantes, tickets
3. Acessa `/manager/stores` para ver status das lojas
4. Acessa `/manager/affiliates` para ver performance dos afiliados
5. Se tiver dúvida, vai em `/manager/support`

---

## 8. Escala e Limitações

### Número estimado de usuários por role:
| Role | Quantidade | Notas |
|------|-----------|-------|
| SUPER_ADMIN | 1 | Apenas o dono |
| MANAGER | 2-4 | Equipe interna de confiança |
| AFFILIATE | 5-15 | Parceiros de vendas |
| ADMIN | N | Cada lojista é um ADMIN |
| STAFF | N | Funcionários de cada loja |
| CUSTOMER | N | Clientes finais |

### Não foi projetado para:
- ❌ Centenas de afiliados (para isso usaria plataforma externa)
- ❌ MLM (multi-level marketing)
- ❌ Auto-cadastro de afiliados (são adicionados manualmente pelo SA)
- ❌ Comissões recorrentes automáticas

---

## 9. Arquivos Criados / Modificados

### Novos Arquivos:
```
app/affiliate/layout.tsx
app/affiliate/page.tsx
app/affiliate/links/page.tsx
app/affiliate/conversions/page.tsx
app/affiliate/payouts/page.tsx
app/affiliate/support/page.tsx
app/affiliate/settings/page.tsx
app/manager/layout.tsx
app/manager/page.tsx
app/manager/stores/page.tsx
app/manager/subscriptions/page.tsx
app/manager/affiliates/page.tsx
app/manager/reports/page.tsx
app/manager/support/page.tsx
src/components/affiliate/affiliate-sidebar.tsx
src/components/affiliate/affiliate-header.tsx
src/components/manager/manager-sidebar.tsx
src/components/manager/manager-header.tsx
```

### Arquivos Modificados:
```
src/types/auth.d.ts                           → Adicionadas roles AFFILIATE, MANAGER
src/lib/auth-role.ts                          → normalizeRole() reconhece novas roles
src/components/features/auth/loginForm.tsx     → Redirect por role no login
src/components/admin/sidebar.tsx               → Removido "Afiliados" do marketing
app/admin/marketing/affiliates/page.tsx        → Substituído por página informativa
```

---

## 10. Checklist de Implementação Backend

### Prioridade Alta (necessário para funcionar):
- [ ] Adicionar AFFILIATE e MANAGER ao enum de roles
- [ ] Configurar Spring Security para as novas roles
- [ ] Criar endpoint `POST /api/v1/auth/login` retornando role correta
- [ ] Criar endpoints `/api/v1/affiliate/me/*` para o afiliado autenticado
- [ ] Vincular AffiliateEntity com userId
- [ ] Seed SQL para usuários de teste

### Prioridade Média (melhorias):
- [ ] Endpoint `/api/v1/manager/*` separado (ou reutilizar `/super-admin/*` com guard de role)
- [ ] Registrar ações de MANAGER nos activity logs
- [ ] Impedir MANAGER de fazer writes em endpoints sensíveis
- [ ] E-mail de boas-vindas para novos afiliados/gerentes

### Prioridade Baixa (futuro):
- [ ] Formulário de auto-cadastro de afiliado (landing page)
- [ ] Dashboard de performance de afiliados com gráficos
- [ ] Notificação push quando conversão é aprovada
- [ ] Exportação de relatórios (CSV)
- [ ] Sistema de tiers de comissão

---

## 11. Segurança

### Guards de Layout (Frontend):
Cada layout verifica a role no `useAuth()`:
- `/affiliate/*` → exige `user.role === 'AFFILIATE'`
- `/manager/*` → exige `user.role === 'MANAGER'`
- `/super-admin/*` → exige `user.role === 'SUPER_ADMIN'`
- `/admin/*` → aceita `ADMIN` e `STAFF`

### API (Backend — a implementar):
- Cada endpoint deve verificar a role via Spring Security
- AFFILIATE só acessa dados DELE (filtro por userId)
- MANAGER só faz leitura (GET) em endpoints de super-admin
- Tokens JWT devem incluir a role

### Recomendações:
1. Nunca confie apenas no frontend para restringir acesso
2. Backend DEVE validar a role em cada endpoint
3. Usar `@PreAuthorize("hasRole('AFFILIATE')")` nos controllers
4. Logs de acesso para todas as roles não-admin

---

## 12. Testes Manuais Sugeridos

### Teste 1: Login de Afiliado
1. Criar usuário com role AFFILIATE no banco
2. Fazer login → deve ir para `/affiliate`
3. Verificar que tabs do dashboard carregam
4. Tentar acessar `/admin` → deve redirecionar de volta
5. Tentar acessar `/super-admin` → deve redirecionar

### Teste 2: Login de Gerente
1. Criar usuário com role MANAGER no banco
2. Fazer login → deve ir para `/manager`
3. Verificar dashboard com dados da plataforma
4. Tentar acessar `/admin` → deve redirecionar
5. Tentar acessar `/super-admin` → deve redirecionar

### Teste 3: Fluxo Completo de Afiliado
1. SA cria afiliado no super-admin
2. Afiliado faz login no `/affiliate`
3. Cria um link
4. (Simular clique no link)
5. SA aprova conversão
6. SA cria payout
7. Afiliado vê payout no seu painel

### Teste 4: Gerente Leitura
1. Gerente acessa `/manager/stores`
2. Verifica que dados carregam
3. Verifica que NÃO tem botões de ação (editar, deletar)
4. Acessa `/manager/affiliates` — dados visíveis

---

*Este documento serve como guia completo para implementar e testar o sistema de roles e afiliados do Lojaki.*
