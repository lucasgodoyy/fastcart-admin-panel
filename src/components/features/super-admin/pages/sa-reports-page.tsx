"use client";

import { motion } from "framer-motion";
import { FileText, Download, CalendarRange } from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, staggerContainer, fadeInUp } from "../ui/sa-components";
import { Button } from "@/components/ui/button";

export function SaReportsPage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Relatórios" description="Exportações e relatórios executivos da plataforma" />
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SaStatCard title="Relatórios Gerados" value="184" icon={FileText} color="accent" />
        <SaStatCard title="Exportações (CSV)" value="96" icon={Download} color="info" />
        <SaStatCard title="Período Atual" value="30 dias" icon={CalendarRange} color="success" />
      </motion.div>
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2">
        {[
          "Receita por período",
          "Crescimento de lojas",
          "Churn de assinaturas",
          "Performance de afiliados",
        ].map((name) => (
          <SaCard key={name}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{name}</span>
              <Button size="sm" className="h-8 rounded-lg text-[11px] bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface))]">
                Exportar
              </Button>
            </div>
          </SaCard>
        ))}
      </motion.div>
    </div>
  );
}
