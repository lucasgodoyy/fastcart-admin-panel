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
  BarChart3,
  Send,
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
import { useState, useEffect } from "react";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import superAdminService from "@/services/super-admin/superAdminService";
import { toast } from "sonner";

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

export function SaSettingsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/settings", { general: "", integrations: "integrations" }, "general");
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

  useEffect(() => {
    if (settings) {
      setPlatformName(settings.platformName ?? "");
      setSupportEmail(settings.supportEmail ?? "");
      setMaintenanceMode(settings.maintenanceMode ?? false);
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
          <Button onClick={handleSave} className="bg-linear-to-r from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-[hsl(var(--sa-accent))]/25 hover:opacity-90">
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-lg p-1 flex-wrap h-auto">
          {[
            { value: "general", icon: Globe, label: "Geral" },
            { value: "integrations", icon: Server, label: "Integrações" },
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
                <Input value={platformName} onChange={e => setPlatformName(e.target.value)} placeholder={isLoading ? 'Carregando...' : ''} className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="URL Principal" desc="Domínio principal da plataforma">
                <Input defaultValue="https://rapidocart.com.br" className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Moeda Padrão" desc="Moeda utilizada nas transações">
                <Input defaultValue="BRL (R$)" disabled className="w-full sm:w-32 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] text-[12px] rounded-lg h-9" />
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
                <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder={isLoading ? 'Carregando...' : ''} className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="E-mail do Remetente" desc="From address para e-mails automáticos">
                <Input defaultValue="noreply@rapidocart.com.br" className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9" />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <SettingSection icon={CreditCard} title="Stripe (Pagamentos)">
              <SettingRow label="Chave Pública" desc="Publishable key do Stripe">
                <Input defaultValue="pk_live_51..." className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Chave Secreta" desc="Secret key do Stripe">
                <div className="flex items-center gap-2">
                  <Input
                    type={showStripeKey ? "text" : "password"}
                    defaultValue="sk_live_51..."
                    className="w-full sm:w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
                  />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--sa-text-muted))]" onClick={() => setShowStripeKey(v => !v)}>
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

            <SettingSection icon={Mail} title="E-mail (Resend)">
              <SettingRow label="Provedor" desc="Serviço de envio de e-mails transacionais">
                <Input defaultValue="Resend" disabled className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="API Key" desc="Chave de API do Resend">
                <Input type="password" placeholder="re_xxxxxxxxx" className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Domínio Verificado" desc="Domínio configurado no Resend">
                <Input defaultValue="rapidocart.com.br" disabled className="w-full sm:w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-muted))] text-[12px] rounded-lg h-9" />
              </SettingRow>
              <SettingRow label="Enviar E-mail de Teste" desc="Verifica se o Resend está configurado corretamente">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-[12px] h-9"
                  onClick={async () => {
                    try {
                      const result = await superAdminService.sendPlatformEmail({
                        to: settings?.supportEmail || 'admin@lojaki.store',
                        subject: '[Lojaki] E-mail de teste — Resend OK ?',
                        bodyHtml: '<h2>E-mail de teste</h2><p>Se você está lendo isso, o Resend está configurado corretamente!</p><p><small>Enviado em: ' + new Date().toLocaleString('pt-BR') + '</small></p>',
                      });
                      if (result.status === 'SENT') {
                        toast.success('E-mail de teste enviado com sucesso!');
                      } else {
                        toast.error('Falha ao enviar e-mail de teste.');
                      }
                    } catch {
                      toast.error('Erro ao enviar e-mail de teste. Verifique a API Key do Resend.');
                    }
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Enviar teste
                </Button>
              </SettingRow>
            </SettingSection>

            <SettingSection icon={BarChart3} title="Google Analytics">
              <SettingRow label="Measurement ID" desc="ID de mensuração do GA4 (ex: G-XXXXXXXXXX)">
                <Input placeholder="G-XXXXXXXXXX" className="w-full sm:w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Ativo" desc="Injetar script do GA4 na landing page e lojas">
                <Switch />
              </SettingRow>
            </SettingSection>

            <SettingSection icon={BarChart3} title="Facebook Pixel">
              <SettingRow label="Pixel ID" desc="ID do Pixel do Facebook (ex: 123456789012345)">
                <Input placeholder="123456789012345" className="w-full sm:w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono" />
              </SettingRow>
              <SettingRow label="Ativo" desc="Injetar script do Pixel na landing page e lojas">
                <Switch />
              </SettingRow>
            </SettingSection>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
