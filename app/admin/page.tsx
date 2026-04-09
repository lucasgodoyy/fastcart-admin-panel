import dynamic from 'next/dynamic'

const DashboardClient = dynamic(
  () => import('@/components/features/dashboard/DashboardClient').then(m => m.DashboardClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando dashboard...</div> }
)

export default function AdminPage() {
  return <DashboardClient />
}
