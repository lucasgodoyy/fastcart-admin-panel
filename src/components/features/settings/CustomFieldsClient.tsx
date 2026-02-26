'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CustomFieldsClient() {
  return (
    <SettingsPageLayout
      title="Campos personalizados"
      description="Adicione informacao exclusiva e personalize a gestao de sua loja."
    >
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Criar campo em Categorias
        </Button>

        <div>
          <p className="text-sm font-medium text-foreground">Que tipo de campo quer criar?</p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {[
              { label: 'Texto curto', desc: 'Campo para inserir texto simples.' },
              { label: 'Texto longo', desc: 'Campo para textos maiores e descricoes.' },
              { label: 'Numerico', desc: 'Campo que aceita apenas numeros.' },
              { label: 'Selecao', desc: 'Lista suspensa com opcoes pre-definidas.' },
              { label: 'Checkbox', desc: 'Campo de marcacao (sim/nao).' },
            ].map((type) => (
              <button
                key={type.label}
                className="flex items-start gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum campo personalizado criado ainda.
        </p>
      </div>
    </SettingsPageLayout>
  );
}
