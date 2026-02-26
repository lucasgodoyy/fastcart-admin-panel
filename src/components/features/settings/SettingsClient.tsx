'use client';

import Link from 'next/link';
import {
  ChevronRight,
  User,
  Users,
  Truck,
  MapPin,
  CreditCard,
  Mail,
  Globe,
  ShoppingCart,
  FileText,
  MessageSquare,
  ArrowRightLeft,
  Link2,
  Plug,
} from 'lucide-react';

interface SettingsItem {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const settingsItems: SettingsItem[] = [
  {
    label: 'Informacao de contato',
    description: 'Dados da empresa, e-mail e endereco.',
    href: '/admin/settings/contact-info',
    icon: <User className="h-5 w-5" />,
  },
  {
    label: 'Usuarios e notificacoes',
    description: 'Gerencie usuarios e permissoes de acesso.',
    href: '/admin/settings/users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Meios de envio',
    description: 'Configure transportadoras e entregas personalizadas.',
    href: '/admin/settings/shipping-methods',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    label: 'Centros de distribuicao',
    description: 'Defina de onde seus produtos serao enviados.',
    href: '/admin/settings/distribution-centers',
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    label: 'Meios de pagamento',
    description: 'Configure as formas de pagamento da loja.',
    href: '/admin/settings/payment-methods',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: 'E-mails automaticos',
    description: 'Personalize os e-mails enviados aos clientes.',
    href: '/admin/settings/emails',
    icon: <Mail className="h-5 w-5" />,
  },
  {
    label: 'Idiomas e moedas',
    description: 'Configure paises, idiomas e taxas de cambio.',
    href: '/admin/settings/languages',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    label: 'Opcoes do checkout',
    description: 'Dados do cliente, layout e restricoes de compra.',
    href: '/admin/settings/checkout',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: 'Campos personalizados',
    description: 'Adicione informacoes exclusivas a sua loja.',
    href: '/admin/settings/custom-fields',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Mensagem para clientes',
    description: 'Exiba uma mensagem no checkout e no frete.',
    href: '/admin/settings/messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: 'Redirecionamentos 301',
    description: 'Redirecione URLs antigas para novas.',
    href: '/admin/settings/redirects',
    icon: <ArrowRightLeft className="h-5 w-5" />,
  },
  {
    label: 'Dominios',
    description: 'Gerencie os dominios da sua loja.',
    href: '/admin/settings/domains',
    icon: <Link2 className="h-5 w-5" />,
  },
  {
    label: 'Integracoes',
    description: 'Stripe Connect e Melhor Envio.',
    href: '/admin/settings/integrations',
    icon: <Plug className="h-5 w-5" />,
  },
];

export function SettingsClient() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie todas as configuracoes da sua loja.
        </p>
      </div>

      <div className="grid gap-2">
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:bg-accent/50 group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
