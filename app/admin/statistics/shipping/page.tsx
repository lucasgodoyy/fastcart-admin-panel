import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsShippingPage() {
  return (
    <RoutePlaceholderPage
      title="Statistics · Shipping"
      description="Acompanhe custos, SLA e performance de frete."
      links={[{ label: 'Shipping Settings', href: '/admin/shipping' }]}
    />
  );
}
