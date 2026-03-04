'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';
import { t } from '@/lib/admin-language';

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
      router.push('/login?registered=true');
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
