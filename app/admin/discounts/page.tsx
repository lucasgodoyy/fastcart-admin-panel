import Link from 'next/link';

export default function DiscountsPage() {
  return (
    <div className="p-8">
      <h1 className="text-5 font-semibold text-foreground">Discounts</h1>
      <p className="mt-2 text-sm text-muted-foreground">Selecione o tipo de desconto que deseja gerenciar.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/discounts/coupons"
          className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <p className="text-sm font-medium text-foreground">Coupons</p>
          <p className="mt-1 text-xs text-muted-foreground">Cupons com desconto percentual ou valor fixo.</p>
        </Link>

        <Link
          href="/admin/discounts/promotions"
          className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <p className="text-sm font-medium text-foreground">Promotions</p>
          <p className="mt-1 text-xs text-muted-foreground">Promoções Buy X Pay Y para catálogo.</p>
        </Link>
      </div>
    </div>
  );
}
