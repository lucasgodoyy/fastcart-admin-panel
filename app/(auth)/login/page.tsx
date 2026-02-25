import { LoginForm } from '@/components/features/auth/loginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-foreground">FastCart</h1>
          <p className="mt-1 text-sm text-muted-foreground">Faça login para acessar o painel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
