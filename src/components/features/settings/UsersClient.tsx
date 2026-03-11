'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Shield,
  UserPlus,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Users,
  ChevronRight,
  Calendar,
  Crown,
  User,
  Mail,
  Hash,
} from 'lucide-react';
import storeSettingsService, { StoreUser } from '@/services/storeSettingsService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const getStoreId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('storeId');
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
};

const ROLE_OPTIONS = [
  { value: 'ROLE_ADMIN', label: 'Admin', description: 'Acesso total a loja' },
  { value: 'ROLE_STAFF', label: 'Staff', description: 'Acesso limitado a pedidos, produtos e estoque' },
];

const roleLabel = (role: string) =>
  ({ ROLE_SUPER_ADMIN: 'Super Admin', ROLE_ADMIN: 'Admin', ROLE_STAFF: 'Staff', ROLE_CUSTOMER: 'Cliente' } as Record<string, string>)[role] ?? role;

const roleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' =>
  ({ ROLE_SUPER_ADMIN: 'default', ROLE_ADMIN: 'default', ROLE_STAFF: 'secondary' } as Record<string, 'default' | 'secondary' | 'outline'>)[role] ?? 'outline';

const initials = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '??';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

export function UsersClient() {
  const storeId = getStoreId();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);
  const [editRole, setEditRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'ROLE_STAFF' });

  const { data: users = [], isLoading } = useQuery<StoreUser[]>({
    queryKey: ['store-users', storeId],
    queryFn: () => storeSettingsService.listUsers(storeId as number),
    enabled: Boolean(storeId),
  });

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (!search || u.email.toLowerCase().includes(search.toLowerCase())) &&
          (roleFilter === 'all' || u.role === roleFilter),
      ),
    [users, search, roleFilter],
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role === 'ROLE_ADMIN' || u.role === 'ROLE_SUPER_ADMIN').length,
      staff: users.filter((u) => u.role === 'ROLE_STAFF').length,
    }),
    [users],
  );

  const createMutation = useMutation({
    mutationFn: (d: { email: string; password: string; role: string; storeId: number }) =>
      storeSettingsService.createUser(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] });
      toast.success('Usuario adicionado com sucesso!');
      setAddOpen(false);
      setNewUser({ email: '', password: '', role: 'ROLE_STAFF' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao adicionar usuario.'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      storeSettingsService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar perfil.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => storeSettingsService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-users', storeId] });
      toast.success('Usuario removido.');
      setDeleteOpen(false);
      setDetailOpen(false);
      setSelectedUser(null);
    },
    onError: () => toast.error('Erro ao remover usuario.'),
  });

  const openDetail = (user: StoreUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setDetailOpen(true);
  };

  const handleAdd = () => {
    if (!newUser.email.trim()) return toast.error('E-mail e obrigatorio.');
    if (newUser.password.length < 6) return toast.error('Senha deve ter pelo menos 6 caracteres.');
    if (!storeId) return toast.error('Loja nao encontrada.');
    createMutation.mutate({ ...newUser, storeId });
  };

  const handleSaveRole = () => {
    if (!selectedUser) return;
    if (editRole === selectedUser.role) return toast.info('Nenhuma alteracao detectada.');
    updateRoleMutation.mutate({ userId: selectedUser.id, role: editRole });
  };

  const isCurrent = (u: StoreUser) => currentUser?.email === u.email;

  return (
    <SettingsPageLayout
      title="Usuarios e permissoes"
      helpText="Mais sobre permissoes para usuarios"
      helpHref="#"
    >
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total de usuarios', value: stats.total, icon: Users },
          { label: 'Administradores', value: stats.admins, icon: Crown },
          { label: 'Staff', value: stats.staff, icon: User },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os perfis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            <SelectItem value="ROLE_SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
            <SelectItem value="ROLE_STAFF">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <div className="px-5 py-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {filtered.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}
            </p>
            <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>

          {filtered.map((usr) => (
            <button
              key={usr.id}
              className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/40 transition-colors"
              onClick={() => openDetail(usr)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {initials(usr.email)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{usr.email}</p>
                  {isCurrent(usr) && (
                    <span className="text-xs text-muted-foreground shrink-0">(voce)</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={roleBadgeVariant(usr.role)} className="text-xs h-5">
                    {roleLabel(usr.role)}
                  </Badge>
                  {usr.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      desde {new Date(usr.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="py-10 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                {search || roleFilter !== 'all'
                  ? 'Nenhum usuario encontrado com esses filtros.'
                  : 'Nenhum usuario cadastrado.'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Verificacao em 2 passos</p>
              <p className="text-xs text-muted-foreground">
                Adicione uma camada extra de seguranca a sua conta.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Em breve
          </Button>
        </div>
      </div>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader className="pb-5">
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shrink-0">
                    {initials(selectedUser.email)}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-base break-all leading-tight">
                      {selectedUser.email}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={roleBadgeVariant(selectedUser.role)} className="text-xs">
                        {roleLabel(selectedUser.role)}
                      </Badge>
                      {isCurrent(selectedUser) && (
                        <span className="text-xs text-muted-foreground">voce</span>
                      )}
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <Separator />

              <div className="py-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Informacoes do usuario
                  </p>
                  <div className="space-y-3">
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="E-mail" value={selectedUser.email} />
                    <InfoRow icon={<Hash className="h-4 w-4" />} label="ID" value={"#" + selectedUser.id} />
                    {selectedUser.createdAt && (
                      <InfoRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Membro desde"
                        value={formatDate(selectedUser.createdAt)}
                      />
                    )}
                  </div>
                </div>

                {!isCurrent(selectedUser) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Perfil de acesso
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Define quais areas e funcionalidades este usuario pode acessar.
                      </p>
                      <div className="space-y-2">
                        {ROLE_OPTIONS.map((r) => (
                          <label
                            key={r.value}
                            className={"flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors " + (editRole === r.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30')}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={r.value}
                              checked={editRole === r.value}
                              onChange={() => setEditRole(r.value)}
                              className="mt-0.5 accent-primary"
                            />
                            <div>
                              <p className="text-sm font-medium">{r.label}</p>
                              <p className="text-xs text-muted-foreground">{r.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <SheetFooter className="flex flex-col gap-2 pt-4 border-t border-border">
                {!isCurrent(selectedUser) ? (
                  <>
                    <Button
                      className="w-full"
                      onClick={handleSaveRole}
                      disabled={updateRoleMutation.isPending || editRole === selectedUser.role}
                    >
                      {updateRoleMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar alteracoes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => {
                        setDetailOpen(false);
                        setTimeout(() => setDeleteOpen(true), 200);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover usuario
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-center text-muted-foreground">
                    Voce nao pode editar seu proprio perfil nesta secao.
                  </p>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar usuario</DialogTitle>
            <DialogDescription>Convide um novo membro para gerenciar sua loja.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                placeholder="usuario@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Senha temporaria *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Minimo 6 caracteres"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-0.5 h-8 w-8"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                O usuario pode alterar a senha apos o primeiro login.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Perfil de acesso</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
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
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover usuario</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{' '}
              <strong>{selectedUser?.email}</strong> desta loja? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
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
