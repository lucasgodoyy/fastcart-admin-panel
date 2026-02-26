'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, ChevronRight } from 'lucide-react';

export function UsersClient() {
  return (
    <SettingsPageLayout
      title="Usuarios e notificacoes"
      helpText="Mais sobre permissoes para usuarios"
      helpHref="#"
    >
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Usuario atual
        </p>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            LG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Lucas Godoy dos Santos</p>
            <p className="text-xs text-muted-foreground">Acesso total</p>
          </div>
          <div className="text-xs text-muted-foreground">Todas notificacoes</div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

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
          <Button variant="outline" size="sm">
            Ativar
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
