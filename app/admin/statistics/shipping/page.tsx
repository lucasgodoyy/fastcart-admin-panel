import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsShippingPage() {
  return (
    <RoutePlaceholderPage
      title="Estatísticas · Envio"
      description="Análise de custos de frete, SLA de entrega e métricas de logística. Dados serão exibidos quando houver pedidos com envio."
      links={[{ label: 'Configurações de Envio', href: '/admin/shipping' }]}
    />
  );
}
