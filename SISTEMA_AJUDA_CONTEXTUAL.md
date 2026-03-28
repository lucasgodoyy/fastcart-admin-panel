# Sistema de Ajuda Contextual — Painel Admin Lojaki

**Data:** 28/03/2026  
**Projeto:** fastcart-admin-panel  
**Objetivo:** Documentar TODOS os pontos do painel que precisam de ajuda contextual — tooltips, textos explicativos, links "Saiba mais", e páginas de tutorial detalhadas. Tornar o painel 100% compreensível para lojistas não-técnicos.

---

## 📋 Índice

1. [Decisões de Arquitetura](#1-decisões-de-arquitetura)
2. [Sidebar — Reposicionamento dos Tutoriais](#2-sidebar--reposicionamento)
3. [Produtos e Catálogo](#3-produtos-e-catálogo)
4. [Variações de Produtos](#4-variações-de-produtos)
5. [Categorias e Marcas](#5-categorias-e-marcas)
6. [Estoque / Inventário](#6-estoque--inventário)
7. [Pedidos e Vendas](#7-pedidos-e-vendas)
8. [Pedido Manual](#8-pedido-manual)
9. [Devoluções](#9-devoluções)
10. [PDV (Ponto de Venda)](#10-pdv-ponto-de-venda)
11. [Carrinhos Abandonados](#11-carrinhos-abandonados)
12. [Clientes](#12-clientes)
13. [Avaliações de Clientes](#13-avaliações-de-clientes)
14. [Cupons de Desconto](#14-cupons-de-desconto)
15. [Promoções](#15-promoções)
16. [Frete Grátis (regras)](#16-frete-grátis-regras)
17. [E-mail Marketing / Campanhas](#17-e-mail-marketing--campanhas)
18. [Programa de Afiliados](#18-programa-de-afiliados)
19. [Upsell e Cross-sell](#19-upsell-e-cross-sell)
20. [Programa de Fidelidade](#20-programa-de-fidelidade)
21. [Contadores Regressivos](#21-contadores-regressivos)
22. [Assinaturas de Produtos](#22-assinaturas-de-produtos)
23. [Chat / Mensagens](#23-chat--mensagens)
24. [Suporte](#24-suporte)
25. [Notificações](#25-notificações)
26. [Notas Fiscais (NF-e)](#26-notas-fiscais-nf-e)
27. [Integrações](#27-integrações)
28. [Loja Virtual / Online Store](#28-loja-virtual--online-store)
29. [Estatísticas / Analytics](#29-estatísticas--analytics)
30. [Configurações — Dados do Negócio](#30-configurações--dados-do-negócio)
31. [Configurações — Dados Fiscais](#31-configurações--dados-fiscais)
32. [Configurações — Conta e Segurança](#32-configurações--conta-e-segurança)
33. [Configurações — Meios de Envio](#33-configurações--meios-de-envio)
34. [Configurações — Centros de Distribuição](#34-configurações--centros-de-distribuição)
35. [Configurações — Meios de Pagamento](#35-configurações--meios-de-pagamento)
36. [Configurações — E-mails Automáticos](#36-configurações--e-mails-automáticos)
37. [Configurações — Checkout](#37-configurações--checkout)
38. [Configurações — Campos Personalizados](#38-configurações--campos-personalizados)
39. [Configurações — Mensagens para Clientes](#39-configurações--mensagens-para-clientes)
40. [Configurações — Redirecionamentos 301](#40-configurações--redirecionamentos-301)
41. [Configurações — Domínios](#41-configurações--domínios)
42. [Configurações — Idiomas e Moedas](#42-configurações--idiomas-e-moedas)
43. [Configurações — Usuários e Permissões](#43-configurações--usuários-e-permissões)
44. [Billing / Plano](#44-billing--plano)
45. [FAQ](#45-faq)
46. [Aplicativos](#46-aplicativos)
47. [Atividade / Logs](#47-atividade--logs)
48. [Dashboard](#48-dashboard)
49. [Super Admin — Lojas](#49-super-admin--lojas)
50. [Super Admin — Assinaturas e Planos](#50-super-admin--assinaturas-e-planos)
51. [Super Admin — Afiliados](#51-super-admin--afiliados)
52. [Super Admin — Finanças](#52-super-admin--finanças)
53. [Super Admin — E-mails e Campanhas](#53-super-admin--e-mails-e-campanhas)
54. [Super Admin — Configurações do Sistema](#54-super-admin--configurações-do-sistema)

---

## 1. Decisões de Arquitetura

### Tipos de ajuda contextual a implementar

| Tipo | Onde usar | Componente |
|------|-----------|------------|
| **Tooltip (?)** | Campos de formulário confusos (SKU, CFOP, etc.) | `<TooltipHelper text="..." />` — ícone `HelpCircle` 16px ao lado do label |
| **Texto descritivo** | Abaixo do título de cada seção/card | `<p className="text-sm text-muted-foreground">...</p>` |
| **Link "Saiba mais"** | Em cada página/seção que tem tutorial correspondente | `<LearnMoreLink href="/admin/tutorials/..." />` — abre em nova aba |
| **Banner de dica** | Topo de páginas complexas | `<HelpBanner icon={...} text="..." link="..." />` — dismissível |
| **Texto inline** | Dentro de campos (placeholder + description) | Texto abaixo do input |

### Componentes a criar

```
src/components/shared/tooltip-helper.tsx    → Ícone (?) com tooltip hover
src/components/shared/learn-more-link.tsx   → Link "Saiba mais →" estilizado
src/components/shared/help-banner.tsx       → Banner de ajuda com ícone + texto + link, dismissível
```

---

## 2. Sidebar — Reposicionamento

### Problema atual
"Tutoriais" está exposto na seção **Ferramentas** com sub-itens expandíveis. Ocupa espaço demais na sidebar e distrai do fluxo operacional.

### Solução

**Mover "Tutoriais" para dentro das Configurações / ou para um ícone discreto no rodapé da sidebar.**

Opção recomendada: **Mover para o rodapé da sidebar como um ícone de ajuda discreto**, junto ao toggle de tema.

```
Rodapé da sidebar:
[?] Central de Ajuda    → /admin/tutorials
[◑] Tema claro/escuro
[⚙] Configurações       → /admin/settings
[💳] Meu plano           → /admin/billing
```

**Remover** os sub-itens de tutoriais da seção Ferramentas. O FAQ pode ficar, mas renomear para "Ajuda" e apontar para `/admin/tutorials` (que já tem o FAQ embutido).

### Mudanças no sidebar.tsx

- [ ] Remover item `Tutoriais` (com todos os children) da seção "Ferramentas"
- [ ] Remover item `FAQ` da seção "Ferramentas"  
- [ ] Adicionar ícone `HelpCircle` no rodapé da sidebar (ao lado do theme toggle), linkando para `/admin/tutorials`
- [ ] Tooltip no hover: "Central de Ajuda e Tutoriais"

---

## 3. Produtos e Catálogo

### Página: `/admin/products` (lista)
**Texto descritivo no topo:**
> "Gerencie todos os produtos da sua loja. Aqui você cadastra, edita, ativa/desativa e organiza seus produtos por categorias."

**Link:** [Saiba mais: Como cadastrar meu primeiro produto →](/admin/tutorials/products)

### Formulário de criação/edição de produto

#### Seção: Informações básicas

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome** | — (autoexplicativo) | — |
| **Descrição** | — (autoexplicativo) | — |
| **SKU** | **Tooltip:** "SKU (Stock Keeping Unit) é um código interno para identificar este produto no seu estoque. Pode ser letras e números. Ex: CAM-AZ-M (Camisa Azul Média). Se deixar vazio, será gerado automaticamente." | Tooltip (?) |
| **Código de barras** | **Tooltip:** "Código de barras do produto (EAN/UPC). Usado em leitores de código de barras no PDV e para integração com marketplaces." | Tooltip (?) |
| **Tipo de produto** | **Texto abaixo:** "Produto físico: requer frete e dimensões. Produto digital: entrega por download/email, sem frete." | Texto inline |

#### Seção: Preços

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Preço** | — (autoexplicativo — é o preço de venda) | — |
| **Preço promocional** | **Tooltip:** "Preço com desconto que será exibido na loja. Se preenchido, o preço original aparecerá riscado." | Tooltip (?) |
| **Preço comparativo** | **Tooltip:** "Preço original antes do desconto (aparece riscado na loja). Use para mostrar ao cliente quanto ele está economizando. Não é obrigatório se já usou o preço promocional." | Tooltip (?) |
| **Custo do produto** | **Tooltip:** "Seu custo de compra/fabricação. NÃO é exibido ao cliente. Usado apenas para calcular sua margem de lucro nos relatórios." | Tooltip (?) |
| **Moeda** | **Tooltip:** "Moeda usada para este produto. O padrão é BRL (Real brasileiro)." | Tooltip (?) |
| **Mostrar preço na loja** | **Tooltip:** "Se desativado, o preço não aparece na loja. Útil para produtos 'sob consulta'." | Tooltip (?) |

**Banner no topo da seção de preços:**
> 💡 **Dica:** Preencha o "Preço comparativo" para que o cliente veja o desconto. O preço aparecerá assim: ~~R$ 199,00~~ **R$ 149,00**.
> [Saiba mais sobre precificação →](/admin/tutorials/products)

#### Seção: Imagens e Mídia

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Fotos** | **Texto abaixo do drag-drop:** "Recomendação: pelo menos 4 fotos (frente, costas, detalhe, uso). Lojas com 4+ imagens têm 60% mais conversão. Formatos: WEBP, PNG, JPEG ou GIF. Mínimo 1024x1024px." | Texto inline |
| **Link para vídeo** | **Tooltip:** "Cole um link do YouTube ou Vimeo. O vídeo aparecerá na página do produto, abaixo das fotos." | Tooltip (?) |

#### Seção: Estoque

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Estoque infinito** | **Tooltip:** "Use para produtos digitais, sob encomenda ou feitos à mão. O produto nunca ficará 'esgotado'." | Tooltip (?) |
| **Quantidade em estoque** | **Tooltip:** "Quantidade disponível para venda. Quando chegar a zero, o produto ficará como 'Esgotado' na loja." | Tooltip (?) |

#### Seção: Peso e Dimensões (produtos físicos)

**Banner no topo:**
> 📦 Peso e dimensões são usados para calcular o frete automaticamente. Valores incorretos podem gerar fretes errados para o cliente.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Peso (kg)** | **Texto inline:** "Em quilogramas. Ex: 0.3 para 300g" | Texto inline |
| **Comprimento (cm)** | **Texto inline:** "Maior dimensão da embalagem" | Texto inline |
| **Largura (cm)** | — | — |
| **Altura (cm)** | — | — |
| **Frete grátis** | **Tooltip:** "Ativar frete grátis SOMENTE para este produto. Ignora as regras de frete da loja." | Tooltip (?) |

#### Seção: Categorização

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Categoria** | **Tooltip:** "A categoria principal organiza seus produtos na loja e nos filtros de busca." | Tooltip (?) |
| **Marca** | **Tooltip:** "A marca aparece como filtro na loja, permitindo que clientes busquem por marca." | Tooltip (?) |

#### Seção: Produtos Relacionados

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Produtos relacionados** | **Tooltip:** "Aparecem como 'Você também pode gostar' na página do produto. Ajuda a aumentar o ticket médio." | Tooltip (?) |
| **Produtos complementares** | **Tooltip:** "Aparecem como 'Compre junto' na página do produto. Ideal para acessórios e itens que combinam." | Tooltip (?) |

#### Seção: SEO

**Banner:**
> 🔍 SEO ajuda seu produto a ser encontrado no Google. Se não preencher, o sistema usa o nome e descrição do produto automaticamente.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Título SEO** | **Tooltip:** "Título que aparece nos resultados do Google. Máximo 60 caracteres para melhor exibição." | Tooltip (?) |
| **Descrição SEO** | **Tooltip:** "Descrição que aparece nos resultados do Google abaixo do título. Máximo 160 caracteres." | Tooltip (?) |
| **Tags** | **Tooltip:** "Palavras-chave para busca interna. Separe por vírgula. Ex: camiseta, algodão, básica" | Tooltip (?) |

#### Seção: Marketing / Visual

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Texto promocional** | **Tooltip:** "Texto curto que aparece como badge/etiqueta no card do produto na loja. Ex: '🔥 HOT', 'Novo', '-30%'. Máximo ~15 caracteres." | Tooltip (?) |
| **Prova social** | **Tooltip:** "Depoimento ou frase de cliente exibido na página do produto para gerar confiança. Ex: 'Já vendemos 500 unidades!' ou '⭐ 4.9 — 200 avaliações'" | Tooltip (?) |
| **Produto novo** | **Tooltip:** "Exibe badge 'Novo' no card do produto. Desativa automaticamente após 30 dias." | Tooltip (?) |
| **Produto destaque** | **Tooltip:** "Produto aparece na seção 'Destaques' da página inicial da loja." | Tooltip (?) |

---

## 4. Variações de Produtos

### Página: Dentro do form de produto (aba/seção "Variações")

**Banner explicativo no topo da seção:**
> 🎨 **Variações** permitem vender o mesmo produto em diferentes opções (cor, tamanho, material). Cada combinação de opções gera uma variante com estoque e preço independentes.
> 
> **Exemplo:** Um tênis com 3 cores e 4 tamanhos gera **12 variantes** (3 × 4 = 12).
> 
> [Saiba mais: Como criar variações de produtos →](/admin/tutorials/products)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome da propriedade** | **Tooltip:** "Tipo da variação. Ex: 'Cor', 'Tamanho', 'Material'. Máximo 3 propriedades por produto." | Tooltip (?) |
| **Valores** | **Tooltip:** "Opções disponíveis. Digite e pressione Enter para adicionar. Ex: para Cor → Preto, Branco, Azul." | Tooltip (?) |
| **Sugestões (presets)** | — (já são autoexplicativas — Cor, Tamanho, Material) | — |

### Tabela de variantes geradas

| Coluna | Tooltip / Ajuda | Tipo |
|--------|----------------|------|
| **Combinação** | — (autoexplicativa — mostra Ex: "Preto / M") | — |
| **SKU da variante** | **Tooltip:** "Código único desta variante. Ex: TEN-AZ-42. Útil para controle de estoque." | Tooltip (?) |
| **Estoque** | **Tooltip:** "Estoque individual desta variante. Se Tênis Azul 42 esgota, as outras variantes continuam disponíveis." | Tooltip (?) |
| **Ajuste de preço** | **Tooltip:** "Valor adicionado ou subtraído do preço base. Ex: +10.00 para tamanho GG. Deixe 0 para manter o mesmo preço." | Tooltip (?) |
| **Disponível** | **Tooltip:** "Se desativado, esta variante não aparece como opção na loja." | Tooltip (?) |

**Aviso quando muitas combinações:**
> ⚠️ Você está criando **{n} variantes**. Certifique-se de preencher o estoque de cada uma. Variantes sem estoque ficam como "Esgotado".

---

## 5. Categorias e Marcas

### Página: `/admin/products/categories`

**Texto descritivo:**
> "Categorias organizam seus produtos na loja e nos filtros. Crie categorias e subcategorias para facilitar a navegação dos clientes."

**Link:** [Saiba mais: Como organizar categorias →](/admin/tutorials/products)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome** | — | — |
| **Slug** | **Tooltip:** "URL amigável da categoria. Gerado automaticamente do nome. Ex: 'camisetas-masculinas'. Usado no link da loja: sualoja.com/categoria/camisetas-masculinas" | Tooltip (?) |
| **Descrição** | **Tooltip:** "Texto exibido na página da categoria. Também usado pelo Google (SEO)." | Tooltip (?) |
| **Categoria pai** | **Tooltip:** "Selecione para criar subcategorias. Ex: 'Roupas' > 'Camisetas' > 'Camisetas Básicas'" | Tooltip (?) |
| **Imagem** | **Tooltip:** "Imagem exibida no card da categoria na loja. Recomendado: 600x600px." | Tooltip (?) |

---

## 6. Estoque / Inventário

### Página: `/admin/products/inventory`

**Texto descritivo:**
> "Visão geral do estoque de todos os produtos e variantes. Atualize quantidades em massa e monitore itens com estoque baixo."

**Link:** [Saiba mais: Gerenciamento de estoque →](/admin/tutorials/products)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Estoque baixo** | **Tooltip:** "Produto com menos de 5 unidades. Reponha para não perder vendas." | Tooltip (?) |
| **Movimentação de estoque** | **Tooltip:** "Histórico de entradas e saídas de estoque para este produto. Inclui vendas, devoluções e ajustes manuais." | Tooltip (?) |

---

## 7. Pedidos e Vendas

### Página: `/admin/sales` (lista)

**Texto descritivo:**
> "Todos os pedidos da sua loja. Acompanhe o status, processe envios e gerencie pagamentos."

**Link:** [Saiba mais: Fluxo completo de um pedido →](/admin/tutorials/orders)

**Banner de dica (para novos lojistas):**
> 📋 **O fluxo de um pedido é:** Pendente → Processando → Enviado → Entregue. Clique em um pedido para gerenciá-lo.

### Detalhe do pedido: `/admin/sales/[id]`

| Campo / Ação | Tooltip / Ajuda | Tipo |
|--------------|----------------|------|
| **Status do pedido** | **Texto descritivo:** Explicar cada status: `PENDING` = Aguardando pagamento · `PROCESSING` = Pagamento confirmado, preparar envio · `SHIPPED` = Enviado, aguardando entrega · `DELIVERED` = Entregue ao cliente · `CANCELLED` = Pedido cancelado | Texto inline |
| **Código de rastreio** | **Tooltip:** "Código fornecido pela transportadora (Correios, Jadlog, etc.). O cliente receberá este código por e-mail para acompanhar a entrega." | Tooltip (?) |
| **Marcar como enviado** | **Tooltip:** "Altera o status para 'Enviado'. O cliente será notificado por e-mail automaticamente." | Tooltip (?) |
| **Reembolso** | **Tooltip:** "Devolver o valor (total ou parcial) ao cliente. O estoque do produto será restaurado automaticamente." | Tooltip (?) |
| **Notas internas** | **Tooltip:** "Anotações visíveis APENAS para a equipe. O cliente NÃO vê estas notas." | Tooltip (?) |
| **Etiqueta de envio** | **Tooltip:** "Gera ou imprime a etiqueta de envio pelo Melhor Envio. Necessita integração configurada." | Tooltip (?) |

---

## 8. Pedido Manual

### Página: `/admin/sales/manual/new`

**Texto descritivo:**
> "Crie um pedido manualmente para vendas feitas por telefone, WhatsApp ou presencialmente."

**Link:** [Saiba mais: Como criar pedidos manuais →](/admin/tutorials/orders)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Cliente** | **Tooltip:** "Selecione um cliente existente ou crie um novo." | Tooltip (?) |
| **Método de pagamento** | **Tooltip:** "Como o cliente pagou/pagará. Pedidos manuais podem ser marcados como já pagos." | Tooltip (?) |
| **Desconto manual** | **Tooltip:** "Aplicar desconto diretamente no pedido. Não consome cupom." | Tooltip (?) |

---

## 9. Devoluções

### Página: `/admin/sales/returns`

**Texto descritivo:**
> "Gerencie devoluções e trocas. Aqui você processa pedidos de devolução e aprova reembolsos."

**Link:** [Saiba mais: Devoluções e reembolsos →](/admin/tutorials/orders)

---

## 10. PDV (Ponto de Venda)

### Página: `/admin/pos`

**Texto descritivo:**
> "Ponto de Venda para vendas presenciais. Use o PDV para registrar vendas em loja física, feiras, eventos ou por telefone."

| Campo / Área | Tooltip / Ajuda | Tipo |
|-------------|----------------|------|
| **Caixa registradora** | **Tooltip:** "Abrir/fechar caixa. Ao abrir, registre o valor de abertura. Ao fechar, o sistema compara com o total de vendas do dia." | Tooltip (?) |
| **Histórico de vendas** | **Texto:** "Vendas realizadas pelo PDV. Diferente dos pedidos online." | Texto inline |

**Link:** [Saiba mais: Como usar o PDV →](/admin/tutorials/orders)

---

## 11. Carrinhos Abandonados

### Página: `/admin/abandoned-carts`

**Texto descritivo:**
> "Clientes que adicionaram produtos ao carrinho mas não finalizaram a compra. Recupere essas vendas enviando lembretes."

**Banner de dica:**
> 💰 **Dica:** Lojas que enviam lembretes de carrinho abandonado recuperam em média 15% das vendas perdidas.

**Link:** [Saiba mais: Como recuperar carrinhos abandonados →](/admin/tutorials/orders)

### Detalhe: `/admin/abandoned-carts/[id]`

| Campo / Ação | Tooltip / Ajuda | Tipo |
|--------------|----------------|------|
| **Link de recuperação** | **Tooltip:** "Link exclusivo que leva o cliente direto ao checkout com os mesmos produtos no carrinho." | Tooltip (?) |
| **Enviar via WhatsApp** | **Tooltip:** "Abre o WhatsApp com uma mensagem pronta com o link de recuperação." | Tooltip (?) |
| **E-mail personalizado** | **Tooltip:** "Envie um e-mail com o link de recuperação. Use as variáveis {{cart.contact_name}} e {{recovery_link}} no corpo." | Tooltip (?) |
| **Status** | **Texto:** `PENDING` = Nenhuma ação tomada · `EMAIL_SENT` = Lembrete enviado · `RECOVERED` = Cliente completou a compra · `OPTED_OUT` = Cliente optou por não receber lembretes | Texto inline |

---

## 12. Clientes

### Página: `/admin/customers`

**Texto descritivo:**
> "Base de clientes da sua loja. Veja pedidos, contatos e histórico de cada cliente."

### Formulário: `/admin/customers/new`

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome completo** | — | — |
| **E-mail** | — | — |
| **Telefone** | **Tooltip:** "Com DDD. Usado para contato e envio de notificações por WhatsApp." | Tooltip (?) |
| **CPF/CNPJ** | **Tooltip:** "Necessário para emissão de nota fiscal. Opcional para cadastro." | Tooltip (?) |
| **Tags** | **Tooltip:** "Etiquetas para segmentar clientes. Ex: 'VIP', 'Atacado', 'Revendedor'. Útil para filtros e campanhas de e-mail." | Tooltip (?) |
| **Notas** | **Tooltip:** "Observações internas sobre o cliente. Não é visível para o cliente." | Tooltip (?) |

---

## 13. Avaliações de Clientes

### Página: `/admin/customers/reviews`

**Texto descritivo:**
> "Avaliações deixadas por clientes nos produtos. Aprove, responda ou remova avaliações."

| Campo / Ação | Tooltip / Ajuda | Tipo |
|--------------|----------------|------|
| **Aprovar** | **Tooltip:** "Torna a avaliação visível na loja. Avaliações pendentes não aparecem para outros clientes." | Tooltip (?) |
| **Responder** | **Tooltip:** "Sua resposta aparece publicamente abaixo da avaliação do cliente." | Tooltip (?) |

---

## 14. Cupons de Desconto

### Página: `/admin/discounts/coupons`

**Texto descritivo:**
> "Crie códigos de cupom para oferecer descontos na sua loja. Cupons podem ser percentuais, valor fixo ou frete grátis."

**Link:** [Saiba mais: Como criar cupons de desconto →](/admin/tutorials/marketing)

### Formulário de cupom

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Código do cupom** | **Tooltip:** "Código que o cliente digita no checkout. Será convertido para MAIÚSCULAS. Ex: PRIMEIRACOMPRA, NATAL2026" | Tooltip (?) |
| **Tipo: Percentual** | **Tooltip:** "Desconto em % sobre o valor dos produtos. Ex: 10% de desconto." | Tooltip (?) |
| **Tipo: Valor fixo** | **Tooltip:** "Desconto de um valor fixo em R$. Ex: R$ 20 de desconto." | Tooltip (?) |
| **Tipo: Frete grátis** | **Tooltip:** "Isenta o frete. Pode ser combinado com pedido mínimo." | Tooltip (?) |
| **Escopo: Todos os produtos** | **Tooltip:** "O cupom se aplica a qualquer produto do carrinho." | Tooltip (?) |
| **Escopo: Produtos específicos** | **Tooltip:** "O desconto vale apenas para os produtos selecionados." | Tooltip (?) |
| **Escopo: Categorias específicas** | **Tooltip:** "O desconto vale para todos os produtos das categorias selecionadas." | Tooltip (?) |
| **Limite de uso total** | **Tooltip:** "Quantas vezes este cupom pode ser usado no total por todos os clientes. Ex: Limitar a 100 usos." | Tooltip (?) |
| **Limite por cliente** | **Tooltip:** "Quantas vezes UM MESMO cliente pode usar este cupom. Ex: 1 vez por cliente." | Tooltip (?) |
| **Primeira compra apenas** | **Tooltip:** "O cupom funciona apenas para novos clientes que nunca compraram na loja." | Tooltip (?) |
| **Quantidade mínima do pedido** | **Tooltip:** "O cupom só funciona se o carrinho atingir este valor. Ex: Desconto válido para compras acima de R$ 100." | Tooltip (?) |
| **Desconto máximo** | **Tooltip:** "Para cupons percentuais: limite o valor máximo do desconto. Ex: 10% de desconto com máximo de R$ 50." | Tooltip (?) |
| **Incluir frete no desconto** | **Tooltip:** "Se ativado, o percentual de desconto também se aplica ao valor do frete." | Tooltip (?) |
| **Frete mais barato** | **Tooltip:** "Se 'Incluir frete' estiver ativo, aplica o desconto apenas na opção de frete mais barata." | Tooltip (?) |
| **Combinar com promoções** | **Tooltip:** "Se ativado, o cupom funciona junto com promoções ativas (ex: 'Compre 3 pague 2'). Se desativado, o cliente precisa escolher entre o cupom ou a promoção." | Tooltip (?) |
| **Vigência** | **Tooltip:** "Período em que o cupom está disponível. Fora deste período, o cupom retorna erro inválido." | Tooltip (?) |
| **Ativo** | **Tooltip:** "Ativar/desativar o cupom imediatamente. Um cupom desativado retorna erro inválido no checkout." | Tooltip (?) |

---

## 15. Promoções

### Página: `/admin/discounts/promotions`

**Texto descritivo:**
> "Promoções automáticas aplicadas sem código. Diferente dos cupons, as promoções são ativadas automaticamente quando as condições são atendidas."

**Link:** [Saiba mais: Tipos de promoções →](/admin/tutorials/marketing)

**Banner de dica:**
> 💡 **Diferença entre Cupom e Promoção:** Cupons exigem que o cliente digite um código. Promoções são aplicadas automaticamente ao carrinho quando as condições são atendidas.

### Formulário de promoção

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome** | **Tooltip:** "Nome interno da promoção. O cliente verá no carrinho como motivo do desconto." | Tooltip (?) |
| **Tipo: Compre X pague Y** | **Tooltip:** "Ex: 'Compre 3 pague 2' — o cliente coloca 3 itens e paga apenas 2. O item mais barato é gratuito." | Tooltip (?) |
| **Tipo: Desconto sobre preços** | **Tooltip:** "Aplica desconto (% ou R$) em produtos ou categorias específicas automaticamente." | Tooltip (?) |
| **Tipo: Cross-selling** | **Tooltip:** "Ex: 'Compre uma camisa e ganhe 20% no cinto'. O desconto se aplica ao segundo produto quando o primeiro está no carrinho." | Tooltip (?) |
| **Tipo: Desconto progressivo** | **Tooltip:** "Quanto mais o cliente compra, maior o desconto. Ex: 2 itens = 10%, 3 itens = 15%, 5+ itens = 25%." | Tooltip (?) |
| **Tipo: Desconto no carrinho** | **Tooltip:** "Desconto aplicado ao valor total do pedido. Ex: 10% se o carrinho for acima de R$ 200." | Tooltip (?) |
| **Escopo de compra (Buy scope)** | **Tooltip:** "Em quais produtos o desconto se aplica: toda a loja, categorias específicas ou produtos específicos." | Tooltip (?) |
| **Escopo do desconto (Pay scope)** | **Tooltip:** "Para cross-selling: em qual produto o desconto será aplicado quando o gatilho for atendido." | Tooltip (?) |
| **Faixas de desconto progressivo** | **Tooltip:** "Crie múltiplas faixas. Ex: Faixa 1: 2 itens → 10%. Faixa 2: 5 itens → 20%. O sistema aplica a melhor faixa." | Tooltip (?) |
| **Valor mínimo do carrinho** | **Tooltip:** "Para desconto no carrinho: valor mínimo que o carrinho precisa atingir." | Tooltip (?) |
| **Combinar com...** | **Tooltip:** "Selecione quais outros descontos podem funcionar junto com esta promoção. Cuidado: combinar muitas promoções pode reduzir muito sua margem." | Tooltip (?) |
| **Limite de uso** | **Tooltip:** "Quantas vezes esta promoção pode ser usada no total. Deixe vazio para ilimitado." | Tooltip (?) |

---

## 16. Frete Grátis (Regras)

### Página: `/admin/discounts/free-shipping`

**Texto descritivo:**
> "Regras automáticas de frete grátis. Diferentes dos cupons — aqui o frete grátis é aplicado automaticamente quando as condições são atendidas."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Valor mínimo** | **Tooltip:** "Valor mínimo do carrinho para frete grátis automático. Ex: Frete grátis para compras acima de R$ 150." | Tooltip (?) |
| **Regiões** | **Tooltip:** "Selecione para quais regiões/estados o frete grátis se aplica. Deixe vazio para todo o Brasil." | Tooltip (?) |

---

## 17. E-mail Marketing / Campanhas

### Página: `/admin/marketing/email-campaigns`

**Texto descritivo:**
> "Envie campanhas de e-mail para seus clientes. Anuncie novidades, promoções e conteúdos diretamente na caixa de entrada."

**Link:** [Saiba mais: Como criar campanhas de e-mail →](/admin/tutorials/marketing)

### Formulário de campanha

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome da campanha** | **Tooltip:** "Nome interno. Não é visível para o cliente." | Tooltip (?) |
| **Assunto** | **Tooltip:** "Assunto do e-mail que o cliente verá na caixa de entrada. Máximo 50 caracteres para melhor visualização em mobile." | Tooltip (?) |
| **Conteúdo HTML** | **Tooltip:** "Corpo do e-mail em HTML. Use templates ou cole HTML de ferramentas como Canva/Unlayer." | Tooltip (?) |
| **Público-alvo: Todos** | **Tooltip:** "Envia para todos os clientes cadastrados com e-mail." | Tooltip (?) |
| **Público-alvo: Novos** | **Tooltip:** "Clientes que fizeram a primeira compra nos últimos 30 dias." | Tooltip (?) |
| **Público-alvo: Recorrentes** | **Tooltip:** "Clientes que compraram mais de 1 vez." | Tooltip (?) |
| **Público-alvo: Personalizado** | **Tooltip:** "Envie para uma lista de e-mails específica." | Tooltip (?) |
| **Frequência** | **Tooltip:** "Envio único: dispara uma vez. Recorrente: repete automaticamente no intervalo selecionado." | Tooltip (?) |
| **Data/Hora de envio** | **Tooltip:** "Quando o e-mail será disparado. Deixe em branco para enviar imediatamente ao salvar como 'Enviando'." | Tooltip (?) |
| **Fuso horário** | **Tooltip:** "Fuso horário da data/hora de envio. O envio será feito neste horário exato." | Tooltip (?) |

---

## 18. Programa de Afiliados

### Página: `/admin/marketing/affiliates`

**Texto descritivo:**
> "Programa de afiliados: parceiros que indicam sua loja e ganham comissão sobre as vendas geradas. Cada afiliado recebe um link exclusivo de divulgação."

**Link:** [Saiba mais: Como funciona o programa de afiliados →](/admin/tutorials/marketing)

**Banner:**
> 🤝 **Como funciona:** O afiliado divulga seu link → Cliente compra pelo link → Afiliado ganha comissão → Você paga a comissão.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Comissão %** | **Tooltip:** "Percentual que o afiliado recebe sobre cada venda gerada pelo link dele. Ex: 10% = R$10 em uma venda de R$100." | Tooltip (?) |
| **Código de referência** | **Tooltip:** "Código único do afiliado usado no link de divulgação. Ex: sualoja.com/?ref=CODIGO" | Tooltip (?) |
| **Status** | **Tooltip:** "Ativo: pode gerar comissões. Pendente: aguardando aprovação. Inativo: comissões pausadas." | Tooltip (?) |

---

## 19. Upsell e Cross-sell

### Página: `/admin/upsell`

**Texto descritivo:**
> "Aumente o ticket médio oferecendo produtos complementares ou versões superiores durante a compra."

**Link:** [Saiba mais: Upsell e Cross-sell →](/admin/tutorials/marketing)

**Banner:**
> 💡 **Upsell** = Oferecer versão melhor/maior (Ex: "Leve o tamanho família por +R$5"). **Cross-sell** = Oferecer produto complementar (Ex: "Leve também a capinha do celular"). **Bundle** = Combo com desconto. **Pós-compra** = Oferta após finalizar o pedido.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Tipo** | (explicado no banner acima) | — |
| **Gatilho** | **Tooltip:** "Condição para exibir a oferta. 'Produto' = quando item X está no carrinho. 'Categoria' = quando qualquer item da categoria está no carrinho. 'Valor do carrinho' = quando o total atinge o valor. 'Todos' = exibir sempre." | Tooltip (?) |
| **IDs Gatilho** | **Tooltip:** "IDs dos produtos ou categorias que ativam esta oferta. Separe por vírgula." | Tooltip (?) |
| **IDs Produtos Ofertados** | **Tooltip:** "IDs dos produtos que serão oferecidos como upsell/cross-sell. Separe por vírgula." | Tooltip (?) |
| **Desconto %** | **Tooltip:** "Desconto exclusivo da oferta. Ex: 15% de desconto se o cliente aceitar o upsell." | Tooltip (?) |
| **Prioridade** | **Tooltip:** "Quando múltiplas ofertas podem aparecer, a de maior prioridade (número maior) é exibida primeiro." | Tooltip (?) |
| **Max impressões** | **Tooltip:** "Quantas vezes esta oferta pode ser exibida no total. Deixe 0 para ilimitado." | Tooltip (?) |

---

## 20. Programa de Fidelidade

### Página: `/admin/loyalty`

**Texto descritivo:**
> "Recompense clientes fiéis com pontos. Clientes acumulam pontos a cada compra e podem trocar por descontos."

**Link:** [Saiba mais: Como funciona o programa de fidelidade →](/admin/tutorials/marketing)

**Banner:**
> 🏆 **Fluxo:** Cliente compra → Ganha pontos → Acumula pontos → Troca por desconto no próximo pedido.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Pontos por real** | **Tooltip:** "Quantos pontos o cliente ganha por cada R$ 1 gasto. Ex: 1 ponto por real = compra de R$ 100 gera 100 pontos." | Tooltip (?) |
| **Mínimo para resgate** | **Tooltip:** "Quantidade mínima de pontos para trocar por desconto. Ex: 100 pontos mínimos para usar." | Tooltip (?) |
| **Valor por ponto** | **Tooltip:** "Quanto vale cada ponto em reais. Ex: 0.01 = 100 pontos valem R$ 1.00." | Tooltip (?) |
| **Expiração (dias)** | **Tooltip:** "Pontos expiram após X dias sem uso. Ex: 365 = pontos valem por 1 ano." | Tooltip (?) |
| **Pontos em avaliações** | **Tooltip:** "Cliente ganha pontos extras ao deixar uma avaliação de produto." | Tooltip (?) |
| **Pontos por indicação** | **Tooltip:** "Cliente ganha pontos quando indica um amigo que faz a primeira compra." | Tooltip (?) |
| **Tiers (Bronze/Prata/Ouro/Platina)** | **Tooltip:** "Níveis de fidelidade baseados em pontos acumulados. Quanto mais pontos, maior o nível e os benefícios." | Tooltip (?) |
| **Ajuste de pontos** | **Tooltip:** "Adicionar ou remover pontos manualmente. Use valor negativo para subtrair. Ex: +100 ou -50." | Tooltip (?) |

---

## 21. Contadores Regressivos

### Página: `/admin/countdown-timers`

**Texto descritivo:**
> "Crie urgência com contadores regressivos na loja. Mostra tempo restante para promoções e ofertas limitadas."

**Link:** [Saiba mais: Contadores regressivos →](/admin/tutorials/marketing)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Tipo: Data fixa** | **Tooltip:** "O contador termina em uma data/hora específica. Ex: 'Black Friday termina em 25/11 às 23:59'." | Tooltip (?) |
| **Tipo: Evergreen** | **Tooltip:** "O contador reinicia para cada visitante. Ex: 'Oferta expira em 60 minutos'. Cada visitante vê seus próprios 60 minutos." | Tooltip (?) |
| **Tipo: Diário recorrente** | **Tooltip:** "O contador funciona em horários fixos todo dia. Ex: Das 08:00 às 20:00. Fora do horário, o contador some." | Tooltip (?) |
| **Posição** | **Tooltip:** "Onde o contador aparece na loja: topo da página, rodapé, página do produto ou página do carrinho." | Tooltip (?) |
| **Mensagem** | **Tooltip:** "Texto exibido junto ao contador. Ex: '🔥 Oferta termina em...', 'Últimas unidades!'" | Tooltip (?) |
| **Cores** | **Tooltip:** "Cor de fundo e cor do texto do banner do contador." | Tooltip (?) |

---

## 22. Assinaturas de Produtos

### Página: `/admin/product-subscriptions`

**Texto descritivo:**
> "Venda produtos por assinatura. O cliente recebe o produto automaticamente em intervalos regulares (semanal, mensal, etc.)."

**Link:** [Saiba mais: Assinaturas de produtos →](/admin/tutorials/marketing)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Produto** | **Tooltip:** "Produto que será vendido por assinatura." | Tooltip (?) |
| **Frequência** | **Tooltip:** "Com que frequência o cliente recebe: semanal, quinzenal, mensal, bimestral, trimestral." | Tooltip (?) |
| **Desconto de assinatura** | **Tooltip:** "Desconto para quem assina vs compra avulsa. Ex: 10% de desconto nos pedidos recorrentes." | Tooltip (?) |
| **Parcelas / Ciclos** | **Tooltip:** "Número de entregas. Ex: 12 ciclos = 12 meses. Deixe vazio para assinatura contínua." | Tooltip (?) |

---

## 23. Chat / Mensagens

### Página: `/admin/chat`

**Texto descritivo:**
> "Converse com seus clientes diretamente pelo painel. As mensagens aparecem para o cliente na loja."

---

## 24. Suporte

### Página: `/admin/support`

**Texto descritivo:**
> "Central de suporte — abra tickets para a equipe Lojaki quando precisar de ajuda técnica ou comercial."

---

## 25. Notificações

### Página: `/admin/notifications`

**Texto descritivo:**
> "Todas as notificações da sua loja: novos pedidos, estoque baixo, novos clientes e atualizações do sistema."

---

## 26. Notas Fiscais (NF-e)

### Página: `/admin/nfe`

**Texto descritivo:**
> "Emita e gerencie Notas Fiscais Eletrônicas (NF-e) dos seus pedidos. Obrigatório para vendas com nota fiscal."

**Link:** [Saiba mais: Como emitir notas fiscais →](/admin/tutorials/payments)

**Banner educativo:**
> 📄 **NF-e (Nota Fiscal Eletrônica)** é o documento fiscal digital obrigatório no Brasil para empresas com CNPJ. Integre um provedor (NFe.io, Tiny, Bling) para emissão automática ou manual.

### Aba de configuração

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Provedor NF-e** | **Tooltip:** "Serviço que emite as notas fiscais. NFe.io, Tiny e Bling são os mais populares. Cada um tem planos e preços diferentes." | Tooltip (?) |
| **Chave da API** | **Tooltip:** "Token de autenticação do provedor de NF-e. Encontre nas configurações/API do provedor escolhido." | Tooltip (?) |
| **Emissão automática** | **Tooltip:** "Se ativado, uma NF-e é emitida automaticamente quando o pagamento de um pedido é confirmado." | Tooltip (?) |
| **CNPJ** | **Tooltip:** "CNPJ da empresa emissora. Deve ser o mesmo cadastrado no provedor de NF-e." | Tooltip (?) |
| **Inscrição Estadual** | **Tooltip:** "Número da Inscrição Estadual (IE). Necessário para emissão de NF-e. Isento se for MEI sem IE." | Tooltip (?) |
| **CFOP padrão** | **Tooltip:** "Código Fiscal de Operações e Prestações. Define a natureza da operação. Para venda de mercadoria dentro do estado, use **5102**. Para venda interestadual, use **6102**. Em caso de dúvida, consulte seu contador." | Tooltip (?) |

### Status das notas

| Status | Explicação para o usuário |
|--------|--------------------------|
| **PENDING** | "Aguardando emissão" |
| **PROCESSING** | "Sendo processada pelo provedor" |
| **ISSUED** | "Emitida com sucesso — PDF e XML disponíveis" |
| **CANCELLED** | "Nota cancelada" |
| **ERROR** | "Erro na emissão — verifique os dados fiscais" |

---

## 27. Integrações

### Página: `/admin/integrations`

**Texto descritivo:**
> "Conecte sua loja a serviços externos: pagamentos, frete, marketing, analytics e mais."

**Link:** [Saiba mais: Guia de integrações →](/admin/tutorials/integrations)

### Por integração — tooltips e links

| Integração | Campos confusos | Tooltip / Ajuda |
|------------|----------------|---------|
| **Facebook Pixel** | Pixel ID | **Tooltip:** "ID do pixel encontrado em Meta Events Manager → Pixels. Formato: 10-20 dígitos numéricos." |
| **Google Analytics 4** | Measurement ID | **Tooltip:** "Encontre em Google Analytics → Admin → Data Streams. Formato: G-XXXXXXXXXX" |
| **Google Tag Manager** | Container ID | **Tooltip:** "ID do container GTM. Formato: GTM-XXXXXXX. Encontre em tagmanager.google.com" |
| **Google Merchant Center** | Merchant ID | **Tooltip:** "ID do Merchant Center. Encontre em merchantcenter.google.com → Configurações" |
| **TikTok Pixel** | Pixel ID | **Tooltip:** "ID do pixel do TikTok Events Manager. Formato numérico." |
| **Hotjar** | Site ID | **Tooltip:** "ID do site no Hotjar. Encontre em Hotjar → Sites & Organizations. Formato numérico." |
| **Mailchimp** | API Key | **Tooltip:** "Encontre em mailchimp.com → Account → Extras → API keys. Formato: xxxxx-us21" |
| **Mailchimp** | Audience/List ID | **Tooltip:** "Encontre em Audience → Settings → Audience name and defaults → Audience ID" |
| **Mailchimp** | Server Prefix | **Tooltip:** "Extraído automaticamente da API Key. Ex: us21." |
| **Ebit** | ID | **Tooltip:** "Código Ebit para selo de reputação. Fornecido pela Ebit após cadastro." |
| **Tags de verificação** | Meta tags | **Tooltip:** "Tags HTML para verificar propriedade do site em Google, Facebook, Pinterest, etc." |
| **Códigos de conversão** | Scripts | **Tooltip:** "Códigos JavaScript de acompanhamento de conversão de plataformas de anúncios." |
| **Chat widget** | Script | **Tooltip:** "Código do widget de chat (Tawk.to, JivoChat, etc.) que será inserido em todas as páginas." |

---

## 28. Loja Virtual / Online Store

### `/admin/online-store` — Visão geral

**Texto descritivo:**
> "Personalize a aparência e o conteúdo da sua loja virtual."

### `/admin/online-store/layout-theme` — Temas

**Texto descritivo:**
> "Escolha o tema visual da sua loja. O tema define cores, tipografia e layout geral."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Cor primária** | **Tooltip:** "Cor principal usada em botões, links e destaques. Recomendação: cor da sua marca." | Tooltip (?) |
| **Tipografia** | **Tooltip:** "Fonte usada nos textos da loja. Fonte sans-serif é mais moderna, serif é mais elegante." | Tooltip (?) |

### `/admin/online-store/layout-editor` — Editor de layout

**Texto descritivo:**
> "Monte a página inicial da loja arrastando seções: banners, produtos em destaque, categorias, depoimentos e mais."

**Tooltip nos blocos:**
> Cada bloco (Banner, Grid de produtos, Categorias, Depoimentos, Newsletter etc.) ter tooltip explicando o que faz e onde aparece.

### `/admin/online-store/pages` — Páginas

**Texto descritivo:**
> "Crie páginas institucionais: Sobre, Contato, Política de Privacidade, Termos de Uso. Essas páginas aparecem no menu da loja."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Slug** | **Tooltip:** "URL da página. Gerado do título. Ex: 'politica-de-privacidade'" | Tooltip (?) |
| **HTML / Rich Text** | **Tooltip:** "Conteúdo da página. Use o editor visual ou cole HTML." | Tooltip (?) |

### `/admin/online-store/menus` — Menus

**Texto descritivo:**
> "Configure os menus de navegação da loja: menu principal (topo), menu do rodapé e menu mobile."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Itens do menu** | **Tooltip:** "Arraste para reordenar. Cada item pode linkar para: categoria, página, URL externa ou coleção." | Tooltip (?) |
| **Sub-menus (dropdown)** | **Tooltip:** "Arraste um item dentro de outro para criar sub-menus." | Tooltip (?) |

### `/admin/online-store/filters` — Filtros

**Texto descritivo:**
> "Configure quais filtros aparecem na página de listagem de produtos: preço, categoria, marca, cor, tamanho, avaliação."

### `/admin/online-store/blog` — Blog

**Texto descritivo:**
> "Publique artigos no blog da loja para melhorar o SEO e atrair clientes organicamente."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Slug** | **Tooltip:** "URL do post. Ex: 'como-escolher-o-tamanho-certo'" | Tooltip (?) |
| **Meta description** | **Tooltip:** "Descrição que aparece nos resultados do Google. Máximo 160 caracteres." | Tooltip (?) |
| **Tags** | **Tooltip:** "Palavras-chave para organizar posts e melhorar buscas." | Tooltip (?) |

### `/admin/online-store/social-links` — Links sociais

**Texto descritivo:**
> "Adicione links para suas redes sociais. Aparecem no rodapé da loja."

### `/admin/online-store/under-construction` — Modo manutenção

**Texto descritivo:**
> "Ative o modo manutenção para ocultar a loja temporariamente. Visitantes verão uma página de 'Em breve'."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Modo manutenção** | **Tooltip:** "Quando ativo, a loja fica inacessível para clientes. Somente administradores logados podem ver a loja." | Tooltip (?) |
| **Senha de preview** | **Tooltip:** "Compartilhe esta senha para permitir que pessoas específicas vejam a loja durante a manutenção." | Tooltip (?) |

---

## 29. Estatísticas / Analytics

### Página: `/admin/statistics`

**Texto descritivo:**
> "Métricas da sua loja: vendas, receita, visitantes, taxa de conversão e produtos mais vendidos."

| Métrica | Tooltip / Ajuda |
|---------|---------|
| **Taxa de conversão** | **Tooltip:** "Porcentagem de visitantes que completaram uma compra. Fórmula: (Pedidos ÷ Visitantes) × 100. Média de lojas: 1-3%." |
| **Ticket médio** | **Tooltip:** "Valor médio por pedido. Fórmula: Receita total ÷ Número de pedidos." |
| **LTV (Lifetime Value)** | **Tooltip:** "Valor total que um cliente gasta durante toda a vida como cliente na sua loja." |
| **CAC** | **Tooltip:** "Custo de Aquisição de Cliente. Quanto você gasta em marketing para conquistar 1 cliente." |
| **ROI** | **Tooltip:** "Retorno sobre Investimento. Fórmula: (Receita - Custo) ÷ Custo × 100." |

---

## 30. Configurações — Dados do Negócio

### Página: `/admin/settings/business-data`

**Texto descritivo:**
> "Informações principais da sua loja: nome, descrição, contato e setor de atuação."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome da loja** | — (autoexplicativo) | — |
| **Descrição** | **Tooltip:** "Breve descrição da loja. Aparece nos resultados de busca e meta tags. Máximo 160 caracteres." | Tooltip (?) |
| **Usar para SEO** | **Tooltip:** "Se ativado, o nome e descrição da loja são usados automaticamente como título e meta description da página inicial no Google." | Tooltip (?) |
| **Fuso horário** | **Tooltip:** "Define o horário usado em pedidos, relatórios e agendamentos. American/São Paulo é o padrão (horário de Brasília)." | Tooltip (?) |
| **Ramo de atividade** | **Tooltip:** "Ajuda o sistema a sugerir categorias e configurações otimizadas para o seu segmento." | Tooltip (?) |

---

## 31. Configurações — Dados Fiscais

### Página: `/admin/settings/fiscal-data`

**Texto descritivo:**
> "Dados necessários para emissão de Notas Fiscais (NF-e) e boletos. Se você não emite NF-e, pode preencher depois."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **CPF/CNPJ** | **Tooltip:** "CPF para pessoa física ou CNPJ para empresa. Necessário para emissão de NF-e e boletos." | Tooltip (?) |
| **CEP** | **Tooltip:** "CEP do endereço fiscal. Ao preencher, os campos de endereço serão preenchidos automaticamente." | Tooltip (?) |
| **Razão Social** | **Tooltip:** "Nome completo (pessoa física) ou razão social (empresa) como consta no CNPJ." | Tooltip (?) |

---

## 32. Configurações — Conta e Segurança

### Página: `/admin/settings/account` e `/admin/settings/security`

**Texto descritivo (conta):**
> "Dados de acesso à sua conta no painel administrativo."

**Texto descritivo (segurança):**
> "Configure autenticação em dois fatores (2FA) e gerencie sessões ativas."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **2FA (Autenticação em dois fatores)** | **Tooltip:** "Adiciona uma camada extra de segurança. Além da senha, você precisará de um código gerado pelo app (Google Authenticator, Authy)." | Tooltip (?) |
| **Sessões ativas** | **Tooltip:** "Dispositivos que estão logados na sua conta agora. Encerre sessões desconhecidas para proteger sua conta." | Tooltip (?) |

---

## 33. Configurações — Meios de Envio

### Página: `/admin/settings/shipping-methods`

**Texto descritivo:**
> "Configure como os produtos são entregues: transportadoras, frete personalizado e retirada em loja."

**Link:** [Saiba mais: Como configurar frete →](/admin/tutorials/integrations)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Melhor Envio** | **Tooltip:** "Plataforma que calcula frete automaticamente com várias transportadoras (Correios, Jadlog, etc.) com desconto." | Tooltip (?) |
| **Frete personalizado** | **Tooltip:** "Crie regras de frete manuais quando não quiser usar o Melhor Envio." | Tooltip (?) |
| **Tipo: Tarifa fixa** | **Tooltip:** "Valor fixo de frete para todos os envios. Ex: R$ 15 para qualquer lugar." | Tooltip (?) |
| **Tipo: Grátis a partir de** | **Tooltip:** "Frete grátis quando o carrinho atingir o valor mínimo definido." | Tooltip (?) |
| **Tipo: A combinar** | **Tooltip:** "Frete calculado manualmente após o pedido. Útil para produtos muito grandes ou frágeis." | Tooltip (?) |
| **Prazo mínimo / máximo** | **Tooltip:** "Prazo de entrega em dias úteis exibido para o cliente no checkout." | Tooltip (?) |
| **Retirada em loja** | **Tooltip:** "Permite que o cliente retire o pedido em um ponto de retirada/loja física." | Tooltip (?) |
| **Dias de preparo** | **Tooltip:** "Dias úteis necessários para preparar o pedido antes da retirada. Ex: 2 dias para embalar e separar." | Tooltip (?) |
| **Locais de retirada** | **Tooltip:** "Endereços onde o cliente pode retirar. Pode ter vários locais." | Tooltip (?) |

---

## 34. Configurações — Centros de Distribuição

### Página: `/admin/settings/distribution-centers`

**Texto descritivo:**
> "Endereços de onde seus produtos são enviados. O frete é calculado a partir do centro de distribuição mais próximo do cliente."

**Banner:**
> 📍 Se você tem apenas um local de envio (depósito, casa, loja), cadastre apenas um centro. Múltiplos centros são para operações com vários estoques em locais diferentes.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Definir como principal** | **Tooltip:** "O centro principal é usado como endereço de origem padrão para cálculo de frete quando o produto não tem centro específico." | Tooltip (?) |
| **Nome do local** | **Tooltip:** "Nome interno para identificar. Ex: 'Depósito SP', 'Loja BH'." | Tooltip (?) |

---

## 35. Configurações — Meios de Pagamento

### Página: `/admin/settings/payment-methods`

**Texto descritivo:**
> "Configure como seus clientes pagam: cartão de crédito, PIX, boleto e pagamento manual."

**Link:** [Saiba mais: Como configurar pagamentos →](/admin/tutorials/payments)

### Stripe Connect

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Conectar Stripe** | **Tooltip:** "Stripe é o gateway de pagamento que processa cartões de crédito. Você será redirecionado para criar/conectar uma conta Stripe." | Tooltip (?) |
| **Status: ONBOARDING_PENDING** | **Texto:** "Sua conta Stripe está sendo verificada. Continue o cadastro clicando no botão." | Texto inline |
| **Status: RESTRICTED** | **Texto:** "Ação necessária na sua conta Stripe. Acesse o painel Stripe para resolver." | Texto inline |

### Mercado Pago

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Parcelamento máximo** | **Tooltip:** "Número máximo de parcelas que o cliente pode escolher. Ex: 12x (o Mercado Pago define taxas por parcela)." | Tooltip (?) |
| **Juros pelo cliente** | **Tooltip:** "Se ativado, o cliente paga os juros do parcelamento. Se desativado, você absorve os juros." | Tooltip (?) |

### PIX (manual)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Tipo de chave** | **Tooltip:** "Tipo da chave PIX: CPF, CNPJ, e-mail, telefone ou chave aleatória." | Tooltip (?) |
| **Chave PIX** | **Tooltip:** "Sua chave PIX para receber pagamentos. O cliente fará uma transferência PIX para esta chave." | Tooltip (?) |

### Pagamento Manual

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Label** | **Tooltip:** "Nome do método de pagamento visível para o cliente. Ex: 'Depósito Bancário', 'Combinar via WhatsApp'." | Tooltip (?) |
| **Instruções** | **Tooltip:** "Instruções de pagamento exibidas ao cliente após finalizar o pedido. Ex: dados bancários, Pix, etc." | Tooltip (?) |

---

## 36. Configurações — E-mails Automáticos

### Página: `/admin/settings/emails`

**Texto descritivo:**
> "Personalize os e-mails automáticos que sua loja envia: confirmação de pedido, envio, boas-vindas e mais."

**Link:** [Saiba mais: E-mails da loja →](/admin/tutorials/marketing)

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Variáveis do template** | **Tooltip:** "Use {{variavel}} no corpo do e-mail para inserir dados dinâmicos. Ex: {{customer.name}} será substituído pelo nome do cliente." | Tooltip (?) |
| **E-mail de resposta** | **Tooltip:** "E-mail para onde o cliente responde. Se vazio, o e-mail padrão da loja é usado." | Tooltip (?) |

### Eventos disponíveis com explicação

| Evento | Explicação |
|--------|-----------|
| **Confirmação de pedido** | "Enviado imediatamente quando o cliente finaliza a compra." |
| **Pagamento aprovado** | "Enviado quando o pagamento é confirmado (PIX, cartão, boleto)." |
| **Pedido enviado** | "Enviado quando você marca o pedido como 'Enviado'. Inclui código de rastreio." |
| **Pedido entregue** | "Enviado quando o pedido é marcado como entregue." |
| **Carrinho abandonado** | "Enviado automaticamente X horas após o abandon do carrinho." |
| **Reembolso** | "Enviado quando um reembolso é processado." |
| **Boas-vindas** | "Enviado quando um novo cliente se cadastra na loja." |
| **Recuperação de senha** | "Enviado quando o cliente solicita reset de senha." |
| **Pedir avaliação** | "Enviado X dias após a entrega pedindo avaliação do produto." |
| **Cupom presente** | "E-mail com cupom de desconto enviado em datas especiais." |
| **Nova mensagem** | "Notificação quando o cliente envia mensagem no chat." |

---

## 37. Configurações — Checkout

### Página: `/admin/settings/checkout`

**Texto descritivo:**
> "Personalize a experiência de compra na etapa final. Adicione campos, mensagens e ofertas especiais."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Solicitar telefone** | **Tooltip:** "Pedir telefone do cliente no checkout. Útil para contato sobre entrega e para WhatsApp." | Tooltip (?) |
| **Solicitar CPF/CNPJ** | **Tooltip:** "Pedir CPF/CNPJ para emissão de nota fiscal." | Tooltip (?) |
| **Campo de observação** | **Tooltip:** "Permite que o cliente deixe instruções especiais. Ex: 'Embrulho para presente', 'Não tocar a campainha'." | Tooltip (?) |
| **Troca de pagamento** | **Tooltip:** "Permite que clientes com pedidos pendentes alterem o método de pagamento. Útil quando boleto vence ou cartão é recusado." | Tooltip (?) |
| **Controle de acesso** | **Tooltip:** "Se 'Apenas clientes cadastrados', visitantes sem conta não conseguem finalizar a compra." | Tooltip (?) |
| **Wishlist** | **Tooltip:** "Lista de desejos — clientes podem salvar produtos para comprar depois." | Tooltip (?) |
| **Order Bump** | **Tooltip:** "Oferta complementar exibida na página de checkout. Ex: 'Leve também...' com um produto adicional com desconto." | Tooltip (?) |
| **Brinde** | **Tooltip:** "Produto gratuito adicionado automaticamente quando o carrinho atinge o valor mínimo definido." | Tooltip (?) |
| **Popup de cupom** | **Tooltip:** "Exibe popup oferecendo um cupom para novos visitantes. Atrasa X segundos após carregar a página." | Tooltip (?) |
| **Countdown no checkout** | **Tooltip:** "Contador regressivo exibido no checkout para criar urgência. Ex: 'Oferta expira em 10:00'." | Tooltip (?) |
| **Desconto no PIX** | **Tooltip:** "Desconto automático (%) quando o cliente escolhe pagar via PIX." | Tooltip (?) |
| **Desconto no Boleto** | **Tooltip:** "Desconto automático (%) quando o cliente escolhe pagar por boleto." | Tooltip (?) |

---

## 38. Configurações — Campos Personalizados

### Página: `/admin/settings/custom-fields`

**Texto descritivo:**
> "Adicione informações extras aos seus produtos, categorias e pedidos. Ideal para: gravação personalizada, tamanho sob medida, cor especial, instruções de entrega."

**Banner:**
> 💡 **Exemplo:** Campo "Gravação" tipo texto em Produtos → cliente digita o nome para gravar no produto antes de comprar.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Tipo: Texto curto** | **Tooltip:** "Campo de texto de uma linha. Ex: nome para gravação." | Tooltip (?) |
| **Tipo: Texto longo** | **Tooltip:** "Campo com múltiplas linhas. Ex: instruções detalhadas." | Tooltip (?) |
| **Tipo: Numérico** | **Tooltip:** "Aceita apenas números. Ex: medida em centímetros." | Tooltip (?) |
| **Tipo: Seleção** | **Tooltip:** "Lista de opções para o cliente escolher. Ex: cor da gravação." | Tooltip (?) |
| **Tipo: Checkbox** | **Tooltip:** "Opção de sim/não. Ex: 'Embrulho para presente'." | Tooltip (?) |
| **Aplicar em: Produtos** | **Tooltip:** "O campo aparece na página do produto, antes do botão 'Adicionar ao carrinho'." | Tooltip (?) |
| **Aplicar em: Categorias** | **Tooltip:** "O campo fica associado à categoria para organização interna." | Tooltip (?) |
| **Aplicar em: Pedidos** | **Tooltip:** "O campo aparece no checkout para informações do pedido." | Tooltip (?) |
| **Placeholder** | **Tooltip:** "Texto de exemplo que aparece dentro do campo antes do cliente digitar." | Tooltip (?) |
| **Obrigatório** | **Tooltip:** "Se ativado, o cliente precisa preencher este campo para continuar." | Tooltip (?) |

---

## 39. Configurações — Mensagens para Clientes

### Página: `/admin/settings/messages`

**Texto descritivo:**
> "Personalize mensagens exibidas no checkout, carrinho e acompanhamento de pedido."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Mensagem no checkout** | **Tooltip:** "Texto exibido na página de checkout. Ex: 'Frete grátis para compras acima de R$100!'" | Tooltip (?) |
| **Mensagem no carrinho** | **Tooltip:** "Texto exibido no carrinho de compras. Ex: 'Leve mais 1 e ganhe 10% de desconto!'" | Tooltip (?) |
| **Mensagem pós-compra** | **Tooltip:** "Texto exibido na página de confirmação do pedido. Ex: 'Obrigado! Seu pedido será enviado em até 2 dias úteis.'" | Tooltip (?) |

---

## 40. Configurações — Redirecionamentos 301

### Página: `/admin/settings/redirects`

**Texto descritivo:**
> "Redirecione URLs antigas para novas. Útil quando você muda o slug de um produto ou remove uma página."

**Banner:**
> 🔄 **Redirect 301** diz ao Google que uma página mudou de endereço permanentemente. Preserva o SEO da página antiga.

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **URL de origem** | **Tooltip:** "URL antiga que você quer redirecionar. Ex: /produto/camiseta-velha" | Tooltip (?) |
| **URL de destino** | **Tooltip:** "URL nova para onde o visitante será enviado. Ex: /produto/camiseta-nova" | Tooltip (?) |

---

## 41. Configurações — Domínios

### Página: `/admin/settings/domains`

**Texto descritivo:**
> "Conecte um domínio próprio à sua loja. Por padrão, sua loja está acessível em sualoja.rapidocart.com.br."

**Link:** [Saiba mais: Como configurar domínio próprio →](/admin/tutorials/integrations)

**Banner educativo:**
> 🌐 Para usar um domínio próprio (ex: www.minhaloja.com.br), você precisa configurar registros DNS no seu provedor de domínio (Registro.br, GoDaddy, Cloudflare).

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Domínio** | **Tooltip:** "Seu domínio sem https://. Ex: www.minhaloja.com.br" | Tooltip (?) |
| **CNAME** | **Tooltip:** "Registro DNS tipo CNAME que aponta seu domínio para nossos servidores. Configure no painel do seu provedor de domínio." | Tooltip (?) |
| **TXT** | **Tooltip:** "Registro DNS para verificação de propriedade. Prova que o domínio é seu." | Tooltip (?) |
| **SSL** | **Tooltip:** "Certificado de segurança (https://). É gerado automaticamente após a verificação do domínio." | Tooltip (?) |
| **Propagação DNS** | **Tooltip:** "Após configurar os registros DNS, pode levar de minutos até 48 horas para funcionar. Isso é normal." | Tooltip (?) |

---

## 42. Configurações — Idiomas e Moedas

### Página: `/admin/settings/languages`

**Texto descritivo:**
> "Configure o idioma principal da loja e a moeda utilizada."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Idioma da loja** | **Tooltip:** "Idioma em que os textos automáticos (botões, e-mails, etc.) são exibidos na loja." | Tooltip (?) |
| **Moeda** | **Tooltip:** "Moeda usada nos preços. BRL = Real brasileiro. Alterar a moeda NÃO converte valores — apenas muda o símbolo exibido." | Tooltip (?) |

---

## 43. Configurações — Usuários e Permissões

### Página: `/admin/settings/users`

**Texto descritivo:**
> "Convide membros da equipe para ajudar a gerenciar a loja. Cada usuário tem um nível de acesso."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Role: Admin** | **Tooltip:** "Acesso total — pode ver e alterar tudo, inclusive configurações e dados financeiros." | Tooltip (?) |
| **Role: Editor** | **Tooltip:** "Pode gerenciar produtos, pedidos e clientes. NÃO pode alterar configurações ou dados financeiros." | Tooltip (?) |
| **Role: Viewer** | **Tooltip:** "Apenas visualização — não pode editar nada. Útil para contadores ou consultores." | Tooltip (?) |

---

## 44. Billing / Plano

### Página: `/admin/billing`

**Texto descritivo:**
> "Seu plano atual, limites de uso e histórico de faturas."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Limite de produtos** | **Tooltip:** "Número máximo de produtos que você pode cadastrar no plano atual. Faça upgrade para mais." | Tooltip (?) |
| **Limite de pedidos/mês** | **Tooltip:** "Número máximo de pedidos processados por mês no plano atual." | Tooltip (?) |
| **Armazenamento** | **Tooltip:** "Espaço usado para fotos e arquivos. Planos maiores oferecem mais armazenamento." | Tooltip (?) |

---

## 45. FAQ

### Página: `/admin/faq`

**Texto descritivo:**
> "Perguntas frequentes sobre a plataforma."

---

## 46. Aplicativos

### Página: `/admin/apps`

**Texto descritivo:**
> "Instale aplicativos para expandir as funcionalidades da sua loja: chat, reviews, SEO e mais."

---

## 47. Atividade / Logs

### Página: `/admin/activity`

**Texto descritivo:**
> "Registro de todas as ações realizadas no painel: quem fez o quê e quando. Útil para auditoria."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Ação** | **Tooltip:** "O que foi feito (criou produto, editou pedido, removeu cupom, etc.)" | Tooltip (?) |
| **Usuário** | **Tooltip:** "Quem realizou a ação. Mostra 'Sistema' para ações automáticas." | Tooltip (?) |

---

## 48. Dashboard

### Página: `/admin`

**Texto descritivo (para novos lojistas):**
> "Bem-vindo ao painel! Aqui você vê um resumo da loja: vendas, pedidos recentes e um checklist para começar."

| Metric | Tooltip / Ajuda |
|--------|---------|
| **Setup Checklist** | **Tooltip:** "Complete essas etapas para sua loja ficar pronta para vender." |
| **Vendas hoje** | **Tooltip:** "Total em vendas registradas hoje (pedidos com pagamento confirmado)." |
| **Pedidos pendentes** | **Tooltip:** "Pedidos aguardando processamento ou pagamento." |

---

## 49. Super Admin — Lojas

### Página: `/super-admin/stores`

**Texto descritivo:**
> "Gerencie todas as lojas da plataforma. Visualize, aprove, suspenda ou exclua lojas."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Status: Ativo** | **Tooltip:** "Loja online e operacional." | Tooltip (?) |
| **Status: Pendente** | **Tooltip:** "Loja aguardando aprovação para ir ao ar." | Tooltip (?) |
| **Status: Suspenso** | **Tooltip:** "Loja temporariamente desativada. Clientes não conseguem acessar." | Tooltip (?) |
| **Performance** | **Tooltip:** "Métricas da loja: vendas, pedidos, taxa de conversão." | Tooltip (?) |

### `/super-admin/stores/approvals`

**Texto descritivo:**
> "Lojas pendentes de aprovação. Revise os dados e aprove ou rejeite."

---

## 50. Super Admin — Assinaturas e Planos

### Página: `/super-admin/subscriptions`

**Texto descritivo:**
> "Gerencie os planos de assinatura da plataforma e acompanhe os assinantes."

### `/super-admin/subscriptions/plans/new` ou `[id]`

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Nome do plano** | — | — |
| **Preço mensal** | **Tooltip:** "Valor da assinatura cobrado mensalmente." | Tooltip (?) |
| **Preço anual** | **Tooltip:** "Valor cobrado no plano anual (geralmente com desconto)." | Tooltip (?) |
| **Limite de produtos** | **Tooltip:** "Máximo de produtos que a loja pode cadastrar neste plano." | Tooltip (?) |
| **Limite de pedidos/mês** | **Tooltip:** "Máximo de pedidos que a loja pode processar por mês." | Tooltip (?) |
| **Limite de armazenamento** | **Tooltip:** "Espaço máximo para fotos e arquivos em GB." | Tooltip (?) |
| **Features incluídas** | **Tooltip:** "Funcionalidades habilitadas neste plano (ex: afiliados, NF-e, multi-idioma)." | Tooltip (?) |
| **Trial (dias)** | **Tooltip:** "Período de teste gratuito antes da primeira cobrança." | Tooltip (?) |

### `/super-admin/subscriptions/subscribers`

**Texto descritivo:**
> "Lista de lojas assinantes com status de pagamento, plano atual e data de renovação."

### `/super-admin/subscriptions/billing`

**Texto descritivo:**
> "Histórico de cobranças e faturas de todos os assinantes."

---

## 51. Super Admin — Afiliados

### Página: `/super-admin/affiliates`

**Texto descritivo:**
> "Gerencie o programa de afiliados da plataforma. Parceiros que indicam novas lojas e ganham comissão."

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **Comissão** | **Tooltip:** "Percentual ou valor fixo pago ao afiliado por cada indicação que se torna assinante." | Tooltip (?) |
| **Cookie (dias)** | **Tooltip:** "Duração do cookie de rastreamento. Se o indicado assinar dentro dos X dias do clique, o afiliado ganha comissão." | Tooltip (?) |
| **Payouts** | **Tooltip:** "Pagamentos pendentes e histórico de pagamentos aos afiliados." | Tooltip (?) |

---

## 52. Super Admin — Finanças

### Página: `/super-admin/finance/transactions`

**Texto descritivo:**
> "Todas as transações financeiras da plataforma: cobranças de assinatura, comissões de afiliados e taxas."

### `/super-admin/finance/payouts`

**Texto descritivo:**
> "Pagamentos enviados (payouts) para afiliados e lojistas. Gerencie pendentes e histórico."

---

## 53. Super Admin — E-mails e Campanhas

### Página: `/super-admin/emails`

**Texto descritivo:**
> "Gerencie todos os e-mails da plataforma: templates, campanhas e configurações SMTP."

### `/super-admin/emails/config`

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **SMTP Host** | **Tooltip:** "Servidor SMTP para envio de e-mails. Ex: smtp.gmail.com, smtp.sendgrid.net" | Tooltip (?) |
| **SMTP Port** | **Tooltip:** "Porta do servidor: 587 (TLS) ou 465 (SSL)." | Tooltip (?) |
| **Username / Password** | **Tooltip:** "Credenciais de autenticação do SMTP." | Tooltip (?) |
| **From Email** | **Tooltip:** "E-mail remetente que aparece para os destinatários." | Tooltip (?) |
| **From Name** | **Tooltip:** "Nome que aparece como remetente. Ex: 'Lojaki'" | Tooltip (?) |

### `/super-admin/emails/campaigns`

**Texto descritivo:**
> "Campanhas de e-mail para todos os lojistas da plataforma: novidades, atualizações e marketing."

---

## 54. Super Admin — Configurações do Sistema

### Página: `/super-admin/settings`

**Texto descritivo:**
> "Configurações globais da plataforma."

### `/super-admin/settings/api-keys`

| Campo | Tooltip / Ajuda | Tipo |
|-------|----------------|------|
| **API Key** | **Tooltip:** "Chave de acesso para a API da plataforma. Use para integrações externas." | Tooltip (?) |
| **Permissões** | **Tooltip:** "Quais operações esta chave pode realizar: leitura, escrita, admin." | Tooltip (?) |

### `/super-admin/security`

**Texto descritivo:**
> "Configurações de segurança: rate limiting, bloqueio de IPs, força de senha e logs de segurança."

### `/super-admin/infrastructure`

**Texto descritivo:**
> "Monitoramento da infraestrutura: CPU, memória, banco de dados, filas e armazenamento."

### `/super-admin/error-logs`

**Texto descritivo:**
> "Logs de erro da aplicação para debugging. Filtrar por severidade, data e componente."

---

## Checklist de implementação

### Fase 1 — Componentes base
- [ ] Criar `src/components/shared/tooltip-helper.tsx`
- [ ] Criar `src/components/shared/learn-more-link.tsx`
- [ ] Criar `src/components/shared/help-banner.tsx`

### Fase 2 — Sidebar
- [ ] Mover "Tutoriais" para rodapé da sidebar como ícone de ajuda
- [ ] Remover sub-itens expandidos de tutoriais
- [ ] Unificar FAQ com Central de Ajuda

### Fase 3 — Produtos (prioridade alta)
- [ ] Adicionar tooltips: SKU, barcode, tipo de produto
- [ ] Adicionar tooltips: todos os preços (promocional, comparativo, custo)
- [ ] Adicionar tooltips: estoque, frete grátis, peso/dimensões
- [ ] Adicionar banner explicativo na seção de variações
- [ ] Adicionar aviso de quantidade de variantes
- [ ] Adicionar tooltips: SEO, tags, texto promo, prova social
- [ ] Link "Saiba mais" → `/admin/tutorials/products`

### Fase 4 — Cupons e Promoções (prioridade alta)
- [ ] Adicionar tooltips em TODOS os campos do form de cupom
- [ ] Banner diferenciando cupom vs promoção
- [ ] Tooltips nos tipos de promoção (compre X pague Y, etc.)
- [ ] Tooltips em escopo, combinações e faixas progressivas  
- [ ] Link "Saiba mais" → `/admin/tutorials/marketing`

### Fase 5 — Pedidos e Carrinhos (prioridade alta)
- [ ] Texto explicativo de cada status de pedido
- [ ] Tooltips: código de rastreio, notas internas, etiqueta
- [ ] Tooltips em carrinhos abandonados (link de recuperação, status)
- [ ] Banner explicativo do fluxo de pedidos  
- [ ] Link "Saiba mais" → `/admin/tutorials/orders`

### Fase 6 — NF-e e Fiscal (prioridade alta)
- [ ] Tooltips: CFOP, IE, provedor NF-e, emissão automática
- [ ] Banner educativo sobre NF-e
- [ ] Explicação de cada status de nota fiscal
- [ ] Link "Saiba mais" → `/admin/tutorials/payments`

### Fase 7 — Configurações (prioridade média)
- [ ] Business Data: fuso horário, ramo, SEO toggle
- [ ] Fiscal Data: CPF/CNPJ, razão social
- [ ] Checkout: explicar cada toggle e funcionalidade
- [ ] Meios de envio: tipos de frete, dias de preparo
- [ ] Meios de pagamento: Stripe, Mercado Pago, PIX manual
- [ ] E-mails automáticos: variáveis, eventos
- [ ] Campos personalizados: tipos e onde aparecem
- [ ] Domínios: CNAME, TXT, SSL, propagação
- [ ] Redirecionamentos 301: banner educativo
- [ ] Usuários: roles com permissões

### Fase 8 — Marketing e Conversão (prioridade média)
- [ ] Afiliados: como funciona, comissão
- [ ] Upsell: tipos, gatilho, IDs
- [ ] Fidelidade: pontos, tiers, expiração
- [ ] Contadores: tipos (fixo, evergreen, diário)
- [ ] Assinaturas de produtos: frequência, ciclos
- [ ] E-mail marketing: público, frequência

### Fase 9 — Integrações (prioridade média)
- [ ] Tooltip em cada ID/key de integração
- [ ] Links para encontrar IDs em cada plataforma
- [ ] Facebook Pixel, GA4, TikTok, GTM, Hotjar, Mailchimp

### Fase 10 — Online Store (prioridade média)
- [ ] Temas: cor primária, tipografia
- [ ] Editor de layout: tooltips nos blocos
- [ ] Páginas: slug, SEO
- [ ] Menus: drag-drop, sub-menus
- [ ] Blog: slug, meta, tags
- [ ] Manutenção: toggle, senha preview

### Fase 11 — Estatísticas (prioridade baixa)
- [ ] Tooltips: taxa de conversão, ticket médio, LTV, CAC, ROI

### Fase 12 — Super Admin (prioridade baixa)
- [ ] Texto descritivo em todas as páginas
- [ ] Tooltips em planos (limites, trial, features)
- [ ] Afiliados platform-level: comissão, cookie, payouts
- [ ] E-mail config: SMTP, from, port
- [ ] API Keys: permissões
- [ ] Infraestrutura: métricas

---

## Novas páginas de tutorial a criar

Além dos tutoriais existentes (products, orders, marketing, integrations, payments), criar:

### Tutoriais adicionais necessários:
- [ ] `/admin/tutorials/shipping` — Frete e Logística (tipos de frete, retirada, centros de distribuição)
- [ ] `/admin/tutorials/store` — Loja Virtual (temas, editor, páginas, menus, blog, SEO da loja)
- [ ] `/admin/tutorials/settings` — Configurações (checkout, campos personalizados, domínios, e-mails)
- [ ] `/admin/tutorials/glossary` — Glossário de termos (SKU, CFOP, IE, CNAME, SSL, 301, etc.)
- [ ] `/admin/tutorials/faq` — Unificar FAQ com tutoriais

---

**Estimativa:** ~250 tooltips, ~55 textos descritivos, ~30 banners, ~20 links "Saiba mais", 4 novas páginas de tutorial, 1 glossário.
