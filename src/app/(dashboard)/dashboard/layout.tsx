import { SessionSync } from "@/components/providers/SessionSync"
import { CommandMenu } from "@/components/shared/CommandMenu"
import { DashboardChrome } from "@/components/layout/DashboardChrome"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      <SessionSync />
      <CommandMenu />
      <DashboardChrome>{children}</DashboardChrome>
    </div>
  )
}
