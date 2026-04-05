'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ManagerSidebar } from '@/components/manager/manager-sidebar';
import { ManagerHeader } from '@/components/manager/manager-header';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'MANAGER') {
      if (user.role === 'SUPER_ADMIN') router.replace('/super-admin');
      else if (user.role === 'AFFILIATE') router.replace('/affiliate');
      else router.replace('/admin');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== 'MANAGER') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Carregando painel do gerente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <ManagerHeader />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
