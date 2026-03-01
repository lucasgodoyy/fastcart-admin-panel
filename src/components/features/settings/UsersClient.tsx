'use client';

import { useQuery } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, ChevronRight, Loader2, User } from 'lucide-react';
import storeSettingsService, { StoreUser } from '@/services/storeSettingsService';
import { useAuth } from '@/context/AuthContext';

const getStoreId = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('storeId');
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
};

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    ROLE_SUPER_ADMIN: 'Super Admin',
    ROLE_ADMIN: 'Admin',
    ROLE_STAFF: 'Staff',
    ROLE_CUSTOMER: 'Cliente',
  };
  return map[role] || role;
};

const initials = (email: string) => {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 2);
};

export function UsersClient() {
  const storeId = getStoreId();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery<StoreUser[]>({
    queryKey: ['store-users', storeId],
    queryFn: () => storeSettingsService.listUsers(storeId as number),
    enabled: Boolean(storeId),
  });

  return (
    <SettingsPageLayout title="Usuários e notificações" helpText="Mais sobre permissões para usuários" helpHref="#">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <div className="px-5 py-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {users.length} usuário{users.length !== 1 ? 's' : ''} nesta loja
            </p>
          </div>
          {users.map((usr) => {
            const isCurrent = currentUser?.email === usr.email;
            return (
              <div key={usr.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {initials(usr.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {usr.email}
                    {isCurrent && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                  </p>
                  <Badge variant="outline" className="mt-0.5 text-xs">{roleLabel(usr.role)}</Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Verificação em 2 passos</p>
              <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança à sua conta.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>Em breve</Button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button className="gap-2" disabled>
          <UserPlus className="h-4 w-4" />
          Adicionar (em breve)
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
