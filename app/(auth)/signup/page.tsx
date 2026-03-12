import { SignupForm } from '@/components/features/auth/signupForm';
import { Zap } from 'lucide-react';
import { t } from '@/lib/admin-language';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-primary via-primary/90 to-primary/70 flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Lojaki</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            {t('Comece a vender', 'Start selling')}<br />{t('online agora.', 'online now.')}
          </h2>
          <p className="mt-3 text-sm text-white/70 max-w-sm leading-relaxed">
            {t(
              'Crie sua loja virtual em minutos. Sem taxa de configuração, sem complicações.',
              'Create your online store in minutes. No setup fees, no complications.'
            )}
          </p>
        </div>
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Lojaki. {t('Todos os direitos reservados.', 'All rights reserved.')}
        </p>
      </div>

      {/* Right signup form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Lojaki</span>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
