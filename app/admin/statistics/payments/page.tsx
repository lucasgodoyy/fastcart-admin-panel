import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsPaymentsPage() {
  return (
    <RoutePlaceholderPage
      title="Statistics · Payments"
      description="Acompanhe receita, ticket médio e conversão por pagamentos."
      links={[{ label: 'Payments Settings', href: '/admin/payments' }]}
    />
  );
}
