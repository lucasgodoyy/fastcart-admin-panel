"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail, Send, AlertTriangle, CheckCircle, Clock, RotateCcw,
  FileText, Settings, Search, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import emailService from "@/services/emailService";
import notificationService from "@/services/notificationService";
import { toast } from "sonner";
import { t } from "@/lib/admin-language";

type EmailLog = {
  id: number;
  recipientEmail: string;
  subject: string;
  status: string;
  templateKey?: string;
  sentAt: string | null;
  createdAt?: string;
  errorMessage: string | null;
};

type EmailTemplate = {
  id: number;
  templateKey: string;
  subject: string;
  active: boolean;
  updatedAt: string;
};

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  SENT: { label: "Enviado", variant: "default" },
  DELIVERED: { label: "Entregue", variant: "default" },
  OPENED: { label: "Aberto", variant: "secondary" },
  FAILED: { label: "Falhou", variant: "destructive" },
  PENDING: { label: "Pendente", variant: "outline" },
  BOUNCED: { label: "Bounce", variant: "destructive" },
};

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState("emails");
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const { data: emailLogs, isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ["admin-email-logs", logStatusFilter],
    queryFn: () =>
      emailService.listLogs(
        logStatusFilter === "ALL" ? undefined : logStatusFilter,
        100
      ),
    enabled: tab === "emails",
  });

  const { data: templates, isLoading: tplLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["admin-email-templates"],
    queryFn: () => emailService.listTemplates(),
    enabled: tab === "templates",
  });

  const { data: senderConfig } = useQuery({
    queryKey: ["admin-sender-config"],
    queryFn: () => emailService.getSenderConfig(),
    enabled: tab === "config",
  });

  const resendMutation = useMutation({
    mutationFn: (logId: number) => emailService.resendEmail(logId),
    onSuccess: () => {
      toast.success(t("E-mail reenviado!", "Email resent!"));
      queryClient.invalidateQueries({ queryKey: ["admin-email-logs"] });
    },
    onError: () => toast.error(t("Erro ao reenviar", "Failed to resend")),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("Notificações", "Notifications")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(
            "Histórico de e-mails enviados, templates e configuração",
            "Email history, templates and configuration"
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Send className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Total Enviados", "Total Sent")}</span>
          </div>
          <p className="text-2xl font-bold">{emailLogs?.length ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Entregues", "Delivered")}</span>
          </div>
          <p className="text-2xl font-bold">
            {emailLogs?.filter((l) => l.status === "SENT" || l.status === "DELIVERED").length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Falhas", "Failed")}</span>
          </div>
          <p className="text-2xl font-bold text-destructive">
            {emailLogs?.filter((l) => l.status === "FAILED" || l.status === "BOUNCED").length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">{t("Templates", "Templates")}</span>
          </div>
          <p className="text-2xl font-bold">{templates?.length ?? "—"}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="emails" className="text-xs">
            {t("Histórico de Envios", "Send History")}
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            {t("Templates", "Templates")}
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs">
            {t("Configuração", "Configuration")}
          </TabsTrigger>
        </TabsList>

        {/* Email Logs */}
        <TabsContent value="emails" className="mt-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
              <SelectTrigger className="w-40 h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("Todos", "All")}</SelectItem>
                <SelectItem value="SENT">{t("Enviado", "Sent")}</SelectItem>
                <SelectItem value="DELIVERED">{t("Entregue", "Delivered")}</SelectItem>
                <SelectItem value="FAILED">{t("Falhou", "Failed")}</SelectItem>
                <SelectItem value="PENDING">{t("Pendente", "Pending")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {logsLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">{t("Carregando...", "Loading...")}</div>
          ) : !emailLogs || emailLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {t("Nenhum e-mail encontrado.", "No emails found.")}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t("Destinatário", "Recipient")}</TableHead>
                    <TableHead className="text-xs">{t("Assunto", "Subject")}</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">{t("Motivo", "Reason")}</TableHead>
                    <TableHead className="text-xs">{t("Enviado", "Sent")}</TableHead>
                    <TableHead className="text-xs">{t("Ações", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{log.recipientEmail}</TableCell>
                      <TableCell className="text-xs max-w-50 truncate">{log.subject}</TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadge[log.status]?.variant || "outline"}
                          className="text-[10px]"
                        >
                          {statusBadge[log.status]?.label || log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-70">
                        {(log.status === "FAILED" || log.status === "BOUNCED") && log.errorMessage ? (
                          <span className="text-destructive block truncate" title={log.errorMessage}>
                            {log.errorMessage}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.sentAt
                          ? new Date(log.sentAt).toLocaleString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={resendMutation.isPending}
                          onClick={() => resendMutation.mutate(log.id)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> {t("Reenviar", "Resend")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="mt-4">
          {tplLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">{t("Carregando...", "Loading...")}</div>
          ) : !templates || templates.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {t("Nenhum template encontrado.", "No templates found.")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge variant={tpl.active ? "default" : "outline"} className="text-[10px]">
                      {tpl.active ? t("Ativo", "Active") : t("Inativo", "Inactive")}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{tpl.subject}</h4>
                  <p className="text-xs font-mono text-muted-foreground mb-2">{tpl.templateKey}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Atualizado", "Updated")}: {new Date(tpl.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Config */}
        <TabsContent value="config" className="mt-4">
          <div className="rounded-lg border bg-card p-5 max-w-lg space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("Configuração de Remetente", "Sender Configuration")}
            </h3>
            {senderConfig ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t("Nome", "Name")}</span>
                  <span className="font-medium">{senderConfig.fromName || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{t("E-mail", "Email")}</span>
                  <span className="font-medium">{senderConfig.fromEmail || "—"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t("Reply-To", "Reply-To")}</span>
                  <span className="font-medium">{senderConfig.replyToEmail || "—"}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t(
                  "Nenhuma configuração personalizada encontrada. Os e-mails usam o padrão da plataforma.",
                  "No custom configuration. Emails use platform defaults."
                )}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
