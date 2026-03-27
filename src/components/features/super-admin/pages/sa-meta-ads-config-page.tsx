"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Facebook, Save, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import {
  SaPageHeader,
  SaCard,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import metaAdsService from "@/services/metaAdsService";
import type { PlatformMetaConfig, PlatformMetaConfigRequest } from "@/types/meta-ads";

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

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp}>
      <SaCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
            <Facebook className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{title}</h3>
        </div>
        {children}
      </SaCard>
    </motion.div>
  );
}

export function SaMetaAdsConfigPage() {
  const queryClient = useQueryClient();
  const [showAppSecret, setShowAppSecret] = useState(false);

  // Form state
  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");
  const [defaultRedirectUri, setDefaultRedirectUri] = useState("");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  const [enabled, setEnabled] = useState(false);

  const { data: config, isLoading } = useQuery<PlatformMetaConfig>({
    queryKey: ["sa-meta-ads-config"],
    queryFn: metaAdsService.getPlatformConfig,
    retry: false,
  });

  useEffect(() => {
    if (config) {
      setMetaAppId(config.metaAppId ?? "");
      setMetaAppSecret(config.metaAppSecret ?? "");
      setDefaultRedirectUri(config.defaultRedirectUri ?? "");
      setWebhookVerifyToken(config.webhookVerifyToken ?? "");
      setEnabled(config.enabled ?? false);
    }
  }, [config]);

  const saveMut = useMutation({
    mutationFn: (req: PlatformMetaConfigRequest) => metaAdsService.savePlatformConfig(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-meta-ads-config"] });
      toast.success("Configurações Meta salvas com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar configurações."),
  });

  const handleSave = () => {
    saveMut.mutate({
      metaAppId,
      metaAppSecret,
      defaultRedirectUri,
      webhookVerifyToken,
      enabled,
    });
  };

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Meta Ads (Facebook/Instagram)"
        description="Credenciais do Meta App para a plataforma — usadas por todas as lojas via OAuth."
        actions={
          <Button
            onClick={handleSave}
            disabled={saveMut.isPending}
            className="bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-blue-600/25 hover:opacity-90"
          >
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <SettingSection title="Credenciais do App">
          <SettingRow label="Meta App ID" desc="ID do App criado no Meta for Developers">
            <Input
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
              placeholder={isLoading ? "Carregando..." : "Ex: 1234567890123456"}
              className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
            />
          </SettingRow>
          <SettingRow label="Meta App Secret" desc="Secret key do App (nunca exposta ao frontend)">
            <div className="flex items-center gap-2">
              <Input
                type={showAppSecret ? "text" : "password"}
                value={metaAppSecret}
                onChange={(e) => setMetaAppSecret(e.target.value)}
                placeholder={isLoading ? "Carregando..." : "App Secret"}
                className="w-full sm:w-56 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[hsl(var(--sa-text-muted))]"
                onClick={() => setShowAppSecret((v) => !v)}
              >
                {showAppSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </SettingRow>
        </SettingSection>

        <SettingSection title="OAuth & Webhooks">
          <SettingRow label="Redirect URI" desc="URL de callback OAuth (usado em todas as lojas)">
            <Input
              value={defaultRedirectUri}
              onChange={(e) => setDefaultRedirectUri(e.target.value)}
              placeholder="https://api.seudominio.com/api/v1/integrations/meta/callback"
              className="w-full sm:w-80 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
            />
          </SettingRow>
          <SettingRow label="Webhook Verify Token" desc="Token de verificação para o endpoint de webhooks Meta">
            <Input
              value={webhookVerifyToken}
              onChange={(e) => setWebhookVerifyToken(e.target.value)}
              placeholder="Escolha um token secreto"
              className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
            />
          </SettingRow>
          <SettingRow label="Canal Habilitado" desc="Permitir que lojistas conectem suas contas Meta">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Links Úteis">
          <div className="space-y-2">
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Meta for Developers — Apps
            </a>
            <br />
            <a
              href="https://developers.facebook.com/docs/marketing-apis/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Marketing API — Documentação
            </a>
            <br />
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Conversions API (CAPI) — Documentação
            </a>
          </div>
        </SettingSection>
      </motion.div>
    </div>
  );
}
