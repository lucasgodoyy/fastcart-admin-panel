"use client";

import { useMemo, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  Search,
  MoreHorizontal,
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
  CUSTOMER: "bg-[hsl(var(--sa-surface-hover))] text-[hsl(var(--sa-text-secondary))]",
};

export function SaRolesPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-roles-users", roleFilter, search],
    queryFn: () =>
      superAdminService.listUsers({
        role: roleFilter,
        search: search || undefined,
        page: 0,
        size: 100,
      }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      superAdminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-roles-users"] });
    },
  });

  const users = useMemo(() => data?.content ?? [], [data]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        const role = user.role ?? "CUSTOMER";
        acc[role] = (acc[role] ?? 0) + 1;
        return acc;
      },
      { SUPER_ADMIN: 0, ADMIN: 0, STAFF: 0, CUSTOMER: 0 } as Record<string, number>,
    );
  }, [users]);

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Roles e Permissões"
        description="Gerencie os papéis dos usuários da plataforma"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Super Admin" value={String(roleCounts.SUPER_ADMIN)} icon={ShieldCheck} color="accent" />
        <SaStatCard title="Admins" value={String(roleCounts.ADMIN)} icon={Shield} color="info" />
        <SaStatCard title="Staff" value={String(roleCounts.STAFF)} icon={UserCog} color="warning" />
        <SaStatCard title="Customers" value={String(roleCounts.CUSTOMER)} icon={Users} color="success" />
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaCard className="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sa-text-muted))]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="pl-10 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))] placeholder:text-[hsl(var(--sa-text-muted))]"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todas as Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaTableCard title="Usuários por Role" subtitle={`${users.length} resultado(s)`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--sa-border-subtle))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Usuário</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Role Atual</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider">Loja</TableHead>
                <TableHead className="text-[hsl(var(--sa-text-muted))] text-[11px] font-bold uppercase tracking-wider w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => {
                const roleLabel = user.role ?? "CUSTOMER";
                const userName = user.name || user.email;
                const RoleIcon = roleIcons[roleLabel] || UserCog;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white text-[11px] font-bold">
                          {userName.split(" ").map((namePart) => namePart[0]).join("").slice(0, 2)}
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
                    <TableCell>
                      <SaStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{user.storeName ?? "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          {!isLoading && users.length === 0 && (
            <SaEmptyState
              icon={Users}
              title="Nenhum usuário encontrado"
              description="Tente ajustar os filtros de busca"
            />
          )}
        </SaTableCard>
      </motion.div>
    </div>
  );
}
