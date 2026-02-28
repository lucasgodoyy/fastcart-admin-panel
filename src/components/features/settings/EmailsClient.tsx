'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Send,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  ShoppingCart,
  Megaphone,
  UserCog,
  KeyRound,
  HandCoins,
  Receipt,
  CreditCard,
  PackageCheck,
  Truck,
  BadgeCheck,
  Settings2,
} from 'lucide-react';
import emailService, {
  type EmailSenderConfig,
  type EmailTemplate,
  type OutboundEmailLog,
} from '@/services/emailService';
import Link from 'next/link';

// ── Category definitions ──────────────────────────────────────
interface EmailCategory {
  title: string;
  icon: React.ReactNode;
  items: {
    templateKey: string;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

const EMAIL_CATEGORIES: EmailCategory[] = [
  {
    title: 'Promoções',
    icon: <Megaphone className="h-4 w-4 text-primary" />,
    items: [
      {
        templateKey: 'ABANDONED_CART_RECOVERY',
        label: 'Carrinhos abandonados',
        description: 'Recupere vendas com e-mails automáticos.',
        icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
      },
    ],
  },
  {
    title: 'Conta de usuários',
    icon: <UserCog className="h-4 w-4 text-primary" />,
    items: [
      {
        templateKey: 'WELCOME',
        label: 'Boas-vindas',
        description: 'Enviado quando um cliente cria conta.',
        icon: <HandCoins className="h-4 w-4 text-muted-foreground" />,
      },
      {
        templateKey: 'PASSWORD_RESET',
        label: 'Mudança de senha',
        description: 'Enviado para redefinir a senha.',
        icon: <KeyRound className="h-4 w-4 text-muted-foreground" />,
      },
    ],
  },
  {
    title: 'Vendas',
    icon: <Receipt className="h-4 w-4 text-primary" />,
    items: [
      {
        templateKey: 'ORDER_PAID_CONFIRMATION',
        label: 'Comprovante de compra',
        description: 'Enviado quando o pagamento é confirmado.',
        icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
      },
      {
        templateKey: 'ORDER_DELIVERED',
        label: 'Confirmação de entrega',
        description: 'Enviado quando o pedido é entregue.',
        icon: <PackageCheck className="h-4 w-4 text-muted-foreground" />,
      },
      {
        templateKey: 'ORDER_DISPATCHED_CONFIRMATION',
        label: 'Confirmação de envio',
        description: 'Enviado quando o pedido é despachado.',
        icon: <Truck className="h-4 w-4 text-muted-foreground" />,
      },
      {
        templateKey: 'CONTACT_FORM_NOTIFICATION',
        label: 'Formulário de contato',
        description: 'Notificação de novo contato recebido.',
        icon: <Mail className="h-4 w-4 text-muted-foreground" />,
      },
    ],
  },
];

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  SENT: { icon: <Send className="h-3 w-3" />, color: 'text-blue-500', label: 'Enviado' },
  DELIVERED: { icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-green-500', label: 'Entregue' },
  FAILED: { icon: <XCircle className="h-3 w-3" />, color: 'text-red-500', label: 'Falha' },
  PENDING: { icon: <Clock className="h-3 w-3" />, color: 'text-yellow-500', label: 'Pendente' },
  BOUNCED: { icon: <AlertCircle className="h-3 w-3" />, color: 'text-orange-500', label: 'Rejeitado' },
};

type Tab = 'overview' | 'config' | 'logs';

export function EmailsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sender Config state
  const [senderConfig, setSenderConfig] = useState<EmailSenderConfig | null>(null);
  const [configForm, setConfigForm] = useState({ fromName: '', fromEmail: '', replyToEmail: '', active: true });

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  // Logs state
  const [logs, setLogs] = useState<OutboundEmailLog[]>([]);
  const [logFilter, setLogFilter] = useState('');

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [config, templateList, logList] = await Promise.all([
        emailService.getSenderConfig(),
        emailService.listTemplates(),
        emailService.listLogs({ limit: 50 }),
      ]);
      setSenderConfig(config);
      setConfigForm({
        fromName: config.fromName || '',
        fromEmail: config.fromEmail || '',
        replyToEmail: config.replyToEmail || '',
        active: config.active,
      });
      setTemplates(templateList);
      setLogs(logList);
    } catch {
      showToast('error', 'Erro ao carregar configurações de e-mail.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const updated = await emailService.updateSenderConfig({
        fromName: configForm.fromName.trim(),
        fromEmail: configForm.fromEmail.trim(),
        replyToEmail: configForm.replyToEmail.trim() || null,
        active: configForm.active,
      });
      setSenderConfig(updated);
      showToast('success', 'Configuração de remetente salva!');
    } catch {
      showToast('error', 'Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  const getTemplateStatus = (templateKey: string): boolean => {
    const tpl = templates.find((t) => t.templateKey === templateKey);
    return tpl?.active ?? false;
  };

  const filteredLogs = logFilter ? logs.filter((l) => l.deliveryStatus === logFilter) : logs;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SettingsPageLayout
      title="E-mails automáticos"
      description="Gerencie todos os e-mails transacionais e de marketing enviados automaticamente pela sua loja."
      helpText="Documentação de e-mails"
      helpHref="#"
    >
      {/* Toast */}
      {toast && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {[
          { key: 'overview' as Tab, label: 'Automações', icon: <FileText className="h-3.5 w-3.5" /> },
          { key: 'config' as Tab, label: 'Remetente', icon: <Settings2 className="h-3.5 w-3.5" /> },
          { key: 'logs' as Tab, label: 'Histórico', icon: <Send className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {EMAIL_CATEGORIES.map((category) => (
            <div key={category.title} className="space-y-3">
              <div className="flex items-center gap-2">
                {category.icon}
                <h3 className="text-sm font-semibold text-foreground">{category.title}</h3>
              </div>

              <div className="space-y-2">
                {category.items.map((item) => {
                  const isActive = getTemplateStatus(item.templateKey);
                  return (
                    <div
                      key={item.templateKey}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                isActive
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/settings/emails/${item.templateKey.toLowerCase().replace(/_/g, '-')}`}
                        className="text-xs text-primary hover:underline font-medium whitespace-nowrap"
                      >
                        Editar conteúdo
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sender Config Tab ── */}
      {activeTab === 'config' && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Configuração do remetente</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Defina o nome e e-mail que aparecerá como remetente nos e-mails transacionais da loja.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="fromName" className="text-sm font-medium">
              Nome do remetente
            </Label>
            <Input
              id="fromName"
              value={configForm.fromName}
              onChange={(e) => setConfigForm((p) => ({ ...p, fromName: e.target.value }))}
              placeholder="Nome da loja"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fromEmail" className="text-sm font-medium">
              E-mail do remetente
            </Label>
            <Input
              id="fromEmail"
              type="email"
              value={configForm.fromEmail}
              onChange={(e) => setConfigForm((p) => ({ ...p, fromEmail: e.target.value }))}
              placeholder="noreply@sualoja.com"
            />
            <p className="text-xs text-muted-foreground">Precisa ser um domínio verificado no Resend.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="replyTo" className="text-sm font-medium">
              Reply-to (opcional)
            </Label>
            <Input
              id="replyTo"
              type="email"
              value={configForm.replyToEmail}
              onChange={(e) => setConfigForm((p) => ({ ...p, replyToEmail: e.target.value }))}
              placeholder="contato@sualoja.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="configActive"
              checked={configForm.active}
              onChange={(e) => setConfigForm((p) => ({ ...p, active: e.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="configActive" className="text-sm">
              Ativo
            </Label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Salvar remetente
            </Button>
          </div>
        </div>
      )}

      {/* ── Logs Tab ── */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Histórico de envios</p>
            </div>
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="">Todos</option>
              <option value="SENT">Enviado</option>
              <option value="DELIVERED">Entregue</option>
              <option value="FAILED">Falha</option>
              <option value="PENDING">Pendente</option>
              <option value="BOUNCED">Rejeitado</option>
            </select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum e-mail enviado ainda.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Destinatário</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Assunto</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Template</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const statusCfg = STATUS_CONFIG[log.deliveryStatus] || STATUS_CONFIG.PENDING;
                    return (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 ${statusCfg.color}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="p-3 text-foreground">{log.recipientEmail}</td>
                        <td className="p-3 text-foreground max-w-[200px] truncate">{log.subject}</td>
                        <td className="p-3">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                            {log.templateKey}
                          </code>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {log.sentAt
                            ? new Date(log.sentAt).toLocaleString('pt-BR')
                            : new Date(log.createdAt).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </SettingsPageLayout>
  );
}
