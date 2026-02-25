"use client"

import { HelpCircle } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="flex h-14 items-center justify-end border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>releases</span>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#2563EB"/>
            <path d="M8 14C8 10.686 10.686 8 14 8C17.314 8 20 10.686 20 14C20 17.314 17.314 20 14 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="white"/>
          </svg>
          <span className="font-medium text-foreground">fastcart</span>
        </a>
        <button className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            F
          </div>
          <span className="text-sm font-medium text-foreground">FastCart</span>
        </div>
      </div>
    </header>
  )
}
