"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Link2,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Percent,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import affiliateService from "@/services/affiliateService";

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function AffiliateDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["affiliate-my-stats"],
    queryFn: affiliateService.getStats,
  });

  const { data: linksData } = useQuery({
    queryKey: ["affiliate-my-links"],
    queryFn: () => affiliateService.listLinks({ size: 5 }),
  });

  const { data: conversionsData } = useQuery({
    queryKey: ["affiliate-my-conversions"],
    queryFn: () => affiliateService.listConversions({ size: 5 }),
  });

  const links = linksData?.content ?? [];
  const conversions = conversionsData?.content ?? [];

  const statCards = [
    {
      title: "Cliques Totais",
      value: stats?.totalClicks?.toLocaleString("pt-BR") ?? "0",
      icon: MousePointerClick,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Conversões",
      value: String(stats?.totalConversions ?? 0),
      icon: ShoppingBag,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Receita Gerada",
      value: fmtMoney(stats?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Comissões Totais",
      value: fmtMoney(stats?.totalCommission ?? 0),
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Pendente Pagamento",
      value: fmtMoney(stats?.pendingCommission ?? 0),
      icon: Calendar,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Taxa de Conversão",
      value: `${(stats?.conversionRate ?? 0).toFixed(1)}%`,
      icon: Percent,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel do Afiliado</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe seus resultados, links e comissões em tempo real
        </p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {isLoading ? "..." : s.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Recent links & conversions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Links */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Links Recentes
              </CardTitle>
              <CardDescription>Seus últimos links de afiliado</CardDescription>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhum link criado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {links.map((lk) => (
                    <div
                      key={lk.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-semibold text-primary truncate">
                          /{lk.slug}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lk.destinationUrl || lk.targetUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold">{lk.totalClicks ?? lk.clicks}</p>
                          <p className="text-[10px] text-muted-foreground">cliques</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-600">{lk.totalConversions ?? lk.conversions}</p>
                          <p className="text-[10px] text-muted-foreground">conv.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Conversions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                Conversões Recentes
              </CardTitle>
              <CardDescription>Últimas vendas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {conversions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Nenhuma conversão registrada ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {conversions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-xs font-semibold">
                          Pedido #{c.orderId ?? "—"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600">
                          {fmtMoney(c.commissionAmount)}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            c.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : c.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {c.status === "APPROVED" ? "Aprovada" : c.status === "PENDING" ? "Pendente" : "Rejeitada"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
