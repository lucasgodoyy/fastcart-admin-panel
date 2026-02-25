'use client';

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, HelpCircle, Mail, Plus, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerService } from '@/services/sales';
import { Customer } from '@/types/customer';

const getStoreId = () => {
  if (typeof window === 'undefined') return null;
  const rawStoreId = localStorage.getItem('storeId');
  const storeId = rawStoreId ? Number(rawStoreId) : NaN;
  if (!Number.isInteger(storeId) || storeId <= 0) return null;
  return storeId;
};

function ActionIconButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="cursor-pointer rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={label}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 scale-95 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
        {label}
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-foreground" />
      </span>
    </div>
  );
}

export function CustomerClient() {
  const [search, setSearch] = useState('');
  const storeId = getStoreId();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', storeId],
    queryFn: () => customerService.listByStore(storeId as number),
    enabled: Boolean(storeId),
  });

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((customer) => {
      const values = [customer.firstName, customer.lastName, customer.phone, customer.document]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(term);
    });
  }, [customers, search]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-5 font-semibold text-foreground">Clientes</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
          <Link href="/admin/customers/new">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Adicionar cliente
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, telefone ou documento"
            className="pl-9"
          />
        </div>
      </div>

      {!storeId && (
        <div className="mb-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Não foi possível identificar a loja. Faça login novamente para listar os clientes.
        </div>
      )}

      {storeId && <div className="mb-4 text-sm text-muted-foreground">{filteredCustomers.length} clientes</div>}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Nome</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Telefone</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Documento</th>
              <th className="px-4 py-2 text-xs font-medium uppercase text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando clientes...
                </td>
              </tr>
            )}

            {!isLoading && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="cursor-pointer font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                    >
                      {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || `Cliente #${customer.id}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{customer.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{customer.document || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <ActionIconButton label="Contato">
                      <Mail className="h-4 w-4" />
                    </ActionIconButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary">
        <HelpCircle className="h-3.5 w-3.5" />
        <a href="#" className="inline-flex items-center gap-1 hover:underline">
          Mais sobre clientes
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
