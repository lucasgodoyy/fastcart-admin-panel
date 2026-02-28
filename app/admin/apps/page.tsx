import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function AppsPage() {
  return (
    <RoutePlaceholderPage
      title="Apps"
      description="Gerencie aplicativos e integrações complementares da loja."
      links={[
        { label: 'Payments', href: '/admin/payments' },
        { label: 'Shipping', href: '/admin/shipping' },
      ]}
    />
  );
}
