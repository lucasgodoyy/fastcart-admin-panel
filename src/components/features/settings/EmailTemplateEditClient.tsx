'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCcw,
  Send,
  Copy,
  Check,
  MonitorSmartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import emailService from '@/services/emailService';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────────────────────────
 *  Shared event definitions (key → defaults + variables)
 * ────────────────────────────────────────────────────────────────── */
type EmailEventDef = {
  key: string;
  backendKey: string;
  label: string;
  description: string;
  category: string;
  defaultSubject: string;
  defaultBody: string;
  variables: { name: string; desc: string }[];
};

const EMAIL_EVENT_DEFS: EmailEventDef[] = [
  {
    key: 'order_confirmation',
    backendKey: 'ORDER_PAID_CONFIRMATION',
    label: 'Confirmação de pedido',
    description: 'Enviado quando o cliente conclui um pedido.',
    category: 'Pedidos',
    defaultSubject: 'Pedido #{{ order.number }} confirmado — {{ store_name }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0;color:#111">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Pedido confirmado! 🎉</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Recebemos seu pedido <strong>#{{ order.number }}</strong> com sucesso.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Total</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">{{ order.total }}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ order.tracking_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Acompanhar pedido</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'order.total', desc: 'Valor total formatado' },
      { name: 'order.tracking_url', desc: 'Link de acompanhamento' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
    ],
  },
  {
    key: 'payment_confirmed',
    backendKey: 'ORDER_PAID_CONFIRMATION',
    label: 'Pagamento aprovado',
    description: 'Quando o pagamento é confirmado via Stripe.',
    category: 'Pedidos',
    defaultSubject: 'Pagamento aprovado — Pedido #{{ order.number }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Pagamento confirmado ✅</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Seu pagamento de <strong>{{ order.total }}</strong> para o pedido <strong>#{{ order.number }}</strong> foi aprovado. Estamos preparando seu pedido para envio.</p>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'order.total', desc: 'Valor total' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
    ],
  },
  {
    key: 'order_shipped',
    backendKey: 'ORDER_DISPATCHED_CONFIRMATION',
    label: 'Pedido enviado',
    description: 'Quando o pedido recebe código de rastreio.',
    category: 'Pedidos',
    defaultSubject: 'Seu pedido foi enviado! — #{{ order.number }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Pedido a caminho! 🚚</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Seu pedido <strong>#{{ order.number }}</strong> foi enviado.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Código de rastreio</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">{{ shipping.tracking_code }}</td></tr>
      <tr><td style="padding:8px 0;color:#666;font-size:13px">Transportadora</td><td style="padding:8px 0;text-align:right;font-weight:600">{{ shipping.carrier }}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ shipping.tracking_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Rastrear envio</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'shipping.tracking_code', desc: 'Código de rastreio' },
      { name: 'shipping.carrier', desc: 'Transportadora' },
      { name: 'shipping.tracking_url', desc: 'Link de rastreamento' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
    ],
  },
  {
    key: 'order_delivered',
    backendKey: 'ORDER_DELIVERED',
    label: 'Pedido entregue',
    description: 'Quando o pedido é entregue ao cliente.',
    category: 'Pedidos',
    defaultSubject: 'Pedido entregue! #{{ order.number }} — {{ store_name }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Pedido entregue! 📦</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Seu pedido <strong>#{{ order.number }}</strong> foi entregue com sucesso.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ review_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Avaliar compra</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'review_url', desc: 'Link para avaliar' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
    ],
  },
  {
    key: 'abandoned_cart',
    backendKey: 'ABANDONED_CART_RECOVERY',
    label: 'Carrinho abandonado',
    description: 'Recupere vendas com lembretes automáticos.',
    category: 'Pedidos',
    defaultSubject: 'Você esqueceu algo na {{ store_name }}!',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Você deixou itens no carrinho! 🛒</h2>
    <p>Olá, <strong>{{ cart.contact_name }}</strong>!</p>
    <p>Notamos que você adicionou <strong>{{ product.name }}</strong> ao carrinho, mas não finalizou a compra.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ cart.abandoned_checkout_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Voltar ao carrinho</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }}</p>
  </div>
</div>`,
    variables: [
      { name: 'cart.contact_name', desc: 'Nome do cliente' },
      { name: 'product.name', desc: 'Nome do produto' },
      { name: 'cart.abandoned_checkout_url', desc: 'Link ao carrinho' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'refund_confirmation',
    backendKey: 'REFUND_CONFIRMATION',
    label: 'Reembolso confirmado',
    description: 'Quando um reembolso é processado.',
    category: 'Pedidos',
    defaultSubject: 'Reembolso processado — Pedido #{{ order.number }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Reembolso processado</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>O reembolso de <strong>{{ refund.amount }}</strong> do pedido <strong>#{{ order.number }}</strong> foi processado. O valor será creditado em até 10 dias úteis.</p>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'order.number', desc: 'Número do pedido' },
      { name: 'refund.amount', desc: 'Valor do reembolso' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
    ],
  },
  {
    key: 'welcome',
    backendKey: 'WELCOME',
    label: 'Boas-vindas',
    description: 'Quando um novo cliente cria conta na loja.',
    category: 'Clientes',
    defaultSubject: 'Bem-vindo à {{ store_name }}!',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Bem-vindo! 👋</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Sua conta na <strong>{{ store_name }}</strong> foi criada com sucesso. Explore nossos produtos e encontre o que precisa.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ store_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Visitar loja</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'customer.email', desc: 'E-mail do cliente' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
      { name: 'store_url', desc: 'URL da loja' },
    ],
  },
  {
    key: 'password_reset',
    backendKey: 'PASSWORD_RESET',
    label: 'Recuperação de senha',
    description: 'Quando o cliente solicita redefinição de senha.',
    category: 'Clientes',
    defaultSubject: 'Redefina sua senha — {{ store_name }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Redefinição de senha</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Recebemos uma solicitação de redefinição de senha para sua conta.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ reset_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Redefinir senha</a>
    </div>
    <p style="font-size:13px;color:#666">Se você não solicitou esta alteração, ignore este e-mail. O link expira em 24 horas.</p>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }} — {{ store_email }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'reset_url', desc: 'Link de redefinição' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'store_email', desc: 'E-mail da loja' },
    ],
  },
  {
    key: 'review_request',
    backendKey: 'REVIEW_REQUEST',
    label: 'Pedir avaliação',
    description: 'Solicite avaliação depois da entrega.',
    category: 'Marketing',
    defaultSubject: 'Avalie sua compra na {{ store_name }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Conte-nos o que achou! ⭐</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Esperamos que tenha gostado da compra. Sua opinião é muito importante para nós!</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ review_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Avaliar minha compra</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'review_url', desc: 'Link para avaliar' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'coupon_gift',
    backendKey: 'COUPON_GIFT',
    label: 'Cupom de presente',
    description: 'Envie cupons de desconto automaticamente.',
    category: 'Marketing',
    defaultSubject: 'Presente pra você! {{ coupon.code }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Temos um presente pra você! 🎁</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Use o cupom abaixo na sua próxima compra:</p>
    <div style="margin:24px 0;padding:20px;border:2px dashed #111;text-align:center;border-radius:8px">
      <strong style="font-size:26px;letter-spacing:3px">{{ coupon.code }}</strong>
      <p style="margin-top:8px;color:#666;font-size:13px">{{ coupon.description }}</p>
    </div>
    <div style="text-align:center;margin:20px 0">
      <a href="{{ store_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Comprar agora</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'coupon.code', desc: 'Código do cupom' },
      { name: 'coupon.description', desc: 'Descrição do desconto' },
      { name: 'store_url', desc: 'URL da loja' },
      { name: 'store_name', desc: 'Nome da loja' },
    ],
  },
  {
    key: 'new_message',
    backendKey: 'CONTACT_FORM_NOTIFICATION',
    label: 'Nova mensagem no chat',
    description: 'Notificar cliente sobre nova mensagem.',
    category: 'Sistema',
    defaultSubject: 'Nova mensagem de {{ store_name }}',
    defaultBody: `<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px">
  <div style="text-align:center;padding:30px 0;border-bottom:2px solid #f0f0f0">
    <h1 style="font-size:22px;font-weight:700;margin:0">{{ store_name }}</h1>
  </div>
  <div style="padding:32px 0">
    <h2 style="font-size:20px;margin:0 0 16px">Você recebeu uma mensagem 💬</h2>
    <p>Olá, <strong>{{ customer.name }}</strong>!</p>
    <p>Há uma nova mensagem para você na <strong>{{ store_name }}</strong>.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{ chat_url }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px">Ver mensagem</a>
    </div>
  </div>
  <div style="border-top:1px solid #f0f0f0;padding-top:20px;text-align:center;font-size:12px;color:#999">
    <p>{{ store_name }}</p>
  </div>
</div>`,
    variables: [
      { name: 'customer.name', desc: 'Nome do cliente' },
      { name: 'store_name', desc: 'Nome da loja' },
      { name: 'chat_url', desc: 'Link para conversa' },
    ],
  },
];

/* Resolve event def from URL slug or backend key */
function resolveEventDef(templateSlug: string): EmailEventDef | undefined {
  // Try direct key match first
  let found = EMAIL_EVENT_DEFS.find((e) => e.key === templateSlug);
  if (found) return found;
  // Try backend key match
  found = EMAIL_EVENT_DEFS.find(
    (e) => e.backendKey === templateSlug.toUpperCase().replace(/-/g, '_'),
  );
  return found;
}

/* Preview variable substitution */
const PREVIEW_VALUES: Record<string, string> = {
  'customer.name': 'Maria Silva',
  'customer.email': 'maria@exemplo.com',
  'order.number': '1042',
  'order.total': 'R$ 349,90',
  'order.tracking_url': '#',
  'shipping.tracking_code': 'BR123456789BR',
  'shipping.carrier': 'Correios',
  'shipping.tracking_url': '#',
  'cart.contact_name': 'João Costa',
  'cart.abandoned_checkout_url': '#',
  'product.name': 'Tênis Esportivo',
  'refund.amount': 'R$ 120,00',
  'review_url': '#',
  'reset_url': '#',
  'chat_url': '#',
  'coupon.code': 'BEM10OFF',
  'coupon.description': '10% de desconto na próxima compra',
  store_name: 'Minha Loja',
  store_email: 'contato@minhaloja.com',
  store_url: 'https://minhaloja.com',
};

function previewSubstitute(html: string): string {
  return Object.entries(PREVIEW_VALUES).reduce(
    (acc, [key, val]) =>
      acc
        .replace(new RegExp(`\\{\\{\\s*${key.replace('.', '\\.')}\\s*\\}\\}`, 'g'), val),
    html,
  );
}

interface Props {
  templateSlug: string;
}

export function EmailTemplateEditClient({ templateSlug }: Props) {
  const queryClient = useQueryClient();
  const eventDef = resolveEventDef(templateSlug);
  const backendKey = eventDef?.backendKey ?? templateSlug.toUpperCase().replace(/-/g, '_');

  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [showTestEmail, setShowTestEmail] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    subject: eventDef?.defaultSubject ?? '',
    bodyHtml: eventDef?.defaultBody ?? '',
    active: true,
  });

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const templates = await emailService.listTemplates();
      const found = templates.find((t) => t.templateKey === backendKey);
      if (found) {
        setForm({ subject: found.subject, bodyHtml: found.bodyHtml, active: found.active });
      }
      // If not found in DB, keep defaults (no "not found" error)
    } catch {
      toast.error('Erro ao carregar template.');
    } finally {
      setLoading(false);
    }
  }, [backendKey]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const saveMutation = useMutation({
    mutationFn: () =>
      emailService.upsertTemplate(backendKey, {
        subject: form.subject.trim(),
        bodyHtml: form.bodyHtml.trim(),
        active: form.active,
      }),
    onSuccess: () => {
      toast.success('Template salvo com sucesso!');
      void queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
    onError: () => toast.error('Erro ao salvar template.'),
  });

  const sendTestMutation = useMutation({
    mutationFn: () => emailService.sendTestEmail(testEmail, backendKey),
    onSuccess: () => {
      toast.success(`E-mail de teste enviado para ${testEmail}!`);
      setTestEmail('');
      setShowTestEmail(false);
    },
    onError: () => toast.error('Falha ao enviar e-mail de teste.'),
  });

  const handleSave = () => {
    if (!form.subject.trim()) { toast.error('Assunto é obrigatório.'); return; }
    if (!form.bodyHtml.trim()) { toast.error('Conteúdo é obrigatório.'); return; }
    saveMutation.mutate();
  };

  const insertVariable = (varName: string) => {
    const tag = `{{ ${varName} }}`;
    const ta = textareaRef.current;
    if (!ta) {
      navigator.clipboard.writeText(tag);
      toast.success(`${tag} copiado!`);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = form.bodyHtml.slice(0, start) + tag + form.bodyHtml.slice(end);
    setForm((p) => ({ ...p, bodyHtml: newVal }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + tag.length, start + tag.length);
    });
  };

  const copyVariable = (varName: string) => {
    navigator.clipboard.writeText(`{{ ${varName} }}`);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const restoreDefaults = () => {
    if (!eventDef) return;
    setForm({ subject: eventDef.defaultSubject, bodyHtml: eventDef.defaultBody, active: form.active });
    toast.info('Template restaurado ao padrão.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const variables = eventDef?.variables ?? [];

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-3">
          <Link
            href="/admin/settings/emails"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            E-mails
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {eventDef?.label ?? 'Template de e-mail'}
            </h1>
            {eventDef && (
              <p className="text-xs text-muted-foreground truncate">{eventDef.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Active toggle */}
            <div className="flex items-center gap-2 border-r border-border pr-3 mr-1">
              <span className="text-xs text-muted-foreground">Ativo</span>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
              />
            </div>
            {/* Preview toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPreview ? 'Fechar preview' : 'Preview'}
            </Button>
            {/* Save */}
            <Button
              size="sm"
              className="gap-1.5 h-8"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Salvar template
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={cn('flex flex-1 gap-0', showPreview ? 'divide-x divide-border' : '')}>
        {/* Left: Editor */}
        <div className={cn('flex flex-col gap-5 p-6 overflow-y-auto', showPreview ? 'w-1/2' : 'w-full max-w-3xl mx-auto')}>

          {/* Category badge */}
          {eventDef && (
            <Badge variant="outline" className="w-fit text-xs text-muted-foreground">
              {eventDef.category}
            </Badge>
          )}

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="emailSubject" className="text-sm font-medium">
              Assunto do e-mail
            </Label>
            <Input
              id="emailSubject"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Bem-vindo à {{ store_name }}!"
              className="font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Este é o assunto que aparecerá na caixa de entrada do cliente.
            </p>
          </div>

          {/* Body editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Conteúdo do e-mail (HTML)</Label>
              {eventDef && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={restoreDefaults}
                >
                  <RotateCcw className="h-3 w-3" />
                  Restaurar padrão
                </button>
              )}
            </div>
            <textarea
              ref={textareaRef}
              className="flex min-h-105 w-full rounded-md border border-input bg-background px-3 py-2.5 text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              value={form.bodyHtml}
              onChange={(e) => setForm((p) => ({ ...p, bodyHtml: e.target.value }))}
              placeholder="<html><body><h1>Olá {{ customer.name }}</h1></body></html>"
            />
            <p className="text-xs text-muted-foreground">
              Cole HTML completo ou edite o template acima. Clique em uma variável abaixo para inserir no cursor.
            </p>
          </div>

          {/* Variables panel */}
          {variables.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Variáveis disponíveis</p>
              <p className="text-xs text-muted-foreground">
                Clique para inserir no editor • Clique no ícone para copiar
              </p>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <div key={v.name} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertVariable(v.name)}
                      title={v.desc}
                      className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      {`{{ ${v.name} }}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyVariable(v.name)}
                      className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar"
                    >
                      {copiedVar === v.name ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 grid gap-1">
                {variables.map((v) => (
                  <div key={v.name} className="flex items-center gap-2 text-xs">
                    <code className="font-mono text-[10px] text-muted-foreground">{`{{ ${v.name} }}`}</code>
                    <span className="text-muted-foreground">— {v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send test email */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enviar e-mail de teste</p>
                <p className="text-xs text-muted-foreground">Verifique como ficará na caixa de entrada.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestEmail((v) => !v)}
              >
                {showTestEmail ? 'Fechar' : 'Enviar teste'}
              </Button>
            </div>
            {showTestEmail && (
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sendTestMutation.isPending || !testEmail}
                  onClick={() => sendTestMutation.mutate()}
                >
                  {sendTestMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Bottom save */}
          <div className="flex items-center justify-end pb-6">
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-1.5">
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar template
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col bg-muted/20">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background">
              <p className="text-xs font-semibold text-foreground">Preview</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    'rounded p-1.5 transition-colors',
                    previewDevice === 'desktop'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <MonitorSmartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Subject preview */}
              <div className="mb-3 rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5">Assunto</p>
                <p className="text-sm font-medium text-foreground">
                  {previewSubstitute(form.subject) || '(sem assunto)'}
                </p>
              </div>
              {/* HTML preview */}
              <div
                className={cn(
                  'rounded-lg border border-border bg-white overflow-auto',
                  previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full',
                )}
                style={{ minHeight: 400 }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: previewSubstitute(form.bodyHtml) }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
