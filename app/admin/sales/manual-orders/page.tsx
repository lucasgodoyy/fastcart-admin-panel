import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function ManualOrdersPage() {
  return (
    <RoutePlaceholderPage
      title="Vendas · Pedidos manuais"
      description="Crie pedidos manuais para vendas internas e atendimento."
      links={[{ label: 'Lista de vendas', href: '/admin/sales' }]}
    />
  );
}
