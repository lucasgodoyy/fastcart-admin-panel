"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, AlertTriangle, Bug, Lightbulb, Shield, Zap, Palette, CheckSquare,
  ChevronDown, ChevronUp, Search, Filter, ArrowDownToLine, Flame, Clock, CheckCircle2,
  Circle, XCircle, Server, Monitor, Smartphone, BarChart3, Trash2, Plus
} from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, SaSkeleton, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────
type Category = "BUG" | "MISSING_FEATURE" | "IMPROVEMENT" | "SECURITY" | "PERFORMANCE" | "UX" | "TODO";
type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status = "PENDING" | "IN_PROGRESS" | "DONE" | "WONT_FIX";
type Area = "Backend" | "Frontend-Store" | "Frontend-Admin" | "Infrastructure";

interface BacklogItem {
  id: string;
  category: Category;
  priority: Priority;
  status: Status;
  area: Area;
  title: string;
  description: string;
  file?: string;
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = "sa-backlog-items";

const categoryConfig: Record<Category, { label: string; icon: typeof Bug; color: string }> = {
  BUG:             { label: "Bug",              icon: Bug,            color: "hsl(var(--sa-danger))" },
  MISSING_FEATURE: { label: "Feature Faltando", icon: Lightbulb,     color: "hsl(var(--sa-info))" },
  IMPROVEMENT:     { label: "Melhoria",         icon: Zap,           color: "hsl(var(--sa-accent))" },
  SECURITY:        { label: "Segurança",        icon: Shield,        color: "hsl(var(--sa-warning))" },
  PERFORMANCE:     { label: "Performance",      icon: BarChart3,     color: "hsl(var(--sa-success))" },
  UX:              { label: "UX/UI",            icon: Palette,       color: "#a78bfa" },
  TODO:            { label: "TODO",             icon: CheckSquare,   color: "hsl(var(--sa-text-muted))" },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; order: number }> = {
  CRITICAL: { label: "Crítico",  color: "#ef4444", bg: "rgba(239,68,68,0.12)",  order: 0 },
  HIGH:     { label: "Alto",     color: "#f97316", bg: "rgba(249,115,22,0.12)", order: 1 },
  MEDIUM:   { label: "Médio",    color: "#eab308", bg: "rgba(234,179,8,0.12)",  order: 2 },
  LOW:      { label: "Baixo",    color: "#22c55e", bg: "rgba(34,197,94,0.12)",  order: 3 },
};

const statusConfig: Record<Status, { label: string; icon: typeof Circle; color: string }> = {
  PENDING:     { label: "Pendente",    icon: Circle,       color: "hsl(var(--sa-text-muted))" },
  IN_PROGRESS: { label: "Em Progresso",icon: Clock,        color: "hsl(var(--sa-info))" },
  DONE:        { label: "Concluído",   icon: CheckCircle2, color: "hsl(var(--sa-success))" },
  WONT_FIX:    { label: "Não Fará",    icon: XCircle,      color: "hsl(var(--sa-danger))" },
};

const areaConfig: Record<Area, { label: string; icon: typeof Server }> = {
  "Backend":        { label: "Backend",        icon: Server },
  "Frontend-Store": { label: "Loja (Store)",   icon: Smartphone },
  "Frontend-Admin": { label: "Admin Panel",    icon: Monitor },
  "Infrastructure": { label: "Infraestrutura", icon: Server },
};

// ── Initial seed data — comprehensive audit ────────────────
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const SEED_DATA: Omit<BacklogItem, "id" | "createdAt">[] = [
  // ════════════════════════════════════════════════════════
  //  CRITICAL
  // ════════════════════════════════════════════════════════
  { category: "SECURITY", priority: "CRITICAL", status: "PENDING", area: "Backend", title: "Super Admin endpoint público sem @PreAuthorize", description: "POST /api/v1/users/super-admin tem @PreAuthorize comentado. Qualquer pessoa pode se tornar super admin." },
  { category: "SECURITY", priority: "CRITICAL", status: "PENDING", area: "Backend", title: "Reset de senha sem verificação por e-mail", description: "Qualquer pessoa que saiba o e-mail pode trocar a senha diretamente, sem token OTP ou link de verificação." },
  { category: "SECURITY", priority: "CRITICAL", status: "PENDING", area: "Backend", title: "JWT secret hardcoded como fallback", description: "Se a env var JWT_SECRET não existir, usa uma chave padrão de dev. Em produção isso é crítico." },
  { category: "SECURITY", priority: "CRITICAL", status: "PENDING", area: "Backend", title: "Senha do banco de dados no código-fonte", description: "application.properties contém a senha do DB visível no repositório. Deveria usar variável de ambiente." },
  { category: "BUG", priority: "CRITICAL", status: "PENDING", area: "Frontend-Store", title: "Layout é 'use client' — zero SEO/metadata", description: "O layout.tsx da store é client component, impossibilitando metadata do Next.js. Nenhuma página tem meta tags, OG tags, title dinâmico." },
  { category: "BUG", priority: "CRITICAL", status: "PENDING", area: "Frontend-Store", title: "ignoreBuildErrors: true esconde erros TS", description: "next.config.mjs tem ignoreBuildErrors:true, permitindo deploys com bugs de TypeScript silenciados." },
  { category: "SECURITY", priority: "CRITICAL", status: "PENDING", area: "Frontend-Admin", title: "Sem middleware Next.js para proteger rotas", description: "Não existe middleware.ts. Todas rotas admin/super-admin são desprotegidas no server. Auth é apenas client-side via AuthContext." },
  { category: "SECURITY", priority: "CRITICAL", status: "PENDING", area: "Frontend-Admin", title: "Reset de senha sem token/OTP no admin", description: "ForgotPasswordForm permite trocar a senha enviando email + nova senha direto. Sem e-mail de verificação." },
  { category: "MISSING_FEATURE", priority: "CRITICAL", status: "PENDING", area: "Frontend-Admin", title: "Edição de produto perde dados importantes", description: "EditProductClient silently descarta weightKg, lengthCm, widthCm, heightCm, tags, seoTitle, seoDescription, videoUrl, barcode, etc. ao salvar." },
  { category: "MISSING_FEATURE", priority: "CRITICAL", status: "PENDING", area: "Frontend-Admin", title: "Sem upload de imagens na edição de produto", description: "Só CreateProductClient suporta upload. EditProductClient não tem nenhum gerenciamento de imagens." },
  { category: "MISSING_FEATURE", priority: "CRITICAL", status: "PENDING", area: "Frontend-Admin", title: "Sem UI de reembolso apesar de endpoint existir", description: "orderService.refund() existe mas não há nenhum botão ou form de reembolso parcial no OrderDetailClient." },

  // ════════════════════════════════════════════════════════
  //  HIGH — Backend
  // ════════════════════════════════════════════════════════
  { category: "BUG", priority: "HIGH", status: "PENDING", area: "Backend", title: "OrderController sem service layer — 522 linhas", description: "7 repositórios injetados direto no controller. Toda a lógica de negócio (criar, pagar, cancelar, listar) está no controller." },
  { category: "PERFORMANCE", priority: "HIGH", status: "PENDING", area: "Backend", title: "ProductEntity images EAGER causa N+1 queries", description: "FetchType.EAGER nas imagens do produto. Listagens de produtos carregam todas as imagens de cada um em queries separadas." },
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Backend", title: "CustomerController sem @PreAuthorize", description: "Endpoints de clientes não verificam role/permissão do usuário logado. Qualquer token válido acessa qualquer cliente." },
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Backend", title: "CORS permite todos *.vercel.app", description: "Configuração permite qualquer subdomain vercel.app como origin, incluindo sites de terceiros." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Backend", title: "Sem mecanismo de refresh token JWT", description: "Tokens expiram e não há refresh flow. Usuários precisam re-logar quando o token expira." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Backend", title: "Sem paginação no endpoint de pedidos", description: "GET /orders retorna todos os pedidos sem limit/offset. Vai quebrar com escala." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Backend", title: "Sem suporte a reembolso parcial", description: "Endpoint de refund cancela tudo. Não há parcial refund com valor customizado." },
  { category: "PERFORMANCE", priority: "HIGH", status: "PENDING", area: "Backend", title: "RestTemplate inline sem timeout em 4 services", description: "Chamadas HTTP externas (ViaCEP, Melhor Envio, Stripe) criam RestTemplate inline sem connection/read timeout." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Backend", title: "Sem validação @Valid em vários controllers", description: "Muitos endpoints recebem DTOs sem @Valid, permitindo dados inválidos passarem para o serviço." },

  // ════════════════════════════════════════════════════════
  //  HIGH — Frontend Store
  // ════════════════════════════════════════════════════════
  { category: "BUG", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Carrinho não limpa após pagamento Stripe", description: "Após sucesso no checkout, o cart permanece com itens. success/page.tsx não chama clearCart()." },
  { category: "BUG", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Endereço de entrega coletado mas nunca enviado", description: "checkout-page.tsx coleta endereço mas não envia para backend. Pedido é criado sem endereço de entrega." },
  { category: "BUG", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Checkout mostra 'Sample Product' com cart vazio", description: "Quando carrinho está vazio, checkout-page.tsx exibe produto fake ao invés de redirecionar." },
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Token JWT no localStorage (XSS vulnerável)", description: "Auth tokens guardados em localStorage. Qualquer XSS no site pode roubar os tokens de todos os usuários." },
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "dangerouslySetInnerHTML sem sanitização no blog", description: "Blog post renderiza HTML cru do backend sem sanitizar. Permite XSS stored se admin publica HTML malicioso." },
  { category: "PERFORMANCE", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Imagens não otimizadas + sem paginação em produtos", description: "next.config tem unoptimized: true e product-grid.tsx não tem paginação. Tudo carrega de uma vez." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Página 'Meus Pedidos' sem detalhes de cada pedido", description: "Listagem de pedidos não permite expandir/ver itens, tracking, notas. Experiência pós-compra incompleta." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Store", title: "Sem busca funcional com filtros", description: "Busca na store é básica, sem filtros por categoria, marca, faixa de preço, avaliação." },

  // ════════════════════════════════════════════════════════
  //  HIGH — Frontend Admin
  // ════════════════════════════════════════════════════════
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "JWT em localStorage no admin (XSS)", description: "authService.login() salva token em localStorage. Em caso de XSS, atacante pega token do admin." },
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "storeId lido de localStorage e usado em API calls", description: "Múltiplos componentes leem storeId de localStorage. Usuário pode manipular para acessar dados de outras lojas." },
  { category: "SECURITY", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "User ID é 'temp-id' — nunca vem do backend", description: "AuthContext seta user.id como 'temp-id'. Qualquer feature que dependa de user.id está errada." },
  { category: "BUG", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Timeline do pedido usa createdAt para tudo", description: "OrderDetailClient mostra 'Pedido enviado' e 'Pedido entregue' com a mesma data createdAt. Não há shippedAt/deliveredAt." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Sem paginação server-side nos pedidos", description: "OrderListClient chama listStoreOrders() que retorna TODOS os pedidos. Sem page/size. Performance vai degradar." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Sem paginação server-side nos produtos", description: "ProductClient chama productService.listAll() retornando todos os produtos. Sem paginação." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Sem seletor de marca na edição de produto", description: "Criação de produto tem brand selector mas edição não. Impossível mudar marca depois de criar." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Página 'Em Construção' é stub literal", description: "online-store/under-construction mostra apenas 'Em breve você poderá configurar'. Nenhuma funcionalidade." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Criação de método de envio customizado desabilitada", description: "ShippingMethodsClient mostra 'Adicionar (em breve)' disabled. Só Melhor Envio está disponível." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Pagamento limitado a Stripe apenas", description: "PaymentMethodsClient só mostra Stripe. Sem PIX, boleto, PagSeguro, Mercado Pago." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Sem tracking code/etiqueta no pedido", description: "Ação 'Despachar' marca como enviado mas não captura código de rastreio." },
  { category: "MISSING_FEATURE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Sem ações em massa nos produtos", description: "Sem multi-select, sem delete em lote, sem ativar/desativar em massa, sem update de preço em bulk." },
  { category: "PERFORMANCE", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Dashboard carrega TODOS os pedidos para mostrar 8", description: "DashboardClient busca listStoreOrders() inteira e faz .slice(0,8). Deveria ter endpoint dedicado." },
  { category: "UX", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "Moeda hardcoded BRL em múltiplos componentes", description: "Dashboard, Statistics, Finance, Orders todos hardcodam 'BRL'/R$. Lojas em USD/EUR veem formatação errada." },
  { category: "UX", priority: "HIGH", status: "PENDING", area: "Frontend-Admin", title: "i18n inconsistente — muitos componentes sem t()", description: "Customer, Coupon, Promotion, Inventory, Blog, Settings usam strings PT hardcoded. Só dashboard/orders usam t()." },

  // ════════════════════════════════════════════════════════
  //  MEDIUM
  // ════════════════════════════════════════════════════════
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem endpoint de delete de cupom", description: "API permite criar, listar, atualizar e toggle de cupom, mas não deletar." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem paginação no endpoint de produtos", description: "GET /products retorna tudo sem paginação." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem histórico de preços de produto", description: "Preço é sobrescrito direto. Sem registro do histórico de mudanças de preço." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem endpoint de notificações para admin", description: "Existe infra de e-mail mas sem sistema de notificações in-app para o admin da loja." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem rate limiting nos endpoints de auth", description: "Login, register, forgot-password sem throttle. Permite brute force." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem documentação Swagger/OpenAPI", description: "Nenhum endpoint documentado via Swagger. Dificulta integração e debugging." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Entity exposta direto em endpoints", description: "Vários controllers retornam entities JPA direto ao invés de DTOs. Expõe schema interno." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem testes unitários", description: "Zero testes no backend. Nenhum test unitário, integração ou E2E." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Backend", title: "Sem migration tool (Flyway/Liquibase)", description: "SQL scripts manuais na pasta sql/. Sem controle de versão de schema automatizado." },
  { category: "BUG", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Wishlist sem persistência — perde ao fechar", description: "Wishlist é mantida apenas em state local. Fecha a aba e perde tudo. Deveria salvar no backend ou localStorage." },
  { category: "BUG", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Cupom aplicado some ao mudar página", description: "Se usuário aplica cupom no cart e navega, o desconto some. State não persiste entre rotas." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Página de conta sem histórico de endereços", description: "Conta do usuário não permite gerenciar múltiplos endereços salvos." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Sem avaliações/reviews de produto", description: "Nenhuma funcionalidade de review ou rating de produto implementada na loja." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Sem cálculo de frete na página do produto", description: "Calculadora de frete aparece só no checkout. Deveria ter um 'calcular frete' no PDP." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Sem compartilhamento de produto nas redes", description: "PDP não tem botões de share para WhatsApp, Facebook, Twitter, copiar link." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Sem zoom na imagem do produto", description: "Imagem do produto é estática. Sem zoom on hover ou lightbox para ver detalhes." },
  { category: "UX", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Sem breadcrumbs em páginas internas", description: "Navegação sem breadcrumbs. Usuário perde referência de onde está." },
  { category: "UX", priority: "MEDIUM", status: "PENDING", area: "Frontend-Store", title: "Sem skeleton loading na listagem de produtos", description: "Listagem mostra texto 'Carregando...' ao invés de skeletons de produto." },
  { category: "BUG", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "DistributionCenters salvas em addressStreet como JSON", description: "Centros de distribuição salvos como JSON no campo addressStreet, quebrando ContactInfoClient que espera string simples." },
  { category: "BUG", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Botão 'Filtros' dos clientes não funciona", description: "CustomerClient tem botão Filtros sem onClick handler. Clicar não faz nada." },
  { category: "BUG", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Tabs de shipping methods são fake", description: "ShippingMethodsClient mostra tabs Nacionais/Internacionais/Retiradas que não alternam conteúdo." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem delete de cliente", description: "customerService não tem método delete. Admins não conseguem remover clientes." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem delete de cupom no admin", description: "Cupons só podem ser desativados. Não há como remover permanentemente." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem delete de promoção", description: "Promoções só desativam. Sem opção de deletar." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem edição de ofertas de frete grátis", description: "FreeShippingClient cria ofertas mas não permite editar ou deletar." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem edição de campanha de marketing", description: "Campanhas são criadas e deletadas mas sem edição dos campos após criação." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Carrinhos abandonados são view-only", description: "AbandonedCartsClient mostra lista mas sem ações (email de recuperação, dismiss, marcar como recuperado)." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Blog editor sem rich text", description: "BlogManagementClient usa <textarea> puro. Sem WYSIWYG, markdown preview, ou embed de imagem." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem export CSV/Excel para pedidos, produtos, clientes", description: "Nenhum botão de exportação de dados no admin. Admin não consegue baixar relatórios." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem troca de senha para usuário logado", description: "Settings não tem opção de alterar senha. Só existe forgot-password (inseguro)." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Chat usa HTTP polling ao invés de WebSocket", description: "ChatClient faz polling a cada 10s. Sem WebSocket/SSE para tempo real." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem busca por email nos clientes", description: "Busca filtra nome, telefone, documento — mas NÃO email." },
  { category: "MISSING_FEATURE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem edição de variantes no edit product", description: "CreateProductClient tem ProductVariations, mas EditProductClient não. Variantes não mudam após criação." },
  { category: "PERFORMANCE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem staleTime no React Query", description: "Todos os useQuery usam staleTime padrão (0). Cada mount ou focus triggera refetch desnecessário." },
  { category: "PERFORMANCE", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Finance duplica chamadas do dashboard", description: "FinanceClient busca DashboardStats e orders com query keys diferentes. Mesmo dado carregado 2x." },
  { category: "UX", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem loading skeleton na maioria das telas", description: "Maioria mostra texto 'Carregando...' ao invés de skeleton/shimmer." },
  { category: "UX", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "CreateCustomer requer userId manual", description: "Form pede userId que deveria ser automático pelo backend." },
  { category: "UX", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Sem dialog de confirmação para toggle de visibilidade", description: "Mudar visibilidade de produto é instantâneo sem confirmação." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "EditProduct usa <textarea> e <select> raw", description: "Edição usa elementos HTML nativos ao invés dos componentes UI do projeto (Textarea, Select)." },
  { category: "TODO", priority: "MEDIUM", status: "PENDING", area: "Frontend-Admin", title: "Activity log sem filtro de data", description: "ActivityClient filtra por tipo e busca mas sem range de datas ou export." },

  // ════════════════════════════════════════════════════════
  //  LOW
  // ════════════════════════════════════════════════════════
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Backend", title: "Sem soft-delete em entidades", description: "Deletes são hard delete. Sem campo deleted_at para recuperação." },
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Backend", title: "Sem logs de auditoria detalhados", description: "Sem registro de quem alterou o quê e quando nas entidades." },
  { category: "IMPROVEMENT", priority: "LOW", status: "PENDING", area: "Backend", title: "Sem health check endpoint padronizado", description: "Sem /actuator/health do Spring Boot Actuator configurado." },
  { category: "IMPROVEMENT", priority: "LOW", status: "PENDING", area: "Backend", title: "Sem perfis de config (dev/staging/prod)", description: "application.properties único. Deveria ter profiles separados." },
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Frontend-Store", title: "Sem animações de transição entre páginas", description: "Navegação é brusca. Page transitions suavizariam a experiência." },
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Frontend-Store", title: "Sem suporte a múltiplos idiomas", description: "Toda a store está hardcoded em PT-BR. Sem i18n." },
  { category: "UX", priority: "LOW", status: "PENDING", area: "Frontend-Store", title: "Sem indicador de itens no carrinho no header", description: "Ícone do carrinho não mostra badge com quantidade de itens." },
  { category: "UX", priority: "LOW", status: "PENDING", area: "Frontend-Store", title: "Sem tooltip nos ícones de ação", description: "Botões com apenas ícone (favorito, cart, etc.) sem tooltip de acessibilidade." },
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Sem reordenação de categorias", description: "Categorias aparecem na ordem do backend. Sem drag-and-drop ou sort manual." },
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Sem histórico de pedidos no detalhe do cliente", description: "CustomerDetailClient só mostra campos editáveis. Sem seção de orders, total gasto, etc." },
  { category: "MISSING_FEATURE", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Sem API keys para admin de loja", description: "Só super-admin tem API keys. Admin de loja não consegue gerar chaves para integrações." },
  { category: "UX", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Empty states sem ilustrações", description: "Estados vazios (sem pedidos, sem produtos) mostram só texto. Ilustrações melhorariam." },
  { category: "UX", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Auth layout é fragment vazio", description: "(auth)/layout.tsx retorna <>{children}</>. Não adiciona valor nem guard." },
  { category: "UX", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Labels misturadas inglês/português em discounts", description: "Página de descontos mistura 'Coupons', 'Promotions' em inglês com 'Frete Grátis' em português." },
  { category: "BUG", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "helpHref '#' em múltiplas settings pages", description: "PaymentMethods, ShippingMethods e outras settings usam helpHref='#'. Link de ajuda não funciona." },
  { category: "TODO", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "Templates de tema sem imagens de preview", description: "ThemeGalleryClient referencia /templates/template-X-preview.png mas arquivos provavelmente não existem." },
  { category: "PERFORMANCE", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "SalesChannelsClients.tsx tem 1628 linhas", description: "Mega-arquivo com 7+ componentes. Deveria ser dividido em arquivos individuais." },
  { category: "PERFORMANCE", priority: "LOW", status: "PENDING", area: "Frontend-Admin", title: "LayoutEditorPage.tsx tem 1032 linhas", description: "Editor de tema em arquivo único com muitos useState. Difícil manutenção." },

  // ════════════════════════════════════════════════════════
  //  Infrastructure
  // ════════════════════════════════════════════════════════
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Infrastructure", title: "Sem CI/CD pipeline configurado", description: "Sem GitHub Actions, GitLab CI ou equivalente para build/test/deploy automático." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Infrastructure", title: "Sem backup automatizado do banco", description: "Nenhum script de backup periódico do PostgreSQL configurado." },
  { category: "IMPROVEMENT", priority: "MEDIUM", status: "PENDING", area: "Infrastructure", title: "Sem monitoring/alertas (Sentry, Datadog)", description: "Nenhuma ferramenta de monitoramento ou alertas configurada para produção." },
  { category: "IMPROVEMENT", priority: "LOW", status: "PENDING", area: "Infrastructure", title: "Sem CDN para assets estáticos", description: "Imagens e assets servidos direto do servidor. CDN melhoraria performance global." },
  { category: "IMPROVEMENT", priority: "LOW", status: "PENDING", area: "Infrastructure", title: "Sem Redis para cache/sessões", description: "Sem camada de cache. Queries repetidas sempre batem no banco." },
];

// ── Component ──────────────────────────────────────────────
export function SaBacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [filterArea, setFilterArea] = useState<Area | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("PENDING");
  const [sortBy, setSortBy] = useState<"priority" | "category" | "area">("priority");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "BUG" as Category, priority: "MEDIUM" as Priority, area: "Backend" as Area, file: "" });

  // Import/Export dialog  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState("");

  // Load from localStorage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BacklogItem[];
        if (parsed.length > 0) {
          setItems(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch { /* ignore */ }

    // Seed
    const seeded = SEED_DATA.map((s) => ({
      ...s,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    setItems(seeded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    setLoaded(true);
  }, []);

  // Persist
  const persist = useCallback((next: BacklogItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // Update status
  const setStatus = useCallback((id: string, status: Status) => {
    persist(items.map(i => i.id === id ? { ...i, status } : i));
    toast.success(`Status atualizado: ${statusConfig[status].label}`);
  }, [items, persist]);

  // Delete
  const deleteItem = useCallback((id: string) => {
    persist(items.filter(i => i.id !== id));
    toast.success("Item removido");
  }, [items, persist]);

  // Save (create or edit)
  const saveItem = useCallback(() => {
    if (!formData.title.trim()) { toast.error("Título obrigatório"); return; }
    if (editingItem) {
      persist(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
      toast.success("Item atualizado");
    } else {
      const newItem: BacklogItem = {
        id: generateId(),
        ...formData,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      persist([newItem, ...items]);
      toast.success("Item adicionado");
    }
    setDialogOpen(false);
    setEditingItem(null);
  }, [formData, editingItem, items, persist]);

  // Export
  const handleExport = useCallback((format: "json" | "csv") => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `backlog-${new Date().toISOString().split("T")[0]}.json`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const header = "id,category,priority,status,area,title,description,file,createdAt\n";
      const rows = items.map(i => `"${i.id}","${i.category}","${i.priority}","${i.status}","${i.area}","${i.title.replace(/"/g, '""')}","${i.description.replace(/"/g, '""')}","${i.file || ""}","${i.createdAt}"`).join("\n");
      const blob = new Blob([header + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `backlog-${new Date().toISOString().split("T")[0]}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`Exportado como ${format.toUpperCase()}`);
  }, [items]);

  // Import
  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importJson);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const newItems = arr.map((i: any) => ({
        id: i.id || generateId(),
        category: i.category || "TODO",
        priority: i.priority || "MEDIUM",
        status: i.status || "PENDING",
        area: i.area || "Backend",
        title: i.title || "Item importado",
        description: i.description || "",
        file: i.file || "",
        createdAt: i.createdAt || new Date().toISOString(),
      })) as BacklogItem[];
      persist([...newItems, ...items]);
      setImportDialogOpen(false);
      setImportJson("");
      toast.success(`${newItems.length} itens importados`);
    } catch {
      toast.error("JSON inválido");
    }
  }, [importJson, items, persist]);

  // Re-seed
  const handleReseed = useCallback(() => {
    const seeded = SEED_DATA.map((s) => ({
      ...s,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    persist(seeded);
    toast.success("Backlog reiniciado com dados da auditoria");
  }, [persist]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    let result = items;
    if (filterCategory !== "ALL") result = result.filter(i => i.category === filterCategory);
    if (filterPriority !== "ALL") result = result.filter(i => i.priority === filterPriority);
    if (filterArea !== "ALL") result = result.filter(i => i.area === filterArea);
    if (filterStatus !== "ALL") result = result.filter(i => i.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || (i.file && i.file.toLowerCase().includes(q)));
    }
    result = [...result].sort((a, b) => {
      if (sortBy === "priority") return priorityConfig[a.priority].order - priorityConfig[b.priority].order;
      return a[sortBy].localeCompare(b[sortBy]);
    });
    return result;
  }, [items, filterCategory, filterPriority, filterArea, filterStatus, search, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter(i => i.status === "PENDING").length;
    const inProgress = items.filter(i => i.status === "IN_PROGRESS").length;
    const done = items.filter(i => i.status === "DONE").length;
    const critical = items.filter(i => i.priority === "CRITICAL" && i.status !== "DONE" && i.status !== "WONT_FIX").length;
    return { total, pending, inProgress, done, critical };
  }, [items]);

  if (!loaded) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="Backlog do Sistema" description="Carregando..." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <SaSkeleton key={i} className="h-32" />)}
        </div>
        <SaSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaPageHeader
        title="Backlog do Sistema"
        description={`Auditoria completa: ${stats.total} itens identificados em Backend, Store e Admin Panel`}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-[11px] h-8 border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={() => handleExport("json")}>
              <ArrowDownToLine className="h-3 w-3 mr-1" /> JSON
            </Button>
            <Button size="sm" variant="outline" className="text-[11px] h-8 border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={() => handleExport("csv")}>
              <ArrowDownToLine className="h-3 w-3 mr-1" /> CSV
            </Button>
            <Button size="sm" variant="outline" className="text-[11px] h-8 border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={() => setImportDialogOpen(true)}>
              Importar JSON
            </Button>
            <Button size="sm" className="text-[11px] h-8 bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))]/90 text-white" onClick={() => {
              setEditingItem(null);
              setFormData({ title: "", description: "", category: "BUG", priority: "MEDIUM", area: "Backend", file: "" });
              setDialogOpen(true);
            }}>
              <Plus className="h-3 w-3 mr-1" /> Adicionar Item
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SaStatCard title="Total" value={String(stats.total)} icon={ClipboardList} color="accent" />
        <SaStatCard title="Críticos Abertos" value={String(stats.critical)} icon={Flame} color="danger" subtitle="Requerem atenção imediata" />
        <SaStatCard title="Pendentes" value={String(stats.pending)} icon={Circle} color="warning" />
        <SaStatCard title="Em Progresso" value={String(stats.inProgress)} icon={Clock} color="info" />
        <SaStatCard title="Concluídos" value={String(stats.done)} icon={CheckCircle2} color="success" subtitle={stats.total > 0 ? `${((stats.done / stats.total) * 100).toFixed(0)}% do total` : ""} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input placeholder="Buscar por título, descrição ou arquivo..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-[12px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" />
            </div>
            <Select value={filterCategory} onValueChange={v => setFilterCategory(v as any)}>
              <SelectTrigger className="w-[140px] h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Categorias</SelectItem>
                {Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={v => setFilterPriority(v as any)}>
              <SelectTrigger className="w-[120px] h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toda Prioridade</SelectItem>
                {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterArea} onValueChange={v => setFilterArea(v as any)}>
              <SelectTrigger className="w-[140px] h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Áreas</SelectItem>
                {Object.entries(areaConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
              <SelectTrigger className="w-[130px] h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Status</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
              <SelectTrigger className="w-[120px] h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="area">Área</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 text-[11px] text-[hsl(var(--sa-text-muted))]">
            Mostrando {filtered.length} de {items.length} itens
          </div>
        </SaCard>
      </motion.div>

      {/* Items list */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map(item => {
            const cat = categoryConfig[item.category];
            const pri = priorityConfig[item.priority];
            const sta = statusConfig[item.status];
            const CatIcon = cat.icon;
            const StaIcon = sta.icon;
            const isDone = item.status === "DONE" || item.status === "WONT_FIX";

            return (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div className={`rounded-lg border px-4 py-3 transition-colors ${isDone ? "border-[hsl(var(--sa-border-subtle))]/50 opacity-60" : "border-[hsl(var(--sa-border-subtle))] hover:border-[hsl(var(--sa-border))]"} bg-[hsl(var(--sa-card))]`}>
                  <div className="flex items-start gap-3">
                    {/* Priority indicator */}
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pri.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[13px] font-semibold text-[hsl(var(--sa-text))] ${isDone ? "line-through" : ""}`}>
                          {item.title}
                        </span>
                        {/* Badges */}
                        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: pri.bg, color: pri.color }}>
                          {pri.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-[hsl(var(--sa-bg-hover))] text-[hsl(var(--sa-text-secondary))]">
                          <CatIcon className="h-2.5 w-2.5" style={{ color: cat.color }} />
                          {cat.label}
                        </span>
                        <span className="text-[9px] font-medium text-[hsl(var(--sa-text-muted))] bg-[hsl(var(--sa-bg))] px-1.5 py-0.5 rounded-full">
                          {areaConfig[item.area]?.label || item.area}
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--sa-text-secondary))] leading-relaxed">{item.description}</p>
                      {item.file && (
                        <p className="text-[10px] text-[hsl(var(--sa-text-muted))] mt-1 font-mono">{item.file}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Status cycle */}
                      <div className="flex items-center gap-0.5">
                        {(Object.entries(statusConfig) as [Status, typeof statusConfig[Status]][]).map(([key, cfg]) => {
                          const Icon = cfg.icon;
                          const isActive = item.status === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setStatus(item.id, key)}
                              title={cfg.label}
                              className={`p-1 rounded transition-all ${isActive ? "bg-[hsl(var(--sa-bg-hover))]" : "opacity-30 hover:opacity-70"}`}
                            >
                              <Icon className="h-3.5 w-3.5" style={{ color: isActive ? cfg.color : undefined }} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setFormData({ title: item.title, description: item.description, category: item.category, priority: item.priority, area: item.area, file: item.file || "" });
                          setDialogOpen(true);
                        }}
                        className="p-1 rounded text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-bg-hover))] transition-all"
                        title="Editar"
                      >
                        <Filter className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 rounded text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-danger))] hover:bg-[rgba(239,68,68,0.08)] transition-all"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <SaCard>
            <div className="text-center py-12">
              <CheckCircle2 className="h-10 w-10 mx-auto text-[hsl(var(--sa-success))] mb-3" />
              <p className="text-[13px] text-[hsl(var(--sa-text-secondary))]">
                {items.length === 0 ? "Nenhum item no backlog" : "Nenhum item corresponde aos filtros"}
              </p>
            </div>
          </SaCard>
        )}
      </motion.div>

      {/* Reseed button */}
      <div className="flex justify-center pt-4">
        <Button size="sm" variant="outline" className="text-[10px] h-7 border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={handleReseed}>
          Resetar para dados da auditoria original
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Adicionar Item"}</DialogTitle>
            <DialogDescription>Preencha os detalhes do item do backlog</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[12px]">Título *</Label>
              <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="Resumo curto do problema/feature" />
            </div>
            <div>
              <Label className="text-[12px]">Descrição</Label>
              <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} placeholder="Detalhes do item" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px]">Categoria</Label>
                <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v as Category }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px]">Prioridade</Label>
                <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v as Priority }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px]">Área</Label>
                <Select value={formData.area} onValueChange={v => setFormData(p => ({ ...p, area: v as Area }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(areaConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px]">Arquivo (opcional)</Label>
                <Input value={formData.file} onChange={e => setFormData(p => ({ ...p, file: e.target.value }))} className="mt-1" placeholder="src/path/file.tsx" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveItem}>{editingItem ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Itens</DialogTitle>
            <DialogDescription>
              Cole um JSON com array de itens. Cada item pode ter: title, description, category, priority, area, file, status.
              Dica: você pode pedir ao Copilot para analisar o sistema e gerar o JSON.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              rows={10}
              placeholder={`[\n  {\n    "title": "Título do item",\n    "description": "Descrição",\n    "category": "BUG",\n    "priority": "HIGH",\n    "area": "Backend"\n  }\n]`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleImport}>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
