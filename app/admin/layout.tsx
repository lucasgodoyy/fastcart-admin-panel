import { AdminSidebar, MobileSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { MobileSidebarProvider } from "@/context/MobileSidebarContext"
import { MobileSidebarSheet } from "@/components/admin/mobile-sidebar-sheet"
import { EmailVerificationBanner } from "@/components/features/auth/EmailVerificationBanner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar — hidden on mobile */}
        <AdminSidebar />
        {/* Mobile sidebar drawer */}
        <MobileSidebarSheet />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AdminHeader />
          <EmailVerificationBanner />
          <main className="flex-1 overflow-y-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  )
}
