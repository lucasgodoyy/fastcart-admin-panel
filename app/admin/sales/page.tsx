import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function SalesListPage() {
  return (
    <RoutePlaceholderPage
      title="Vendas"
      description="Gerencie pedidos, crie pedidos manuais e acompanhe carrinhos abandonados."
      links={[
        { label: 'Pedidos manuais', href: '/admin/sales/manual-orders' },
        { label: 'Carrinhos abandonados', href: '/admin/sales/abandoned-carts' },
      ]}
    />
  );
}
