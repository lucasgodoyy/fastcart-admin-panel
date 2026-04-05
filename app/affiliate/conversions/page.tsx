"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import affiliateService from "@/services/affiliateService";

const fmtMoney = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export default function AffiliateConversionsPage() {
  const { data: conversionsData } = useQuery({
    queryKey: ["affiliate-my-conversions-all"],
    queryFn: () => affiliateService.listConversions({ size: 100 }),
  });

  const conversions = conversionsData?.content ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Conversões</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe todas as vendas geradas pelos seus links
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              Conversões ({conversions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pedido</TableHead>
                  <TableHead className="text-xs">Valor da Venda</TableHead>
                  <TableHead className="text-xs">Taxa</TableHead>
                  <TableHead className="text-xs">Comissão</TableHead>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma conversão registrada ainda
                    </TableCell>
                  </TableRow>
                )}
                {conversions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs font-mono">#{c.orderId ?? "—"}</TableCell>
                    <TableCell className="text-xs">{fmtMoney(c.orderAmount)}</TableCell>
                    <TableCell className="text-xs">{c.commissionRate}%</TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600">
                      {fmtMoney(c.commissionAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600"
                          : c.status === "PENDING" ? "bg-amber-500/10 text-amber-600"
                          : c.status === "PAID" ? "bg-blue-500/10 text-blue-600"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {c.status === "APPROVED" ? "Aprovada" : c.status === "PENDING" ? "Pendente" : c.status === "PAID" ? "Paga" : "Rejeitada"}
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
