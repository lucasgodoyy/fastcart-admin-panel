import { Suspense } from 'react';
import { EmailTemplateEditClient } from '@/components/features/settings/EmailTemplateEditClient';

interface Props {
  params: Promise<{ templateKey: string }>;
}

export default async function EmailTemplateEditPage({ params }: Props) {
  const { templateKey } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Carregando...</div>}>
      <EmailTemplateEditClient templateSlug={templateKey} />
    </Suspense>
  );
}
