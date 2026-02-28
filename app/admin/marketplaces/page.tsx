import { ChannelLinkClient } from '@/components/features/sales-channels/SalesChannelsClients';

export default function MarketplacesPage() {
  return (
    <ChannelLinkClient
      title="Marketplaces e hubs"
      description="Configure a URL do canal de marketplaces da loja."
      channelKey="marketplaces"
    />
  );
}
