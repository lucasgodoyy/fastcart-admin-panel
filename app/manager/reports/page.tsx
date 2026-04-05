"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, DollarSign, ShoppingBag, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { superAdminService } from "@/services/super-admin";

export default function ManagerReportsPage() {
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ["manager-reports"],
    queryFn: superAdminService.getOverview,
  });

  const { data: subsStats } = useQuery({
    queryKey: ["manager-reports-subs"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Métricas consolidadas da plataforma
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          { title: "Lojas Totais", value: String(overviewData?.totalStores ?? 0), icon: Store, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Lojas Ativas", value: String(overviewData?.activeStores ?? 0), icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Total Assinantes", value: String(subsStats?.totalSubscriptions ?? 0), icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
          { title: "Usuários Totais", value: String(overviewData?.totalUsers ?? 0), icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "Tickets Suporte", value: String(overviewData?.totalSupportTickets ?? 0), icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Tickets Abertos", value: String(overviewData?.openSupportTickets ?? 0), icon: BarChart3, color: "text-pink-500", bg: "bg-pink-500/10" },
        ].map((s) => (
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações</CardTitle>
          <CardDescription>Informações sobre os relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Os dados exibidos aqui são os mesmos disponíveis no dashboard do Super Admin.
            Como gerente, você tem acesso de leitura a estas métricas para acompanhar
            o desempenho geral da plataforma. Para relatórios detalhados e exportação
            de dados, entre em contato com o Super Admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
