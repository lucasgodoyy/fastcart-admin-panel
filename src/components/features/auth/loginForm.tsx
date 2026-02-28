'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { LoginCredentials } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';
import { t } from '@/lib/admin-language';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      router.push('/admin');
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
