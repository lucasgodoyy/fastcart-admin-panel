import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsProductsPage() {
  return (
    <RoutePlaceholderPage
      title="Statistics · Products"
      description="Acompanhe itens mais vendidos, ruptura e margem por produto."
      links={[
        { label: 'Products', href: '/admin/products' },
        { label: 'Inventory', href: '/admin/products/inventory' },
      ]}
    />
  );
}
