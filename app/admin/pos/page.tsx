import { ChannelLinkClient } from '@/components/features/sales-channels/SalesChannelsClients';

export default function PointOfSalePage() {
  return (
    <ChannelLinkClient
      title="Point of Sale"
      description="Configure a URL do canal de ponto de venda."
      channelKey="pointOfSale"
    />
  );
}
