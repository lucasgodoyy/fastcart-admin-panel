import dynamic from 'next/dynamic'

const MarketingClient = dynamic(
  () => import('@/components/features/marketing/MarketingClient').then(m => m.MarketingClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando marketing...</div> }
)

export default function MarketingPage() {
  return <MarketingClient />
}
