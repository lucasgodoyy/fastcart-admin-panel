"use client";

import { useMemo, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserCog,
  Clock,
  Ban,
  Key,
  Power,
  ChevronDown,
} from "lucide-react";
import {
  SaPageHeader,
  SaStatCard,
  SaCard,
  SaTableCard,
  SaStatusBadge,
  SaEmptyState,
  staggerContainer,
  fadeInUp,
} from "../ui/sa-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { superAdminService } from "@/services/super-admin";

const roleIcons: Record<string, ComponentType<{ className?: string }>> = {
  SUPER_ADMIN: ShieldCheck,
  ADMIN: Shield,
  STAFF: UserCog,
};

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: "bg-[hsl(var(--sa-accent-subtle))] text-[hsl(var(--sa-accent))]",
  ADMIN: "bg-[hsl(var(--sa-info-subtle))] text-[hsl(var(--sa-info))]",
  STAFF: "bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))]",
};

export function SaUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; userId: number; email: string }>({
    open: false,
    userId: 0,
    email: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-users", roleFilter, statusFilter, search],
    queryFn: () =>
      superAdminService.listUsers({
        role: roleFilter,
        status: statusFilter,
        search: search || undefined,
        page: 0,
        size: 100,
      }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: number) => superAdminService.toggleUserStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => superAdminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-users"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      superAdminService.resetUserPassword(userId, password),
    onSuccess: () => {
      setResetPasswordDialog({ open: false, userId: 0, email: "" });
      setNewPassword("");
    },
  });

  const users = data?.content ?? [];
  const totalUsers = data?.totalElements ?? 0;
  const activeUsers = useMemo(() => users.filter((user) => user.status === "ACTIVE").length, [users]);
  const pendingUsers = useMemo(() => users.filter((user) => user.status === "PENDING").length, [users]);
  const adminUsers = useMemo(() => users.filter((user) => user.role === "ADMIN").length, [users]);

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Gerenciamento de Usuários"
        description="Gerencie todos os usuários da plataforma, roles e permissões"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Usuários" value={String(totalUsers)} icon={Users} color="accent" />
        <SaStatCard title="Admins de Lojas" value={String(adminUsers)} icon={Shield} color="info" />
        <SaStatCard title="Ativos" value={String(activeUsers)} icon={Clock} color="success" />
        <SaStatCard title="Pendentes" value={String(pendingUsers)} icon={Ban} color="warning" />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todas as Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaTableCard title="Usuários" subtitle={`${users.length} resultado(s)`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Usuário</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Último Login</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => {
                const roleLabel = user.role ?? "STAFF";
                const userName = user.name || user.email;
                const RoleIcon = roleIcons[roleLabel] || UserCog;
                return (
                  <motion.tr key={user.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white text-[11px] font-bold">
                          {userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{userName}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleBadgeColors[roleLabel] ?? ""}`}>
                        <RoleIcon className="h-3 w-3" /> {roleLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{user.storeName ?? "—"}</TableCell>
                    <TableCell><SaStatusBadge status={user.status} /></TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{user.lastLogin ?? "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2">
                              <UserCog className="h-3.5 w-3.5" /> Alterar Role
                              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                              {["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"].map((role) => (
                                <DropdownMenuItem
                                  key={role}
                                  disabled={role === roleLabel}
                                  onClick={() => changeRoleMutation.mutate({ userId: user.id, role })}
                                  className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer text-[11px]"
                                >
                                  {role === roleLabel ? `✓ ${role}` : role}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            onClick={() => {
                              setResetPasswordDialog({ open: true, userId: user.id, email: user.email });
                              setNewPassword("");
                            }}
                            className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"
                          >
                            <Key className="h-3.5 w-3.5" /> Resetar Senha
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleStatusMutation.mutate(user.id)}
                            className={`cursor-pointer gap-2 ${user.status === "ACTIVE" ? "text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))]" : "text-[hsl(var(--sa-success))] hover:bg-[hsl(var(--sa-success))]/10"}`}
                          >
                            {user.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                            {user.status === "ACTIVE" ? "Suspender" : "Ativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          {!isLoading && users.length === 0 && (
            <SaEmptyState icon={Users} title="Nenhum usuário encontrado" description="Tente ajustar os filtros de busca" />
          )}
        </SaTableCard>
      </motion.div>

      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => setResetPasswordDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))] text-[hsl(var(--sa-text))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--sa-text))]">Resetar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[12px] text-[hsl(var(--sa-text-secondary))]">
              Definir nova senha para <strong>{resetPasswordDialog.email}</strong>
            </p>
            <Input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordDialog({ open: false, userId: 0, email: "" })}
              className="bg-transparent border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text-secondary))]"
            >
              Cancelar
            </Button>
            <Button
              disabled={!newPassword || newPassword.length < 4 || resetPasswordMutation.isPending}
              onClick={() =>
                resetPasswordMutation.mutate({
                  userId: resetPasswordDialog.userId,
                  password: newPassword,
                })
              }
              className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white"
            >
              {resetPasswordMutation.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
