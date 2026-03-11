"use client";

import { useState } from "react";
import { useTabFromPath } from "../hooks/use-tab-from-path";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Mail,
  FileText,
  Settings,
  Send,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Zap,
  UserPlus,
  CreditCard,
  Truck,
  MessageSquare,
  KeyRound,
  Bell,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const statusBadge: Record<string, { label: string; color: string }> = {
  SENT: { label: "Enviado", color: "success" },
  DELIVERED: { label: "Entregue", color: "success" },
  FAILED: { label: "Falhou", color: "danger" },
  BOUNCED: { label: "Bounced", color: "danger" },
  PENDING: { label: "Pendente", color: "warning" },
  OPENED: { label: "Aberto", color: "info" },
  CLICKED: { label: "Clicado", color: "info" },
};

interface EmailScenario {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: "customers" | "orders" | "store";
  templateKey: string;
}

const EMAIL_SCENARIOS: EmailScenario[] = [
  {
    key: "welcome",
    label: "Boas-vindas",
    description: "Enviado quando um novo cliente se registra na loja.",
    icon: UserPlus,
    category: "customers",
    templateKey: "WELCOME",
  },
  {
    key: "password_reset",
    label: "Redefinição de senha",
    description: "Enviado quando o cliente solicita redefinição de senha.",
    icon: KeyRound,
    category: "customers",
    templateKey: "PASSWORD_RESET",
  },
  {
    key: "order_paid",
    label: "Pagamento aprovado",
    description: "Enviado quando o pagamento do pedido é confirmado via Stripe.",
    icon: CreditCard,
    category: "orders",
    templateKey: "ORDER_PAID_CONFIRMATION",
  },
  {
    key: "order_dispatched",
    label: "Pedido enviado",
    description: "Enviado quando o pedido é marcado como despachado com código de rastreio.",
    icon: Truck,
    category: "orders",
    templateKey: "ORDER_DISPATCHED",
  },
  {
    key: "contact_form",
    label: "Formulário de contato",
    description: "Notificação enviada ao lojista quando um cliente envia mensagem de contato.",
    icon: MessageSquare,
    category: "store",
    templateKey: "CONTACT_FORM",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function SaEmailsPage() {
  const [tab, setTab] = useTabFromPath("/super-admin/emails", { logs: "", scenarios: "scenarios", templates: "templates", config: "config" }, "logs");
  const [status, setStatus] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("");
  const [page, setPage] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", bodyHtml: "" });

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

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ["super-admin-email-templates"],
    queryFn: () => superAdminService.listEmailTemplates({ page: 0, size: 50 }),
    enabled: tab === "templates",
  });

  const { data: overview } = useQuery({
    queryKey: ["super-admin-overview"],
    queryFn: superAdminService.getOverview,
  });

  const queryClient = useQueryClient();

  const resendMutation = useMutation({
    mutationFn: (logId: number) => superAdminService.resendEmail(logId),
    onSuccess: () => {
      toast.success("E-mail reenviado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["super-admin-emails"] });
    },
    onError: () => toast.error("Erro ao reenviar e-mail"),
  });

  const composeMutation = useMutation({
    mutationFn: () => superAdminService.sendPlatformEmail(composeForm),
    onSuccess: (data) => {
      if (data.status === "SENT") {
        toast.success("E-mail da plataforma enviado com sucesso!");
      } else {
        toast.error("Falha ao enviar e-mail. Verifique configuração do Resend.");
      }
      setComposeOpen(false);
      setComposeForm({ to: "", subject: "", bodyHtml: "" });
      queryClient.invalidateQueries({ queryKey: ["super-admin-emails"] });
    },
    onError: () => toast.error("Erro ao enviar e-mail da plataforma"),
  });

  const templates = templatesData?.content ?? [];

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="E-mails da Plataforma"
        description="Monitore envios, gerencie cenários e configurações Resend"
        actions={
          <Button
            size="sm"
            onClick={() => setComposeOpen(true)}
            className="bg-[hsl(var(--sa-accent))] text-white hover:bg-[hsl(var(--sa-accent))]/90 rounded-lg gap-1.5 text-[12px]"
          >
            <Send className="h-3.5 w-3.5" /> Enviar e-mail
          </Button>
        }
      />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de E-mails" value={String(overview?.totalEmailLogs ?? 0)} icon={Send} color="success" />
        <SaStatCard title="Falhas" value={String(overview?.failedEmailLogs ?? 0)} icon={AlertTriangle} color="danger" />
        <SaStatCard
          title="Taxa de Entrega"
          value={overview && overview.totalEmailLogs > 0
            ? `${(((overview.totalEmailLogs - overview.failedEmailLogs) / overview.totalEmailLogs) * 100).toFixed(1)}%`
            : "—"
          }
          icon={CheckCircle}
          color="info"
        />
        <SaStatCard title="Templates" value={String(templatesData?.totalElements ?? 0)} icon={FileText} color="warning" />
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[hsl(var(--sa-surface))] border border-[hsl(var(--sa-border-subtle))] rounded-xl p-1">
          <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Logs de Envio
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Cenários
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Templates
          </TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-[hsl(var(--sa-accent))] data-[state=active]:text-white text-[hsl(var(--sa-text-secondary))] text-[12px]">
            Configuração
          </TabsTrigger>
        </TabsList>

        {/* ── Logs Tab ──────────────────────────────────────────── */}
        <TabsContent value="logs" className="mt-6 space-y-4">
          <SaCard className="p-4!">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={status} onValueChange={v => { setStatus(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="SENT">Enviado</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="BOUNCED">Bounced</SelectItem>
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
                        <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Ações</TableHead>
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={resendMutation.isPending}
                              onClick={() => resendMutation.mutate(row.id)}
                              className="h-7 px-2 text-[11px] text-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent))]/10 rounded-lg gap-1"
                            >
                              <RotateCcw className="h-3 w-3" /> Reenviar
                            </Button>
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

        {/* ── Scenarios Tab ─────────────────────────────────────── */}
        <TabsContent value="scenarios" className="mt-6">
          <SaCard className="p-0! overflow-hidden">
            <div className="px-6 py-4 border-b border-[hsl(var(--sa-border-subtle))]">
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                Cenários de E-mail Transacional
              </h3>
              <p className="text-[12px] text-[hsl(var(--sa-text-muted))] mt-1">
                Cada cenário define quando um e-mail é disparado automaticamente. Templates podem ser personalizados por loja.
              </p>
            </div>

            {/* Category: Clientes */}
            <div className="px-6 py-3 bg-[hsl(var(--sa-surface-hover))] border-b border-[hsl(var(--sa-border-subtle))]">
              <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">
                Clientes
              </span>
            </div>
            {EMAIL_SCENARIOS.filter(s => s.category === "customers").map(scenario => (
              <ScenarioRow key={scenario.key} scenario={scenario} templates={templates} />
            ))}

            {/* Category: Pedidos */}
            <div className="px-6 py-3 bg-[hsl(var(--sa-surface-hover))] border-b border-[hsl(var(--sa-border-subtle))]">
              <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">
                Pedidos
              </span>
            </div>
            {EMAIL_SCENARIOS.filter(s => s.category === "orders").map(scenario => (
              <ScenarioRow key={scenario.key} scenario={scenario} templates={templates} />
            ))}

            {/* Category: Loja */}
            <div className="px-6 py-3 bg-[hsl(var(--sa-surface-hover))] border-b border-[hsl(var(--sa-border-subtle))]">
              <span className="text-[11px] font-bold text-[hsl(var(--sa-text-muted))] uppercase tracking-wider">
                Loja
              </span>
            </div>
            {EMAIL_SCENARIOS.filter(s => s.category === "store").map(scenario => (
              <ScenarioRow key={scenario.key} scenario={scenario} templates={templates} />
            ))}
          </SaCard>
        </TabsContent>

        {/* ── Templates Tab ─────────────────────────────────────── */}
        <TabsContent value="templates" className="mt-6">
          {templatesLoading ? (
            <div className="py-12 text-center text-[hsl(var(--sa-text-muted))]">Carregando templates...</div>
          ) : templates.length === 0 ? (
            <SaEmptyState icon={FileText} title="Nenhum template encontrado" description="Templates de e-mail aparecerão aqui quando lojas os personalizarem" />
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((tpl) => (
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
                    <span className={`text-[10px] font-bold ${tpl.active ? "text-[hsl(var(--sa-success))]" : "text-[hsl(var(--sa-text-muted))]"}`}>
                      {tpl.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-semibold text-[hsl(var(--sa-text))] mb-1">{tpl.subject}</h4>
                  <p className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))] mb-3">{tpl.templateKey}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--sa-border-subtle))]">
                    <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                      {tpl.storeName || "Plataforma"}
                    </span>
                    <span className="text-[11px] text-[hsl(var(--sa-text-muted))]">
                      {formatDistanceToNow(new Date(tpl.updatedAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ── Config Tab ────────────────────────────────────────── */}
        <TabsContent value="config" className="mt-6">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-6 lg:grid-cols-2">
            {/* Resend Provider Config */}
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                Provider de E-mail
              </h3>
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Provider</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 7l10 7 10-7M2 7l10-5 10 5M2 7v10l10 5 10-5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Resend
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">API Key</span>
                  <span className="text-[12px] font-mono text-[hsl(var(--sa-text-muted))]">
                    re_••••••••
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Status</span>
                  <ResendStatusIndicator />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--sa-border-subtle))]">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Webhook</span>
                  <span className="text-[12px] text-[hsl(var(--sa-text-muted))] font-mono">
                    /api/v1/webhooks/resend
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-[hsl(var(--sa-text-secondary))]">Rate Limit</span>
                  <span className="text-[12px] font-bold text-[hsl(var(--sa-text))]">100 req/s (Free tier)</span>
                </div>
              </div>
            </SaCard>

            {/* Environment Variables */}
            <SaCard>
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                Variáveis de Ambiente
              </h3>
              <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mb-4">
                Configure as seguintes variáveis no docker-compose.yml ou .env do backend:
              </p>
              <div className="space-y-2">
                {[
                  { name: "RESEND_API_KEY", desc: "Chave de API do Resend", required: true },
                  { name: "RESEND_WEBHOOK_SECRET", desc: "Secret para validar webhooks", required: true },
                  { name: "RESEND_DEFAULT_FROM_EMAIL", desc: "E-mail remetente padrão", required: false },
                  { name: "RESEND_DEFAULT_FROM_NAME", desc: "Nome remetente padrão", required: false },
                ].map(env => (
                  <div key={env.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[hsl(var(--sa-bg))] border border-[hsl(var(--sa-border-subtle))]">
                    <div>
                      <span className="text-[12px] font-mono text-[hsl(var(--sa-text))]">{env.name}</span>
                      <p className="text-[10px] text-[hsl(var(--sa-text-muted))]">{env.desc}</p>
                    </div>
                    {env.required && (
                      <Badge className="text-[10px] bg-[hsl(var(--sa-danger))]/10 text-[hsl(var(--sa-danger))] border-0">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </SaCard>

            {/* Email Flow */}
            <SaCard className="lg:col-span-2">
              <h3 className="text-[14px] font-semibold text-[hsl(var(--sa-text))] mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[hsl(var(--sa-accent))]" />
                Fluxo de Entrega
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                {[
                  "TransactionalEmailService",
                  "EmailTemplateRenderService",
                  "EmailDeliveryService",
                  "ResendEmailClient",
                  "Resend API",
                  "Webhook → OutboundEmailLog",
                ].map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-lg bg-[hsl(var(--sa-accent-subtle))] px-3 py-1.5 font-mono text-[hsl(var(--sa-accent))]">
                      {step}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-[hsl(var(--sa-text-muted))]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </SaCard>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ═══ Compose Platform Email Dialog ═══ */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Enviar e-mail da plataforma
            </DialogTitle>
            <DialogDescription>
              Envie um e-mail como Super Admin para lojistas ou qualquer destinatário. Sai de <strong>noreply@lojaki.store</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Destinatário</Label>
              <Input
                type="email"
                placeholder="lojista@email.com"
                value={composeForm.to}
                onChange={(e) => setComposeForm(p => ({ ...p, to: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assunto</Label>
              <Input
                placeholder="Assunto do e-mail"
                value={composeForm.subject}
                onChange={(e) => setComposeForm(p => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo HTML</Label>
              <textarea
                className="w-full h-40 p-3 text-xs font-mono bg-background border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="<p>Olá lojista! Temos uma novidade para você.</p>"
                value={composeForm.bodyHtml}
                onChange={(e) => setComposeForm(p => ({ ...p, bodyHtml: e.target.value }))}
              />
            </div>
            {composeForm.bodyHtml && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">Preview</Label>
                <div
                  className="border rounded-lg p-4 bg-white text-black text-sm min-h-16"
                  dangerouslySetInnerHTML={{ __html: composeForm.bodyHtml }}
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => composeMutation.mutate()}
                disabled={composeMutation.isPending || !composeForm.to || !composeForm.subject || !composeForm.bodyHtml}
              >
                {composeMutation.isPending ? (
                  <span className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 animate-spin" /> Enviando...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="h-3.5 w-3.5" /> Enviar</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScenarioRow — one row per email scenario                           */
/* ------------------------------------------------------------------ */

function ScenarioRow({
  scenario,
  templates,
}: {
  scenario: EmailScenario;
  templates: Array<{ templateKey: string; active: boolean; storeName: string | null }>;
}) {
  const Icon = scenario.icon;
  const matchingTemplates = templates.filter(t => t.templateKey === scenario.templateKey);
  const hasCustomTemplate = matchingTemplates.length > 0;
  const allActive = matchingTemplates.length > 0 && matchingTemplates.every(t => t.active);

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-[hsl(var(--sa-border-subtle))] last:border-0 hover:bg-[hsl(var(--sa-surface-hover))] transition-colors">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sa-accent-subtle))]">
        <Icon className="h-5 w-5 text-[hsl(var(--sa-accent))]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{scenario.label}</p>
        <p className="text-[11px] text-[hsl(var(--sa-text-muted))] mt-0.5">{scenario.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] font-mono text-[hsl(var(--sa-text-muted))]">
          {scenario.templateKey}
        </span>
        {hasCustomTemplate ? (
          <Badge className={`text-[10px] border-0 ${allActive ? "bg-[hsl(var(--sa-success))]/10 text-[hsl(var(--sa-success))]" : "bg-[hsl(var(--sa-warning))]/10 text-[hsl(var(--sa-warning))]"}`}>
            {allActive ? "Ativo" : "Parcial"}
          </Badge>
        ) : (
          <Badge className="text-[10px] bg-[hsl(var(--sa-surface))] text-[hsl(var(--sa-text-muted))] border border-[hsl(var(--sa-border-subtle))]">
            Padrão
          </Badge>
        )}
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--sa-success))]/20">
          <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--sa-success))]" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ResendStatusIndicator                                              */
/* ------------------------------------------------------------------ */

function ResendStatusIndicator() {
  // In a real implementation, this would call a health-check endpoint
  return (
    <span className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--sa-success))]">
      <div className="h-2 w-2 rounded-full bg-[hsl(var(--sa-success))] animate-pulse" />
      Configurado
    </span>
  );
}
