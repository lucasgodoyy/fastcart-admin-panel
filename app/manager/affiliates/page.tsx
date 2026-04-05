"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Handshake, Users, DollarSign, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { superAdminService } from "@/services/super-admin";

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function ManagerAffiliatesPage() {
  const { data: stats } = useQuery({
    queryKey: ["manager-affiliate-stats"],
    queryFn: superAdminService.getAffiliateStats,
  });

  const { data: affiliatesData } = useQuery({
    queryKey: ["manager-affiliates"],
    queryFn: () => superAdminService.listAffiliates({ size: 50 }),
  });

  const partners = affiliatesData?.content ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Afiliados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe o desempenho do programa de afiliados
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Parceiros Ativos</p>
            <p className="text-2xl font-bold mt-1">{stats?.activeAffiliates ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Receita via Afiliados</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{fmtMoney(stats?.totalRevenue ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Comissões Totais</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{fmtMoney(stats?.totalCommission ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{(stats?.conversionRate ?? 0).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Handshake className="h-4 w-4 text-primary" />
              Parceiros Afiliados ({affiliatesData?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Parceiro</TableHead>
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs text-right">Cliques</TableHead>
                  <TableHead className="text-xs text-right">Conversões</TableHead>
                  <TableHead className="text-xs text-right">Comissão Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum afiliado encontrado
                    </TableCell>
                  </TableRow>
                )}
                {partners.map((p) => (
                  <TableRow key={String(p.id)}>
                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold">{String(p.name)}</p>
                        <p className="text-[10px] text-muted-foreground">{String(p.email)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-primary">{String(p.referralCode)}</TableCell>
                    <TableCell className="text-xs text-right">{Number(p.totalClicks ?? 0).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-xs font-bold text-right">{Number(p.totalOrders ?? 0)}</TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600 text-right">
                      {fmtMoney(Number(p.totalCommission ?? 0))}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        String(p.status) === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600"
                          : String(p.status) === "PENDING" ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {String(p.status) === "ACTIVE" ? "Ativo" : String(p.status) === "PENDING" ? "Pendente" : String(p.status)}
                      </span>
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
