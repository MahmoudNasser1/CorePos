import React from 'react'

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/5">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4 max-w-6xl mx-auto px-4">
          <div className="flex gap-2 items-center">
             <span className="text-xl font-bold text-primary">CorePOS</span>
             <span className="text-sm px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">الاشتراكات والفوترة</span>
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-6xl mx-auto py-10 px-4">
        {children}
      </main>
      <footer className="border-t py-6 bg-background">
        <div className="container max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CorePOS - بوابتك لإدارة مبيعاتك بسهولة
        </div>
      </footer>
    </div>
  )
}
