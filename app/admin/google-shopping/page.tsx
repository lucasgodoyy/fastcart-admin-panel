import { ChannelLinkClient } from '@/components/features/sales-channels/SalesChannelsClients';

export default function GoogleShoppingPage() {
  return (
    <ChannelLinkClient
      title="Google Shopping"
      description="Configure a URL do canal Google Shopping da loja."
      channelKey="googleShopping"
    />
  );
}
