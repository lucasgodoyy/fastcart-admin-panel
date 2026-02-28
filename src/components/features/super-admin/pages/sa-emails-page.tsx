"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import {
  Mail,
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

const emailTabRoutes: Record<string, string> = {
  logs: "",
  templates: "templates",
  config: "config",
};

export function SaEmailsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/emails", emailTabRoutes, "logs");
  const [status, setStatus] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(0);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateStoreFilter, setTemplateStoreFilter] = useState("");
  const [templatePage, setTemplatePage] = useState(0);

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

  const { data: templateData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["super-admin-email-templates", templateSearch, templateStoreFilter, templatePage],
    queryFn: () =>
      superAdminService.listEmailTemplates({
        search: templateSearch || undefined,
        storeId: templateStoreFilter.trim() ? Number(templateStoreFilter) : undefined,
        page: templatePage,
        size: 12,
      }),
    enabled: tab === "templates",
  });

  const { data: stats } = useQuery({
    queryKey: ["super-admin-email-stats"],
    queryFn: async () => {
      const [sent, failed, pending] = await Promise.all([
        superAdminService.listEmailLogs({ status: "SENT", page: 0, size: 1 }),
        superAdminService.listEmailLogs({ status: "FAILED", page: 0, size: 1 }),
        superAdminService.listEmailLogs({ status: "PENDING", page: 0, size: 1 }),
      ]);

      const sentCount = sent.totalElements ?? 0;
      const failedCount = failed.totalElements ?? 0;
      const pendingCount = pending.totalElements ?? 0;
      const deliveryBase = sentCount + failedCount;
      const deliveryRate = deliveryBase > 0 ? (sentCount / deliveryBase) * 100 : 0;

      return {
        sentCount,
        failedCount,
        pendingCount,
        deliveryRate,
      };
    },
  });

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="E-mails da Plataforma"
        description="Monitore envios, gerencie templates e configurações SMTP"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total Enviados" value={(stats?.sentCount ?? 0).toLocaleString("pt-BR")} icon={Send} color="success" />
        <SaStatCard title="Taxa de Entrega" value={`${(stats?.deliveryRate ?? 0).toFixed(1)}%`} icon={CheckCircle} color="info" />
        <SaStatCard title="Falhas" value={(stats?.failedCount ?? 0).toLocaleString("pt-BR")} icon={AlertTriangle} color="danger" />
        <SaStatCard title="Na Fila" value={(stats?.pendingCount ?? 0).toLocaleString("pt-BR")} icon={Clock} color="warning" />
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
          <div className="space-y-4">
            <SaCard className="!p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={templateSearch}
                  onChange={(e) => {
                    setTemplateSearch(e.target.value);
                    setTemplatePage(0);
                  }}
                  placeholder="Buscar template por chave ou assunto"
                  className="w-full bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
                />
                <Input
                  value={templateStoreFilter}
                  onChange={(e) => {
                    setTemplateStoreFilter(e.target.value);
                    setTemplatePage(0);
                  }}
                  placeholder="ID da Loja"
                  className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
                />
              </div>
            </SaCard>

            {isLoadingTemplates ? (
              <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando...</div>
            ) : templateData && templateData.content.length > 0 ? (
              <>
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templateData.content.map((template) => (
                    <motion.div
                      key={template.id}
                      variants={fadeInUp}
                      whileHover={{ y: -3 }}
                      className="rounded-2xl border border-[hsl(var(--sa-border-subtle))] bg-[hsl(var(--sa-surface))] p-5 hover:border-[hsl(var(--sa-border))] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--sa-accent-subtle))]">
                          <FileText className="h-5 w-5 text-[hsl(var(--sa-accent))]" />
                        </div>
                        <SaStatusBadge status={template.active ? "ACTIVE" : "INACTIVE"} />
                      </div>
                      <h4 className="text-[12px] font-mono text-[hsl(var(--sa-accent))] mb-1">{template.templateKey}</h4>
                      <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-2">{template.subject}</p>
                      <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-3">
                        {template.storeName ? `Loja: ${template.storeName}` : "Template global"}
                      </p>
                      <div className="pt-3 border-t border-[hsl(var(--sa-border-subtle))] text-[10px] text-[hsl(var(--sa-text-muted))]">
                        Atualizado {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true, locale: ptBR })}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-[12px] text-[hsl(var(--sa-text-muted))]">Página {templateData.page + 1} de {Math.max(templateData.totalPages, 1)}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTemplatePage((currentPage) => Math.max(0, currentPage - 1))}
                      disabled={templateData.first}
                      className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTemplatePage((currentPage) => currentPage + 1)}
                      disabled={templateData.last}
                      className="text-[11px] bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <SaEmptyState icon={FileText} title="Nenhum template encontrado" description="Ajuste os filtros para ver resultados" />
            )}
          </div>
        </TabsContent>

        {/* Config */}
        <TabsContent value="config" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                Provedor de E-mail
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Provider</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">Resend</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">API</span>
                  <span className="text-[12px] font-mono font-bold text-[hsl(var(--sa-text))]">api.resend.com/emails</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Status</span>
                  <span className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--sa-success))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--sa-success))] animate-pulse" /> Conectado
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Webhooks</span>
                  <span className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--sa-success))]">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--sa-success))] animate-pulse" /> Ativo (Svix)
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Eventos Webhook</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">delivered, bounced, complained</span>
                </div>
              </div>
            </SaCard>

            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4">Templates Transacionais</h3>
              <div className="space-y-3">
                {[
                  { key: "WELCOME", label: "Boas-vindas" },
                  { key: "PASSWORD_RESET", label: "Recuperação de senha" },
                  { key: "ORDER_PAID_CONFIRMATION", label: "Pedido pago" },
                  { key: "ORDER_DISPATCHED_CONFIRMATION", label: "Pedido enviado" },
                  { key: "ORDER_DELIVERED", label: "Pedido entregue" },
                  { key: "ABANDONED_CART_RECOVERY", label: "Carrinho abandonado" },
                  { key: "CONTACT_FORM_NOTIFICATION", label: "Formulário de contato" },
                ].map((t) => (
                  <div key={t.key} className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))] last:border-0">
                    <div>
                      <span className="text-[12px] text-[hsl(var(--sa-text))]">{t.label}</span>
                      <span className="text-[10px] font-mono text-[hsl(var(--sa-text-muted))] block">{t.key}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[hsl(var(--sa-success))]">Ativo</span>
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
