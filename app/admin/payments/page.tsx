import dynamic from 'next/dynamic'

const FinanceClient = dynamic(
  () => import('@/components/features/finance/FinanceClient').then(m => m.FinanceClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando financeiro...</div> }
)

export default function PaymentsPage() {
  return <FinanceClient />
}
