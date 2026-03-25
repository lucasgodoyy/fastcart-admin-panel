"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, CheckCircle2, Circle, Clock, Flame, ChevronDown, ChevronRight,
  Server, Monitor, Smartphone, Database, Shield, CreditCard, ShoppingCart,
  Package, Truck, Users, Mail, MessageSquare, Megaphone, Link2, BarChart3,
  Settings, Headset, FileText, PenTool, Target, ArrowDownToLine,
  RotateCcw, Eye, EyeOff, Zap, AlertTriangle, Globe, Bell, Search,
} from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, SaSkeleton, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { type LucideIcon } from "lucide-react";

// ── Types ──────────────────────────────────────────────────
type Phase = "CLEANUP" | "CRITICAL" | "IMPORTANT" | "V2" | "DEPLOY";
type FeatureStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "SKIPPED";
type Area = "Backend" | "Frontend-Store" | "Frontend-Admin" | "Infrastructure" | "Manual";

interface RoadmapFeature {
  id: string;
  moduleId: string;
  phase: Phase;
  area: Area;
  title: string;
  description: string;
  effort: string;
  status: FeatureStatus;
  completedAt?: string;
}



// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = "sa-roadmap-features";
const SEED_VERSION_KEY = "sa-roadmap-seed-version";
const CURRENT_SEED_VERSION = 2; // Bump when SEED_DATA changes

const phaseConfig: Record<Phase, { label: string; color: string; bg: string; icon: LucideIcon; order: number; description: string }> = {
  CLEANUP:  { label: "Fase 0 — Limpeza",            color: "#ef4444", bg: "rgba(239,68,68,0.10)",  icon: AlertTriangle, order: 0, description: "Remover o que não funciona (1-2 dias)" },
  CRITICAL: { label: "Fase 1 — Crítico",            color: "#f97316", bg: "rgba(249,115,22,0.10)", icon: Flame,         order: 1, description: "Sem isso não lança (3-5 dias)" },
  IMPORTANT:{ label: "Fase 2 — Importante",          color: "#3b82f6", bg: "rgba(59,130,246,0.10)", icon: Target,        order: 2, description: "Melhora muito a experiência (5-7 dias)" },
  V2:       { label: "Fase 3 — V2 (pós-lançamento)", color: "#a78bfa", bg: "rgba(167,139,250,0.10)",icon: Rocket,        order: 3, description: "Features que agregam valor (pós-launch)" },
  DEPLOY:   { label: "Deploy Produção",              color: "#22c55e", bg: "rgba(34,197,94,0.10)",  icon: Globe,         order: 4, description: "Checklist de infraestrutura e segurança" },
};

const statusConfig: Record<FeatureStatus, { label: string; icon: LucideIcon; color: string }> = {
  NOT_STARTED: { label: "Pendente",     icon: Circle,       color: "hsl(var(--sa-text-muted))" },
  IN_PROGRESS: { label: "Em Progresso", icon: Clock,        color: "hsl(var(--sa-info))" },
  DONE:        { label: "Concluído",    icon: CheckCircle2, color: "hsl(var(--sa-success))" },
  SKIPPED:     { label: "Pulado",       icon: EyeOff,       color: "hsl(var(--sa-text-muted))" },
};

const areaConfig: Record<Area, { label: string; icon: LucideIcon; color: string }> = {
  "Backend":        { label: "Backend",     icon: Server,     color: "#f97316" },
  "Frontend-Store": { label: "Store",       icon: Smartphone, color: "#3b82f6" },
  "Frontend-Admin": { label: "Admin",       icon: Monitor,    color: "#a78bfa" },
  "Infrastructure": { label: "Infra",       icon: Database,   color: "#22c55e" },
  "Manual":         { label: "Manual/QA",   icon: Eye,        color: "#eab308" },
};

const moduleConfig: Record<string, { title: string; icon: LucideIcon; description: string }> = {
  auth:          { title: "Autenticação & Onboarding",  icon: Shield,        description: "Login, registro, reset senha, sessões" },
  stores:        { title: "Gestão de Lojas",             icon: Settings,      description: "CRUD lojas, temas, CMS, domínios" },
  catalog:       { title: "Catálogo de Produtos",        icon: Package,       description: "Produtos, variantes, categorias, marcas" },
  cart:          { title: "Carrinho",                    icon: ShoppingCart,  description: "Cart API, merge, sidebar" },
  checkout:      { title: "Checkout & Pagamento",        icon: CreditCard,    description: "Stripe, cupons, endereço, frete" },
  shipping:      { title: "Frete (Melhor Envio)",        icon: Truck,         description: "Cotação, etiquetas, tracking" },
  orders:        { title: "Pedidos",                     icon: FileText,      description: "CRUD, cancelar, reembolso, dispatch" },
  abandoned:     { title: "Carrinho Abandonado",         icon: RotateCcw,     description: "Detecção, emails, recuperação" },
  coupons:       { title: "Cupons & Promoções",          icon: Zap,           description: "Cupons, promoções, frete grátis" },
  customers:     { title: "Clientes",                    icon: Users,         description: "CRUD, endereços, perfil" },
  emails:        { title: "E-mails",                     icon: Mail,          description: "Templates, logs, SMTP" },
  blog:          { title: "Blog",                        icon: PenTool,       description: "Posts, SEO, listagem" },
  chat:          { title: "Chat / Inbox",                icon: MessageSquare, description: "Conversas, mensagens, real-time" },
  support:       { title: "Suporte",                     icon: Headset,       description: "Tickets, respostas, status" },
  notifications: { title: "Notificações",                icon: Bell,          description: "In-app, preferências, broadcast" },
  marketing:     { title: "Marketing",                   icon: Megaphone,     description: "Campanhas, banners, push, ads" },
  affiliates:    { title: "Afiliados",                   icon: Link2,         description: "Programa, tracking, comissões, payouts" },
  billing:       { title: "Assinaturas SaaS",            icon: CreditCard,    description: "Planos, billing, trial, limites" },
  superadmin:    { title: "Super Admin",                 icon: Shield,        description: "Dashboard, gestão global" },
  analytics:     { title: "Analytics & Estatísticas",    icon: BarChart3,     description: "Receita, produtos, frete, tráfego" },
  cleanup:       { title: "Limpeza de Código",           icon: AlertTriangle, description: "Remover placeholders, duplicados, dead code" },
  deploy:        { title: "Deploy & Infraestrutura",     icon: Globe,         description: "Hosting, SSL, DNS, env vars, monitoring" },
  security:      { title: "Segurança & Hardening",       icon: Shield,        description: "CORS, rate limiting, JWT, middleware" },
};

// ── Seed Data (from PRODUCT_BLUEPRINT) ─────────────────────
function generateId() { return Math.random().toString(36).substring(2, 10); }

const SEED_DATA: Omit<RoadmapFeature, "id">[] = [
  // ═══════════════════════════════════════
  //  FASE 0 — LIMPEZA (1-2 dias)
  // ═══════════════════════════════════════
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Store", title: "Remover /dashboard/* e sidebar dashboard da store", description: "100% hardcoded, confunde com admin panel real", effort: "1h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Store", title: "Remover /diagnostic", description: "Ferramenta dev, não deve ir pra produção", effort: "5min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Store", title: "Remover /store-locator", description: "Placeholder 'em breve' sem backend", effort: "5min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Store", title: "Remover /gift-card page", description: "Página estática sem funcionalidade", effort: "5min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Store", title: "Remover gift card input do checkout", description: "Input cosmético que não faz nada", effort: "10min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Store", title: "Remover filterService.ts duplicado", description: "Duplica productService.getFilterOptions() — não é usado", effort: "5min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Admin", title: "Trocar placeholders por 'Em breve' ou remover rota", description: "Apps, messages, manual orders, price tables, etc.", effort: "30min", status: "NOT_STARTED" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Admin", title: "Consolidar orderService duplicado", description: "orderService em 2 lugares, storeService vs storeSettingsService overlap", effort: "30min", status: "NOT_STARTED" },
  { moduleId: "cleanup", phase: "CLEANUP", area: "Frontend-Admin", title: "Limpar imports/referências dos removidos", description: "Garantir build limpo após remoções", effort: "30min", status: "NOT_STARTED" },

  // ═══════════════════════════════════════
  //  FASE 1 — CRÍTICO PARA LANÇAMENTO
  // ═══════════════════════════════════════
  { moduleId: "orders", phase: "CRITICAL", area: "Backend", title: "Cancelar pedido — endpoint + Stripe Refund + estoque + email", description: "PATCH /orders/store/{id}/cancel com Stripe Refund API, atualiza estoque e envia email de notificação", effort: "4h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "orders", phase: "CRITICAL", area: "Frontend-Admin", title: "Cancelar pedido UI — botão + confirmação + motivo", description: "Botão no OrderDetailClient com dialog de confirmação, motivo e reembolso", effort: "1h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "orders", phase: "CRITICAL", area: "Backend", title: "Reembolso parcial — endpoint + Stripe", description: "POST /orders/store/{id}/refund com valor parcial via Stripe Refund API", effort: "3h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "orders", phase: "CRITICAL", area: "Frontend-Admin", title: "Reembolso parcial UI — form no detalhe do pedido", description: "Dialog com valor e motivo para refund parcial no OrderDetailClient", effort: "1h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "billing", phase: "CRITICAL", area: "Backend", title: "Enforcement de limites do plano", description: "PlanLimitsService checa maxProducts ao criar produto", effort: "2h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "customers", phase: "CRITICAL", area: "Frontend-Store", title: "Salvar perfil do cliente na /account", description: "Conectar form /account ao PUT /customers/{storeId}/{id}", effort: "1h", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "auth", phase: "CRITICAL", area: "Frontend-Store", title: "Conectar 'Esqueci senha' na store ao API", description: "Botão de recuperação de senha na store conectado ao POST /auth/reset-password", effort: "30min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "shipping", phase: "CRITICAL", area: "Backend", title: "Webhook Melhor Envio para tracking automático", description: "POST /webhooks/melhor-envio que atualiza status do pedido automaticamente quando entregue", effort: "3h", status: "NOT_STARTED" },
  { moduleId: "checkout", phase: "CRITICAL", area: "Manual", title: "Testar fluxo completo Stripe end-to-end", description: "Criar loja → conectar Stripe → criar produto → checkout → webhook → pedido criado", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "shipping", phase: "CRITICAL", area: "Manual", title: "Testar fluxo completo Melhor Envio", description: "Conectar token → cotação → checkout com frete real", effort: "1h", status: "NOT_STARTED" },

  // ═══════════════════════════════════════
  //  FASE 2 — IMPORTANTE MAS NÃO BLOQUEIA
  // ═══════════════════════════════════════
  { moduleId: "chat", phase: "IMPORTANT", area: "Frontend-Store", title: "Widget de chat na store", description: "Botão flutuante → abre form → cria conversa via API existente de chat", effort: "4h", status: "NOT_STARTED" },
  { moduleId: "affiliates", phase: "IMPORTANT", area: "Frontend-Store", title: "Afiliado tracking na store (?ref=CODE)", description: "Detectar ?ref=CODE na URL, salvar cookie, registrar click, vincular conversão no checkout", effort: "4h", status: "NOT_STARTED" },
  { moduleId: "affiliates", phase: "IMPORTANT", area: "Backend", title: "Vincular conversão ao afiliado no checkout", description: "Ao finalizar compra, associar conversão ao afiliado via cookie ref", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "checkout", phase: "IMPORTANT", area: "Backend", title: "Newsletter opt-in persistir no backend", description: "Salvar preferência de newsletter no backend (campo no customer)", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "coupons", phase: "IMPORTANT", area: "Frontend-Store", title: "Promoção badge na store (Leve 3 Pague 2)", description: "Exibir selo nos produtos elegíveis para promoções ativas", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "orders", phase: "IMPORTANT", area: "Frontend-Store", title: "Tracking do pedido na conta do cliente", description: "Em /account, mostrar código/link de rastreio dos pedidos", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "orders", phase: "CRITICAL", area: "Backend", title: "Tracking code no dispatch", description: "Endpoint dispatch aceita trackingCode no body e salva no pedido", effort: "30min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "orders", phase: "CRITICAL", area: "Frontend-Admin", title: "Tracking code UI no dispatch", description: "Dialog no dispatch com campo de código de rastreio", effort: "30min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "coupons", phase: "IMPORTANT", area: "Backend", title: "Deletar cupom — endpoint", description: "DELETE /coupons/{id} com verificação de loja", effort: "15min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "coupons", phase: "IMPORTANT", area: "Frontend-Admin", title: "Deletar cupom UI", description: "Botão de excluir cupom na listagem com confirmação", effort: "15min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "analytics", phase: "IMPORTANT", area: "Backend", title: "Statistics/Products — endpoint top vendidos", description: "Criar endpoint que agrupa vendas por produto com receita, quantidade", effort: "3h", status: "NOT_STARTED" },
  { moduleId: "analytics", phase: "IMPORTANT", area: "Frontend-Admin", title: "Statistics/Products — página admin", description: "UI com gráficos de top produtos vendidos, receita por produto", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "analytics", phase: "IMPORTANT", area: "Backend", title: "Statistics/Shipping — endpoint por status/transportadora", description: "Criar endpoint que agrupa frete por status e transportadora", effort: "3h", status: "NOT_STARTED" },
  { moduleId: "analytics", phase: "IMPORTANT", area: "Frontend-Admin", title: "Statistics/Shipping — página admin", description: "UI com gráficos de frete por status, transportadora, custo médio", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "stores", phase: "IMPORTANT", area: "Frontend-Store", title: "Modo manutenção na store", description: "Checar flag de manutenção e exibir página bloqueadora bonita", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "billing", phase: "IMPORTANT", area: "Backend", title: "Trial period enforcement", description: "Lógica de expirar trial + bloquear acesso ao admin após fim do trial", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "auth", phase: "IMPORTANT", area: "Backend", title: "Reset senha por email com token/link", description: "Enviar link com token via Resend ao invés de reset direto", effort: "3h", status: "NOT_STARTED" },
  { moduleId: "customers", phase: "IMPORTANT", area: "Backend", title: "Preferências de comunicação (email/SMS opt-in)", description: "Salvar email/SMS opt-in no backend como campo no customer", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "customers", phase: "IMPORTANT", area: "Frontend-Store", title: "Preferências de comunicação UI", description: "Checkboxes na conta do cliente para opt-in email/SMS", effort: "1h", status: "NOT_STARTED" },

  // ═══════════════════════════════════════
  //  FASE 3 — V2 (pós-lançamento)
  // ═══════════════════════════════════════
  { moduleId: "checkout", phase: "V2", area: "Backend", title: "Gift cards — sistema completo (comprar/resgatar)", description: "Criar, vender e resgatar gift cards no checkout", effort: "2-3 semanas", status: "NOT_STARTED" },
  { moduleId: "orders", phase: "V2", area: "Backend", title: "Pedido manual (admin cria sem checkout)", description: "Admin cria pedido manualmente sem passar pelo checkout", effort: "1 semana", status: "NOT_STARTED" },
  { moduleId: "chat", phase: "V2", area: "Backend", title: "Chat real-time (WebSocket)", description: "Substituir polling HTTP por WebSocket/SSE para chat em tempo real", effort: "1 semana", status: "NOT_STARTED" },
  { moduleId: "catalog", phase: "V2", area: "Backend", title: "Tabela de preços (B2B)", description: "Sistema de price tables para diferentes segmentos de clientes", effort: "1-2 semanas", status: "NOT_STARTED" },
  { moduleId: "marketing", phase: "V2", area: "Backend", title: "Push notifications reais (FCM/OneSignal)", description: "Integração real com FCM ou OneSignal para push notifications", effort: "1 semana", status: "NOT_STARTED" },
  { moduleId: "marketing", phase: "V2", area: "Backend", title: "Ads integration real (Google/Meta Ads API)", description: "Conectar com APIs reais do Google Ads e Meta Ads", effort: "2-3 semanas", status: "NOT_STARTED" },
  { moduleId: "analytics", phase: "V2", area: "Backend", title: "Analytics de tráfego (GA4/Plausible)", description: "Integração com GA4 ou Plausible para métricas de tráfego", effort: "1 semana", status: "NOT_STARTED" },
  { moduleId: "stores", phase: "V2", area: "Backend", title: "Multi-idioma real (backend retorna textos traduzidos)", description: "Backend serve textos traduzidos por locale da loja", effort: "2-3 semanas", status: "NOT_STARTED" },
  { moduleId: "stores", phase: "V2", area: "Backend", title: "Custom fields dinâmicos (backend + store)", description: "Sistema de campos customizados para produtos e clientes", effort: "1-2 semanas", status: "NOT_STARTED" },
  { moduleId: "customers", phase: "V2", area: "Backend", title: "Mensagens diretas para clientes", description: "Sistema de mensagens admin → cliente", effort: "1 semana", status: "NOT_STARTED" },
  { moduleId: "catalog", phase: "V2", area: "Backend", title: "Importar/exportar produtos (CSV/Excel)", description: "Upload e download de catálogo em CSV/Excel", effort: "1 semana", status: "NOT_STARTED" },
  { moduleId: "catalog", phase: "V2", area: "Backend", title: "Avaliações de produtos (reviews)", description: "Sistema completo de review/rating de produto", effort: "1-2 semanas", status: "NOT_STARTED" },
  { moduleId: "catalog", phase: "V2", area: "Frontend-Store", title: "Variantes com imagem por cor", description: "Associar imagem específica a cada variante de cor", effort: "3-5 dias", status: "NOT_STARTED" },
  { moduleId: "catalog", phase: "V2", area: "Frontend-Store", title: "SEO automático (sitemap.xml, robots.txt, meta tags)", description: "Geração automática de sitemap, robots.txt e meta tags dinâmicas", effort: "3-5 dias", status: "NOT_STARTED" },
  { moduleId: "stores", phase: "V2", area: "Frontend-Store", title: "PWA / App mobile", description: "Progressive Web App com push notifications", effort: "2-4 semanas", status: "NOT_STARTED" },

  // ═══════════════════════════════════════
  //  DEPLOY PRODUÇÃO
  // ═══════════════════════════════════════
  // Infraestrutura
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "PostgreSQL em RDS/Cloud SQL", description: "Não usar Docker em prod — migrar para managed database", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Backend em EC2/ECS/Railway com auto-scaling", description: "Deploy do JAR com auto-scaling configurado", effort: "4h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Store frontend em Vercel", description: "Deploy do Next.js da store no Vercel", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Admin frontend em Vercel", description: "Deploy do Next.js admin panel no Vercel", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "CDN para imagens (S3 + CloudFront)", description: "Configurar upload de imagens no S3 com CDN CloudFront", effort: "3h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Domínio customizado + SSL (rapidocart.com.br)", description: "Registrar domínio e configurar certificado SSL", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "DNS wildcard para subdomínios (*.rapidocart.com.br)", description: "Configurar wildcard DNS para lojas em subdomínios", effort: "1h", status: "NOT_STARTED" },
  // Env vars
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Configurar todas env vars de produção", description: "JWT_SECRET, DB_*, STRIPE keys, MELHOR_ENVIO, RESEND, URLs", effort: "1h", status: "NOT_STARTED" },
  // Stripe
  { moduleId: "deploy", phase: "DEPLOY", area: "Manual", title: "Stripe: mudar para chaves live", description: "Trocar sk_test_ por sk_live_, configurar webhooks de prod", effort: "30min", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Manual", title: "Stripe: testar checkout com cartão real", description: "Fazer uma compra de teste com cartão real em produção", effort: "30min", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Manual", title: "Stripe Connect: configurar conta bancária real", description: "Dados bancários reais para receber pagamentos", effort: "30min", status: "NOT_STARTED" },
  // Melhor Envio
  { moduleId: "deploy", phase: "DEPLOY", area: "Manual", title: "Melhor Envio: mudar para produção", description: "Trocar sandbox por melhorenvio.com.br, re-autenticar token", effort: "30min", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Manual", title: "Melhor Envio: validar cotação com CEP real", description: "Testar cotação de frete com endereços reais", effort: "30min", status: "NOT_STARTED" },
  // Emails
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Configurar domínio de envio no Resend", description: "noreply@rapidocart.com.br com SPF/DKIM/DMARC verificados", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Configurar webhooks Resend de produção", description: "Webhook URL apontando para backend de produção", effort: "30min", status: "NOT_STARTED" },
  // Segurança
  { moduleId: "security", phase: "DEPLOY", area: "Backend", title: "Proteger endpoint POST /users/super-admin", description: "Desabilitar ou proteger com @PreAuthorize('SUPER_ADMIN')", effort: "15min", status: "NOT_STARTED" },
  { moduleId: "security", phase: "DEPLOY", area: "Frontend-Store", title: "Remover /diagnostic da store", description: "Página de diagnóstico não deve existir em produção", effort: "5min", status: "DONE", completedAt: "2025-01-01" },
  { moduleId: "security", phase: "DEPLOY", area: "Backend", title: "Configurar CORS para domínios de produção", description: "Trocar *.vercel.app por domínios específicos", effort: "15min", status: "NOT_STARTED" },
  { moduleId: "security", phase: "DEPLOY", area: "Backend", title: "Rate limiting nos endpoints públicos", description: "Throttle em login, register, forgot-password, endpoints públicos", effort: "2h", status: "NOT_STARTED" },
  // Monitoramento
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Configurar alertas (Uptime Robot/Better Stack)", description: "Monitoramento de uptime e alertas de downtime", effort: "1h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Log aggregation (CloudWatch/Papertrail)", description: "Centralizar logs de todos os serviços", effort: "2h", status: "NOT_STARTED" },
  { moduleId: "deploy", phase: "DEPLOY", area: "Infrastructure", title: "Error tracking (Sentry)", description: "Integrar Sentry no backend e frontends para captura de erros", effort: "2h", status: "NOT_STARTED" },
];

// ── Module summary from PRODUCT_BLUEPRINT ──────────────────
const MODULE_STATUS_SEED: Record<string, { total: number; done: number; partial: number; notStarted: number }> = {
  auth:          { total: 8,   done: 6,   partial: 2, notStarted: 0 },
  stores:        { total: 20,  done: 14,  partial: 5, notStarted: 1 },
  catalog:       { total: 17,  done: 15,  partial: 1, notStarted: 1 },
  cart:          { total: 7,   done: 7,   partial: 0, notStarted: 0 },
  checkout:      { total: 13,  done: 10,  partial: 1, notStarted: 2 },
  shipping:      { total: 12,  done: 10,  partial: 1, notStarted: 1 },
  orders:        { total: 8,   done: 7,   partial: 0, notStarted: 1 },
  abandoned:     { total: 10,  done: 10,  partial: 0, notStarted: 0 },
  coupons:       { total: 5,   done: 5,   partial: 0, notStarted: 0 },
  customers:     { total: 9,   done: 6,   partial: 2, notStarted: 1 },
  emails:        { total: 6,   done: 6,   partial: 0, notStarted: 0 },
  blog:          { total: 5,   done: 5,   partial: 0, notStarted: 0 },
  chat:          { total: 6,   done: 4,   partial: 0, notStarted: 2 },
  support:       { total: 5,   done: 5,   partial: 0, notStarted: 0 },
  notifications: { total: 6,   done: 6,   partial: 0, notStarted: 0 },
  marketing:     { total: 6,   done: 3,   partial: 3, notStarted: 0 },
  affiliates:    { total: 9,   done: 7,   partial: 0, notStarted: 2 },
  billing:       { total: 7,   done: 5,   partial: 2, notStarted: 0 },
  superadmin:    { total: 11,  done: 11,  partial: 0, notStarted: 0 },
  analytics:     { total: 6,   done: 2,   partial: 0, notStarted: 4 },
};

// ── Progress Bar Component ─────────────────────────────────
function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const color = clampedValue === 100 ? "hsl(var(--sa-success))" : clampedValue >= 70 ? "#3b82f6" : clampedValue >= 40 ? "#eab308" : "#f97316";
  return (
    <div className={`h-2 w-full rounded-full bg-[hsl(var(--sa-bg-hover))] overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ── Helper: load from storage ──────────────────────────────
function loadInitialFeatures(): RoadmapFeature[] {
  if (typeof window === "undefined") return [];
  try {
    const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);
    // Re-seed if version changed or no data
    if (storedVersion && Number(storedVersion) >= CURRENT_SEED_VERSION && stored) {
      const parsed = JSON.parse(stored) as RoadmapFeature[];
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const seeded = SEED_DATA.map(s => ({ ...s, id: generateId() }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
  return seeded;
}

// ── Main Component ─────────────────────────────────────────
export function SaRoadmapPage() {
  const [features, setFeatures] = useState<RoadmapFeature[]>(loadInitialFeatures);
  const [loaded] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<"phases" | "modules">("phases");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["CLEANUP", "CRITICAL"]));
  const [filterPhase, setFilterPhase] = useState<Phase | "ALL">("ALL");
  const [filterArea, setFilterArea] = useState<Area | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // Persist
  const persist = useCallback((next: RoadmapFeature[]) => {
    setFeatures(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // Toggle section expand
  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // Update status
  const cycleStatus = useCallback((id: string) => {
    const statusOrder: FeatureStatus[] = ["NOT_STARTED", "IN_PROGRESS", "DONE", "SKIPPED"];
    persist(features.map(f => {
      if (f.id !== id) return f;
      const idx = statusOrder.indexOf(f.status);
      const nextStatus = statusOrder[(idx + 1) % statusOrder.length];
      return {
        ...f,
        status: nextStatus,
        completedAt: nextStatus === "DONE" ? new Date().toISOString() : undefined,
      };
    }));
  }, [features, persist]);

  const setStatus = useCallback((id: string, status: FeatureStatus) => {
    persist(features.map(f => {
      if (f.id !== id) return f;
      return {
        ...f,
        status,
        completedAt: status === "DONE" ? new Date().toISOString() : undefined,
      };
    }));
    toast.success(`Marcado como: ${statusConfig[status].label}`);
  }, [features, persist]);

  // Mark all in phase as done
  const markPhaseAllDone = useCallback((phase: Phase) => {
    persist(features.map(f =>
      f.phase === phase && f.status !== "DONE" && f.status !== "SKIPPED"
        ? { ...f, status: "DONE" as FeatureStatus, completedAt: new Date().toISOString() }
        : f
    ));
    toast.success(`Todos os itens de "${phaseConfig[phase].label}" marcados como concluídos`);
  }, [features, persist]);

  // Reset
  const handleReset = useCallback(() => {
    const seeded = SEED_DATA.map(s => ({ ...s, id: generateId() }));
    persist(seeded);
    toast.success("Roadmap resetado para dados originais do Product Blueprint");
  }, [persist]);

  // Export
  const handleExport = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      features,
      stats: {
        total: features.length,
        done: features.filter(f => f.status === "DONE").length,
        inProgress: features.filter(f => f.status === "IN_PROGRESS").length,
        skipped: features.filter(f => f.status === "SKIPPED").length,
        pending: features.filter(f => f.status === "NOT_STARTED").length,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rapidocart-roadmap-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Roadmap exportado");
  }, [features]);

  // Filtered features
  const filtered = useMemo(() => {
    let result = features;
    if (filterPhase !== "ALL") result = result.filter(f => f.phase === filterPhase);
    if (filterArea !== "ALL") result = result.filter(f => f.area === filterArea);
    if (filterStatus !== "ALL") result = result.filter(f => f.status === filterStatus);
    if (!showCompleted) result = result.filter(f => f.status !== "DONE" && f.status !== "SKIPPED");
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(f => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.moduleId.toLowerCase().includes(q));
    }
    return result;
  }, [features, filterPhase, filterArea, filterStatus, showCompleted, search]);

  // Stats
  const stats = useMemo(() => {
    const total = features.length;
    const done = features.filter(f => f.status === "DONE").length;
    const inProgress = features.filter(f => f.status === "IN_PROGRESS").length;
    const skipped = features.filter(f => f.status === "SKIPPED").length;
    const pending = features.filter(f => f.status === "NOT_STARTED").length;

    const byPhase = (Object.keys(phaseConfig) as Phase[]).map(p => {
      const items = features.filter(f => f.phase === p);
      const pDone = items.filter(f => f.status === "DONE" || f.status === "SKIPPED").length;
      return { phase: p, total: items.length, done: pDone, pct: items.length > 0 ? Math.round((pDone / items.length) * 100) : 0 };
    });

    // Overall platform readiness (modules from PRODUCT_BLUEPRINT)
    const moduleEntries = Object.entries(MODULE_STATUS_SEED);
    const totalPlatformFeatures = moduleEntries.reduce((s, [, v]) => s + v.total, 0);
    const donePlatformFeatures = moduleEntries.reduce((s, [, v]) => s + v.done, 0);
    const platformPct = Math.round((donePlatformFeatures / totalPlatformFeatures) * 100);

    return { total, done, inProgress, skipped, pending, byPhase, platformPct, totalPlatformFeatures, donePlatformFeatures };
  }, [features]);

  // Group by phase
  const groupedByPhase = useMemo(() => {
    const groups = new Map<Phase, RoadmapFeature[]>();
    for (const p of Object.keys(phaseConfig) as Phase[]) {
      groups.set(p, filtered.filter(f => f.phase === p));
    }
    return groups;
  }, [filtered]);

  // Group by module
  const groupedByModule = useMemo(() => {
    const groups = new Map<string, RoadmapFeature[]>();
    for (const f of filtered) {
      if (!groups.has(f.moduleId)) groups.set(f.moduleId, []);
      groups.get(f.moduleId)!.push(f);
    }
    return groups;
  }, [filtered]);

  if (!loaded) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="SaaS Roadmap" description="Carregando..." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SaSkeleton key={i} className="h-32" />)}
        </div>
        <SaSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaPageHeader
        title="SaaS Roadmap"
        description="Gerenciamento completo de ponta a ponta — do código ao deploy"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-[11px] h-8 border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={handleExport}>
              <ArrowDownToLine className="h-3 w-3 mr-1" /> Exportar
            </Button>
            <Button size="sm" variant="outline" className="text-[11px] h-8 border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" /> Resetar
            </Button>
          </div>
        }
      />

      {/* ── Overall Platform Stats ── */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))]">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[hsl(var(--sa-text))]">Plataforma RapidoCart</h2>
              <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                {stats.platformPct}% pronto — {stats.donePlatformFeatures}/{stats.totalPlatformFeatures} features do catálogo implementadas
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[24px] font-bold text-[hsl(var(--sa-text))]">{stats.platformPct}%</div>
              <div className="text-[10px] text-[hsl(var(--sa-text-muted))]">READINESS</div>
            </div>
          </div>
          <ProgressBar value={stats.platformPct} />
        </SaCard>
      </motion.div>

      {/* ── Roadmap Stats ── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SaStatCard title="Total Roadmap" value={String(stats.total)} icon={Rocket} color="accent" subtitle="Itens para gerenciar" />
        <SaStatCard title="Pendentes" value={String(stats.pending)} icon={Circle} color="warning" />
        <SaStatCard title="Em Progresso" value={String(stats.inProgress)} icon={Clock} color="info" />
        <SaStatCard title="Concluídos" value={String(stats.done)} icon={CheckCircle2} color="success" subtitle={`${stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% do roadmap`} />
        <SaStatCard title="Pulados" value={String(stats.skipped)} icon={EyeOff} color="danger" />
      </motion.div>

      {/* ── Phase Progress Cards ── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.byPhase.map(({ phase, total, done, pct }) => {
          const cfg = phaseConfig[phase];
          const PhIcon = cfg.icon;
          return (
            <motion.div
              key={phase}
              variants={fadeInUp}
              className="rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-card))] p-4 hover:border-[hsl(var(--sa-border))] transition-all cursor-pointer"
              onClick={() => {
                setFilterPhase(filterPhase === phase ? "ALL" : phase);
                if (!expandedSections.has(phase)) {
                  setExpandedSections(prev => new Set([...prev, phase]));
                }
              }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <PhIcon className="h-4 w-4" style={{ color: cfg.color }} />
                <span className="text-[11px] font-semibold text-[hsl(var(--sa-text))]">{cfg.label.split(" — ")[0]}</span>
              </div>
              <div className="text-[20px] font-bold text-[hsl(var(--sa-text))]">{done}/{total}</div>
              <ProgressBar value={pct} className="mt-2" />
              <div className="mt-1 text-[10px] text-[hsl(var(--sa-text-muted))]">{pct}% concluído</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Module Status Grid (from PRODUCT_BLUEPRINT) ── */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="p-5">
          <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))] mb-4">Status por Módulo (Catálogo de Features)</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(MODULE_STATUS_SEED).map(([key, val]) => {
              const cfg = moduleConfig[key];
              if (!cfg) return null;
              const Icon = cfg.icon;
              const pct = val.total > 0 ? Math.round((val.done / val.total) * 100) : 0;
              const isComplete = pct === 100;
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-3 transition-all ${isComplete ? "border-[hsl(var(--sa-success))]/30 bg-[hsl(var(--sa-success-subtle))]" : "border-[hsl(var(--sa-border-subtle))] hover:border-[hsl(var(--sa-border))]"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-3.5 w-3.5 ${isComplete ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-text-muted))]"}`} />
                    <span className="text-[11px] font-semibold text-[hsl(var(--sa-text))] truncate">{cfg.title}</span>
                    {isComplete && <CheckCircle2 className="h-3 w-3 text-[hsl(var(--sa-success))] ml-auto shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={pct} className="flex-1" />
                    <span className="text-[10px] font-mono text-[hsl(var(--sa-text-muted))] w-8 text-right">{pct}%</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] text-[hsl(var(--sa-success))]">{val.done} ok</span>
                    {val.partial > 0 && <span className="text-[9px] text-[hsl(var(--sa-warning))]">{val.partial} parcial</span>}
                    {val.notStarted > 0 && <span className="text-[9px] text-[hsl(var(--sa-danger))]">{val.notStarted} falta</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </SaCard>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-50">
              <Search className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input placeholder="Buscar por título, descrição ou módulo..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-[12px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]" />
            </div>

            {/* View mode */}
            <div className="flex rounded-lg border border-[hsl(var(--sa-border-subtle))] overflow-hidden">
              <button
                className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${viewMode === "phases" ? "bg-[hsl(var(--sa-accent))] text-white" : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-bg-hover))]"}`}
                onClick={() => setViewMode("phases")}
              >Fases</button>
              <button
                className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${viewMode === "modules" ? "bg-[hsl(var(--sa-accent))] text-white" : "text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-bg-hover))]"}`}
                onClick={() => setViewMode("modules")}
              >Módulos</button>
            </div>

            <Select value={filterPhase} onValueChange={v => setFilterPhase(v as Phase | "ALL")}>
              <SelectTrigger className="w-40 h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as Fases</SelectItem>
                {(Object.entries(phaseConfig) as [Phase, typeof phaseConfig[Phase]][]).map(([k, v]) => <SelectItem key={k} value={k}>{v.label.split(" — ")[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterArea} onValueChange={v => setFilterArea(v as Area | "ALL")}>
              <SelectTrigger className="w-30 h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Áreas</SelectItem>
                {(Object.entries(areaConfig) as [Area, typeof areaConfig[Area]][]).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => setFilterStatus(v as FeatureStatus | "ALL")}>
              <SelectTrigger className="w-32 h-8 text-[11px] bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Status</SelectItem>
                {(Object.entries(statusConfig) as [FeatureStatus, typeof statusConfig[FeatureStatus]][]).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <button
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors border ${showCompleted ? "border-[hsl(var(--sa-success))]/30 text-[hsl(var(--sa-success))] bg-[hsl(var(--sa-success-subtle))]" : "border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))]"}`}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {showCompleted ? "Concluídos" : "Ocultos"}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-[hsl(var(--sa-text-muted))]">
            Mostrando {filtered.length} de {features.length} itens
          </div>
        </SaCard>
      </motion.div>

      {/* ── Items By Phase ── */}
      {viewMode === "phases" && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {(Object.keys(phaseConfig) as Phase[]).map(phase => {
            const items = groupedByPhase.get(phase) || [];
            if (items.length === 0) return null;
            const cfg = phaseConfig[phase];
            const PhIcon = cfg.icon;
            const isExpanded = expandedSections.has(phase);
            const doneCount = items.filter(f => f.status === "DONE" || f.status === "SKIPPED").length;
            const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

            return (
              <motion.div key={phase} variants={fadeInUp}>
                {/* Phase Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-card))] cursor-pointer hover:border-[hsl(var(--sa-border))] transition-all"
                  onClick={() => toggleSection(phase)}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <PhIcon className="h-4 w-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[hsl(var(--sa-text))]">{cfg.label}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4" style={{ borderColor: cfg.color, color: cfg.color }}>
                        {doneCount}/{items.length}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{cfg.description}</p>
                  </div>
                  <div className="w-24">
                    <ProgressBar value={pct} />
                    <div className="mt-0.5 text-[9px] text-[hsl(var(--sa-text-muted))] text-right">{pct}%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pct < 100 && (
                      <button
                        className="p-1 rounded text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success-subtle))] transition-all"
                        onClick={e => { e.stopPropagation(); markPhaseAllDone(phase); }}
                        title="Marcar todos como concluídos"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" /> : <ChevronRight className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />}
                  </div>
                </div>

                {/* Phase Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pt-1 space-y-1">
                        {items.map(feature => (
                          <FeatureRow key={feature.id} feature={feature} setStatus={setStatus} cycleStatus={cycleStatus} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Items By Module ── */}
      {viewMode === "modules" && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {Array.from(groupedByModule.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([modId, items]) => {
              const cfg = moduleConfig[modId] || { title: modId, icon: Package, description: "" };
              const ModIcon = cfg.icon;
              const isExpanded = expandedSections.has(modId);
              const doneCount = items.filter(f => f.status === "DONE" || f.status === "SKIPPED").length;
              const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

              return (
                <motion.div key={modId} variants={fadeInUp}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-card))] cursor-pointer hover:border-[hsl(var(--sa-border))] transition-all"
                    onClick={() => toggleSection(modId)}
                  >
                    <ModIcon className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[hsl(var(--sa-text))]">{cfg.title}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                          {doneCount}/{items.length}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{cfg.description}</p>
                    </div>
                    <div className="w-24">
                      <ProgressBar value={pct} />
                      <div className="mt-0.5 text-[9px] text-[hsl(var(--sa-text-muted))] text-right">{pct}%</div>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" /> : <ChevronRight className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pt-1 space-y-1">
                          {items.map(feature => (
                            <FeatureRow key={feature.id} feature={feature} setStatus={setStatus} cycleStatus={cycleStatus} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </motion.div>
      )}

      {filtered.length === 0 && (
        <SaCard>
          <div className="text-center py-12">
            <CheckCircle2 className="h-10 w-10 mx-auto text-[hsl(var(--sa-success))] mb-3" />
            <p className="text-[13px] text-[hsl(var(--sa-text-secondary))]">
              {features.length === 0 ? "Nenhum item no roadmap" : "Nenhum item corresponde aos filtros"}
            </p>
          </div>
        </SaCard>
      )}

      {/* ── Critical Flows Tracker ── */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="p-5">
          <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))] mb-4">Fluxos Críticos</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <FlowCard
              title="Primeira Venda"
              steps={21}
              done={20}
              missing="Webhook tracking Melhor Envio"
              color="#3b82f6"
            />
            <FlowCard
              title="Carrinho Abandonado"
              steps={10}
              done={10}
              missing={null}
              color="#22c55e"
            />
            <FlowCard
              title="SaaS Billing (Tenant)"
              steps={9}
              done={7}
              missing="Enforcement de limites + Trial blocking"
              color="#f97316"
            />
          </div>
        </SaCard>
      </motion.div>

      {/* ── Reset button ── */}
      <div className="flex justify-center pt-4 pb-8">
        <Button size="sm" variant="outline" className="text-[10px] h-7 border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] hover:bg-[hsl(var(--sa-bg-hover))]" onClick={handleReset}>
          Resetar para dados do Product Blueprint
        </Button>
      </div>
    </div>
  );
}

// ── Feature Row Component ──────────────────────────────────
function FeatureRow({
  feature,
  setStatus,
  cycleStatus,
}: {
  feature: RoadmapFeature;
  setStatus: (id: string, status: FeatureStatus) => void;
  cycleStatus: (id: string) => void;
}) {
  const sta = statusConfig[feature.status];
  const StaIcon = sta.icon;
  const area = areaConfig[feature.area];
  const AreaIcon = area.icon;
  const isDone = feature.status === "DONE" || feature.status === "SKIPPED";
  const mod = moduleConfig[feature.moduleId];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all group ${isDone ? "border-[hsl(var(--sa-border-subtle))]/40 opacity-55 hover:opacity-80" : "border-[hsl(var(--sa-border-subtle))] hover:border-[hsl(var(--sa-border))] hover:bg-[hsl(var(--sa-surface-hover))]"} bg-[hsl(var(--sa-card))]`}
    >
      {/* Status toggle */}
      <button
        onClick={() => cycleStatus(feature.id)}
        className="shrink-0 p-0.5 rounded transition-all hover:scale-110"
        title={`Clique para mudar status (atual: ${sta.label})`}
      >
        <StaIcon className="h-4.5 w-4.5" style={{ color: sta.color }} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[12px] font-medium text-[hsl(var(--sa-text))] ${isDone ? "line-through" : ""}`}>
            {feature.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">{feature.description}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Module badge */}
        {mod && (
          <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-medium bg-[hsl(var(--sa-bg-hover))] text-[hsl(var(--sa-text-muted))]">
            {mod.title.split(" ")[0]}
          </span>
        )}

        {/* Area badge */}
        <span
          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-medium"
          style={{ backgroundColor: `${area.color}15`, color: area.color }}
        >
          <AreaIcon className="h-2.5 w-2.5" />
          {area.label}
        </span>

        {/* Effort */}
        <span className="text-[9px] font-mono text-[hsl(var(--sa-text-muted))] bg-[hsl(var(--sa-bg))] px-1.5 py-0.5 rounded-full">
          {feature.effort}
        </span>

        {/* Quick status buttons (visible on hover) */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          {(Object.entries(statusConfig) as [FeatureStatus, typeof statusConfig[FeatureStatus]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = feature.status === key;
            return (
              <button
                key={key}
                onClick={e => { e.stopPropagation(); setStatus(feature.id, key); }}
                title={cfg.label}
                className={`p-0.5 rounded transition-all ${isActive ? "bg-[hsl(var(--sa-bg-hover))]" : "opacity-40 hover:opacity-80"}`}
              >
                <Icon className="h-3 w-3" style={{ color: isActive ? cfg.color : undefined }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Completed date */}
      {feature.completedAt && (
        <span className="text-[8px] text-[hsl(var(--sa-text-muted))] shrink-0">
          {new Date(feature.completedAt).toLocaleDateString("pt-BR")}
        </span>
      )}
    </motion.div>
  );
}

// ── Flow Card Component ────────────────────────────────────
function FlowCard({
  title,
  steps,
  done,
  missing,
  color,
}: {
  title: string;
  steps: number;
  done: number;
  missing: string | null;
  color: string;
}) {
  const pct = Math.round((done / steps) * 100);
  const isComplete = done === steps;
  return (
    <div className={`rounded-xl border p-4 transition-all ${isComplete ? "border-[hsl(var(--sa-success))]/30 bg-[hsl(var(--sa-success-subtle))]" : "border-[hsl(var(--sa-border-subtle))]"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">{title}</span>
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--sa-success))]" />
        ) : (
          <span className="text-[10px] font-mono" style={{ color }}>{done}/{steps}</span>
        )}
      </div>
      <ProgressBar value={pct} />
      <div className="mt-2 text-[10px] text-[hsl(var(--sa-text-muted))]">
        {isComplete ? (
          <span className="text-[hsl(var(--sa-success))] font-medium">100% funcional</span>
        ) : (
          <span>Falta: {missing}</span>
        )}
      </div>
    </div>
  );
}
