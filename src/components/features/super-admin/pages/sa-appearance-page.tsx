"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Monitor, Check } from "lucide-react";
import { SaPageHeader, SaCard, fadeInUp, staggerContainer } from "../ui/sa-components";

const THEMES = [
  {
    id: "dark-neon",
    name: "Dark Neon",
    description: "Neon verde com fundo escuro — o padrão da plataforma.",
    accent: "161 94% 44%",
    info: "262 83% 58%",
    bg: "240 10% 4%",
    surface: "240 7% 8%",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Azul ciano sobre marinho profundo — moderno e tech.",
    accent: "199 89% 48%",
    info: "217 91% 60%",
    bg: "222 47% 6%",
    surface: "222 38% 11%",
  },
  {
    id: "forest",
    name: "Midnight Forest",
    description: "Esmeralda sobre preto — discreto e sofisticado.",
    accent: "142 76% 46%",
    info: "158 64% 45%",
    bg: "160 20% 4%",
    surface: "160 14% 9%",
  },
] as const;

function getStoredTheme(): string {
  if (typeof window === "undefined") return "dark-neon";
  return localStorage.getItem("sa-admin-theme") || "dark-neon";
}

export function SaAppearancePage() {
  const [activeTheme, setActiveTheme] = useState(getStoredTheme);

  useEffect(() => {
    setActiveTheme(getStoredTheme());
  }, []);

  const applyTheme = (themeId: string) => {
    localStorage.setItem("sa-admin-theme", themeId);
    setActiveTheme(themeId);
    window.dispatchEvent(new CustomEvent("sa-theme-change", { detail: themeId }));
  };

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Aparência"
        description="Escolha o tema visual do painel Super Admin"
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <motion.div key={theme.id} variants={fadeInUp}>
              <button
                onClick={() => applyTheme(theme.id)}
                className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sa-accent))] rounded-2xl"
              >
                <SaCard
                  className={`relative transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-[hsl(var(--sa-accent))] shadow-lg shadow-[hsl(var(--sa-accent))]/10"
                      : "hover:border-[hsl(var(--sa-text-muted))/0.3]"
                  }`}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--sa-accent))] shadow-md">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  {/* Theme preview swatches */}
                  <div className="mb-4 flex gap-2">
                    <div
                      className="h-16 flex-1 rounded-lg border border-white/5"
                      style={{ background: `hsl(${theme.bg})` }}
                    />
                    <div
                      className="h-16 w-12 rounded-lg border border-white/5"
                      style={{ background: `hsl(${theme.surface})` }}
                    />
                    <div
                      className="h-16 w-8 rounded-lg"
                      style={{ background: `hsl(${theme.accent})` }}
                    />
                    <div
                      className="h-16 w-6 rounded-lg"
                      style={{ background: `hsl(${theme.info})` }}
                    />
                  </div>

                  {/* Theme info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[14px] font-bold text-[hsl(var(--sa-text))]">
                        {theme.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[hsl(var(--sa-text-muted))]">
                        {theme.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="shrink-0 rounded-full bg-[hsl(var(--sa-accent-subtle))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--sa-accent))]">
                        Ativo
                      </span>
                    )}
                  </div>

                  {/* Color row */}
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Cores:</span>
                    {[theme.accent, theme.info, theme.bg, theme.surface].map((c, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border border-white/10"
                        style={{ background: `hsl(${c})` }}
                      />
                    ))}
                  </div>
                </SaCard>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Live palette preview */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
            <h3 className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">Paleta do tema ativo</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {[
              ["Accent", "--sa-accent"],
              ["Info", "--sa-info"],
              ["Success", "--sa-success"],
              ["Warning", "--sa-warning"],
              ["Danger", "--sa-danger"],
              ["Surface", "--sa-surface"],
            ].map(([label, v]) => (
              <div key={v} className="space-y-1.5">
                <div
                  className="h-12 rounded-lg border border-[hsl(var(--sa-border-subtle))]"
                  style={{ background: `hsl(var(${v}))` }}
                />
                <p className="text-center text-[10px] font-medium text-[hsl(var(--sa-text-muted))]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </SaCard>
      </motion.div>
    </div>
  );
}
