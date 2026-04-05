import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Mail,
  Settings,
  Headset,
  BarChart3,
  DollarSign,
  PanelTop,
  Shield,
  Bell,
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
          { title: "Aprovações", href: "/super-admin/stores/approvals" },
        ],
      },
      {
        title: "Usuários",
        href: "/super-admin/users",
        icon: Users,
        children: [
          { title: "Todos os Usuários", href: "/super-admin/users" },
          { title: "Roles & Permissões", href: "/super-admin/users/roles" },
        ],
      },
      {
        title: "Assinaturas",
        href: "/super-admin/subscriptions",
        icon: CreditCard,
        children: [
          { title: "Planos", href: "/super-admin/subscriptions" },
          { title: "Assinantes", href: "/super-admin/subscriptions/subscribers" },
          { title: "Faturamento", href: "/super-admin/subscriptions/billing" },
        ],
      },
      {
        title: "Financeiro",
        href: "/super-admin/finance",
        icon: DollarSign,
        children: [
          { title: "Visão Geral", href: "/super-admin/finance" },
          { title: "Transações", href: "/super-admin/finance/transactions" },
        ],
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Landing Page",
        href: "/super-admin/landing",
        icon: PanelTop,
      },
      {
        title: "E-mails",
        href: "/super-admin/emails",
        icon: Mail,
        children: [
          { title: "Campanhas", href: "/super-admin/emails/campaigns" },
          { title: "Templates", href: "/super-admin/emails/templates" },
        ],
      },
    ],
  },
  {
    label: "Análises",
    items: [
      {
        title: "Relatórios",
        href: "/super-admin/reports",
        icon: BarChart3,
        children: [
          { title: "Visão Geral", href: "/super-admin/reports" },
          { title: "Crescimento", href: "/super-admin/reports/growth" },
        ],
      },
    ],
  },
  {
    label: "Suporte",
    items: [
      {
        title: "Suporte",
        href: "/super-admin/support",
        icon: Headset,
      },
      {
        title: "Notificações",
        href: "/super-admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Segurança",
        href: "/super-admin/security",
        icon: Shield,
      },
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
    ],
  },
];
