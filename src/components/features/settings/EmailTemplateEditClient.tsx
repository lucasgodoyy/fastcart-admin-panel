'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import emailService, { type EmailTemplate } from '@/services/emailService';
import Link from 'next/link';

// Mapping from URL slug → backend templateKey
const SLUG_TO_KEY: Record<string, string> = {
  welcome: 'WELCOME',
  'password-reset': 'PASSWORD_RESET',
  'order-paid-confirmation': 'ORDER_PAID_CONFIRMATION',
  'order-dispatched-confirmation': 'ORDER_DISPATCHED_CONFIRMATION',
  'order-delivered': 'ORDER_DELIVERED',
  'abandoned-cart-recovery': 'ABANDONED_CART_RECOVERY',
  'contact-form-notification': 'CONTACT_FORM_NOTIFICATION',
};

const TEMPLATE_META: Record<string, { label: string; description: string }> = {
  WELCOME: { label: 'Boas-vindas', description: 'Enviado quando um cliente cria conta na loja.' },
  PASSWORD_RESET: { label: 'Mudança de senha', description: 'Enviado para redefinir a senha do cliente.' },
  ORDER_PAID_CONFIRMATION: { label: 'Comprovante de compra', description: 'Enviado quando o pagamento é confirmado.' },
  ORDER_DISPATCHED_CONFIRMATION: { label: 'Confirmação de envio', description: 'Enviado quando o pedido é despachado.' },
  ORDER_DELIVERED: { label: 'Confirmação de entrega', description: 'Enviado quando o pedido é entregue.' },
  ABANDONED_CART_RECOVERY: { label: 'Carrinhos abandonados', description: 'Recupere vendas com e-mails automáticos.' },
  CONTACT_FORM_NOTIFICATION: { label: 'Formulário de contato', description: 'Notificação de novo contato recebido.' },
};

const AVAILABLE_VARIABLES = [
  'store_name',
  'store_email',
  'store_url',
  'customer_name',
  'order_id',
  'total_amount',
  'currency',
];

interface Props {
  templateSlug: string;
}

export function EmailTemplateEditClient({ templateSlug }: Props) {
  const templateKey = SLUG_TO_KEY[templateSlug] || templateSlug.toUpperCase().replace(/-/g, '_');
  const meta = TEMPLATE_META[templateKey] || { label: templateKey, description: '' };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [format, setFormat] = useState<'html' | 'text'>('html');

  const [form, setForm] = useState({
    subject: '',
    bodyHtml: '',
    active: true,
  });

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const templates = await emailService.listTemplates();
      const found = templates.find((t: EmailTemplate) => t.templateKey === templateKey);
      if (found) {
        setForm({
          subject: found.subject,
          bodyHtml: found.bodyHtml,
          active: found.active,
        });
      } else {
        setNotFound(true);
      }
    } catch {
      toast.error('Erro ao carregar template.');
    } finally {
      setLoading(false);
    }
  }, [templateKey]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleSave = async () => {
    if (!form.subject.trim()) {
      toast.error('O título do e-mail é obrigatório.');
      return;
    }
    if (!form.bodyHtml.trim()) {
      toast.error('O conteúdo do e-mail é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      await emailService.upsertTemplate(templateKey, {
        subject: form.subject.trim(),
        bodyHtml: form.bodyHtml.trim(),
        active: form.active,
      });
      toast.success('Template salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar template.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <SettingsPageLayout
        title="Template não encontrado"
        description="O template solicitado não existe."
        helpText="Voltar"
        helpHref="/admin/settings/emails"
      >
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Template &quot;{templateKey}&quot; não foi encontrado. Verifique se o seeding foi executado.
          </p>
          <Link href="/admin/settings/emails" className="text-xs text-primary hover:underline mt-4 inline-block">
            Voltar para E-mails automáticos
          </Link>
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title={meta.label}
      description={meta.description}
      helpText="Voltar para E-mails automáticos"
      helpHref="/admin/settings/emails"
    >
      {/* Back link */}
      <Link
        href="/admin/settings/emails"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft className="h-3 w-3" />
        E-mails automáticos
      </Link>

      {/* Personalizar mensagem */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Personalizar mensagem</p>

        {/* Subject */}
        <div className="space-y-1.5">
          <Label htmlFor="emailSubject" className="text-sm font-medium">
            Título do e-mail
          </Label>
          <Input
            id="emailSubject"
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            placeholder="Bem-vindo à {{store_name}}!"
          />
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-foreground">E-mail ativo</span>
        </label>

        {/* Format selector */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Formato do texto</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setFormat('html')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                format === 'html'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setFormat('text')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                format === 'text'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Texto
            </button>
          </div>
        </div>

        {/* Body editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {format === 'html' ? 'Código HTML do e-mail' : 'Conteúdo do e-mail'}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-1 text-xs"
            >
              {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPreview ? 'Fechar preview' : 'Preview'}
            </Button>
          </div>
          <textarea
            className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.bodyHtml}
            onChange={(e) => setForm((p) => ({ ...p, bodyHtml: e.target.value }))}
            placeholder={
              format === 'html'
                ? '<html><body><h1>Olá {{customer_name}}</h1></body></html>'
                : 'Olá {{customer_name}}, seja bem-vindo!'
            }
          />
        </div>

        {/* Variables hint */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <span>Variáveis disponíveis:</span>
          {AVAILABLE_VARIABLES.map((v) => (
            <code key={v} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              {`{{${v}}}`}
            </code>
          ))}
        </div>
      </div>

      {/* HTML Preview */}
      {showPreview && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/50 px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground">Preview do e-mail</p>
          </div>
          <div className="p-4">
            <div className="rounded-lg border border-border bg-white p-6 max-h-[500px] overflow-auto">
              {format === 'html' ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: form.bodyHtml
                      .replace(/\{\{store_name\}\}/g, 'Minha Loja')
                      .replace(/\{\{customer_name\}\}/g, 'João Silva')
                      .replace(/\{\{store_email\}\}/g, 'contato@minhaloja.com')
                      .replace(/\{\{store_url\}\}/g, 'https://minhaloja.com')
                      .replace(/\{\{order_id\}\}/g, '12345')
                      .replace(/\{\{total_amount\}\}/g, 'R$ 199,90')
                      .replace(/\{\{currency\}\}/g, 'BRL'),
                  }}
                />
              ) : (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                  {form.bodyHtml
                    .replace(/\{\{store_name\}\}/g, 'Minha Loja')
                    .replace(/\{\{customer_name\}\}/g, 'João Silva')
                    .replace(/\{\{store_email\}\}/g, 'contato@minhaloja.com')
                    .replace(/\{\{store_url\}\}/g, 'https://minhaloja.com')
                    .replace(/\{\{order_id\}\}/g, '12345')
                    .replace(/\{\{total_amount\}\}/g, 'R$ 199,90')
                    .replace(/\{\{currency\}\}/g, 'BRL')}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Salvar template
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
