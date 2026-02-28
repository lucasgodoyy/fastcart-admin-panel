'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { t } from '@/lib/admin-language';

type ForgotPasswordFormValues = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export const ForgotPasswordForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSuccessMessage(null);

    if (values.newPassword !== values.confirmPassword) {
      form.setError('confirmPassword', {
        message: t('As senhas não coincidem.', 'Passwords do not match.'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword({
        email: values.email,
        newPassword: values.newPassword,
      });

      setSuccessMessage(t(
        'Senha redefinida com sucesso. Faça login com sua nova senha.',
        'Password reset successfully. Sign in with your new password.'
      ));

      form.reset({
        email: values.email,
        newPassword: '',
        confirmPassword: '',
      });
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
        const data = response.data as Record<string, unknown> | undefined;
        form.setError('email', {
          message: (data?.message as string) || t('Não foi possível redefinir a senha.', 'Unable to reset password.'),
        });
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
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold text-center">{t('Esqueceu sua senha?', 'Forgot your password?')}</CardTitle>
        <CardDescription className="text-center">
          {t('Informe seu e-mail e defina uma nova senha.', 'Enter your email and set a new password.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      disabled={isSubmitting}
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
              name="newPassword"
              rules={{
                required: t('Nova senha é obrigatória', 'New password is required'),
                minLength: {
                  value: 6,
                  message: t('A senha deve ter pelo menos 6 caracteres', 'Password must be at least 6 characters'),
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('Nova senha', 'New password')}</FormLabel>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isSubmitting}
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
                required: t('Confirme sua senha', 'Confirm your password'),
              }}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('Confirmar nova senha', 'Confirm new password')}</FormLabel>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {successMessage ? (
              <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                {successMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isSubmitting ? t('Redefinindo...', 'Resetting...') : t('Redefinir senha', 'Reset password')}
            </Button>
          </form>
        </Form>

        <div className="text-sm mt-6 pt-6 border-t text-center">
          <a href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {t('Voltar para login', 'Back to sign in')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
