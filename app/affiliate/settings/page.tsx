"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Settings, User, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AffiliateSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informações da sua conta de afiliado
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="text-sm font-medium">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">E-mail</p>
              <p className="text-sm font-medium">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID do Usuário</p>
              <p className="text-sm font-mono text-muted-foreground">{user?.id || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Papel</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Afiliado
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status de E-mail</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                user?.emailVerified
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}>
                <Mail className="h-3 w-3" />
                {user?.emailVerified ? "Verificado" : "Não verificado"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed border-t pt-4 mt-4">
              Para alterar dados como PIX, banco de pagamento ou taxa de comissão,
              entre em contato com o suporte da plataforma.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
