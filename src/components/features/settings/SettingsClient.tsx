'use client';

import Link from 'next/link';
import {
  ChevronRight,
  User,
  Users2,
  Truck,
  MapPin,
  CreditCard,
  Mail,
  Globe,
  ShoppingBag,
  FileText,
  MessageSquare,
  ArrowRightLeft,
  Link2,
  Plug,
} from 'lucide-react';
import { t } from '@/lib/admin-language';

interface SettingsItem {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const settingsItems: SettingsItem[] = [
  {
    label: t('Informações de contato', 'Contact info'),
    description: t('Dados da empresa, e-mail e endereço.', 'Company details, email, and address.'),
    href: '/admin/settings/contact-info',
    icon: <User className="h-5 w-5" />,
  },
  {
    label: t('Usuários e notificações', 'Users & notifications'),
    description: t('Gerencie usuários e permissões de acesso.', 'Manage users and access permissions.'),
    href: '/admin/settings/users',
    icon: <Users2 className="h-5 w-5" />,
  },
  {
    label: t('Meios de envio', 'Shipping methods'),
    description: t('Configure transportadoras e entregas personalizadas.', 'Configure carriers and custom deliveries.'),
    href: '/admin/settings/shipping-methods',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    label: t('Centros de distribuição', 'Distribution centers'),
    description: t('Defina de onde os produtos serão enviados.', 'Define where products are shipped from.'),
    href: '/admin/settings/distribution-centers',
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    label: t('Meios de pagamento', 'Payment methods'),
    description: t('Configure formas de pagamento aceitas.', 'Configure accepted payment methods.'),
    href: '/admin/settings/payment-methods',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: t('E-mails automáticos', 'Automated emails'),
    description: t('Personalize e-mails enviados aos clientes.', 'Customize emails sent to customers.'),
    href: '/admin/settings/emails',
    icon: <Mail className="h-5 w-5" />,
  },
  {
    label: t('Idiomas e moedas', 'Languages & currencies'),
    description: t('Configure países, idiomas e taxas de câmbio.', 'Configure countries, languages, and exchange rates.'),
    href: '/admin/settings/languages',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    label: t('Opções do checkout', 'Checkout options'),
    description: t('Dados do cliente, layout e restrições de compra.', 'Customer data, layout, and purchase restrictions.'),
    href: '/admin/settings/checkout',
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    label: t('Campos personalizados', 'Custom fields'),
    description: t('Adicione informações únicas à sua loja.', 'Add unique information to your store.'),
    href: '/admin/settings/custom-fields',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: t('Mensagens para clientes', 'Customer messages'),
    description: t('Mostre mensagens no checkout e no frete.', 'Show a message at checkout and shipping.'),
    href: '/admin/settings/messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: '301 Redirects',
    description: t('Redirecione URLs antigas para novas.', 'Redirect old URLs to new ones.'),
    href: '/admin/settings/redirects',
    icon: <ArrowRightLeft className="h-5 w-5" />,
  },
  {
    label: t('Domínios', 'Domains'),
    description: t('Gerencie os domínios da sua loja.', 'Manage your store domains.'),
    href: '/admin/settings/domains',
    icon: <Link2 className="h-5 w-5" />,
  },
  {
    label: t('Integrações', 'Integrations'),
    description: t('Stripe Connect e Melhor Envio.', 'Stripe Connect and Melhor Envio.'),
    href: '/admin/settings/integrations',
    icon: <Plug className="h-5 w-5" />,
  },
];

export function SettingsClient() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{t('Configurações', 'Settings')}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {t('Gerencie todas as configurações da sua loja.', 'Manage all your store settings.')}
        </p>
      </div>

      <div className="grid gap-1.5">
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-primary/30 hover:shadow-sm group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-accent transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

