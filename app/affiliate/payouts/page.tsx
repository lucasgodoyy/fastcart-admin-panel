"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import affiliateService from "@/services/affiliateService";

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function AffiliatePayoutsPage() {
  const { data: payoutsData } = useQuery({
    queryKey: ["affiliate-my-payouts-all"],
    queryFn: () => affiliateService.listPayouts({ size: 100 }),
  });

  const { data: stats } = useQuery({
    queryKey: ["affiliate-my-stats-payouts"],
    queryFn: affiliateService.getStats,
  });

  const payouts = payoutsData?.content ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus Pagamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de pagamentos e saldo pendente
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Total Ganho</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {fmtMoney(stats?.totalCommission ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Já Pago</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {fmtMoney(stats?.paidCommission ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Pendente</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {fmtMoney(stats?.pendingCommission ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Histórico de Pagamentos ({payouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Valor</TableHead>
                  <TableHead className="text-xs">Método</TableHead>
                  <TableHead className="text-xs">Referência</TableHead>
                  <TableHead className="text-xs">Criado em</TableHead>
                  <TableHead className="text-xs">Pago em</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum pagamento registrado ainda
                    </TableCell>
                  </TableRow>
                )}
                {payouts.map((py) => (
                  <TableRow key={py.id}>
                    <TableCell className="text-xs font-bold text-emerald-600">
                      {fmtMoney(py.amount)}
                    </TableCell>
                    <TableCell className="text-xs">{py.method ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {py.reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(py.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {py.paidAt ? new Date(py.paidAt).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        py.status === "PAID" ? "bg-emerald-500/10 text-emerald-600"
                          : py.status === "PENDING" ? "bg-amber-500/10 text-amber-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {py.status === "PAID" ? "Pago" : py.status === "PENDING" ? "Pendente" : "Processando"}
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
