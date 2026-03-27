import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Mail,
  Settings,
  Headset,
  Megaphone,
  Activity,
  MessageSquare,
  Palette,
  Bell,
  Handshake,
  Bug,
  Facebook,
  BarChart3,
  Globe,
  Server,
  Shield,
  ClipboardList,
  Map,
  DollarSign,
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
        title: "Atividade",
        href: "/super-admin/activity",
        icon: Activity,
      },
      {
        title: "Analytics",
        href: "/super-admin/analytics",
        icon: BarChart3,
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
          { title: "Pagamentos", href: "/super-admin/finance/payouts" },
          { title: "Taxas", href: "/super-admin/finance/fees" },
        ],
      },
      {
        title: "Domínios",
        href: "/super-admin/domains",
        icon: Globe,
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Campanhas",
        href: "/super-admin/marketing",
        icon: Megaphone,
        children: [
          { title: "Campanhas", href: "/super-admin/marketing" },
          { title: "Banners", href: "/super-admin/marketing/banners" },
          { title: "Push", href: "/super-admin/marketing/push" },
        ],
      },
      {
        title: "E-mail Marketing",
        href: "/super-admin/emails/campaigns",
        icon: Mail,
      },
      {
        title: "Afiliados",
        href: "/super-admin/affiliates",
        icon: Handshake,
        children: [
          { title: "Visão Geral", href: "/super-admin/affiliates" },
          { title: "Parceiros", href: "/super-admin/affiliates/partners" },
          { title: "Comissões", href: "/super-admin/affiliates/commissions" },
          { title: "Pagamentos", href: "/super-admin/affiliates/payouts" },
          { title: "Tracking", href: "/super-admin/affiliates/tracking" },
          { title: "Configurações", href: "/super-admin/affiliates/settings" },
        ],
      },
    ],
  },
  {
    label: "Comunicação",
    items: [
      {
        title: "Mensagens",
        href: "/super-admin/messages",
        icon: MessageSquare,
        children: [
          { title: "Mensagens", href: "/super-admin/messages" },
          { title: "Equipe", href: "/super-admin/messages/team" },
        ],
      },
      {
        title: "E-mails",
        href: "/super-admin/emails",
        icon: Mail,
        children: [
          { title: "Logs de Envio", href: "/super-admin/emails" },
          { title: "Templates", href: "/super-admin/emails/templates" },
          { title: "Configurações", href: "/super-admin/emails/config" },
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
      },
    ],
  },
  {
    label: "Relatórios",
    items: [
      {
        title: "Relatórios",
        href: "/super-admin/reports",
        icon: BarChart3,
        children: [
          { title: "Visão Geral", href: "/super-admin/reports" },
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
        title: "Segurança",
        href: "/super-admin/security",
        icon: Shield,
      },
      {
        title: "Infraestrutura",
        href: "/super-admin/infrastructure",
        icon: Server,
      },
      {
        title: "Logs de Erro",
        href: "/super-admin/error-logs",
        icon: Bug,
      },
      {
        title: "Configurações",
        href: "/super-admin/settings",
        icon: Settings,
        children: [
          { title: "Geral", href: "/super-admin/settings" },
          { title: "Integrações", href: "/super-admin/settings/integrations" },
          { title: "API Keys", href: "/super-admin/settings/api-keys" },
          { title: "Meta Ads", href: "/super-admin/settings/meta-ads" },
          { title: "TikTok", href: "/super-admin/settings/tiktok" },
        ],
      },
      {
        title: "Aparência",
        href: "/super-admin/appearance",
        icon: Palette,
      },
    ],
  },
  {
    label: "Planejamento",
    items: [
      {
        title: "Backlog",
        href: "/super-admin/backlog",
        icon: ClipboardList,
      },
      {
        title: "Roadmap",
        href: "/super-admin/roadmap",
        icon: Map,
      },
    ],
  },
];
