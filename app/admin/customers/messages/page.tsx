import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function CustomerMessagesPage() {
  return (
    <RoutePlaceholderPage
      title="Customers · Messages"
      description="Acompanhe e responda mensagens dos clientes."
      links={[{ label: 'Customer List', href: '/admin/customers' }]}
    />
  );
}
