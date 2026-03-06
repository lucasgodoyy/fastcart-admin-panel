'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { LoginCredentials } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { t } from '@/lib/admin-language';

type BannerType = 'success' | 'error' | 'info';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, setEmailVerified } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [banner, setBanner] = useState<{ type: BannerType; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const form = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle email verification token from URL
  useEffect(() => {
    const token = searchParams.get('verify');
    const registered = searchParams.get('registered');

    if (token) {
      setVerifying(true);
      authService.verifyEmail(token)
        .then(() => {
          setBanner({
            type: 'success',
            message: t('E-mail verificado com sucesso! Faça login para continuar.', 'Email verified successfully! Sign in to continue.'),
          });
          setEmailVerified(true);
        })
        .catch(() => {
          setBanner({
            type: 'error',
            message: t('Token de verificação inválido ou expirado.', 'Invalid or expired verification token.'),
          });
        })
        .finally(() => setVerifying(false));
    } else if (registered) {
      setBanner({
        type: 'info',
        message: t(
          'Conta criada! Verifique seu e-mail para ativar sua conta, depois faça login.',
          'Account created! Check your email to verify your account, then sign in.'
        ),
      });
    }
  }, [searchParams, setEmailVerified]);

  const handleSubmit = async (credentials: LoginCredentials) => {
    try {
      const response = await login(credentials);
      const redirectPath = response.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin';
      router.push(redirectPath);
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
        if (status === 401 || status === 403) {
          form.setError('email', {
            message: t('E-mail ou senha inválidos. Tente novamente.', 'Invalid email or password. Please try again.'),
          });
        } else {
          const data = response.data as Record<string, unknown> | undefined;
          form.setError('email', {
            message: (data?.message as string) || t('Ocorreu um erro durante o login.', 'An error occurred during login.'),
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
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-center">{t('Bem-vindo de volta', 'Welcome Back')}</CardTitle>
        <CardDescription className="text-center">{t('Entre na sua conta para continuar', 'Sign in to your account to continue')}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Verification / Registration banner */}
        {verifying && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-muted text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('Verificando e-mail...', 'Verifying email...')}
          </div>
        )}
        {banner && !verifying && (
          <div className={`flex items-start gap-2 p-3 mb-4 rounded-lg text-sm ${
            banner.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
            banner.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' :
            'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          }`}>
            {banner.type === 'success' && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
            {banner.type === 'error' && <XCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            {banner.type === 'info' && <Mail className="h-4 w-4 mt-0.5 shrink-0" />}
            {banner.message}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
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
                      autoComplete="current-password"
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
              {isLoading ? t('Autenticando...', 'Authenticating...') : t('Entrar', 'Sign In')}
            </Button>
          </form>
        </Form>

        <div className="flex justify-between items-center text-sm mt-6 pt-6 border-t">
          <a href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
            {t('Esqueceu a senha?', 'Forgot password?')}
          </a>
          <a href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {t('Criar conta', 'Create account')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
