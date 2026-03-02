'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface MobileSidebarContextType {
  open: boolean
  setOpen: (val: boolean) => void
  toggle: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
})

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  return (
    <MobileSidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MobileSidebarContext.Provider>
  )
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext)
}
