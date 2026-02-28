import { ChannelLinkClient } from '@/components/features/sales-channels/SalesChannelsClients';

export default function PointOfSalePage() {
  return (
    <ChannelLinkClient
      title="Ponto de venda"
      description="Configure a URL do canal de ponto de venda."
      channelKey="pointOfSale"
    />
  );
}
