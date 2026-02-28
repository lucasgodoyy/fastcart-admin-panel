import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function AbandonedCartsPage() {
  return (
    <RoutePlaceholderPage
      title="Vendas · Carrinhos abandonados"
      description="Monitore carrinhos abandonados e ações de recuperação."
      links={[{ label: 'Lista de vendas', href: '/admin/sales' }]}
    />
  );
}
