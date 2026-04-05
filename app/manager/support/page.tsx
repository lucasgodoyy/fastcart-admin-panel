"use client";

import { motion } from "framer-motion";
import { Headphones, MessageSquare, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagerSupportPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Canal de comunicação com a equipe principal
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <CardTitle className="text-base">Chat com Super Admin</CardTitle>
            <CardDescription>Comunicação direta com o administrador principal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Use para questões urgentes ou decisões rápidas
            </p>
            <Button variant="outline" className="w-full">
              Abrir Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
              <Mail className="h-5 w-5 text-emerald-500" />
            </div>
            <CardTitle className="text-base">E-mail</CardTitle>
            <CardDescription>Envie relatórios ou questões detalhadas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Para assuntos que precisam de documentação
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:admin@lojaki.com">Enviar E-mail</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 mb-2">
              <Headphones className="h-5 w-5 text-violet-500" />
            </div>
            <CardTitle className="text-base">Base de Conhecimento</CardTitle>
            <CardDescription>Documentação interna e procedimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Guias de operação e processos internos
            </p>
            <Button variant="outline" className="w-full">
              Ver Documentação
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
