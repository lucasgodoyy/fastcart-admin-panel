import { RoutePlaceholderPage } from '@/components/admin/RoutePlaceholderPage';

export default function MarketingPage() {
  return (
    <RoutePlaceholderPage
      title="Marketing"
      description="Gerencie campanhas e canais de aquisição."
      links={[
        { label: 'Google Shopping', href: '/admin/google-shopping' },
        { label: 'Instagram & Facebook', href: '/admin/instagram-facebook' },
        { label: 'TikTok', href: '/admin/tiktok' },
        { label: 'Pinterest', href: '/admin/pinterest' },
      ]}
    />
  );
}
