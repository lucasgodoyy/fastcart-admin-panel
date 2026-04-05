"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { superAdminService } from "@/services/super-admin";

export default function ManagerStoresPage() {
  const { data: storesData } = useQuery({
    queryKey: ["manager-stores"],
    queryFn: () => superAdminService.listStores({ size: 50 }),
  });

  const stores = storesData?.content ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lojas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral das lojas cadastradas na plataforma
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              Lojas ({storesData?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Slug</TableHead>
                  <TableHead className="text-xs">Plano</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma loja encontrada
                    </TableCell>
                  </TableRow>
                )}
                {stores.map((s) => (
                  <TableRow key={String(s.id)}>
                    <TableCell className="text-xs font-semibold">{String(s.name ?? "—")}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{String(s.slug ?? "—")}</TableCell>
                    <TableCell className="text-xs">{String(s.planName ?? "—")}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        String(s.status) === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600"
                          : String(s.status) === "PENDING" ? "bg-amber-500/10 text-amber-600"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {String(s.status) === "ACTIVE" ? "Ativa" : String(s.status) === "PENDING" ? "Pendente" : String(s.status ?? "—")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.createdAt ? new Date(String(s.createdAt)).toLocaleDateString("pt-BR") : "—"}
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
