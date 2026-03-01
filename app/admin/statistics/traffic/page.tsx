import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsTrafficPage() {
  return (
    <RoutePlaceholderPage
      title="Estatísticas · Tráfego"
      description="Aquisição por canal, mídia e origem de tráfego. Integre com Google Analytics para dados completos."
      links={[
        { label: 'Google Shopping', href: '/admin/google-shopping' },
      ]}
    />
  );
}
