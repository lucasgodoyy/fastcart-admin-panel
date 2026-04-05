"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Bell } from "lucide-react";
import Link from "next/link";

export function AffiliateHeader() {
  const { user, logout } = useAuth();

  const initials = (user?.name || user?.email || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-sm font-bold">Painel Afiliado</span>
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" asChild>
          <Link href="/affiliate/support">
            <Bell className="h-4 w-4" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium hidden md:inline">{user?.name || user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/affiliate/settings" className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5" /> Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 text-xs text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
