'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerService } from '@/services/sales';
import { CreateCustomerRequest } from '@/types/customer';

const getStoreId = () => {
  if (typeof window === 'undefined') return null;
  const rawStoreId = localStorage.getItem('storeId');
  const storeId = rawStoreId ? Number(rawStoreId) : NaN;
  if (!Number.isInteger(storeId) || storeId <= 0) return null;
  return storeId;
};

const getStoredUserId = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userId') || '';
};

export function CreateCustomerClient() {
  const router = useRouter();
  const storeId = getStoreId();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [userIdInput, setUserIdInput] = useState(getStoredUserId());

  const parsedUserId = useMemo(() => Number(userIdInput), [userIdInput]);

  const createMutation = useMutation({
    mutationFn: (request: CreateCustomerRequest) => customerService.create(request),
    onSuccess: (customer) => {
      toast.success('Cliente criado com sucesso');
      router.push(`/admin/customers/${customer.id}`);
    },
    onError: () => toast.error('Não foi possível criar o cliente'),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!storeId) {
      toast.error('StoreId não encontrado. Faça login novamente.');
      return;
    }

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      toast.error('Preencha nome e sobrenome com ao menos 2 caracteres');
      return;
    }

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      toast.error('UserId inválido');
      return;
    }

    const payload: CreateCustomerRequest = {
      storeId,
      userId: parsedUserId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/customers" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Adicionar cliente</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/customers')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Adicionar
            </Button>
          </div>
        </div>

        {!storeId && (
          <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            StoreId não encontrado no login atual.
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Dados do cliente</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nome</label>
              <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Sobrenome</label>
              <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Telefone</label>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">User ID</label>
              <Input
                type="number"
                min="1"
                value={userIdInput}
                onChange={(event) => setUserIdInput(event.target.value)}
                placeholder="ID do usuário já existente"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
