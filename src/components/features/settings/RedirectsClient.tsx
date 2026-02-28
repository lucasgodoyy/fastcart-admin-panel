'use client';

import { useState } from 'react';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';

interface Redirect {
  id: number;
  oldUrl: string;
  newUrl: string;
}

export function RedirectsClient() {
  const [oldUrl, setOldUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [redirects, setRedirects] = useState<Redirect[]>([]);

  const handleAdd = () => {
    if (!oldUrl || !newUrl) return;
    setRedirects((prev) => [...prev, { id: Date.now(), oldUrl, newUrl }]);
    setOldUrl('');
    setNewUrl('');
  };

  return (
    <SettingsPageLayout title="Redirecionamentos 301" helpText="Mais sobre redirecionamentos 301" helpHref="#">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-700">Alterar estas configurações pode afetar o funcionamento da sua loja.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Novo redirecionamento</p>
        <p className="text-xs text-muted-foreground">
          Insira as URLs as quais quer redirecionar. Você pode adicionar todas as que necessitar, uma de cada vez.
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="oldUrl" className="text-sm font-medium text-foreground">URL antiga</Label>
            <Input
              id="oldUrl"
              value={oldUrl}
              onChange={(e) => setOldUrl(e.target.value)}
              placeholder="Ex.: /antiga-categoria/antigo-produto"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newUrl" className="text-sm font-medium text-foreground">URL nova</Label>
            <Input
              id="newUrl"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Ex.: /nova-categoria/novo-produto"
            />
          </div>
        </div>

        <Button onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {redirects.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
          <p className="text-sm font-medium text-foreground mb-3">Redirecionamentos ativos</p>
          {redirects.map((redirect) => (
            <div key={redirect.id} className="flex items-center gap-3 text-xs rounded-md border border-border p-2.5">
              <span className="text-muted-foreground truncate flex-1">{redirect.oldUrl}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground truncate flex-1">{redirect.newUrl}</span>
            </div>
          ))}
        </div>
      )}
    </SettingsPageLayout>
  );
}
