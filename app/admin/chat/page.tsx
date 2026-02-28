import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function ChatPage() {
  return (
    <RoutePlaceholderPage
      title="Chat"
      description="Central de mensagens para atendimento e comunicação com clientes."
      links={[{ label: 'Customers', href: '/admin/customers' }]}
    />
  );
}
