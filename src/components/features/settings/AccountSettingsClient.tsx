'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsPageLayout } from './SettingsPageLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import accountSettingsService, { AccountInfo } from '@/services/accountSettingsService';
import { toast } from 'sonner';
import { t } from '@/lib/admin-language';

export function AccountSettingsClient() {
  const queryClient = useQueryClient();
  const { data: account, isLoading } = useQuery<AccountInfo>({
    queryKey: ['my-account'],
    queryFn: () => accountSettingsService.getMyAccount(),
  });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (account) {
      setForm({
        firstName: account.firstName || '',
        lastName: account.lastName || '',
        email: account.email || '',
      });
    }
  }, [account]);

  const profileMutation = useMutation({
    mutationFn: () => accountSettingsService.updateMyAccount(form),
    onSuccess: () => {
      toast.success(t('Dados da conta atualizados!', 'Account data updated!'));
      queryClient.invalidateQueries({ queryKey: ['my-account'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t('Erro ao atualizar dados.', 'Error updating data.');
      toast.error(msg);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => accountSettingsService.changePassword(passwordForm),
    onSuccess: () => {
      toast.success(t('Senha alterada com sucesso!', 'Password changed successfully!'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || t('Erro ao alterar senha.', 'Error changing password.');
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <SettingsPageLayout title={t('Dados da conta', 'Account settings')}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title={t('Dados da conta', 'Account settings')}
      description={t('Gerencie suas informações pessoais e credenciais de acesso.', 'Manage your personal info and access credentials.')}
    >
      {/* Profile data */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">{t('Informações pessoais', 'Personal information')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
              {t('Nome', 'First name')}
            </Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder={t('Seu nome', 'Your first name')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
              {t('Sobrenome', 'Last name')}
            </Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder={t('Seu sobrenome', 'Your last name')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            {t('E-mail', 'Email')}
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="seu@email.com"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => account && setForm({
            firstName: account.firstName || '', lastName: account.lastName || '', email: account.email || '',
          })}>{t('Cancelar', 'Cancel')}</Button>
          <Button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}>
            {profileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Salvar', 'Save')}
          </Button>
        </div>
      </div>

      {/* Password change */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">{t('Alterar senha', 'Change password')}</h3>

        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
            {t('Senha atual', 'Current password')}
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
            {t('Nova senha', 'New password')}
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            {t('Repetir nova senha', 'Repeat new password')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Alterar senha', 'Change password')}
          </Button>
        </div>
      </div>
    </SettingsPageLayout>
  );
}
