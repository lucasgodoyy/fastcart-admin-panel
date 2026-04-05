'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AffiliateSidebar } from '@/components/affiliate/affiliate-sidebar';
import { AffiliateHeader } from '@/components/affiliate/affiliate-header';

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'AFFILIATE') {
      if (user.role === 'SUPER_ADMIN') router.replace('/super-admin');
      else if (user.role === 'MANAGER') router.replace('/manager');
      else router.replace('/admin');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== 'AFFILIATE') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Carregando painel do afiliado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AffiliateSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AffiliateHeader />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
