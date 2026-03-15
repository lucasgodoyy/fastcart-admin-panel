'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MessageSquare, Search, ShieldCheck, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import reviewService, { type ReviewStatus, type StoreReview, type StoreReviewStats } from '@/services/sales/reviewService';

const statusOptions: Array<{ value: 'ALL' | ReviewStatus; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<ReviewStatus, string> = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovada',
    REJECTED: 'Rejeitada',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export function ReviewsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ReviewStatus>('ALL');

  const { data: reviews = [], isLoading } = useQuery<StoreReview[]>({
    queryKey: ['store-reviews', status],
    queryFn: () => reviewService.list(status),
  });

  const { data: stats } = useQuery<StoreReviewStats>({
    queryKey: ['store-review-stats'],
    queryFn: reviewService.getStats,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ reviewId, nextStatus }: { reviewId: number; nextStatus: ReviewStatus }) => reviewService.moderate(reviewId, nextStatus),
    onSuccess: () => {
      toast.success('Avaliação atualizada.');
      queryClient.invalidateQueries({ queryKey: ['store-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['store-review-stats'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Não foi possível atualizar a avaliação.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => reviewService.remove(reviewId),
    onSuccess: () => {
      toast.success('Avaliação removida.');
      queryClient.invalidateQueries({ queryKey: ['store-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['store-review-stats'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Não foi possível excluir a avaliação.');
    },
  });

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter((review) => {
      const haystack = [
        review.productName,
        review.customerName,
        review.customerEmail,
        review.title,
        review.body,
        review.status,
        review.orderId ? String(review.orderId) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [reviews, search]);

  const breakdown = stats?.ratingBreakdown || {};

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-5 font-semibold text-foreground">Avaliações</h1>
          <p className="mt-1 text-sm text-muted-foreground">Modere avaliações de produtos, acompanhe pendências e mantenha a vitrine confiável.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{stats?.totalReviews ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pendentes</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{stats?.pendingReviews ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aprovadas</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats?.approvedReviews ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rejeitadas</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">{stats?.rejectedReviews ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nota média</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{stats?.averageApprovedRating ?? '-'}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr,320px]">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por produto, cliente, email, título ou conteúdo"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${status === option.value ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:bg-muted'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquare className="h-4 w-4" />
            Distribuição das notas aprovadas
          </div>
          <div className="mt-4 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = breakdown[String(rating)] || 0;
              const percentage = stats?.approvedReviews ? (count / stats.approvedReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-muted-foreground">{rating}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Produto</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Cliente</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Nota</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Conteúdo</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Status</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Criada em</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Carregando avaliações...</td>
              </tr>
            )}

            {!isLoading && filteredReviews.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma avaliação encontrada.</td>
              </tr>
            )}

            {!isLoading && filteredReviews.map((review) => (
              <tr key={review.id} className="border-b border-border align-top transition-colors hover:bg-muted/40">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-foreground">{review.productName || `Produto #${review.productId}`}</div>
                  <div className="mt-1 text-xs text-muted-foreground">ID {review.productId}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-foreground">{review.customerName || `Cliente #${review.customerId}`}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{review.customerEmail || '-'}</div>
                  {review.verifiedPurchase && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Compra verificada
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm"><RatingStars rating={review.rating} /></td>
                <td className="px-4 py-3 text-sm text-foreground">
                  <div className="font-medium">{review.title || '-'}</div>
                  <p className="mt-1 max-w-[360px] whitespace-pre-wrap text-muted-foreground">{review.body || '-'}</p>
                </td>
                <td className="px-4 py-3 text-sm"><StatusBadge status={review.status} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {review.status !== 'APPROVED' && (
                      <Button size="sm" onClick={() => moderateMutation.mutate({ reviewId: review.id, nextStatus: 'APPROVED' })}>
                        <Check className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                    )}
                    {review.status !== 'REJECTED' && (
                      <Button size="sm" variant="outline" onClick={() => moderateMutation.mutate({ reviewId: review.id, nextStatus: 'REJECTED' })}>
                        <X className="mr-2 h-4 w-4" />
                        Rejeitar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(review.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
