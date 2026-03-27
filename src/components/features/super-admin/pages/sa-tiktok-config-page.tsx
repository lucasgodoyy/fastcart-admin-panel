"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
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
import tiktokAdsService from "@/services/tiktokAdsService";
import type { PlatformTikTokConfig, PlatformTikTokConfigRequest } from "@/services/tiktokAdsService";

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
          <div className="h-8 w-8 rounded-lg bg-zinc-900/10 dark:bg-zinc-100/10 flex items-center justify-center">
            <span className="text-base font-bold">T</span>
          </div>
          <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">{title}</h3>
        </div>
        {children}
      </SaCard>
    </motion.div>
  );
}

export function SaTikTokConfigPage() {
  const queryClient = useQueryClient();
  const [showAppSecret, setShowAppSecret] = useState(false);

  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [oauthRedirectUri, setOauthRedirectUri] = useState("");
  const [active, setActive] = useState(false);

  const { data: config, isLoading } = useQuery<PlatformTikTokConfig>({
    queryKey: ["sa-tiktok-config"],
    queryFn: tiktokAdsService.getPlatformConfig,
    retry: false,
  });

  useEffect(() => {
    if (config) {
      setAppId(config.appId ?? "");
      setAppSecret(config.appSecret ?? "");
      setOauthRedirectUri(config.oauthRedirectUri ?? "");
      setActive(config.active ?? false);
    }
  }, [config]);

  const saveMut = useMutation({
    mutationFn: (req: PlatformTikTokConfigRequest) => tiktokAdsService.savePlatformConfig(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-tiktok-config"] });
      toast.success("Configurações TikTok salvas com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar configurações."),
  });

  const handleSave = () => {
    saveMut.mutate({ appId, appSecret, oauthRedirectUri, active });
  };

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="TikTok for Business"
        description="Credenciais do TikTok App para a plataforma — usadas por todas as lojas via OAuth."
        actions={
          <Button
            onClick={handleSave}
            disabled={saveMut.isPending}
            className="bg-linear-to-r from-zinc-800 to-zinc-700 text-white rounded-lg gap-2 text-[12px] shadow-lg shadow-zinc-600/25 hover:opacity-90"
          >
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <SettingSection title="Credenciais do App">
          <SettingRow label="TikTok App ID" desc="ID do App criado no TikTok for Developers">
            <Input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder={isLoading ? "Carregando..." : "Ex: 1234567890123456"}
              className="w-full sm:w-64 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
            />
          </SettingRow>

          <SettingRow label="App Secret" desc="Secret do App TikTok (nunca expor ao cliente)">
            <div className="flex items-center gap-2 w-full sm:w-64">
              <Input
                type={showAppSecret ? "text" : "password"}
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="••••••••••••••"
                className="flex-1 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
              />
              <button
                onClick={() => setShowAppSecret(!showAppSecret)}
                className="text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] transition-colors p-1"
              >
                {showAppSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </SettingRow>

          <SettingRow label="OAuth Redirect URI" desc="URL de callback para o fluxo de autorização OAuth 2.0">
            <Input
              value={oauthRedirectUri}
              onChange={(e) => setOauthRedirectUri(e.target.value)}
              placeholder="https://app.rapidocart.com.br/admin/tiktok/callback"
              className="w-full sm:w-80 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] text-[12px] rounded-lg h-9 font-mono"
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title="Status">
          <SettingRow label="Ativo" desc="Habilitar integração TikTok for Business para todas as lojas">
            <Switch checked={active} onCheckedChange={setActive} />
          </SettingRow>
        </SettingSection>

        <motion.div variants={fadeInUp}>
          <SaCard>
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <h3 className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">Links Úteis</h3>
            </div>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <a
                  href="https://business-api.tiktok.com/portal/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  TikTok Marketing API Docs →
                </a>
              </li>
              <li>
                <a
                  href="https://developers.tiktok.com/apps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  TikTok Developer Portal →
                </a>
              </li>
            </ul>
          </SaCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
