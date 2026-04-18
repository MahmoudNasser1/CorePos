import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:mr-72 min-h-screen transition-all duration-300">
        <Header />
        
        <main className="flex-1 pt-20 px-4 md:px-8 pb-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Mobile Navigation Placeholder - Built later if needed */}
      </div>
    </div>
  )
}
