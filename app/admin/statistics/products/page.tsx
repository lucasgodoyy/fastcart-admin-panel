import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function StatisticsProductsPage() {
  return (
    <RoutePlaceholderPage
      title="Estatísticas · Produtos"
      description="Ranking de itens mais vendidos, análise de margem e estoque. Dados serão exibidos quando houver vendas."
      links={[
        { label: 'Catálogo', href: '/admin/products' },
        { label: 'Estoque', href: '/admin/products/inventory' },
      ]}
    />
  );
}
