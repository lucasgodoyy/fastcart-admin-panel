"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { superAdminService } from "@/services/super-admin";

export default function ManagerDashboard() {
  const { data: overviewData, isLoading } = useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: superAdminService.getOverview,
  });

  const { data: subsStats } = useQuery({
    queryKey: ["manager-sub-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const stats = [
    {
      title: "Lojas Ativas",
      value: String(overviewData?.activeStores ?? 0),
      icon: Store,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total de Lojas",
      value: String(overviewData?.totalStores ?? 0),
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Usuários Ativos",
      value: String(overviewData?.activeUsers ?? 0),
      icon: DollarSign,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      title: "Tickets Abertos",
      value: String(overviewData?.openSupportTickets ?? 0),
      icon: ShoppingBag,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Assinantes",
      value: String(subsStats?.totalSubscriptions ?? 0),
      icon: TrendingUp,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      title: "Total Usuários",
      value: String(overviewData?.totalUsers ?? 0),
      icon: CreditCard,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel do Gerente</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da plataforma — dados de vendas, lojas e assinaturas
        </p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stats.map((s) => (
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

      {/* Info Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sobre o Painel do Gerente</CardTitle>
            <CardDescription>O que você pode acessar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Dashboard com métricas gerais da plataforma",
              "Visão de vendas, receita e crescimento",
              "Lista de lojas e seus status",
              "Visão geral de assinaturas e faturamento",
              "Acesso ao suporte para resolver questões",
              "Programa de afiliados — acompanhamento de parceiros",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 text-sm">✓</span>
                <p className="text-xs text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Limitações</CardTitle>
            <CardDescription>Itens restritos ao Super Admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Configurações da plataforma e integrações",
              "Segurança, infraestrutura e logs de erro",
              "API Keys e configurações de terceiros",
              "Aparência e temas do super admin",
              "Gestão de roles e permissões de usuários",
              "Backlog e roadmap de desenvolvimento",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-500 text-sm">✗</span>
                <p className="text-xs text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
