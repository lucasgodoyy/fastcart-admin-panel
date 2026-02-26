'use client';

import { SettingsPageLayout } from './SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Globe, Shield, CheckCircle, Plus, ExternalLink } from 'lucide-react';

export function DomainsClient() {
  return (
    <SettingsPageLayout
      title="Dominios"
      description="O dominio e o endereco de sua loja na Internet. Voce pode ter mais de um e gerencia-los aqui."
      helpText="Mais sobre dominios"
      helpHref="#"
    >
      {/* Administre seus dominios */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Administre seus dominios</p>

        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">lojjak.lojavirtualnuvem.com.br</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Por padrao
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Ativado
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  <Shield className="h-3 w-3" />
                  SSL ativado
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {/* Aprenda mais */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-medium text-foreground">Aprenda mais</p>

        {[
          {
            title: 'Configure seu dominio',
            desc: 'Use um dominio proprio para destacar a identidade da sua marca.',
          },
          {
            title: 'Verifique a configuracao',
            desc: 'Siga estes passos para revisar se seu dominio ficou corretamente vinculado.',
          },
          {
            title: 'Consulte o vencimento',
            desc: 'Identifique se o registro do seu dominio deve ser renovado em breve.',
          },
          {
            title: 'Certificado de seguranca',
            desc: 'Saiba se seu certificado de seguranca esta ativo.',
          },
        ].map((item) => (
          <a
            key={item.title}
            href="#"
            className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent/50 group"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-xs text-primary flex items-center gap-1 shrink-0 ml-2">
              Ver tutorial
              <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        ))}
      </div>
    </SettingsPageLayout>
  );
}
