import dynamic from 'next/dynamic'

const OrderListClient = dynamic(
  () => import('@/components/features/orders/OrderListClient').then(m => m.OrderListClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando pedidos...</div> }
)

export default function SalesListPage() {
  return <OrderListClient />
}
