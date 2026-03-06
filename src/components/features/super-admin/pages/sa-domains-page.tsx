"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Globe, ShieldCheck, Link2, Loader2, Store, ExternalLink } from "lucide-react";
import { SaPageHeader, SaCard, SaStatCard, SaStatusBadge, SaSkeleton, fadeInUp, staggerContainer } from "../ui/sa-components";
import { Button } from "@/components/ui/button";
import superAdminService from "@/services/super-admin/superAdminService";

const statusMap = {
  ACTIVE: { label: "Ativo", color: "success" },
  PENDING: { label: "Pendente", color: "warning" },
  INACTIVE: { label: "Inativo", color: "danger" },
  CONFIG: { label: "Configuração", color: "warning" },
} as const;

export function SaDomainsPage() {
  const { data: storesData, isLoading } = useQuery({
    queryKey: ["sa-stores-domains"],
    queryFn: () => superAdminService.listStores({ size: 200 }),
  });

  const allStores = storesData?.content ?? [];
  // Stores with custom domains
  const storesWithDomains = allStores.filter(s => s.customDomain);
  // Stores without custom domains
  const storesWithoutDomains = allStores.filter(s => !s.customDomain);

  // Platform domains (always present)
  const platformDomains = [
    { host: "lojaki.com", type: "Plataforma", ssl: "Válido", status: "ACTIVE" as const },
    { host: "admin.lojaki.com", type: "Admin Panel", ssl: "Válido", status: "ACTIVE" as const },
    { host: "api.lojaki.com", type: "API", ssl: "Válido", status: "ACTIVE" as const },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SaPageHeader title="Domínios" description="Gerenciamento de domínios e SSL da plataforma" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <SaSkeleton key={i} className="h-32" />)}
        </div>
        <SaSkeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SaPageHeader title="Domínios" description="Gerenciamento de domínios e SSL da plataforma" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SaStatCard title="Domínios Plataforma" value={String(platformDomains.length)} icon={Globe} color="accent" />
        <SaStatCard title="Domínios Customizados" value={String(storesWithDomains.length)} icon={Link2} color="info" subtitle={`de ${allStores.length} lojas`} />
        <SaStatCard title="Sem Domínio Custom" value={String(storesWithoutDomains.length)} icon={Store} color="warning" />
      </motion.div>

      {/* Platform Domains */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">Domínios da Plataforma</h3>
          <div className="space-y-3">
            {platformDomains.map((d) => (
              <div key={d.host} className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{d.host}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">{d.type}</span>
                      <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">•</span>
                      <span className="text-[10px] text-[hsl(var(--sa-success))]">
                        <ShieldCheck className="h-3 w-3 inline mr-0.5" />SSL {d.ssl}
                      </span>
                    </div>
                  </div>
                </div>
                <SaStatusBadge status={d.status} map={statusMap} />
              </div>
            ))}
          </div>
        </SaCard>
      </motion.div>

      {/* Store Custom Domains */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">
            Domínios Personalizados das Lojas ({storesWithDomains.length})
          </h3>
          {storesWithDomains.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-[hsl(var(--sa-text-muted))]">
              Nenhuma loja possui domínio personalizado configurado.
            </div>
          ) : (
            <div className="space-y-3">
              {storesWithDomains.map((store) => (
                <div key={store.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link2 className="h-4 w-4 text-[hsl(var(--sa-info))]" />
                    <div>
                      <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{store.customDomain}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Loja: {store.name}</span>
                        <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">•</span>
                        <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">{store.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SaStatusBadge status={store.active ? "ACTIVE" : "INACTIVE"} map={statusMap} />
                    <a
                      href={`https://${store.customDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-accent))] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SaCard>
      </motion.div>

      {/* Stores without custom domain */}
      {storesWithoutDomains.length > 0 && (
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <SaCard>
            <h3 className="mb-4 text-[14px] font-bold text-[hsl(var(--sa-text))]">
              Lojas sem Domínio Personalizado ({storesWithoutDomains.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {storesWithoutDomains.slice(0, 20).map((store) => (
                <div key={store.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--sa-border-subtle))] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 text-[hsl(var(--sa-text-muted))]" />
                    <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{store.name}</span>
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">({store.slug})</span>
                  </div>
                  <SaStatusBadge status={store.active ? "ACTIVE" : "INACTIVE"} map={statusMap} />
                </div>
              ))}
              {storesWithoutDomains.length > 20 && (
                <p className="text-center text-[11px] text-[hsl(var(--sa-text-muted))] pt-2">
                  Mostrando 20 de {storesWithoutDomains.length} lojas
                </p>
              )}
            </div>
          </SaCard>
        </motion.div>
      )}
    </div>
  );
}
