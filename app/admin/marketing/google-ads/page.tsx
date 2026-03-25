"use client"

import { Search } from "lucide-react"

export default function GoogleAdsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Google Ads</h1>
      <p className="max-w-md text-muted-foreground">
        Conecte sua conta do Google Ads para gerenciar campanhas e acompanhar o desempenho dos seus anúncios diretamente pelo painel.
      </p>
      <p className="text-sm text-muted-foreground">Em breve</p>
    </div>
  )
}
