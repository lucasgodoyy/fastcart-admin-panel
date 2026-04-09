'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Download, Mail, MessageCircle, Plus, Search, Users, User } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageContainer, PageHeader, EmptyState } from '@/components/admin/page-header';
import { customerService } from '@/services/sales';
import { Customer } from '@/types/customer';

const getStoreId = () => {
  if (typeof window === 'undefined') return null;
  const rawStoreId = localStorage.getItem('storeId');
  const storeId = rawStoreId ? Number(rawStoreId) : NaN;
  if (!Number.isInteger(storeId) || storeId <= 0) return null;
  return storeId;
};

export function CustomerClient() {
  const [search, setSearch] = useState('');
  const storeId = getStoreId();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', storeId],
    queryFn: () => customerService.listByStore(storeId as number),
    enabled: Boolean(storeId),
  });

  const handleExportCsv = () => {
    downloadCSV(customers, 'clientes', [
      { key: 'id', label: 'ID' },
      { key: 'firstName', label: 'Nome' },
      { key: 'lastName', label: 'Sobrenome' },
      { key: 'phone', label: 'Telefone' },
      { key: 'document', label: 'Documento' },
    ]);
  };

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((customer) => {
      const values = [customer.firstName, customer.lastName, customer.phone, customer.document, (customer as Record<string, unknown>).email as string]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(term);
    });
  }, [customers, search]);

  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes da sua loja."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCsv}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
            <Link href="/admin/customers/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar cliente
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail, telefone ou documento"
          className="pl-9"
        />
      </div>

      {!storeId && (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Não foi possível identificar a loja. Faça login novamente para listar os clientes.
        </div>
      )}

      {storeId && (
        <p className="text-sm text-muted-foreground">{filteredCustomers.length} clientes</p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredCustomers.length === 0 && (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Nenhum cliente encontrado"
          description="Quando seus clientes fizerem pedidos, eles aparecerão aqui."
          action={
            <Link href="/admin/customers/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar cliente
              </Button>
            </Link>
          }
        />
      )}

      {/* Customer card list */}
      {!isLoading && filteredCustomers.length > 0 && (
        <div className="space-y-2">
          {filteredCustomers.map((customer) => {
            const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || `Cliente #${customer.id}`;
            const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

            return (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:border-border/80 hover:bg-accent/30"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials || <User className="h-4 w-4" />}
                </div>

                {/* Info — stacked on mobile, row on desktop */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {name}
                    </p>
                    {customer.phone && (
                      <span className="text-xs text-muted-foreground">{customer.phone}</span>
                    )}
                    {customer.document && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">{customer.document}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.preventDefault()}>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="E-mail"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  {customer.phone && (
                    <a
                      href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                      aria-label="WhatsApp"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
