"use client";

import { motion } from "framer-motion";
import { Globe, ShieldCheck, Link2 } from "lucide-react";
import { SaPageHeader, SaCard, SaStatusBadge, fadeInUp, staggerContainer } from "../ui/sa-components";

const domains = [
  { host: "fastcart.com", ssl: "VALID", status: "ACTIVE" },
  { host: "admin.fastcart.com", ssl: "VALID", status: "ACTIVE" },
  { host: "api.fastcart.com", ssl: "VALID", status: "ACTIVE" },
  { host: "staging.fastcart.com", ssl: "PENDING", status: "CONFIG" },
];

const map = {
  ACTIVE: { label: "Ativo", color: "success" },
  CONFIG: { label: "Configuração", color: "warning" },
} as const;

export function SaDomainsPage() {
  return (
    <div className="space-y-8">
      <SaPageHeader title="Domínios" description="Gerenciamento de domínios e SSL da plataforma" />
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
        {domains.map((d) => (
          <motion.div key={d.host} variants={fadeInUp}>
            <SaCard>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[hsl(var(--sa-text))]">{d.host}</p>
                  <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">SSL: {d.ssl}</p>
                </div>
                <SaStatusBadge status={d.status} map={map} />
              </div>
            </SaCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
