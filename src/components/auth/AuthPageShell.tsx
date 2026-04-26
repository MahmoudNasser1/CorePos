import Link from "next/link"
import { AuthMarketingFooter } from "@/components/auth/AuthMarketingFooter"

/**
 * هيكل صفحات (auth): خلفية هادئة، شريط علوي بسيط، تذييل للثقة.
 * التصميم مُنفصل عن أسلوب لاندنغ تسويقي معيّن — تركيز على وضوح المسار.
 */
export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-background via-background to-muted/30">
      <header className="shrink-0 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            CorePOS
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              المميزات
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              الباقات
            </Link>
            <span className="text-border hidden sm:inline">|</span>
            <Link
              href="/login"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              دخول
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-stretch justify-center py-8 sm:py-12">
        {children}
      </main>

      <AuthMarketingFooter />
    </div>
  )
}
