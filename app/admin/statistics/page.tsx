import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsOverviewPage() {
  return (
    <RoutePlaceholderPage
      title="Statistics"
      description="Visão geral dos indicadores da operação."
      links={[
        { label: 'Payments', href: '/admin/statistics/payments' },
        { label: 'Shipping', href: '/admin/statistics/shipping' },
        { label: 'Products', href: '/admin/statistics/products' },
        { label: 'Traffic Sources', href: '/admin/statistics/traffic' },
      ]}
    />
  );
}
