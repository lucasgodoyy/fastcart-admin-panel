'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { t } from '@/lib/admin-language';
import Script from 'next/script';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  storeName: string;
}

export const SignupForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleCallback = useCallback(async (response: { credential?: string }) => {
    if (!response.credential) return;
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const authRes = await authService.oauthLogin('google', response.credential);
      const redirectPath = authRes.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';
      router.push(redirectPath);
    } catch {
      setGoogleError(t('Falha ao entrar com Google. Tente novamente.', 'Failed to sign in with Google. Try again.'));
    } finally {
      setGoogleLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
    if (!googleClientId || typeof window === 'undefined') return;
    const initGoogle = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (!win.google) return;
      const google = win.google;
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });
      const btnEl = document.getElementById('google-signup-btn');
      if (btnEl) {
        google.accounts.id.renderButton(btnEl, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signup_with',
          locale: 'pt-BR',
        });
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.google) {
      initGoogle();
    } else {
      win.__googleSignUpInit = initGoogle;
    }
  }, [handleGoogleCallback]);

  const form = useForm<SignupFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      storeName: '',
    },
  });

  const handleSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: t('As senhas não coincidem', 'Passwords do not match'),
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        storeName: data.storeName,
      });
      setRegisteredEmail(data.email);
    } catch (err) {
      const errorObj = err as Record<string, unknown>;

      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in errorObj &&
        typeof errorObj.response === 'object' &&
        errorObj.response !== null
      ) {
        const response = errorObj.response as Record<string, unknown>;
        const status = response.status as number;
        if (status === 409) {
          form.setError('email', {
            message: t('Este e-mail já está cadastrado.', 'This email is already registered.'),
          });
        } else {
          const data = response.data as Record<string, unknown> | undefined;
          form.setError('email', {
            message: (data?.message as string) || t('Ocorreu um erro durante o cadastro.', 'An error occurred during registration.'),
          });
        }
      } else if (
        typeof err === 'object' &&
        err !== null &&
        'request' in errorObj &&
        errorObj.request
      ) {
        form.setError('email', {
          message: t('Não foi possível conectar ao servidor. Verifique sua conexão.', 'Server is unreachable. Please check your connection.'),
        });
      } else {
        form.setError('email', {
          message: t('Ocorreu um erro inesperado. Tente novamente mais tarde.', 'An unexpected error occurred. Please try again later.'),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state after registration
  if (registeredEmail) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {t('Verifique seu e-mail', 'Check your email')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {t(
                `Enviamos um link de verificação para ${registeredEmail}. Clique no link para ativar sua conta.`,
                `We sent a verification link to ${registeredEmail}. Click the link to activate your account.`
              )}
            </p>
          </div>
          <div className="pt-2 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              {t('Ir para o login', 'Go to login')}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('Não recebeu? Verifique sua pasta de spam.', "Didn't receive it? Check your spam folder.")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-center">{t('Crie sua conta', 'Create your account')}</CardTitle>
        <CardDescription className="text-center">
          {t('Cadastre-se e comece a vender online agora', 'Sign up and start selling online now')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="storeName"
              rules={{
                required: t('Nome da loja é obrigatório', 'Store name is required'),
                minLength: {
                  value: 2,
                  message: t('O nome da loja deve ter pelo menos 2 caracteres', 'Store name must be at least 2 characters'),
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Nome da loja', 'Store Name')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('Minha Loja', 'My Store')}
                      disabled={isLoading}
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{
                required: t('E-mail é obrigatório', 'Email is required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('Endereço de e-mail inválido', 'Invalid email address'),
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Endereço de e-mail', 'Email Address')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      disabled={isLoading}
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={{
                required: t('Senha é obrigatória', 'Password is required'),
                minLength: {
                  value: 6,
                  message: t('A senha deve ter pelo menos 6 caracteres', 'Password must be at least 6 characters'),
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('Senha', 'Password')}</FormLabel>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: t('Confirmação de senha é obrigatória', 'Password confirmation is required'),
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Confirmar senha', 'Confirm Password')}</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isLoading ? t('Criando conta...', 'Creating account...') : t('Criar conta grátis', 'Create free account')}
            </Button>
          </form>
        </Form>

        {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('ou', 'or')}</span>
              </div>
            </div>
            <div id="google-signup-btn" className="flex justify-center" />
            {googleLoading && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('Entrando com Google...', 'Signing in with Google...')}
              </div>
            )}
            {googleError && (
              <p className="text-xs text-red-500 text-center mt-2">{googleError}</p>
            )}
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onLoad={() => {
                const init = (window as any).__googleSignUpInit;
                if (typeof init === 'function') (init as () => void)();
              }}
            />
          </>
        )}

        <div className="flex justify-center items-center text-sm mt-6 pt-6 border-t">
          <span className="text-muted-foreground mr-1">{t('Já tem uma conta?', 'Already have an account?')}</span>
          <a href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {t('Entrar', 'Sign In')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
