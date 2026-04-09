import dynamic from 'next/dynamic'

const CustomerClient = dynamic(
  () => import('@/components/features/customers/CustomerClient').then(m => m.CustomerClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando clientes...</div> }
)

export default function CustomersPage() {
  return <CustomerClient />
}
