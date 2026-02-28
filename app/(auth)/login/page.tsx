import { LoginForm } from '@/components/features/auth/loginForm';
import { Zap } from 'lucide-react';
import { t } from '@/lib/admin-language';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight">FastCart</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            {t('Gerencie sua loja', 'Manage your store')}<br />{t('com confiança.', 'with confidence.')}
          </h2>
          <p className="mt-3 text-sm text-white/70 max-w-sm leading-relaxed">
            {t(
              'Tudo que você precisa para operar seu e-commerce — produtos, pedidos, pagamentos e envios em um só lugar.',
              'Everything you need to run your e-commerce — products, orders, payments, and shipping in one place.'
            )}
          </p>
        </div>
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} FastCart. {t('Todos os direitos reservados.', 'All rights reserved.')}
        </p>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">FastCart</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
