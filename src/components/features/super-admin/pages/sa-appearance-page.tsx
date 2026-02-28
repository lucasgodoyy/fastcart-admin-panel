"use client";

import { motion } from "framer-motion";
import { Palette, Monitor, Sparkles } from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, fadeInUp, staggerContainer } from "../ui/sa-components";

export function SaAppearancePage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Aparência" description="Branding e personalização visual da plataforma" />
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SaStatCard title="Tema Ativo" value="Dark Neon" icon={Monitor} color="accent" />
        <SaStatCard title="Variações de Marca" value="6" icon={Palette} color="info" />
        <SaStatCard title="Componentes Skinnáveis" value="42" icon={Sparkles} color="success" />
      </motion.div>
      <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-3">
        {[
          ["Primária", "hsl(var(--sa-accent))"],
          ["Info", "hsl(var(--sa-info))"],
          ["Sucesso", "hsl(var(--sa-success))"],
        ].map(([name, color]) => (
          <SaCard key={String(name)}>
            <p className="mb-2 text-[12px] text-[hsl(var(--sa-text-muted))]">{name}</p>
            <div className="h-24 rounded-xl border border-[hsl(var(--sa-border-subtle))]" style={{ background: String(color) }} />
          </SaCard>
        ))}
      </motion.div>
    </div>
  );
}
