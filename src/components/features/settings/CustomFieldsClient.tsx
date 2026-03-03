'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Package } from 'lucide-react';

export function CustomFieldsClient() {
  return (
    <SettingsPageLayout
      title="Campos personalizados"
      description="Adicione informação exclusiva e personalize a gestão de sua loja."
    >
      <div className="rounded-lg border border-dashed border-border bg-card p-8 md:p-12 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Em breve</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
            Campos personalizados permitirão adicionar informações extras aos seus produtos e categorias, como gravação, personalização, tamanho sob medida e mais. Estamos trabalhando para entregar esta funcionalidade em breve.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['Texto curto', 'Texto longo', 'Numérico', 'Seleção', 'Checkbox'].map((type) => (
            <span
              key={type}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </SettingsPageLayout>
  );
}
