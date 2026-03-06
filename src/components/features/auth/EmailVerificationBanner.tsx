'use client';

import { useState } from 'react';
import { AlertTriangle, Mail, CheckCircle2, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { t } from '@/lib/admin-language';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const { user, emailVerified } = useAuth();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show for super admins (always verified) or if already verified
  if (!user || emailVerified || user.role === 'SUPER_ADMIN' || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (!user.email) return;
    setSending(true);
    try {
      await authService.resendVerification(user.email);
      toast.success(t('E-mail de verificação reenviado!', 'Verification email resent!'));
    } catch {
      toast.error(t('Erro ao reenviar e-mail. Tente novamente.', 'Failed to resend email. Try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 truncate">
            <span className="font-medium">
              {t('E-mail não verificado.', 'Email not verified.')}
            </span>{' '}
            <span className="text-amber-600 dark:text-amber-300">
              {t(
                'Verifique seu e-mail para ativar todos os recursos da plataforma.',
                'Verify your email to unlock all platform features.'
              )}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Mail className="h-3 w-3" />
            )}
            {t('Reenviar', 'Resend')}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
