# Status dos Tutoriais e Central de Ajuda — Painel Admin

**Data:** 28/03/2026  
**Projeto:** fastcart-admin-panel  
**Documento complementar:** [`SISTEMA_AJUDA_CONTEXTUAL.md`](./SISTEMA_AJUDA_CONTEXTUAL.md) — Blueprint completo de tooltips, textos e ajuda contextual para todo o painel

---

## Resumo

A Central de Ajuda e Tutoriais foi implementada para ajudar lojistas a entenderem e utilizarem
todas as funcionalidades da plataforma. O sistema é acessível via sidebar em **Ferramentas > Tutoriais**.

---

## ✅ O que foi implementado

### Página Principal de Tutoriais (`/admin/tutorials`)
- [x] Grid de 6 categorias de tutoriais com ícones, cores e contagem de artigos
- [x] Guia completo "Primeiros Passos" com 8 etapas ilustradas
- [x] Seção de "Dicas Rápidas" com 4 cards informativos
- [x] Seção "O que cada funcionalidade faz?" com 8 explicações detalhadas
- [x] Link para suporte no rodapé
- [x] Suporte bilíngue (PT-BR / EN) via `t()` helper

### Categorias com tutoriais detalhados

#### 1. Produtos e Catálogo (`/admin/tutorials/products`) ✅
- Como cadastrar um produto (7 passos + 3 dicas)
- Como criar variações de tamanho/cor (6 passos + 1 dica)
- Gerenciamento de estoque (4 passos + alertas)
- Categorias e coleções (4 passos)

#### 2. Pedidos e Vendas (`/admin/tutorials/orders`) ✅
- Fluxo completo de um pedido (6 status explicados)
- Como processar um pedido (6 passos + dica)
- Carrinhos abandonados (4 passos + dica)
- Devoluções e reembolsos (4 passos + alerta)

#### 3. Marketing e Promoções (`/admin/tutorials/marketing`) ✅
- Cupons de desconto (5 passos)
- Programa de Afiliados (7 passos + 2 dicas)
- E-mail Marketing (5 passos)
- Programa de Fidelidade (4 passos)

#### 4. Integrações e Canais (`/admin/tutorials/integrations`) ✅
- Stripe - pagamentos (5 passos + alerta)
- Melhor Envio - frete (4 passos)
- Facebook & Instagram (4 passos)
- Google Analytics e Ads (4 passos)

#### 5. Pagamentos e Financeiro (`/admin/tutorials/payments`) ✅
- Meios de pagamento disponíveis (4 itens)
- Entendendo as taxas (4 passos + alerta)
- Notas Fiscais Eletrônicas NF-e (4 passos)

### Sidebar
- [x] Adicionado item "Tutoriais" na seção Ferramentas com ícone GraduationCap
- [x] Sub-itens: Primeiros Passos, Produtos, Pedidos, Marketing, Integrações, Pagamentos
- [x] Notificações adicionada na seção Comunicação
- [x] Atividade adicionada na seção Ferramentas

### Componentes criados
- `src/components/features/tutorials/TutorialsClient.tsx` — Página principal
- `src/components/features/tutorials/TutorialsCategoryClient.tsx` — Páginas de categoria
- 6 rotas de página em `app/admin/tutorials/`

---

## ❌ O que NÃO existia antes (feito pelo agente anterior)

O agente anterior **NÃO** criou nenhuma página de tutoriais. O que existia:
- SetupChecklist no dashboard (checklist de configuração inicial)
- FAQ genérico (`/admin/faq`)
- Seções "Aprenda mais" em algumas páginas de config (domínios)
- Tooltips genéricos

**Nada dedicado a tutoriais/help center para lojistas.**

---

## 🔮 O que ainda pode ser feito (sugestões futuras)

### Prioridade Alta
- [ ] Tutorial em vídeo embed (YouTube/Loom) para cada seção
- [ ] Sistema de busca dentro dos tutoriais
- [ ] Tutorial interativo de primeira configuração (tour guiado)
- [ ] **Tooltips contextuais em cada página do painel** → Documentado em [`SISTEMA_AJUDA_CONTEXTUAL.md`](./SISTEMA_AJUDA_CONTEXTUAL.md)
- [ ] **Mover Tutoriais para rodapé da sidebar (ícone de ajuda discreto)** → Documentado em SISTEMA_AJUDA_CONTEXTUAL.md §2

### Prioridade Média
- [ ] Categorias adicionais: Frete/Logística, Loja Virtual/Personalização, SEO
- [ ] FAQ dinâmico por seção (FAQ de produtos, FAQ de pedidos, etc.)
- [ ] Artigo sobre segurança de conta (2FA, senhas)
- [ ] Artigo sobre PDV (ponto de venda) presencial
- [ ] Tutorial sobre Blog da loja
- [ ] Tutorial sobre páginas institucionais (Sobre, Contato, Política)

### Prioridade Baixa
- [ ] Gamificação: medalhas por completar tutoriais
- [ ] Base de conhecimento com busca full-text
- [ ] Chatbot de suporte integrado com IA
- [ ] Comunidade de lojistas / Fórum

---

## Arquivos envolvidos

| Arquivo | Descrição |
|---|---|
| `app/admin/tutorials/page.tsx` | Rota principal |
| `app/admin/tutorials/products/page.tsx` | Rota produtos |
| `app/admin/tutorials/orders/page.tsx` | Rota pedidos |
| `app/admin/tutorials/marketing/page.tsx` | Rota marketing |
| `app/admin/tutorials/integrations/page.tsx` | Rota integrações |
| `app/admin/tutorials/payments/page.tsx` | Rota pagamentos |
| `src/components/features/tutorials/TutorialsClient.tsx` | Component principal |
| `src/components/features/tutorials/TutorialsCategoryClient.tsx` | Component de categorias |
| `src/components/admin/sidebar.tsx` | Sidebar atualizada |
