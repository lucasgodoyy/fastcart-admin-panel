"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Server,
  Mail,
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  Circle,
  ExternalLink,
  Zap,
  Facebook,
  Search,
  Star,
  Code,
  MessageSquare,
  Flame,
  Tag,
  TrendingUp,
  ChevronRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import {
  SaPageHeader,
  SaCard,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import superAdminService from "@/services/super-admin/superAdminService";
import { toast } from "sonner";

/* ── Shared helpers ─────────────────────────────────────────── */

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <div className="flex-1 min-w-0 sm:mr-4">
        <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{label}</p>
        {desc && <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp}>
      <SaCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sa-accent))]/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
          </div>
          <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{title}</h3>
        </div>
        {children}
      </SaCard>
    </motion.div>
  );
}

/* ── Integration Card ───────────────────────────────────────── */

interface PlatformIntegration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  category: string;
  status: "connected" | "not_connected" | "env_configured" | "per_store";
  statusLabel: string;
  configHint?: string;
  docsUrl?: string;
}

function IntegrationCard({ integration }: { integration: PlatformIntegration }) {
  const isActive = integration.status === "connected" || integration.status === "env_configured";
  const isPerStore = integration.status === "per_store";
  const Icon = integration.icon;

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative flex items-start gap-4 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-5 transition-all hover:border-[hsl(var(--sa-border))] hover:shadow-md"
    >
      <div className="shrink-0 h-12 w-12 rounded-lg bg-[hsl(var(--sa-surface-hover))] flex items-center justify-center">
        <Icon className={`h-6 w-6 ${integration.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-[13px] font-bold text-[hsl(var(--sa-text))]">{integration.name}</h3>
          {isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--sa-success-subtle))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--sa-success))]">
              <CheckCircle2 className="h-3 w-3" /> Conectado
            </span>
          ) : isPerStore ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--sa-info-subtle))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--sa-info))]">
              <CheckCircle2 className="h-3 w-3" /> Por loja
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--sa-surface-hover))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--sa-text-muted))]">
              <Circle className="h-3 w-3" /> Não conectado
            </span>
          )}
        </div>
        <p className="text-[11px] text-[hsl(var(--sa-text-muted))] leading-relaxed">{integration.description}</p>
        {integration.configHint && (
          <p className="text-[10px] text-[hsl(var(--sa-text-muted))] mt-1.5 font-mono bg-[hsl(var(--sa-bg))] rounded px-2 py-1 inline-block">
            {integration.configHint}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] font-medium text-[hsl(var(--sa-text-secondary))]">
            {integration.statusLabel}
          </span>
          {integration.docsUrl && (
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--sa-accent))] hover:underline"
            >
              Docs <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--sa-text-muted))] mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

/* ── Platform Integrations Tab ──────────────────────────────── */

function PlatformIntegrationsTab() {
  const { data: settings } = useQuery({
    queryKey: ["sa-general-settings"],
    queryFn: superAdminService.getGeneralSettings,
  });

  const integrations: PlatformIntegration[] = [
    // ── Pagamentos ──
    {
      id: "stripe",
      name: "Stripe",
      description: "Processamento de pagamentos via cartao, PIX e boleto. Gerencia assinaturas, cobranças e repasses para lojistas via Stripe Connect.",
      icon: CreditCard,
      iconColor: "text-[#635BFF]",
      category: "Pagamentos",
      status: "env_configured",
      statusLabel: "Configurado via variaveis de ambiente (STRIPE_SECRET_KEY)",
      configHint: "Chaves configuradas no servidor",
      docsUrl: "https://docs.stripe.com/connect",
    },
    // ── Infraestrutura da Plataforma ──
    {
      id: "resend",
      name: "Resend (E-mail Transacional)",
      description: "Envio de e-mails transacionais: confirmacao de pedido, redefinicao de senha, notificacoes de envio e campanhas de marketing.",
      icon: Mail,
      iconColor: "text-[#000000]",
      category: "Infraestrutura da Plataforma",
      status: "env_configured",
      statusLabel: settings?.supportEmail
        ? `Remetente: ${settings.supportEmail}`
        : "Configurado via variavel de ambiente (RESEND_API_KEY)",
      configHint: "re_**** (configurado no servidor)",
      docsUrl: "https://resend.com/docs",
    },
    {
      id: "custom-domains",
      name: "Dominios Personalizados",
      description: "Cada loja recebe um subdominio gratuito e pode configurar dominio personalizado com CNAME DNS.",
      icon: Globe,
      iconColor: "text-[#10B981]",
      category: "Infraestrutura da Plataforma",
      status: "connected",
      statusLabel: "Ativo — subdominio + dominio customizado suportados",
    },
    // ── Analytics & Tracking (por loja) ──
    {
      id: "google-analytics",
      name: "Google Analytics 4",
      description: "Rastreamento de visitantes, conversoes e comportamento do usuario. Cada lojista configura seu proprio GA4 Measurement ID.",
      icon: BarChart3,
      iconColor: "text-[#F9AB00]",
      category: "Analytics & Tracking",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Google Analytics",
      docsUrl: "https://analytics.google.com",
    },
    {
      id: "google-tag-manager",
      name: "Google Tag Manager",
      description: "Gerenciamento centralizado de tags de marketing. Cada lojista adiciona seu Container ID (GTM-XXXXXXX).",
      icon: Tag,
      iconColor: "text-[#4285F4]",
      category: "Analytics & Tracking",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > GTM",
      docsUrl: "https://tagmanager.google.com",
    },
    {
      id: "facebook-pixel",
      name: "Facebook Pixel (Meta)",
      description: "Rastreamento de conversoes para Facebook Ads e Instagram Ads. Permite remarketing e otimizacao de campanhas publicitarias.",
      icon: Facebook,
      iconColor: "text-[#1877F2]",
      category: "Analytics & Tracking",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Facebook Pixel",
      docsUrl: "https://developers.facebook.com/docs/meta-pixel",
    },
    {
      id: "tiktok-pixel",
      name: "TikTok Pixel",
      description: "Rastreamento de eventos para TikTok Ads. Auto-tracking de PageView, ViewContent, AddToCart, InitiateCheckout e CompletePayment.",
      icon: BarChart3,
      iconColor: "text-[#010101]",
      category: "Analytics & Tracking",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > TikTok Pixel",
      docsUrl: "https://ads.tiktok.com/",
    },
    {
      id: "hotjar",
      name: "Hotjar",
      description: "Mapas de calor, gravacoes de sessao e funis de conversao. Ajuda lojistas a entender o comportamento dos visitantes.",
      icon: Flame,
      iconColor: "text-[#FF3C00]",
      category: "Analytics & Tracking",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Hotjar",
      docsUrl: "https://www.hotjar.com/",
    },
    // ── Marketing (por loja) ──
    {
      id: "google-ads",
      name: "Google Ads",
      description: "Rastreamento de conversoes do Google Ads com Conversion ID e scripts personalizados no checkout e confirmacao.",
      icon: TrendingUp,
      iconColor: "text-[#4285F4]",
      category: "Marketing",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Google Ads",
      docsUrl: "https://ads.google.com",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Sincronizacao de clientes e envio de campanhas de e-mail marketing automatizadas. Integra novos compradores as listas de contatos.",
      icon: Mail,
      iconColor: "text-[#FFE01B]",
      category: "Marketing",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Mailchimp (API Key + List ID)",
      docsUrl: "https://mailchimp.com/developer/",
    },
    // ── SEO & Verificacao (por loja) ──
    {
      id: "google-search-console",
      name: "Google Search Console",
      description: "Verificacao de propriedade do site no Google. Essencial para SEO — permite que a loja apareca nos resultados de busca.",
      icon: Search,
      iconColor: "text-[#34A853]",
      category: "SEO & Verificacao",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Tags de Verificacao",
      docsUrl: "https://search.google.com/search-console",
    },
    {
      id: "bing-webmaster",
      name: "Bing Webmaster Tools",
      description: "Verificacao no Bing para melhorar visibilidade nas buscas do Bing e Yahoo. Complementa a presenca no Google.",
      icon: Search,
      iconColor: "text-[#008373]",
      category: "SEO & Verificacao",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Tags de Verificacao",
      docsUrl: "https://www.bing.com/webmasters",
    },
    // ── Reputacao (por loja) ──
    {
      id: "ebit-reclame-aqui",
      name: "Ebit / Reclame Aqui",
      description: "Selo de reputacao exibido no footer da loja. Coleta avaliacoes de clientes pos-compra para construir confianca.",
      icon: Star,
      iconColor: "text-[#F5A623]",
      category: "Reputacao",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Ebit (Ebit ID + URL do selo)",
      docsUrl: "https://www.ebit.com.br/",
    },
    {
      id: "google-customer-reviews",
      name: "Google Customer Reviews",
      description: "Programa do Google que coleta avaliacoes de clientes apos a compra. Exibe estrelas nos resultados de busca.",
      icon: Star,
      iconColor: "text-[#4285F4]",
      category: "Reputacao",
      status: "per_store",
      statusLabel: "Cada lojista configura em Integracoes > Google Reviews (requer Merchant Center)",
      docsUrl: "https://support.google.com/merchants/answer/7105655",
    },
    // ── Canais de Venda (por loja) ──
    {
      id: "google-merchant",
      name: "Google Merchant Center",
      description: "Feed XML automatico de produtos para o Google Shopping. Permite que produtos aparecam nos resultados de compras do Google.",
      icon: TrendingUp,
      iconColor: "text-[#34A853]",
      category: "Canais de Venda",
      status: "per_store",
      statusLabel: "Feed automatico gerado em /api/v1/public/stores/{slug}/feed/google",
      docsUrl: "https://merchants.google.com/",
    },
    // ── Conversao & Scripts (por loja) ──
    {
      id: "conversion-codes",
      name: "Codigos de Conversao",
      description: "Scripts customizados injetados no checkout e na confirmacao de pedido. Usado para Facebook CAPI, Google Ads tags e outros trackers.",
      icon: Code,
      iconColor: "text-[#8B5CF6]",
      category: "Conversao & Scripts",
      status: "per_store",
      statusLabel: "Cada lojista configura scripts de checkout + confirmacao",
    },
    {
      id: "chat-widget",
      name: "Chat / Widget Externo",
      description: "Widget de atendimento ao cliente (Tawk.to, Crisp, JivoChat, Tidio, Zendesk, Intercom). Inserido automaticamente em todas as paginas.",
      icon: MessageSquare,
      iconColor: "text-[#6366F1]",
      category: "Conversao & Scripts",
      status: "per_store",
      statusLabel: "Cada lojista configura script do widget em Integracoes > Chat",
    },
    // ── Automacoes ──
    {
      id: "zapier",
      name: "Zapier",
      description: "Webhooks automaticos para conectar a loja a mais de 7.000 apps. Eventos: pedido pago, enviado, entregue, cancelado e cliente criado.",
      icon: Zap,
      iconColor: "text-[#FF4A00]",
      category: "Automacoes",
      status: "connected",
      statusLabel: "Ativo — webhooks configuraveis por loja com secret token",
      docsUrl: "https://zapier.com/",
    },
  ];

  const categories = [...new Set(integrations.map((i) => i.category))];

  const platformCount = integrations.filter(
    (i) => i.status === "connected" || i.status === "env_configured"
  ).length;
  const perStoreCount = integrations.filter((i) => i.status === "per_store").length;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
      {/* Summary */}
      <motion.div variants={fadeInUp}>
        <SaCard>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">
                Visao Geral das Integracoes
              </h3>
              <p className="text-[12px] text-[hsl(var(--sa-text-muted))] mt-1 max-w-xl">
                Integracoes de nivel plataforma (Stripe, Resend, Dominios) sao configuradas no servidor via variaveis de ambiente.
                As demais sao configuraveis por cada lojista no painel admin da loja.
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-[24px] font-bold text-[hsl(var(--sa-success))]">{platformCount}</div>
                <div className="text-[10px] text-[hsl(var(--sa-text-muted))] font-medium">Plataforma</div>
              </div>
              <div className="h-8 w-px bg-[hsl(var(--sa-border-subtle))]" />
              <div className="text-center">
                <div className="text-[24px] font-bold text-[hsl(var(--sa-info))]">{perStoreCount}</div>
                <div className="text-[10px] text-[hsl(var(--sa-text-muted))] font-medium">Por loja</div>
              </div>
              <div className="h-8 w-px bg-[hsl(var(--sa-border-subtle))]" />
              <div className="text-center">
                <div className="text-[24px] font-bold text-[hsl(var(--sa-text))]">{integrations.length}</div>
                <div className="text-[10px] text-[hsl(var(--sa-text-muted))] font-medium">Total</div>
              </div>
            </div>
          </div>
        </SaCard>
      </motion.div>

      {/* Categories */}
      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="text-[12px] font-bold text-[hsl(var(--sa-text-muted))] uppercase tracking-wider mb-3">{cat}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {integrations
              .filter((i) => i.category === cat)
              .map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */

export function SaSettingsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/settings", { general: "", integrations: "integrations" }, "general");
  const [showStripeKey, setShowStripeKey] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["sa-general-settings"],
    queryFn: superAdminService.getGeneralSettings,
  });

  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setPlatformName(settings.platformName ?? "");
    setSupportEmail(settings.supportEmail ?? "");
    setMaintenanceMode(settings.maintenanceMode ?? false);
    setInitialized(true);
  }

  const handleSave = () => {
    toast.success("Configuracoes salvas!");
  };

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Configuracoes"
        description="Configuracoes gerais da plataforma, integracoes e infraestrutura"
        actions={
          tab === "general" ? (
            <Button onClick={handleSave} className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
              <Save className="h-4 w-4" /> Salvar Alteracoes
            </Button>
          ) : undefined
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-lg p-1 flex-wrap h-auto">
          {[
            { value: "general", icon: Globe, label: "Geral" },
            { value: "integrations", icon: Server, label: "Integracoes" },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px] gap-1.5">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={Globe} title="Plataforma">
              <SettingRow label="Nome da Plataforma" desc="Nome exibido publicamente">
                <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} placeholder={isLoading ? "Carregando..." : ""} className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="URL Principal" desc="Dominio principal da plataforma">
                <Input defaultValue="https://rapidocart.com.br" className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Moeda Padrao" desc="Moeda utilizada nas transacoes">
                <Input defaultValue="BRL (R$)" disabled className="w-full sm:w-32 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Modo Manutencao" desc="Desabilita acesso publico temporariamente">
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </SettingRow>
              <SettingRow label="Registro de Novas Lojas" desc="Permitir cadastro de novas lojas">
                <Switch defaultChecked />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Mail} title="E-mail">
              <SettingRow label="E-mail de Suporte" desc="Exibido nas paginas de contato">
                <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder={isLoading ? "Carregando..." : ""} className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="E-mail do Remetente" desc="From address para e-mails automaticos">
                <Input defaultValue="noreply@rapidocart.com.br" className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Enviar E-mail de Teste" desc="Verifica se o Resend esta configurado corretamente">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-[12px] h-9"
                  onClick={async () => {
                    try {
                      const result = await superAdminService.sendPlatformEmail({
                        to: settings?.supportEmail || "admin@lojaki.store",
                        subject: "[Lojaki] E-mail de teste - Resend OK",
                        bodyHtml: "<h2>E-mail de teste</h2><p>Se voce esta lendo isso, o Resend esta configurado corretamente!</p><p><small>Enviado em: " + new Date().toLocaleString("pt-BR") + "</small></p>",
                      });
                      if (result.status === "SENT") {
                        toast.success("E-mail de teste enviado com sucesso!");
                      } else {
                        toast.error("Falha ao enviar e-mail de teste.");
                      }
                    } catch {
                      toast.error("Erro ao enviar e-mail de teste. Verifique a API Key do Resend.");
                    }
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Enviar teste
                </Button>
              </SettingRow>
            </SettingSection>

            <SettingSection icon={CreditCard} title="Stripe (Pagamentos)">
              <SettingRow label="Chave Publica" desc="Publishable key do Stripe">
                <Input defaultValue="pk_live_51..." className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Chave Secreta" desc="Secret key do Stripe">
                <div className="flex items-center gap-2">
                  <Input
                    type={showStripeKey ? "text" : "password"}
                    defaultValue="sk_live_51..."
                    className="w-full sm:w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
                  />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--sa-text-muted))]" onClick={() => setShowStripeKey((v) => !v)}>
                    {showStripeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </SettingRow>
              <SettingRow label="Webhook Secret" desc="Para validar eventos do Stripe">
                <Input type="password" defaultValue="whsec_..." className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Modo Teste" desc="Usar chaves de teste do Stripe">
                <Switch />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-6">
          <PlatformIntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
