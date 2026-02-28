import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function FreeShippingPage() {
  return (
    <RoutePlaceholderPage
      title="Discounts · Free Shipping"
      description="Configure campanhas e regras de frete grátis por condição."
      links={[
        { label: 'Coupons', href: '/admin/discounts/coupons' },
        { label: 'Promotions', href: '/admin/discounts/promotions' },
      ]}
    />
  );
}
