import { SessionSync } from "@/components/providers/SessionSync"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      <SessionSync />
      <SuperAdminChrome>{children}</SuperAdminChrome>
    </div>
  )
}
