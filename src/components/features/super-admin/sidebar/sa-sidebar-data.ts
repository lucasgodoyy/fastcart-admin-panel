import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Mail,
  BarChart3,
  Settings,
  Headset,
  Globe,
  Shield,
  Megaphone,
  Wallet,
  FileText,
  Link2,
  Activity,
  Bell,
  Database,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface SASidebarChild {
  title: string;
  href: string;
  badge?: string;
}

export interface SASidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger";
  children?: SASidebarChild[];
}

export interface SASidebarSection {
  label: string;
  items: SASidebarItem[];
}

export const saSidebarSections: SASidebarSection[] = [
  {
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        href: "/super-admin",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/super-admin/analytics",
        icon: BarChart3,
      },
      {
        title: "Atividade",
        href: "/super-admin/activity",
        icon: Activity,
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Lojas",
        href: "/super-admin/stores",
        icon: Building2,
        children: [
          { title: "Todas as Lojas", href: "/super-admin/stores" },
          { title: "Aprovações", href: "/super-admin/stores/approvals", badge: "3" },
          { title: "Performance", href: "/super-admin/stores/performance" },
        ],
      },
      {
        title: "Usuários",
        href: "/super-admin/users",
        icon: Users,
        children: [
          { title: "Todos os Usuários", href: "/super-admin/users" },
          { title: "Roles & Permissões", href: "/super-admin/users/roles" },
          { title: "Sessões Ativas", href: "/super-admin/users/sessions" },
        ],
      },
      {
        title: "Assinaturas",
        href: "/super-admin/subscriptions",
        icon: CreditCard,
        badgeVariant: "success",
        children: [
          { title: "Planos", href: "/super-admin/subscriptions" },
          { title: "Assinantes", href: "/super-admin/subscriptions/subscribers" },
          { title: "Faturamento", href: "/super-admin/subscriptions/billing" },
        ],
      },
    ],
  },
  {
    label: "Marketing & Afiliados",
    items: [
      {
        title: "Afiliados",
        href: "/super-admin/affiliates",
        icon: Link2,
        children: [
          { title: "Programa", href: "/super-admin/affiliates" },
          { title: "Partners", href: "/super-admin/affiliates/partners" },
          { title: "Comissões", href: "/super-admin/affiliates/commissions" },
          { title: "Links & Tracking", href: "/super-admin/affiliates/tracking" },
        ],
      },
      {
        title: "Marketing",
        href: "/super-admin/marketing",
        icon: Megaphone,
        children: [
          { title: "Campanhas", href: "/super-admin/marketing" },
          { title: "Push Notifications", href: "/super-admin/marketing/push" },
          { title: "Banners", href: "/super-admin/marketing/banners" },
        ],
      },
    ],
  },
  {
    label: "Comunicação",
    items: [
      {
        title: "E-mails",
        href: "/super-admin/emails",
        icon: Mail,
        children: [
          { title: "Logs de Envio", href: "/super-admin/emails" },
          { title: "Templates", href: "/super-admin/emails/templates" },
          { title: "Configuração SMTP", href: "/super-admin/emails/config" },
        ],
      },
      {
        title: "Notificações",
        href: "/super-admin/notifications",
        icon: Bell,
      },
      {
        title: "Suporte",
        href: "/super-admin/support",
        icon: Headset,
        badge: "5",
        badgeVariant: "warning",
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        title: "Finanças",
        href: "/super-admin/finance",
        icon: Wallet,
        children: [
          { title: "Visão Geral", href: "/super-admin/finance" },
          { title: "Transações", href: "/super-admin/finance/transactions" },
          { title: "Repasses", href: "/super-admin/finance/payouts" },
          { title: "Taxas", href: "/super-admin/finance/fees" },
        ],
      },
      {
        title: "Relatórios",
        href: "/super-admin/reports",
        icon: FileText,
        children: [
          { title: "Receita", href: "/super-admin/reports" },
          { title: "Crescimento", href: "/super-admin/reports/growth" },
          { title: "Exportar", href: "/super-admin/reports/export" },
        ],
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      {
        title: "Configurações",
        href: "/super-admin/settings",
        icon: Settings,
        children: [
          { title: "Geral", href: "/super-admin/settings" },
          { title: "Integrações", href: "/super-admin/settings/integrations" },
          { title: "API Keys", href: "/super-admin/settings/api-keys" },
        ],
      },
      {
        title: "Segurança",
        href: "/super-admin/security",
        icon: Shield,
      },
      {
        title: "Aparência",
        href: "/super-admin/appearance",
        icon: Palette,
      },
      {
        title: "Domínios",
        href: "/super-admin/domains",
        icon: Globe,
      },
      {
        title: "Infraestrutura",
        href: "/super-admin/infrastructure",
        icon: Database,
      },
    ],
  },
];
