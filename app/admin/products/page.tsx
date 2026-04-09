import dynamic from 'next/dynamic'

const ProductClient = dynamic(
  () => import('@/components/features/products/ProductClient').then(m => m.ProductClient),
  { loading: () => <div className="p-8 text-sm text-muted-foreground">Carregando produtos...</div> }
)

export default function ProductsPage() {
  return <ProductClient />
}
