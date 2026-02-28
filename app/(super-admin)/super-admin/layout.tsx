'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SaShell } from '@/components/features/super-admin';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'SUPER_ADMIN') {
      router.replace('/admin');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="super-admin-theme flex min-h-screen items-center justify-center bg-[hsl(var(--sa-bg))]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--sa-accent))] to-[hsl(var(--sa-info))] animate-pulse" />
          <p className="text-sm text-[hsl(var(--sa-text-muted))]">Carregando Super Admin...</p>
        </div>
      </div>
    );
  }

  return <SaShell>{children}</SaShell>;
}
