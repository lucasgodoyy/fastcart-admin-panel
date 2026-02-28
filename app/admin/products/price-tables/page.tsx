import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function PriceTablesPage() {
  return (
    <RoutePlaceholderPage
      title="Products · Price Tables"
      description="Defina regras de preço e tabelas por canal ou condição comercial."
      links={[
        { label: 'Products', href: '/admin/products' },
        { label: 'Categories', href: '/admin/products/categories' },
      ]}
    />
  );
}
