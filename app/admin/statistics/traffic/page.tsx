import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsTrafficPage() {
  return (
    <RoutePlaceholderPage
      title="Statistics · Traffic Sources"
      description="Acompanhe aquisição por canal, mídia e origem de tráfego."
      links={[
        { label: 'Google Shopping', href: '/admin/google-shopping' },
        { label: 'Instagram & Facebook', href: '/admin/instagram-facebook' },
      ]}
    />
  );
}
