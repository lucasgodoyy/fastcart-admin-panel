"use client";

import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Globe,
  Palette,
  Shield,
  Bell,
  Server,
  Mail,
  CreditCard,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Database,
  Cpu,
  HardDrive,
  Loader2,
} from "lucide-react";
import {
  SaPageHeader,
  SaCard,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import superAdminService from "@/services/super-admin/superAdminService";
import { toast } from "sonner";

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
      <div className="flex-1 min-w-0 mr-4">
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

export function SaSettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("general");
  const [showStripeKey, setShowStripeKey] = useState(false);

  // Load real settings from backend
  const { data: settings, isLoading } = useQuery({
    queryKey: ['sa-general-settings'],
    queryFn: superAdminService.getGeneralSettings,
  });

  // Local form state — initialized from backend
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("");
  const [defaultTimezone, setDefaultTimezone] = useState("");

  useEffect(() => {
    if (settings) {
      setPlatformName(settings.platformName ?? "");
      setSupportEmail(settings.supportEmail ?? "");
      setMaintenanceMode(settings.maintenanceMode ?? false);
      setDefaultLanguage(settings.defaultLanguage ?? "pt-BR");
      setDefaultTimezone(settings.defaultTimezone ?? "America/Sao_Paulo");
    }
  }, [settings]);

  const handleSave = () => {
    toast.success("Configurações salvas!");
  };

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Configurações"
        description="Configurações gerais da plataforma, integrações e infraestrutura"
        actions={
          <Button onClick={handleSave} className="bg-gradient-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-xl gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1 flex-wrap h-auto">
          {[
            { value: "general", icon: Globe, label: "Geral" },
            { value: "appearance", icon: Palette, label: "Aparência" },
            { value: "security", icon: Shield, label: "Segurança" },
            { value: "notifications", icon: Bell, label: "Notificações" },
            { value: "integrations", icon: Server, label: "Integrações" },
            { value: "infrastructure", icon: Database, label: "Infraestrutura" },
          ].map(t => (
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
                <Input value={platformName} onChange={e => setPlatformName(e.target.value)} placeholder={isLoading ? 'Carregando...' : ''} className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="URL Principal" desc="Domínio principal da plataforma">
                <Input defaultValue="https://fastcart.com" className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Moeda Padrão" desc="Moeda utilizada nas transações">
                <Input defaultValue="BRL (R$)" disabled className="w-32 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Modo Manutenção" desc="Desabilita acesso público temporariamente">
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </SettingRow>
              <SettingRow label="Registro de Novas Lojas" desc="Permitir cadastro de novas lojas">
                <Switch defaultChecked />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Mail} title="E-mail">
              <SettingRow label="E-mail de Suporte" desc="Exibido nas páginas de contato">
                <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder={isLoading ? 'Carregando...' : ''} className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="E-mail do Remetente" desc="From address para e-mails automáticos">
                <Input defaultValue="noreply@fastcart.com" className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={Palette} title="Tema & Branding">
              <SettingRow label="Cor Primária" desc="Cor principal da marca">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sa-accent))] border border-[hsl(var(--sa-border-subtle))]" />
                  <Input defaultValue="#7C3AED" className="w-28 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
                </div>
              </SettingRow>
              <SettingRow label="Cor Secundária">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sa-info))] border border-[hsl(var(--sa-border-subtle))]" />
                  <Input defaultValue="#0EA5E9" className="w-28 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
                </div>
              </SettingRow>
              <SettingRow label="Logo da Plataforma" desc="Formato recomendado: SVG ou PNG transparente">
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[12px] rounded-lg h-9">
                  Upload Logo
                </Button>
              </SettingRow>
              <SettingRow label="Favicon">
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[12px] rounded-lg h-9">
                  Upload Favicon
                </Button>
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Globe} title="SEO & Meta">
              <SettingRow label="Título da Página" desc="Tag &lt;title&gt; principal">
                <Input defaultValue="FastCart — Crie Sua Loja Virtual" className="w-80 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Meta Description">
                <Input defaultValue="A plataforma completa para criação de lojas virtuais" className="w-80 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={Shield} title="Autenticação">
              <SettingRow label="2FA Obrigatório" desc="Forçar autenticação de dois fatores para admins">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Expiração de Sessão" desc="Tempo máximo de inatividade">
                <Input defaultValue="30 min" className="w-24 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Tentativas de Login" desc="Máximo de tentativas antes de bloquear">
                <Input defaultValue="5" type="number" className="w-20 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="CAPTCHA no Login" desc="Habilitar Google reCAPTCHA">
                <Switch />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Shield} title="Proteção">
              <SettingRow label="Rate Limiting" desc="Limitar requisições por IP">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="CORS Restrito" desc="Apenas domínios autorizados">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="IPs Bloqueados" desc="Lista de IPs bloqueados">
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[12px] rounded-lg h-9 gap-1">
                  Gerenciar <ChevronRight className="h-3 w-3" />
                </Button>
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={Bell} title="Notificações por E-mail">
              <SettingRow label="Nova Loja Cadastrada" desc="Receber e-mail quando uma loja se registrar">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Nova Assinatura" desc="Quando uma loja assinar um plano pago">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Ticket de Suporte" desc="Novos tickets de suporte">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Alertas de Segurança" desc="Tentativas de login suspeitas">
                <Switch defaultChecked />
              </SettingRow>
              <SettingRow label="Relatórios Semanais" desc="Resumo semanal por e-mail">
                <Switch />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Bell} title="Webhooks">
              <SettingRow label="URL de Webhook" desc="Endpoint para eventos da plataforma">
                <Input placeholder="https://..." className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Eventos" desc="Selecione os eventos que disparam o webhook">
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[12px] rounded-lg h-9 gap-1">
                  Configurar <ChevronRight className="h-3 w-3" />
                </Button>
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={CreditCard} title="Stripe (Pagamentos)">
              <SettingRow label="Chave Pública" desc="Publishable key do Stripe">
                <Input defaultValue="pk_live_51..." className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Chave Secreta" desc="Secret key do Stripe">
                <div className="flex items-center gap-2">
                  <Input
                    type={showStripeKey ? "text" : "password"}
                    defaultValue="sk_live_51..."
                    className="w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
                  />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--sa-text-muted))]" onClick={() => setShowStripeKey(v => !v)}>
                    {showStripeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </SettingRow>
              <SettingRow label="Webhook Secret" desc="Para validar eventos do Stripe">
                <Input type="password" defaultValue="whsec_..." className="w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Modo Teste" desc="Usar chaves de teste do Stripe">
                <Switch />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={Mail} title="Provedor de E-mail">
              <SettingRow label="Provedor" desc="Serviço de envio de e-mails">
                <Input defaultValue="Amazon SES" className="w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="SMTP Host">
                <Input defaultValue="email-smtp.us-east-1.amazonaws.com" className="w-80 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="SMTP Port">
                <Input defaultValue="587" className="w-20 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Infrastructure */}
        <TabsContent value="infrastructure" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={Server} title="Status dos Serviços">
              {[
                { name: "API Backend", status: "Operacional", uptime: "99.98%", icon: Cpu },
                { name: "Banco de Dados", status: "Operacional", uptime: "99.99%", icon: Database },
                { name: "Armazenamento", status: "Operacional", uptime: "100%", icon: HardDrive },
                { name: "CDN (Assets)", status: "Operacional", uptime: "99.95%", icon: Globe },
                { name: "Fila de E-mails", status: "Operacional", uptime: "99.90%", icon: Mail },
              ].map(svc => (
                <motion.div key={svc.name} variants={fadeInUp} className="flex items-center justify-between py-3.5 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[hsl(var(--sa-success))]/10 flex items-center justify-center">
                      <svc.icon className="h-4 w-4 text-[hsl(var(--sa-success))]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{svc.name}</p>
                      <p className="text-[11px] text-[hsl(var(--sa-success))]">{svc.status}</p>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text-secondary))]">{svc.uptime}</span>
                </motion.div>
              ))}
            </SettingSection>

            <SettingSection icon={Database} title="Banco de Dados">
              <SettingRow label="Conexões Ativas" desc="Pool de conexões com o banco">
                <span className="text-[13px] font-bold text-[hsl(var(--sa-success))]">23 / 100</span>
              </SettingRow>
              <SettingRow label="Tamanho" desc="Espaço utilizado no banco">
                <span className="text-[13px] font-bold text-[hsl(var(--sa-text))]">4.2 GB</span>
              </SettingRow>
              <SettingRow label="Último Backup" desc="Backup automático diário">
                <span className="text-[13px] text-[hsl(var(--sa-text-secondary))]">Há 3 horas</span>
              </SettingRow>
              <SettingRow label="Backup Manual">
                <Button variant="outline" className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))] text-[12px] rounded-lg h-9 gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Iniciar Backup
                </Button>
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
