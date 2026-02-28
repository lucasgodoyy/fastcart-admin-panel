"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Crown,
  Gem,
  Rocket,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Shield,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ── Types ── */
interface CurrentSubscription {
  subscriptionId: number;
  planId: number;
  planName: string;
  planSlug: string;
  planPriceCents: number;
  currency: string;
  billingPeriod: string;
  status: string;
  features: string[];
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  canceledAt: string | null;
  createdAt: string;
}

interface AvailablePlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  isPopular: boolean;
  maxStores: number;
  maxProducts: number | null;
  features: string[];
  isCurrent: boolean;
}

interface StoreBillingResponse {
  currentSubscription: CurrentSubscription | null;
  availablePlans: AvailablePlan[];
}

/* ── Helpers ── */
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
}
function planIcon(slug: string) {
  switch (slug) {
    case "free": return Sparkles;
    case "basic": return Rocket;
    case "pro": return Crown;
    case "business": return Gem;
    default: return CreditCard;
  }
}
function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE": return { text: "Ativo", variant: "default" as const };
    case "TRIALING": return { text: "Trial", variant: "secondary" as const };
    case "PAST_DUE": return { text: "Pagamento pendente", variant: "destructive" as const };
    case "CANCELED": return { text: "Cancelado", variant: "destructive" as const };
    case "PAUSED": return { text: "Pausado", variant: "secondary" as const };
    default: return { text: status, variant: "outline" as const };
  }
}

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function BillingClient() {
  const { data: billing, isLoading } = useQuery({
    queryKey: ["admin-billing"],
    queryFn: async (): Promise<StoreBillingResponse> => {
      const res = await apiClient.get<StoreBillingResponse>("/admin/billing");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Não foi possível carregar informações de faturamento.</p>
      </div>
    );
  }

  const current = billing.currentSubscription;
  const plans = billing.availablePlans;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Plano</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua assinatura e veja os planos disponíveis.
        </p>
      </div>

      {/* Current subscription card */}
      {current ? (
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Assinatura Atual
                </CardTitle>
                <Badge variant={statusLabel(current.status).variant}>
                  {statusLabel(current.status).text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plano</p>
                  <p className="text-lg font-bold">{current.planName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valor</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(current.planPriceCents)}<span className="text-xs font-normal text-muted-foreground">/{current.billingPeriod === "MONTHLY" ? "mês" : "ano"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Próxima cobrança
                  </p>
                  <p className="text-sm font-medium">{formatDate(current.currentPeriodEnd)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cliente desde</p>
                  <p className="text-sm font-medium">{formatDate(current.createdAt)}</p>
                </div>
              </div>

              {current.features.length > 0 && (
                <div className="mt-5 pt-5 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recursos inclusos</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {current.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Você ainda não possui uma assinatura ativa.</p>
              <p className="text-xs text-muted-foreground mt-1">Escolha um plano abaixo para começar.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Available plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Planos Disponíveis</h2>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {plans.map((plan) => {
            const Icon = planIcon(plan.slug);
            return (
              <motion.div key={plan.id} variants={fadeInUp}>
                <Card
                  className={`relative h-full transition-all duration-200 hover:shadow-md ${
                    plan.isCurrent
                      ? "border-primary ring-1 ring-primary/20"
                      : plan.isPopular
                        ? "border-primary/40"
                        : ""
                  }`}
                >
                  {plan.isPopular && !plan.isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground">
                      MAIS POPULAR
                    </div>
                  )}
                  {plan.isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 py-0.5 text-[10px] font-bold text-white">
                      SEU PLANO
                    </div>
                  )}

                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-base font-bold">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold">{formatCurrency(plan.priceCents)}</span>
                        <span className="text-xs text-muted-foreground">/{plan.billingPeriod === "MONTHLY" ? "mês" : "ano"}</span>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs">
                          <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t">
                      {plan.isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          Plano atual
                        </Button>
                      ) : (
                        <Button
                          variant={plan.isPopular ? "default" : "outline"}
                          className="w-full"
                        >
                          {current && plan.priceCents > current.planPriceCents
                            ? "Fazer upgrade"
                            : current
                              ? "Alterar plano"
                              : "Começar agora"
                          }
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Help note */}
      <div className="text-center text-xs text-muted-foreground pb-8">
        <p>Precisa de um plano personalizado? <span className="text-primary font-medium cursor-pointer hover:underline">Fale conosco</span></p>
      </div>
    </div>
  );
}
