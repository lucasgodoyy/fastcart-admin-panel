"use client";

import { motion } from "framer-motion";
import { Headphones, MessageSquare, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AffiliateSupportPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Suporte</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Precisa de ajuda? Entre em contato com nossa equipe
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
            <CardTitle className="text-base">Chat Interno</CardTitle>
            <CardDescription>Converse diretamente com a equipe de suporte via chat</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Tempo médio de resposta: 2-4 horas
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/affiliate/messages">Abrir Chat</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
              <Mail className="h-5 w-5 text-emerald-500" />
            </div>
            <CardTitle className="text-base">E-mail</CardTitle>
            <CardDescription>Envie um e-mail detalhado para nossa equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Tempo médio de resposta: 24 horas
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:suporte@lojaki.com">Enviar E-mail</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 mb-2">
              <Headphones className="h-5 w-5 text-violet-500" />
            </div>
            <CardTitle className="text-base">Central de Ajuda</CardTitle>
            <CardDescription>Artigos e tutoriais sobre o programa de afiliados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Respostas rápidas para perguntas frequentes
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/affiliate/help">Ver Artigos</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              q: "Quando recebo minha comissão?",
              a: "As comissões são processadas no dia de pagamento definido nas configurações do programa. O administrador revisa e aprova as conversões antes do pagamento.",
            },
            {
              q: "Como funciona o tracking de cliques?",
              a: "Quando alguém clica no seu link de afiliado, um cookie é salvo no navegador do visitante. Se ele comprar dentro do período do cookie, a venda é atribuída a você.",
            },
            {
              q: "Qual é a minha taxa de comissão?",
              a: "A taxa de comissão é definida individualmente para cada afiliado. Você pode ver sua taxa no seu perfil ou na seção de conversões.",
            },
            {
              q: "Posso criar múltiplos links?",
              a: "Sim! Você pode criar quantos links quiser, cada um apontando para diferentes páginas ou produtos. Use UTM params para rastrear a origem de cada link.",
            },
            {
              q: "O que significa cada status de conversão?",
              a: "Pendente = aguardando aprovação. Aprovada = confirmada, será paga. Rejeitada = não aprovada (com motivo). Paga = já incluída em um pagamento.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border p-4">
              <p className="text-sm font-semibold mb-1">{item.q}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
