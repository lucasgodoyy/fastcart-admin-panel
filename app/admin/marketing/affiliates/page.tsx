"use client";

import { motion } from "framer-motion";
import { AppWindow, ArrowRight, Handshake, Info, Puzzle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AffiliatesPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Handshake className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Programa de Afiliados</h1>
            <p className="text-sm text-muted-foreground">
              Em breve disponível via aplicativos externos
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h2 className="text-base font-semibold">
                Esta funcionalidade será oferecida via Apps Externos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para garantir a melhor experiência possível, o programa de afiliados para lojistas
                será integrado através de aplicativos especializados disponíveis na nossa loja de apps.
                Isso permite maior flexibilidade, funcionalidades avançadas e atualizações independentes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Puzzle className="h-5 w-5 text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold">Apps Especializados</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Conecte apps de afiliados que se integram nativamente à sua loja
              com tracking, comissões automáticas e relatórios detalhados.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <AppWindow className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold">Loja de Aplicativos</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore nosso marketplace de apps e encontre a melhor solução
              de afiliados para o seu tipo de negócio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/apps">
            <Button className="gap-2">
              <AppWindow className="h-4 w-4" />
              Explorar Aplicativos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
