import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/features/auth/forgotPasswordForm';
import { Zap } from 'lucide-react';
import { t } from '@/lib/admin-language';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-primary via-primary/90 to-primary/70 flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Lojaki</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            {t('Recupere seu acesso', 'Recover your access')}<br />{t('em poucos passos.', 'in a few steps.')}
          </h2>
          <p className="mt-3 text-sm text-white/70 max-w-sm leading-relaxed">
            {t(
              'Defina uma nova senha para voltar a administrar sua loja com segurança.',
              'Set a new password to safely get back to managing your store.'
            )}
          </p>
        </div>
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Lojaki. {t('Todos os direitos reservados.', 'All rights reserved.')}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Lojaki</span>
          </div>
          <Suspense fallback={<div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Carregando...</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
