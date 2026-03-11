'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Send,
  Clock,
  AlertCircle,
  Settings,
  Edit,
  Eye,
  Loader2,
  ShoppingCart,
  UserPlus,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  Star,
  MessageSquare,
  Gift,
  Bell,
  Info,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import emailService, { EmailSenderConfig, EmailTemplate, EmailLog } from '@/services/emailService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════════
 *  Email event definitions with pre-built templates (PT-BR)
 * ══════════════════════════════════════════════════════════════════ */

type EmailEvent = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'orders' | 'customers' | 'marketing' | 'system';
  defaultSubject: string;
  defaultBody: string;
  variables: { name: string; desc: string }[];
};

const EMAIL_EVENTS: EmailEvent[] = [
  /* ── Orders ── */
  {
    key: 'order_confirmation',
    label: 'Confirmação de pedido',
    description: 'Enviado quando o cliente conclui um pedido.',
    icon: <ShoppingCart className="h-4 w-4" />,
    category: 'orders',
    defaultSubject: 'Pedido #{{ order.number }} confirmado - {{ store_name }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Seu pedido foi confirmado!</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Recebemos seu pedido <strong>#{{ order.number }}</strong> com sucesso.</p>
  <p><strong>Total:</strong> {{ order.total }}</p>
  <p>Você receberá atualizações sobre o envio em breve.</p>
  <a href="{{ order.tracking_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Acompanhar pedido</a>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'order.total', desc: 'Valor total formatado' },
      { name: 'order.tracking_url', desc: 'Link de acompanhamento' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'payment_confirmed',
    label: 'Pagamento aprovado',
    description: 'Quando o pagamento é confirmado via Stripe.',
    icon: <CreditCard className="h-4 w-4" />,
    category: 'orders',
    defaultSubject: 'Pagamento aprovado - Pedido #{{ order.number }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Pagamento confirmado</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Seu pagamento de <strong>{{ order.total }}</strong> para o pedido <strong>#{{ order.number }}</strong> foi aprovado.</p>
  <p>Estamos preparando seu pedido para envio.</p>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'order.total', desc: 'Valor total' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'order_shipped',
    label: 'Pedido enviado',
    description: 'Quando o pedido recebe código de rastreio.',
    icon: <Truck className="h-4 w-4" />,
    category: 'orders',
    defaultSubject: 'Seu pedido foi enviado! - #{{ order.number }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Pedido a caminho!</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Seu pedido <strong>#{{ order.number }}</strong> foi enviado.</p>
  <p><strong>Código de rastreio:</strong> {{ shipping.tracking_code }}</p>
  <p><strong>Transportadora:</strong> {{ shipping.carrier }}</p>
  <a href="{{ shipping.tracking_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Rastrear envio</a>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'shipping.tracking_code', desc: 'Código de rastreio' },
      { name: 'shipping.carrier', desc: 'Nome da transportadora' },
      { name: 'shipping.tracking_url', desc: 'Link de rastreamento' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'order_delivered',
    label: 'Pedido entregue',
    description: 'Quando o pedido é entregue ao cliente.',
    icon: <Package className="h-4 w-4" />,
    category: 'orders',
    defaultSubject: 'Pedido entregue! #{{ order.number }} - {{ store_name }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Pedido entregue!</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Seu pedido <strong>#{{ order.number }}</strong> foi entregue com sucesso!</p>
  <p>Nos conte o que achou:</p>
  <a href="{{ review_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Avaliar compra</a>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'review_url', desc: 'Link para avaliar' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'abandoned_cart',
    label: 'Carrinho abandonado',
    description: 'Recupere vendas com lembretes automáticos.',
    icon: <RotateCcw className="h-4 w-4" />,
    category: 'orders',
    defaultSubject: 'Esqueceu algo? - {{ store_name }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Você deixou itens no carrinho!</h2>
  <p>Olá <strong>{{ cart.contact_name }}</strong>,</p>
  <p>Notamos que você adicionou <strong>{{ product.name }}</strong> ao carrinho, mas não finalizou a compra.</p>
  <p>Volte e conclua seu pedido antes que acabe!</p>
  <a href="{{ cart.abandoned_checkout_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Voltar ao carrinho</a>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'cart.contact_name', desc: 'Nome do cliente' },
      { name: 'product.name', desc: 'Nome do produto' },
      { name: 'product.quantity', desc: 'Quantidade' },
      { name: 'cart.abandoned_checkout_url', desc: 'Link ao carrinho' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'refund_confirmation',
    label: 'Reembolso confirmado',
    description: 'Quando um reembolso é processado.',
    icon: <RotateCcw className="h-4 w-4" />,
    category: 'orders',
    defaultSubject: 'Reembolso processado - Pedido #{{ order.number }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Reembolso processado</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>O reembolso de <strong>{{ refund.amount }}</strong> do pedido <strong>#{{ order.number }}</strong> foi processado.</p>
  <p>O valor será creditado em até 10 dias úteis.</p>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'refund.amount', desc: 'Valor do reembolso' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  /* ── Customers ── */
  {
    key: 'welcome',
    label: 'Boas-vindas',
    description: 'Quando um novo cliente cria conta na loja.',
    icon: <UserPlus className="h-4 w-4" />,
    category: 'customers',
    defaultSubject: 'Bem-vindo à {{ store_name }}!',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Bem-vindo!</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Sua conta na <strong>{{ store_name }}</strong> foi criada com sucesso!</p>
  <p>Explore nossos produtos e encontre o que precisa.</p>
  <a href="{{ store_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Visitar loja</a>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'customer.email', desc: 'E-mail do cliente' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_url', desc: 'URL da loja' },
    ],
  },
  {
    key: 'password_reset',
    label: 'Recuperação de senha',
    description: 'Quando o cliente solicita redefinição de senha.',
    icon: <Settings className="h-4 w-4" />,
    category: 'customers',
    defaultSubject: 'Redefina sua senha - {{ store_name }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Redefinir senha</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Recebemos uma solicitação para redefinir sua senha.</p>
  <a href="{{ reset_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Criar nova senha</a>
  <p style="margin-top:16px;color:#999;font-size:12px">Se você não solicitou, ignore este e-mail.</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'reset_url', desc: 'Link de redefinição' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  /* ── Marketing ── */
  {
    key: 'review_request',
    label: 'Pedir avaliação',
    description: 'Solicite avaliação depois da entrega.',
    icon: <Star className="h-4 w-4" />,
    category: 'marketing',
    defaultSubject: 'Avalie sua compra na {{ store_name }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Conte-nos o que achou!</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Esperamos que tenha gostado da compra. Sua opinião é muito importante!</p>
  <a href="{{ review_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Avaliar minha compra</a>
  <p style="margin-top:24px;color:#666;font-size:13px">Equipe {{ store_name }}</p>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'review_url', desc: 'Link para avaliar' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'coupon_gift',
    label: 'Cupom de presente',
    description: 'Envie cupons de desconto automaticamente.',
    icon: <Gift className="h-4 w-4" />,
    category: 'marketing',
    defaultSubject: 'Presente pra você! {{ coupon.code }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Temos um presente pra você!</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Use o cupom abaixo na sua próxima compra:</p>
  <div style="margin:20px 0;padding:16px;border:2px dashed #000;text-align:center;border-radius:8px">
    <strong style="font-size:24px;letter-spacing:2px">{{ coupon.code }}</strong>
    <p style="margin-top:8px;color:#666">{{ coupon.description }}</p>
  </div>
  <a href="{{ store_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">Comprar agora</a>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'coupon.code', desc: 'Código do cupom' },
      { name: 'coupon.description', desc: 'Descrição do desconto' },
      { name: 'store_url', desc: 'URL da loja' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  /* ── System ── */
  {
    key: 'new_message',
    label: 'Nova mensagem no chat',
    description: 'Notificar cliente sobre nova mensagem.',
    icon: <MessageSquare className="h-4 w-4" />,
    category: 'system',
    defaultSubject: 'Nova mensagem de {{ store_name }}',
    defaultBody: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <h2>Você recebeu uma mensagem</h2>
  <p>Olá <strong>{{ customer.name }}</strong>,</p>
  <p>Há uma nova mensagem para você na <strong>{{ store_name }}</strong>.</p>
  <a href="{{ chat_url }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:16px">Ver mensagem</a>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'chat_url', desc: 'Link para conversa' },
    ],
  },
];

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  orders: { label: 'Pedidos', icon: <ShoppingCart className="h-4 w-4" /> },
  customers: { label: 'Clientes', icon: <UserPlus className="h-4 w-4" /> },
  marketing: { label: 'Marketing', icon: <Gift className="h-4 w-4" /> },
  system: { label: 'Sistema', icon: <Bell className="h-4 w-4" /> },
};

function normalizeTemplateKey(templateKey: string) {
  const normalized = templateKey.trim().toUpperCase().replace(/-/g, '_');

  const aliases: Record<string, string> = {
    WELCOME_EMAIL: 'WELCOME',
    PASSWORD_RECOVERY: 'PASSWORD_RESET',
    RESET_PASSWORD: 'PASSWORD_RESET',
    ORDER_CONFIRMATION: 'ORDER_PAID_CONFIRMATION',
    PAYMENT_CONFIRMED: 'ORDER_PAID_CONFIRMATION',
    ORDER_SHIPPED: 'ORDER_DISPATCHED_CONFIRMATION',
    ABANDONED_CART: 'ABANDONED_CART_RECOVERY',
  };

  return aliases[normalized] ?? normalized;
}

function statusBadge(status: string) {
  if (status === 'SENT' || status === 'DELIVERED')
    return <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">Enviado</Badge>;
  if (status === 'BOUNCED' || status === 'FAILED')
    return <Badge variant="outline" className="text-red-600 border-red-300 text-[10px]">Falhou</Badge>;
  if (status === 'CLICKED')
    return <Badge variant="outline" className="text-blue-600 border-blue-300 text-[10px]">Clicado</Badge>;
  return <Badge variant="outline" className="text-muted-foreground text-[10px]">{status}</Badge>;
}

/* ══════════════════════════════════════════════════════════════════ */

export function EmailsClient() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('automation');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'orders' | 'customers' | 'marketing' | 'system'>('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', bodyHtml: '' });
  const [testEmailAddr, setTestEmailAddr] = useState('');

  /* ── Data queries ── */
  const { data: senderConfig, isLoading: loadingSender } = useQuery<EmailSenderConfig>({
    queryKey: ['email-sender-config'],
    queryFn: emailService.getSenderConfig,
  });

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates'],
    queryFn: emailService.listTemplates,
  });

  const { data: logs = [] } = useQuery<EmailLog[]>({
    queryKey: ['email-logs'],
    queryFn: () => emailService.listLogs(undefined, 30),
  });

  /* ── Inline active toggle ── */
  const toggleActiveMutation = useMutation({
    mutationFn: ({ key, active, event }: { key: string; active: boolean; event: EmailEvent }) => {
      const existing = templates.find(
        (t) => normalizeTemplateKey(t.templateKey) === normalizeTemplateKey(key),
      );
      return emailService.upsertTemplate(normalizeTemplateKey(key), {
        subject: existing?.subject ?? event.defaultSubject,
        bodyHtml: existing?.bodyHtml ?? event.defaultBody,
        active,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-templates'] }),
    onError: () => toast.error('Erro ao alterar status do e-mail.'),
  });

  /* ── Sender form ── */
  const [senderForm, setSenderForm] = useState({
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    active: true,
  });

  useEffect(() => {
    if (senderConfig) {
      setSenderForm({
        fromName: senderConfig.fromName || '',
        fromEmail: senderConfig.fromEmail || '',
        replyToEmail: senderConfig.replyToEmail || '',
        active: senderConfig.active,
      });
    }
  }, [senderConfig]);

  const senderMutation = useMutation({
    mutationFn: () => emailService.upsertSenderConfig(senderForm),
    onSuccess: () => {
      toast.success('Remetente salvo!');
      void queryClient.invalidateQueries({ queryKey: ['email-sender-config'] });
    },
    onError: () => toast.error('Erro ao salvar remetente.'),
  });

  /* ── Quick setup: activate essential templates with defaults ── */
  const quickSetupMutation = useMutation({
    mutationFn: async () => {
      const essentialKeys = ['order_confirmation', 'payment_confirmed', 'order_shipped', 'welcome', 'abandoned_cart'];
      for (const key of essentialKeys) {
        const event = EMAIL_EVENTS.find((e) => e.key === key);
        if (!event) continue;
        const existing = templates.find(
          (t) => normalizeTemplateKey(t.templateKey) === normalizeTemplateKey(key),
        );
        if (existing?.active) continue;
        await emailService.upsertTemplate(normalizeTemplateKey(key), {
          subject: existing?.subject ?? event.defaultSubject,
          bodyHtml: existing?.bodyHtml ?? event.defaultBody,
          active: true,
        });
      }
    },
    onSuccess: () => {
      toast.success('5 automações essenciais ativadas!');
      void queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: () => toast.error('Erro. Tente ativar individualmente.'),
  });

  /* ── Send test email ── */
  const sendTestMutation = useMutation({
    mutationFn: () => emailService.sendTestEmail(testEmailAddr, 'order_confirmation'),
    onSuccess: () => {
      toast.success('E-mail de teste enviado!');
      setTestEmailAddr('');
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
    },
    onError: () => toast.error('Erro ao enviar e-mail de teste.'),
  });

  /* ── Compose & send email ── */
  const composeMutation = useMutation({
    mutationFn: () => emailService.sendEmail(composeForm),
    onSuccess: () => {
      toast.success('E-mail enviado com sucesso!');
      setComposeOpen(false);
      setComposeForm({ to: '', subject: '', bodyHtml: '' });
      queryClient.invalidateQueries({ queryKey: ['email-logs'] });
    },
    onError: () => toast.error('Erro ao enviar e-mail.'),
  });

  /* ── Helpers ── */
  function isTemplateActive(key: string) {
    const normalizedKey = normalizeTemplateKey(key);
    const t = templates.find((tpl) => normalizeTemplateKey(tpl.templateKey) === normalizedKey);
    return t ? t.active : false;
  }
  function isTemplateConfigured(key: string) {
    const normalizedKey = normalizeTemplateKey(key);
    return templates.some((tpl) => normalizeTemplateKey(tpl.templateKey) === normalizedKey);
  }

  const activeCount = EMAIL_EVENTS.filter((e) => isTemplateActive(e.key)).length;
  const configuredCount = EMAIL_EVENTS.filter((e) => isTemplateConfigured(e.key)).length;
  const sentToday = logs.filter((l) => {
    const today = new Date().toISOString().split('T')[0];
    return l.sentAt?.startsWith(today);
  }).length;

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">E-mails automáticos</h1>
        <p className="text-sm text-muted-foreground">
          Configure e-mails que são disparados automaticamente por ações na sua loja.
        </p>
      </div>

      {/* Onboarding banner — only shows when nothing is configured yet */}
      {configuredCount === 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Configure seus e-mails em 1 clique</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ative as 5 automações essenciais (confirmação de pedido, pagamento, envio, boas‑vindas e carrinho abandonado) com templates profissionais prontos em português. Você pode personalizar tudo depois.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    size="sm"
                    onClick={() => quickSetupMutation.mutate()}
                    disabled={quickSetupMutation.isPending}
                  >
                    {quickSetupMutation.isPending ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Ativando...</>
                    ) : (
                      <><Zap className="mr-1.5 h-3.5 w-3.5" /> Ativar 5 automações essenciais</>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">Leva menos de 5 segundos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick setup bar — when some but not all essentials are active */}
      {configuredCount > 0 && activeCount < 5 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="flex-1 text-xs text-amber-800 dark:text-amber-300">
            Você tem apenas <strong>{activeCount}</strong> de 5 automações essenciais ativas. Ative as restantes para não perder vendas.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={() => quickSetupMutation.mutate()}
            disabled={quickSetupMutation.isPending}
          >
            {quickSetupMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Completar setup'}
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Automações ativas</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">de {EMAIL_EVENTS.length} disponíveis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Configurados</CardTitle>
            <Edit className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configuredCount}</div>
            <p className="text-xs text-muted-foreground">templates personalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Enviados hoje</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total registros</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="automation">Automações</TabsTrigger>
          <TabsTrigger value="sender">Remetente</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
        </TabsList>

        {/* ═══ Automations Tab ═══ */}
        <TabsContent value="automation" className="mt-4 space-y-6">
          {/* How it works guide */}
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">Como funciona?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">1</span>
                <p>Clique em &quot;Ativar&quot; na automação desejada.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">2</span>
                <p>Personalize o assunto e conteúdo se quiser (ou use o padrão).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">3</span>
                <p>Pronto! O e-mail será enviado automaticamente quando a ação acontecer.</p>
              </div>
            </div>
          </div>

            {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2">
            {([['all', 'Todos'], ['orders', 'Pedidos'], ['customers', 'Clientes'], ['marketing', 'Marketing'], ['system', 'Sistema']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setCategoryFilter(val)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  categoryFilter === val
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/50',
                )}
              >
                {label}
                {val !== 'all' && (
                  <span className="ml-1.5 opacity-60">
                    {EMAIL_EVENTS.filter((e) => e.category === val).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Template list */}
          <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
            {EMAIL_EVENTS
              .filter((e) => categoryFilter === 'all' || e.category === categoryFilter)
              .map((event) => {
                const configured = isTemplateConfigured(event.key);
                const active = isTemplateActive(event.key);
                return (
                  <div
                    key={event.key}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors',
                    )}
                  >
                    <div
                      className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                        active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{event.label}</p>
                        {configured && active && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Ativo
                          </span>
                        )}
                        {configured && !active && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Pausado
                          </span>
                        )}
                        {!configured && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Não configurado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Switch
                        checked={active}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ key: event.key, active: checked, event })
                        }
                        disabled={toggleActiveMutation.isPending}
                      />
                      <Link
                        href={`/admin/settings/emails/${event.key}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {configured ? (
                          <><Edit className="h-3 w-3" /> Editar</>
                        ) : (
                          <><Zap className="h-3 w-3" /> Configurar</>
                        )}
                        <ArrowRight className="h-3 w-3 ml-0.5 opacity-50" />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>

        {/* ═══ Sender Tab ═══ */}
        <TabsContent value="sender" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuração do remetente</CardTitle>
              <CardDescription>
                Defina quem envia os e-mails da sua loja. Use um e-mail verificado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSender ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nome do remetente</Label>
                      <Input
                        value={senderForm.fromName}
                        onChange={(e) => setSenderForm((p) => ({ ...p, fromName: e.target.value }))}
                        placeholder="Nome da sua loja"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>E-mail do remetente</Label>
                      <Input
                        type="email"
                        value={senderForm.fromEmail}
                        onChange={(e) => setSenderForm((p) => ({ ...p, fromEmail: e.target.value }))}
                        placeholder="contato@sualoja.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>E-mail de resposta (opcional)</Label>
                      <Input
                        type="email"
                        value={senderForm.replyToEmail}
                        onChange={(e) => setSenderForm((p) => ({ ...p, replyToEmail: e.target.value }))}
                        placeholder="suporte@sualoja.com"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={senderForm.active}
                      onCheckedChange={(v) => setSenderForm((p) => ({ ...p, active: v }))}
                    />
                    <Label>Ativar envio de e-mails automáticos</Label>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => senderMutation.mutate()} disabled={senderMutation.isPending}>
                      {senderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar
                    </Button>
                  </div>

                  {/* ── Send Test Email ── */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-1">Enviar e-mail de teste</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Envie um e-mail de teste para verificar se a configuração está funcionando corretamente.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        className="max-w-sm"
                        placeholder="seu@email.com"
                        value={testEmailAddr}
                        onChange={(e) => setTestEmailAddr(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestMutation.mutate()}
                        disabled={sendTestMutation.isPending || !testEmailAddr}
                      >
                        {sendTestMutation.isPending ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Enviar teste
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Logs Tab ═══ */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Histórico de envios</p>
              <p className="text-xs text-muted-foreground">Últimos {logs.length} e-mails enviados pela sua loja.</p>
            </div>
            <Button size="sm" onClick={() => setComposeOpen(true)}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> Enviar e-mail
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum e-mail enviado ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Erro</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{statusBadge(log.status)}</TableCell>
                        <TableCell className="text-sm">{log.recipientEmail}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-60">
                          {log.subject}
                        </TableCell>
                        <TableCell className="text-xs text-red-600 max-w-80">
                          {(log.status === 'FAILED' || log.status === 'BOUNCED') && log.errorMessage ? (
                            <span className="block truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground text-right whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ Compose Email Dialog ═══ */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Enviar e-mail
            </DialogTitle>
            <DialogDescription>
              Envie um e-mail avulso para um cliente. O e-mail sairá com as configurações do remetente da sua loja.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Destinatário</Label>
              <Input
                type="email"
                placeholder="cliente@email.com"
                value={composeForm.to}
                onChange={(e) => setComposeForm((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assunto</Label>
              <Input
                placeholder="Assunto do e-mail"
                value={composeForm.subject}
                onChange={(e) => setComposeForm((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo HTML</Label>
              <textarea
                className="w-full h-40 p-3 text-xs font-mono bg-background border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="<p>Olá! Este é um e-mail da nossa loja.</p>"
                value={composeForm.bodyHtml}
                onChange={(e) => setComposeForm((p) => ({ ...p, bodyHtml: e.target.value }))}
              />
            </div>
            {composeForm.bodyHtml && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Label>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
