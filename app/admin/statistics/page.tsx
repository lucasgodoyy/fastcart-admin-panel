import dynamic from 'next/dynamic'

const StatisticsOverviewClient = dynamic(
  () => import('@/components/features/statistics/StatisticsOverviewClient').then(m => m.StatisticsOverviewClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando estatísticas...</div> }
)

export default function StatisticsOverviewPage() {
  return <StatisticsOverviewClient />
}
