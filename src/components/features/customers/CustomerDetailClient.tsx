'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
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

type CustomerDetailClientProps = {
  customerId: number;
};

export function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const router = useRouter();
  const storeId = getStoreId();

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['customer', storeId, customerId],
    queryFn: () => customerService.getById(storeId as number, customerId),
    enabled: Boolean(storeId),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!customer) return;
    setFirstName(customer.firstName || '');
    setLastName(customer.lastName || '');
    setPhone(customer.phone || '');
  }, [customer]);

  const initialUserId = useMemo(() => customer?.userId ?? 0, [customer?.userId]);

  const updateMutation = useMutation({
    mutationFn: (payload: { firstName: string; lastName: string; phone: string }) =>
      customerService.update(storeId as number, customerId, {
        storeId: storeId as number,
        userId: initialUserId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
      }),
    onSuccess: () => {
      toast.success('Cliente atualizado com sucesso');
      router.push('/admin/customers');
    },
    onError: () => toast.error('Não foi possível atualizar o cliente'),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!storeId) {
      toast.error('StoreId não encontrado. Faça login novamente.');
      return;
    }

    if (!customer) {
      toast.error('Cliente não encontrado');
      return;
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedPhone = phone.trim();

    if (normalizedFirstName.length < 2 || normalizedLastName.length < 2) {
      toast.error('Preencha nome e sobrenome com ao menos 2 caracteres');
      return;
    }

    updateMutation.mutate({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      phone: normalizedPhone,
    });
  };

  if (!storeId) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-sm text-muted-foreground">
        StoreId não encontrado no login atual.
      </div>
    );
  }

  if (isLoading) {
    return <div className="mx-auto max-w-3xl p-8 text-sm text-muted-foreground">Carregando cliente...</div>;
  }

  if (!customer) {
    return <div className="mx-auto max-w-3xl p-8 text-sm text-muted-foreground">Cliente não encontrado.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/customers" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Detalhe do cliente</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/customers')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              Salvar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Dados do cliente</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nome</label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Sobrenome</label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Telefone</label>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Documento</label>
              <Input value={customer.document || '-'} readOnly />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
