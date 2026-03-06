'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Shield, UserPlus, ChevronRight, Loader2, User, Trash2, Eye, EyeOff } from 'lucide-react';
import storeSettingsService, { StoreUser } from '@/services/storeSettingsService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'ROLE_STAFF',
  });

  const { data: users = [], isLoading } = useQuery<StoreUser[]>({
    queryKey: ['store-users', storeId],
    queryFn: () => storeSettingsService.listUsers(storeId as number),
    enabled: Boolean(storeId),
  });

  const createMutation = useMutation({
    mutationFn: (data: { email: string; password: string; role: string; storeId: number }) =>
      storeSettingsService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] });
      toast.success('Usuário adicionado com sucesso!');
      setAddDialogOpen(false);
      setNewUser({ email: '', password: '', role: 'ROLE_STAFF' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Erro ao adicionar usuário.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => storeSettingsService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] });
      toast.success('Usuário removido.');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Erro ao remover usuário.');
    },
  });

  const handleAddUser = () => {
    if (!newUser.email.trim()) {
      toast.error('E-mail é obrigatório.');
      return;
    }
    if (!newUser.password || newUser.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!storeId) {
      toast.error('Loja não encontrada.');
      return;
    }
    createMutation.mutate({
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      storeId,
    });
  };

  const confirmDelete = (user: StoreUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  return (
    <SettingsPageLayout title="Usuários e permissões" helpText="Mais sobre permissões para usuários" helpHref="#">
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
                <div className="flex items-center gap-1">
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => confirmDelete(usr)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
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
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Adicionar usuário
        </Button>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar usuário</DialogTitle>
            <DialogDescription>
              Convide um novo membro para gerenciar sua loja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">E-mail *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Senha temporária *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-0.5 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">O usuário poderá alterar a senha após o primeiro login.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Perfil de acesso</Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_ADMIN">Admin — Acesso total</SelectItem>
                  <SelectItem value="ROLE_STAFF">Staff — Acesso limitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddUser} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{selectedUser?.email}</strong> desta loja?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsPageLayout>
  );
}
