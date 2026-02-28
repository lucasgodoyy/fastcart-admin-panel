"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserCog,
  Clock,
  Ban,
  CheckCircle,
  Mail,
  Key,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockUsers = [
  { id: 1, name: "João Silva", email: "joao@email.com", role: "SUPER_ADMIN", status: "ACTIVE", store: "—", lastLogin: "Há 5 min", createdAt: "2024-01-15" },
  { id: 2, name: "Maria Santos", email: "maria@fashionstore.com", role: "ADMIN", status: "ACTIVE", store: "Fashion Store", lastLogin: "Há 2h", createdAt: "2024-03-10" },
  { id: 3, name: "Pedro Costa", email: "pedro@techgadgets.com", role: "ADMIN", status: "ACTIVE", store: "TechGadgets Pro", lastLogin: "Há 1 dia", createdAt: "2024-05-22" },
  { id: 4, name: "Ana Oliveira", email: "ana@casadecor.com", role: "STAFF", status: "ACTIVE", store: "Casa & Decor", lastLogin: "Há 3 dias", createdAt: "2024-06-14" },
  { id: 5, name: "Carlos Mendes", email: "carlos@sportlife.com", role: "ADMIN", status: "PENDING", store: "SportLife Brasil", lastLogin: "Nunca", createdAt: "2025-02-20" },
  { id: 6, name: "Luisa Ferreira", email: "luisa@belezanatural.com", role: "ADMIN", status: "SUSPENDED", store: "Beleza Natural", lastLogin: "Há 30 dias", createdAt: "2024-08-05" },
  { id: 7, name: "Rafael Lima", email: "rafael@staff.com", role: "STAFF", status: "ACTIVE", store: "Fashion Store", lastLogin: "Há 4h", createdAt: "2024-11-30" },
];

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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

  const filtered = mockUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <SaPageHeader
        title="Gerenciamento de Usuários"
        description="Gerencie todos os usuários da plataforma, roles e permissões"
        actions={
          <Button className="bg-[hsl(var(--sa-accent))] hover:bg-[hsl(var(--sa-accent-hover))] text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Novo Usuário
          </Button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SaStatCard title="Total de Usuários" value="1.247" icon={Users} color="accent" trend={{ value: 12, label: "" }} />
        <SaStatCard title="Admins de Lojas" value="348" icon={Shield} color="info" />
        <SaStatCard title="Sessões Ativas" value="89" icon={Clock} color="success" />
        <SaStatCard title="Pendentes" value="12" icon={Ban} color="warning" />
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
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-[hsl(var(--sa-bg))] border-[hsl(var(--sa-border-subtle))] text-[hsl(var(--sa-text))]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="SUSPENDED">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SaCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <SaTableCard title="Usuários" subtitle={`${filtered.length} resultado(s)`}>
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
              {filtered.map((user, i) => {
                const RoleIcon = roleIcons[user.role] || UserCog;
                return (
                  <motion.tr key={user.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="border-[hsl(var(--sa-border-subtle))] hover:bg-[hsl(var(--sa-surface-hover))] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] text-white text-[11px] font-bold">
                          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[hsl(var(--sa-text))]">{user.name}</p>
                          <p className="text-[11px] text-[hsl(var(--sa-text-muted))]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleBadgeColors[user.role] ?? ""}`}>
                        <RoleIcon className="h-3 w-3" /> {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-secondary))]">{user.store}</TableCell>
                    <TableCell><SaStatusBadge status={user.status} /></TableCell>
                    <TableCell className="text-[12px] text-[hsl(var(--sa-text-muted))]">{user.lastLogin}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(var(--sa-text-muted))] hover:text-[hsl(var(--sa-text))] hover:bg-[hsl(var(--sa-surface-hover))]"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(var(--sa-surface))] border-[hsl(var(--sa-border))]">
                          <DropdownMenuItem className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"><UserCog className="h-3.5 w-3.5" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"><Key className="h-3.5 w-3.5" /> Resetar Senha</DropdownMenuItem>
                          <DropdownMenuItem className="text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-hover))] cursor-pointer gap-2"><Mail className="h-3.5 w-3.5" /> Enviar E-mail</DropdownMenuItem>
                          <DropdownMenuItem className="text-[hsl(var(--sa-danger))] hover:bg-[hsl(var(--sa-danger-subtle))] cursor-pointer gap-2"><Ban className="h-3.5 w-3.5" /> Suspender</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <SaEmptyState icon={Users} title="Nenhum usuário encontrado" description="Tente ajustar os filtros de busca" />
          )}
        </SaTableCard>
      </motion.div>
    </div>
  );
}
