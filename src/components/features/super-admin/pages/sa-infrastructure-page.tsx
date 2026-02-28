"use client";

import { motion } from "framer-motion";
import { Server, Database, Cpu, HardDrive } from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, staggerContainer, fadeInUp } from "../ui/sa-components";

export function SaInfrastructurePage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Infraestrutura" description="Saúde dos serviços e capacidade operacional" />
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="API Uptime" value="99.98%" icon={Server} color="success" />
        <SaStatCard title="DB Latência" value="23ms" icon={Database} color="info" />
        <SaStatCard title="CPU Médio" value="37%" icon={Cpu} color="warning" />
        <SaStatCard title="Storage" value="4.2/20GB" icon={HardDrive} color="accent" />
      </motion.div>
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Serviços</h3>
          <div className="space-y-3">
            {[
              ["Backend API", "Operacional"],
              ["Worker de E-mails", "Operacional"],
              ["Fila de Eventos", "Operacional"],
              ["CDN", "Operacional"],
            ].map(([service, status]) => (
              <div key={String(service)} className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] px-3 py-2">
                <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{service}</span>
                <span className="text-[11px] font-semibold text-[hsl(var(--sa-success))]">{status}</span>
              </div>
            ))}
          </div>
        </SaCard>
      </motion.div>
    </div>
  );
}
