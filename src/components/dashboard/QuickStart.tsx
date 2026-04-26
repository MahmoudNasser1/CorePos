 "use client"

import Link from "next/link"
import { startTransition, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PackagePlus,
  ShoppingCart,
  ReceiptText,
  Warehouse,
  Landmark,
  HelpCircle,
  EyeOff,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react"
import { dismissQuickStart } from "@/lib/actions/user-preferences.actions"

type QuickStartProps = {
  hasProducts: boolean
  hasWarehouses: boolean
  hasTreasuries: boolean
  hasAnyInvoices: boolean
  dismissedServer?: boolean
  readinessPercent?: number
}

const DISMISS_KEY = "corepos.quickStartDismissed.v1"

export function QuickStart({
  hasProducts,
  hasWarehouses,
  hasTreasuries,
  hasAnyInvoices,
  dismissedServer,
  readinessPercent,
}: QuickStartProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const local = localStorage.getItem(DISMISS_KEY) === "1"
      setDismissed(Boolean(dismissedServer) || local)
    } catch {
      setDismissed(Boolean(dismissedServer))
    }
  }, [dismissedServer])

  const doneSteps = useMemo(() => {
    return [hasWarehouses, hasTreasuries, hasProducts, hasAnyInvoices].filter(Boolean).length
  }, [hasAnyInvoices, hasProducts, hasTreasuries, hasWarehouses])

  const percent = Math.min(
    100,
    Math.max(
      0,
      Math.round(typeof readinessPercent === "number" ? readinessPercent : (doneSteps / 4) * 100)
    )
  )
  const level = percent >= 75 ? 4 : percent >= 50 ? 3 : percent >= 25 ? 2 : 1
  const xp = Math.round((percent / 100) * 120)

  const items = useMemo(() => {
    const list: Array<{
      title: string
      desc: string
      href: string
      icon: any
      cta: string
      tone?: "primary" | "outline"
      badge?: string
      priority: number
      locked?: boolean
      lockReason?: string
    }> = []

    if (!hasWarehouses) {
      list.push({
        title: "أنشئ مخزن",
        desc: "المخزن ضروري للمشتريات والمخزون. ابدأ بمخزن واحد فقط.",
        href: "/dashboard/settings/warehouses",
        icon: Warehouse,
        cta: "إعداد المخازن",
        tone: "primary",
        badge: "ضروري",
        priority: 10,
      })
    }

    if (!hasTreasuries) {
      list.push({
        title: "أضف خزينة",
        desc: "الخزينة تساعدك تسجّل قبض/صرف وتتابع الرصيد. ابدأ بخزينة واحدة.",
        href: "/dashboard/finance/treasuries",
        icon: Landmark,
        cta: "إعداد الخزينة",
        tone: hasWarehouses ? "primary" : "outline",
        badge: "ضروري",
        priority: 20,
      })
    }

    if (!hasProducts) {
      list.push({
        title: "أضف أول صنف",
        desc: "ابدأ بمنتج أو اثنين (اسم + سعر). الباركود والصورة ممكن لاحقًا.",
        href: "/dashboard/inventory/products/new",
        icon: PackagePlus,
        cta: "إضافة صنف",
        tone: "primary",
        badge: "خطوة 1",
        priority: 30,
      })
    }

    list.push({
      title: "افتح نقطة البيع",
      desc: "جرّب عملية بيع سريعة. الضريبة افتراضيًا 0% وقابلة للتعديل من شاشة POS.",
      href: "/dashboard/pos",
      icon: ShoppingCart,
      cta: "فتح POS",
      tone: hasProducts ? "primary" : "outline",
      badge: hasProducts ? "الأسرع" : "بعد إضافة صنف",
      priority: hasProducts ? 40 : 70,
      locked: !hasProducts,
      lockReason: "يتطلب إضافة صنف أولًا",
    })

    list.push({
      title: "اعمل فاتورة مبيعات",
      desc: "لو بتحب تبدأ بالفواتير بدل POS: أنشئ فاتورة مبيعات بسهولة.",
      href: "/dashboard/sales/new",
      icon: ReceiptText,
      cta: "فاتورة مبيعات",
      tone: "outline",
      priority: hasProducts ? 50 : 80,
      locked: !hasProducts,
      lockReason: "يتطلب إضافة صنف أولًا",
    })

    list.push({
      title: "اعمل فاتورة مشتريات",
      desc: "سجّل مشترياتك (وتقدر تضيف صنف سريعًا من داخل فاتورة المشتريات).",
      href: "/dashboard/purchases/new",
      icon: ReceiptText,
      cta: "فاتورة مشتريات",
      tone: "outline",
      priority: hasWarehouses ? (hasProducts ? 60 : 85) : 90,
      locked: !hasWarehouses,
      lockReason: "يتطلب إنشاء مخزن أولًا",
    })

    list.push({
      title: "مساعدة سريعة",
      desc: "لو محتاج إجابة سريعة: خطوات الاستخدام والأسئلة الشائعة.",
      href: "/dashboard/help",
      icon: HelpCircle,
      cta: "فتح المساعدة",
      tone: "outline",
      priority: 100,
    })

    // Keep it compact
    return list.sort((a, b) => a.priority - b.priority).slice(0, 6)
  }, [hasProducts, hasWarehouses, hasTreasuries])

  const shouldShow =
    !dismissed &&
    (!hasAnyInvoices || !hasProducts || !hasWarehouses || !hasTreasuries)

  if (!shouldShow) return null

  return (
    <Card className="border bg-card shadow-sm" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">ابدأ بسرعة</CardTitle>
            <CardDescription>خطوات بسيطة تخليك تشتغل على السيستم بدون أي شرح.</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-muted-foreground"
            onClick={() => {
              try {
                localStorage.setItem(DISMISS_KEY, "1")
              } catch {
                // ignore
              }
              startTransition(() => {
                dismissQuickStart().catch(() => {
                  // ignore (local dismiss already applied)
                })
              })
              setDismissed(true)
            }}
          >
            <EyeOff className="h-4 w-4" aria-hidden />
            إخفاء
          </Button>
        </div>

        <div className="mt-3 rounded-lg border bg-muted/15 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" aria-hidden />
              <div className="text-sm font-semibold">المستوى {level}</div>
              <Badge variant="secondary" className="gap-1 text-[11px]">
                <Star className="h-3 w-3" aria-hidden />
                {xp} XP
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              الإنجاز: <span className="font-semibold text-foreground tabular-nums">{doneSteps}</span>/4
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
            </div>
            <div className="shrink-0 text-xs font-semibold tabular-nums">{percent}%</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            كمل 4 خطوات أساسية (مخزن + خزينة + صنف + أول فاتورة) وتعتبر جاهز بالكامل.
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3" dir="rtl">
          {items.map((it) => (
            <Card key={it.href} className="border border-border/60 bg-background shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <it.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base font-semibold">{it.title}</CardTitle>
                      {it.badge && (
                        <Badge variant={it.badge === "ضروري" ? "destructive" : "secondary"} className="text-[11px] font-medium">
                          {it.badge}
                        </Badge>
                      )}
                      {it.locked && (
                        <Badge variant="outline" className="gap-1 text-[11px]">
                          <Lock className="h-3 w-3" aria-hidden />
                          مقفول
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-600/70"
                    aria-hidden
                    style={{ visibility: it.locked ? "hidden" : "visible" }}
                  />
                </div>
                <CardDescription className="pt-2 text-sm leading-relaxed">
                  {it.locked && it.lockReason ? (
                    <span>
                      {it.desc} <span className="text-muted-foreground">— {it.lockReason}</span>
                    </span>
                  ) : (
                    it.desc
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {it.locked ? (
                  <Button className="w-full" variant="secondary" disabled>
                    {it.cta}
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant={it.tone === "outline" ? "outline" : "default"}>
                    <Link href={it.href}>{it.cta}</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

