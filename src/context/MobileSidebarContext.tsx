'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface MobileSidebarContextType {
  open: boolean
  setOpen: (val: boolean) => void
  toggle: () => void
  collapsed: boolean
  setCollapsed: (val: boolean) => void
  toggleCollapse: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapse: () => {},
})

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), [])
  return (
    <MobileSidebarContext.Provider value={{ open, setOpen, toggle, collapsed, setCollapsed, toggleCollapse }}>
      {children}
    </MobileSidebarContext.Provider>
  )
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext)
}
