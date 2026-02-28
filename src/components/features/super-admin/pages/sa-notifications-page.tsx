"use client";

import { motion } from "framer-motion";
import { Bell, Mail, Smartphone, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SaPageHeader, SaStatCard, SaCard, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Switch } from "@/components/ui/switch";

export function SaNotificationsPage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Notificações" description="Canais e regras de notificações da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="E-mails Hoje" value="4.2K" icon={Mail} color="info" />
        <SaStatCard title="Push Enviados" value="12.8K" icon={Smartphone} color="accent" />
        <SaStatCard title="In-App" value="8.4K" icon={Bell} color="success" />
        <SaStatCard title="Falhas" value="0.6%" icon={AlertTriangle} color="warning" />
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeInUp}>
          <SaCard>
            <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Canais Ativos</h3>
            <div className="space-y-4">
              {[
                ["E-mail transacional", "Pedidos, faturas e autenticação", true],
                ["Push notification", "Promoções e atualizações", true],
                ["Notificação in-app", "Alertas no painel", true],
                ["SMS", "Mensagens críticas", false],
              ].map(([title, subtitle, enabled]) => (
                <div key={String(title)} className="flex items-center justify-between border-b border-[hsl(var(--sa-border-subtle))] pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{title}</p>
                    <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{subtitle}</p>
                  </div>
                  <Switch defaultChecked={Boolean(enabled)} />
                </div>
              ))}
            </div>
          </SaCard>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <SaCard>
            <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Eventos</h3>
            <div className="space-y-3">
              {[
                "Nova assinatura confirmada",
                "Falha de pagamento recorrente",
                "Ticket de suporte criado",
                "Limite de API atingido",
                "Alerta de segurança (login suspeito)",
              ].map((event) => (
                <div key={event} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-bg))] px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--sa-success))]" />
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{event}</span>
                </div>
              ))}
            </div>
          </SaCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
