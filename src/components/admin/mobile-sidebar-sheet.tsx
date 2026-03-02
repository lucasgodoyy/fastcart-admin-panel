'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { MobileSidebar } from './sidebar'
import { useMobileSidebar } from '@/context/MobileSidebarContext'

export function MobileSidebarSheet() {
  const { open, setOpen } = useMobileSidebar()
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" hideClose className="p-0 w-[280px]">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <MobileSidebar />
      </SheetContent>
    </Sheet>
  )
}
