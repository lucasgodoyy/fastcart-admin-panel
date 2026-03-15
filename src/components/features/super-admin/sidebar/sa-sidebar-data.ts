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
        ],
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
        ],
      },
      {
        title: "E-mail Marketing",
        href: "/super-admin/emails/campaigns",
        icon: Mail,
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
      },
      {
        title: "E-mails",
        href: "/super-admin/emails",
        icon: Mail,
        children: [
          { title: "Logs de Envio", href: "/super-admin/emails" },
          { title: "Templates", href: "/super-admin/emails/templates" },
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
    label: "Plataforma",
    items: [
      {
        title: "Configurações",
        href: "/super-admin/settings",
        icon: Settings,
        children: [
          { title: "Geral", href: "/super-admin/settings" },
          { title: "Integrações", href: "/super-admin/settings/integrations" },
        ],
      },
      {
        title: "Aparência",
        href: "/super-admin/appearance",
        icon: Palette,
      },
    ],
  },
];
