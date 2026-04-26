import Link from "next/link"
import { MessageCircle } from "lucide-react"

const WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, "")

/**
 * تذييل خفيف لمسارات الدخول: ثقة + قنوات — بدون ازدحام.
 */
export function AuthMarketingFooter() {
  return (
    <footer className="shrink-0 border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
          <p className="text-center text-xs text-muted-foreground sm:text-start">
            &copy; {new Date().getFullYear()} CorePOS — لوحة عربية لإدارة المبيعات والمخزون.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
              الصفحة الرئيسية
            </Link>
            {WHATSAPP && WHATSAPP.length > 0 ? (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-emerald-600"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                واتساب
              </a>
            ) : null}
            <span className="text-border">·</span>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              شروط الاستخدام
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
