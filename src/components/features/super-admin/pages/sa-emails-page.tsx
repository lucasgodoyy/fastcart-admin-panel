"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Mail,
  Search,
  FileText,
  Settings,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { superAdminService } from "@/services/super-admin";

const statusBadge: Record<string, { label: string; color: string }> = {
  SENT: { label: "Enviado", color: "success" },
  FAILED: { label: "Falhou", color: "danger" },
  PENDING: { label: "Pendente", color: "warning" },
};

const mockTemplates = [
  { id: 1, name: "Boas-vindas", key: "welcome", lastEdited: "2 dias atrás", sends: 1240 },
  { id: 2, name: "Confirmação de Pedido", key: "order_confirmation", lastEdited: "1 semana", sends: 3450 },
  { id: 3, name: "Recuperação de Carrinho", key: "cart_recovery", lastEdited: "3 dias", sends: 890 },
  { id: 4, name: "Reset de Senha", key: "password_reset", lastEdited: "1 mês", sends: 456 },
  { id: 5, name: "Envio Realizado", key: "shipping_update", lastEdited: "5 dias", sends: 2340 },
  { id: 6, name: "Avaliação de Produto", key: "review_request", lastEdited: "2 semanas", sends: 670 },
];

export function SaEmailsPage() {
  const [tab, setTab] = useState("logs");
  const [status, setStatus] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-emails", status, storeFilter, page],
    queryFn: () =>
      superAdminService.listEmailLogs({
        status: status === "ALL" ? undefined : status,
        storeId: storeFilter.trim() ? Number(storeFilter) : undefined,
        page,
        size: 15,
      }),
    enabled: tab === "logs",
  });

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="E-mails da Plataforma"
        description="Monitore envios, gerencie templates e configurações SMTP"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Enviados Hoje" value="1.247" icon={Send} color="success" trend={{ value: 8, label: "" }} />
        <SaStatCard title="Taxa de Entrega" value="98.2%" icon={CheckCircle} color="info" />
        <SaStatCard title="Falhas" value="23" icon={AlertTriangle} color="danger" />
        <SaStatCard title="Na Fila" value="12" icon={Clock} color="warning" />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Logs de Envio
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Templates
          </TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Configuração
          </TabsTrigger>
        </TabsList>

        {/* Logs */}
        <TabsContent value="logs" className="mt-6 space-y-4">
          <SaCard className="!p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={status} onValueChange={v => { setStatus(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="SENT">Enviado</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={storeFilter}
                onChange={e => { setStoreFilter(e.target.value); setPage(0); }}
                placeholder="ID da Loja"
                className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
              />
            </div>
          </SaCard>

          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <SaTableCard title="Logs de E-mail" subtitle={isLoading ? "Carregando..." : `${data?.totalElements ?? 0} registro(s)`}>
              {isLoading ? (
                <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando...</div>
              ) : data && data.content.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">ID</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Destinatário</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Template</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Enviado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.content.map((row, i) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                        >
                          <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-text-muted))]">#{row.id}</TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{row.storeName || `Loja ${row.storeId ?? "-"}`}</TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text))]">{row.recipientEmail}</TableCell>
                          <TableCell className="text-[12px] font-mono text-[hsl(var(--sa-accent))]">{row.templateKey}</TableCell>
                          <TableCell>
                            <SaStatusBadge status={row.deliveryStatus} map={statusBadge} />
                          </TableCell>
                          <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">
                            {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: ptBR })}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">Página {data.page + 1} de {Math.max(data.totalPages, 1)}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={data.first} className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={data.last} className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]">
                        Próxima
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <SaEmptyState icon={Mail} title="Nenhum log encontrado" description="Ajuste os filtros para ver resultados" />
              )}
            </SaTableCard>
          </motion.div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockTemplates.map((tpl) => (
              <motion.div
                key={tpl.id}
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                className="group rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-5 hover:border-[hsl(var(--sa-border))] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--sa-accent-subtle))]">
                    <FileText className="h-5 w-5 text-[hsl(var(--sa-accent))]" />
                  </div>
                  <span className="text-[10px] text-[hsl(var(--sa-text-muted))]">Editado {tpl.lastEdited}</span>
                </div>
                <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-1">{tpl.name}</h4>
                <p className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))] mb-3">{tpl.key}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">{tpl.sends.toLocaleString("pt-BR")} envios</span>
                  <Button variant="ghost" size="sm" className="text-[11px] text-[hsl(var(--sa-accent))] hover:text-[hsl(var(--sa-accent-hover))] p-0 h-auto">
                    Editar
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Config */}
        <TabsContent value="config" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                Configuração SMTP
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Provider</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">Amazon SES</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Região</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">sa-east-1</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Status</span>
                  <span className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--sa-success))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--sa-success))] animate-pulse" /> Conectado
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Limite Diário</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">50.000</span>
                </div>
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Remetentes Verificados</h3>
              <div className="space-y-3">
                {["noreply@fastcart.com", "suporte@fastcart.com", "marketing@fastcart.com"].map(email => (
                  <div key={email} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <span className="text-[12px] text-[hsl(var(--sa-text))]">{email}</span>
                    <span className="text-[11px] font-bold text-[hsl(var(--sa-success))]">Verificado</span>
                  </div>
                ))}
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
