'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Search, ChevronLeft, ChevronRight, User2 } from 'lucide-react';
import activityService, { ActivityLogPage } from '@/services/activityService';
import { t } from '@/lib/admin-language';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

const actionTypeColors: Record<string, string> = {
  ORDER_PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ORDER_DISPATCHED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  ORDER_DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PRODUCT_CREATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PRODUCT_UPDATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SETTINGS_UPDATED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export function ActivityClient() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('');

  const { data, isLoading } = useQuery<ActivityLogPage>({
    queryKey: ['admin-activity', page, search, actionType],
    queryFn: () => activityService.list({ page, size: 20, search: search || undefined, actionType: actionType || undefined }),
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('Registro de Atividades', 'Activity Log')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('Histórico de ações realizadas na loja.', 'History of actions performed in your store.')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('Buscar...', 'Search...')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={actionType}
          onChange={e => { setActionType(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t('Todos os tipos', 'All types')}</option>
          <option value="ORDER_PAID">{t('Pagamento confirmado', 'Payment confirmed')}</option>
          <option value="ORDER_DISPATCHED">{t('Pedido despachado', 'Order dispatched')}</option>
          <option value="ORDER_DELIVERED">{t('Pedido entregue', 'Order delivered')}</option>
          <option value="PRODUCT_CREATED">{t('Produto criado', 'Product created')}</option>
          <option value="PRODUCT_UPDATED">{t('Produto atualizado', 'Product updated')}</option>
          <option value="SETTINGS_UPDATED">{t('Configurações', 'Settings updated')}</option>
        </select>
      </div>

      {/* Activity Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            {t('Carregando...', 'Loading...')}
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            {t('Nenhuma atividade registrada ainda.', 'No activity recorded yet.')}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Ação', 'Action')}</th>
                  <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Descrição', 'Description')}</th>
                  <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Usuário', 'User')}</th>
                  <th className="px-5 py-2 text-xs font-medium uppercase text-muted-foreground">{t('Data', 'Date')}</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map(log => {
                  const colorClass = actionTypeColors[log.actionType] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
                  return (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${colorClass}`}>
                          {log.actionType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-sm text-foreground">{log.description}</td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {log.userName}
                          {log.userRole && (
                            <span className="text-[10px] text-muted-foreground">({log.userRole})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-sm text-muted-foreground">{formatDateTime(log.performedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <span className="text-xs text-muted-foreground">
                  {t('Página', 'Page')} {data.page + 1} {t('de', 'of')} {data.totalPages} · {data.totalElements} {t('registros', 'records')}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-md border border-border p-1.5 text-sm hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                    disabled={page >= data.totalPages - 1}
                    className="rounded-md border border-border p-1.5 text-sm hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
