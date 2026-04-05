"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { superAdminService } from "@/services/super-admin";

export default function ManagerSubscriptionsPage() {
  const { data: subsData } = useQuery({
    queryKey: ["manager-subscriptions"],
    queryFn: () => superAdminService.listSubscriptions({ size: 50 }),
  });

  const { data: subsStats } = useQuery({
    queryKey: ["manager-subs-stats"],
    queryFn: superAdminService.getSubscriptionStats,
  });

  const subscribers = subsData?.content ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assinaturas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral das assinaturas e faturamento
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Assinantes Ativos</p>
                <p className="text-2xl font-bold">{subsStats?.activeSubscriptions ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold text-emerald-600">{subsStats?.activeSubscriptions ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Assinantes</p>
                <p className="text-2xl font-bold text-violet-600">{subsStats?.totalSubscriptions ?? 0}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <DollarSign className="h-5 w-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Assinantes ({subsData?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Loja</TableHead>
                  <TableHead className="text-xs">Plano</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum assinante encontrado
                    </TableCell>
                  </TableRow>
                )}
                {subscribers.map((sub) => (
                  <TableRow key={String(sub.id)}>
                    <TableCell className="text-xs font-semibold">{String(sub.storeName ?? "—")}</TableCell>
                    <TableCell className="text-xs">{String(sub.planName ?? "—")}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        String(sub.status) === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600"
                          : String(sub.status) === "TRIAL" ? "bg-blue-500/10 text-blue-600"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {String(sub.status) === "ACTIVE" ? "Ativo" : String(sub.status) === "TRIAL" ? "Trial" : String(sub.status ?? "—")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.createdAt ? new Date(String(sub.createdAt)).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
