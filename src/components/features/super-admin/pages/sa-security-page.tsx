"use client";

import { motion } from "framer-motion";
import { Shield, KeyRound, Lock, AlertTriangle, UserCheck } from "lucide-react";
import { SaPageHeader, SaStatCard, SaCard, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Switch } from "@/components/ui/switch";

export function SaSecurityPage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Segurança" description="Controles de acesso, autenticação e proteção da plataforma" />
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="2FA Aderência" value="92%" icon={KeyRound} color="success" />
        <SaStatCard title="Sessões Ativas" value="48" icon={UserCheck} color="info" />
        <SaStatCard title="Alertas (24h)" value="7" icon={AlertTriangle} color="warning" />
        <SaStatCard title="Tentativas Bloqueadas" value="132" icon={Lock} color="danger" />
      </motion.div>
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Políticas</h3>
          <div className="space-y-4">
            {[
              ["2FA obrigatório para admins", true],
              ["Rotação de senha a cada 90 dias", true],
              ["Bloqueio por tentativas de login", true],
              ["Whitelist de IP para super admins", false],
            ].map(([name, enabled]) => (
              <div key={String(name)} className="flex items-center justify-between border-b border-[hsl(var(--sa-border-subtle))] pb-3 last:border-0 last:pb-0">
                <span className="text-[13px] text-[hsl(var(--sa-text-secondary))]">{name}</span>
                <Switch defaultChecked={Boolean(enabled)} />
              </div>
            ))}
          </div>
        </SaCard>
      </motion.div>
    </div>
  );
}
