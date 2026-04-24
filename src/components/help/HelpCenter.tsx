"use client"

import { useDeferredValue, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, LifeBuoy, Mail, MessageCircle, Phone, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Article = {
  id: string
  title: string
  keywords: string[]
  steps: string[]
}

type Section = { id: string; title: string; articles: Article[] }

const WHATSAPP = "201113511940"
const WHATSAPP_TEXT = encodeURIComponent("مرحباً، أحتاج مساعدة في CorePOS")

const SECTIONS: Section[] = [
  {
    id: "pos",
    title: "نقطة البيع (POS)",
    articles: [
      {
        id: "pos-1",
        title: "بدء عملية بيع من نقطة البيع",
        keywords: ["بيع", "سلة", "باركود", "POS"],
        steps: [
          "افتح «نقطة البيع» من القائمة الجانبية.",
          "ابحث عن الصنف بالاسم أو امسح الباركود.",
          "اضبط الكمية والسعر إن لزم، ثم أضف للسلة.",
          "اضغط «الدفع» واختر طريقة التحصيل، ثم أكّد الفاتورة.",
        ],
      },
      {
        id: "pos-2",
        title: "تعليق سلة واسترجاعها",
        keywords: ["معلقة", "سلة", "POS"],
        steps: [
          "من شريط الأدوات استخدم «تعليق السلة» عند انقطاع البيع.",
          "لاحقاً افتح «السلال المعلقة» واختر السلة المطلوبة.",
          "تابع الدفع أو عدّل الأصناف قبل الإتمام.",
        ],
      },
    ],
  },
  {
    id: "inventory",
    title: "المخزون",
    articles: [
      {
        id: "inv-1",
        title: "إضافة صنف جديد",
        keywords: ["منتج", "صنف", "مخزون", "إضافة"],
        steps: [
          "اذهب إلى «المخزون» ← «المنتجات» ← «إضافة منتج».",
          "أدخل الاسم والوحدة والأسعار والحد الأدنى للتنبيه.",
          "احفظ الصنف، ثم راجع الكمية من تقرير المخزون إن لزم.",
        ],
      },
      {
        id: "inv-2",
        title: "فهم تنبيهات النواقص",
        keywords: ["نواقص", "تنبيه", "حد أدنى"],
        steps: [
          "يُحسب النقص عندما تقل الكمية عن الحد الأدنى الذي ضبطته للصنف.",
          "تظهر التنبيهات في لوحة التحكم وفي تقارير المخزون.",
          "راجع أوامر الشراء أو التوريد لتغطية النواقص.",
        ],
      },
    ],
  },
  {
    id: "invoices",
    title: "الفواتير والمبيعات",
    articles: [
      {
        id: "invf-1",
        title: "إصدار فاتورة مبيعات",
        keywords: ["فاتورة", "مبيعات", "عميل"],
        steps: [
          "من «المبيعات» اختر «فاتورة جديدة» أو المسار المناسب لنوع البيع.",
          "اختر العميل (أو نقدي)، ثم أضف الأصناف والكميات.",
          "راجع الإجمالي والضريبة، ثم احفظ أو اطبع حسب إعداداتك.",
        ],
      },
      {
        id: "invf-2",
        title: "المدفوعات والمتبقي",
        keywords: ["دفع", "آجل", "متبقي"],
        steps: [
          "سجّل المدفوع من نافذة الدفع إن كان جزئياً.",
          "يتتبع النظام المتبقي على الفاتورة وفي حساب العميل.",
          "استخدم سند القبض لاحقاً لتسوية المبالغ المستحقة.",
        ],
      },
    ],
  },
  {
    id: "faq",
    title: "مشاكل شائعة",
    articles: [
      {
        id: "faq-1",
        title: "لا تظهر أصناف في البحث",
        keywords: ["بحث", "صنف", "لا يظهر"],
        steps: [
          "تأكد أن الصنف «نشط» وليس موقوفاً عن البيع.",
          "جرّب البحث بالباركود أو جزء من الاسم بدون مسافات زائدة.",
          "حدّث الصفحة؛ إذا استمرّت المشكلة تواصل مع الدعم.",
        ],
      },
      {
        id: "faq-2",
        title: "اختلاف رصيد العميل عن المتوقع",
        keywords: ["رصيد", "عميل", "دين"],
        steps: [
          "راجع كشف حساب العميل من صفحة تفاصيل العميل.",
          "تأكد من تسجيل كل المدفوعات والفواتير المرتبطة.",
          "راجع تاريخ الفلترة في التقارير لتطابق الفترة التي تحللها.",
        ],
      },
    ],
  },
]

export function HelpCenter() {
  const [query, setQuery] = useState("")
  const deferred = useDeferredValue(query.trim().toLowerCase())
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    if (!deferred) return SECTIONS
    return SECTIONS.map((sec) => ({
      ...sec,
      articles: sec.articles.filter((a) => {
        const blob = `${a.title} ${a.keywords.join(" ")}`.toLowerCase()
        return blob.includes(deferred)
      }),
    })).filter((s) => s.articles.length > 0)
  }, [deferred])

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-0">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">مركز المساعدة</h1>
        <p className="text-sm text-muted-foreground">
          مقالات قصيرة حسب الموضوع. استخدم البحث للوصول السريع إلى خطوات العمل.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في المساعدة…"
          className="pe-10"
          aria-label="بحث في المساعدة"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">لا نتائج — جرّب كلمات أخرى أو تواصل مع الدعم</p>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://wa.me/${WHATSAPP}?text=${WHATSAPP_TEXT}`} target="_blank" rel="noopener noreferrer">
                فتح واتساب (نافذة جديدة)
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {filtered.map((section) => (
            <section key={section.id} className="space-y-4" aria-labelledby={`sec-${section.id}`}>
              <h2 id={`sec-${section.id}`} className="text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.articles.map((article) => {
                  const isOpen = !!open[article.id]
                  return (
                    <Card key={article.id} className="overflow-hidden border bg-card shadow-sm">
                      <CardHeader className="pb-2">
                        <button
                          type="button"
                          onClick={() => toggle(article.id)}
                          className="flex w-full items-start justify-between gap-3 text-start"
                          aria-expanded={isOpen}
                        >
                          <CardTitle className="text-base font-semibold leading-snug">{article.title}</CardTitle>
                          {isOpen ? (
                            <ChevronUp className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                          ) : (
                            <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                          )}
                        </button>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="border-t border-border/60 pt-4">
                          <ol className="list-decimal space-y-2 pe-5 text-sm leading-relaxed text-muted-foreground marker:text-primary">
                            {article.steps.map((step, i) => (
                              <li key={i} className="text-foreground/90">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Card className="border bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden />
            تواصل معنا
          </CardTitle>
          <CardDescription>فريق الدعم جاهز عبر الواتساب. يُفتح الرابط في نافذة جديدة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${WHATSAPP_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors",
              "hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium">واتساب</p>
              <p className="text-xs text-muted-foreground">دعم مباشر</p>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
            <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium">البريد</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                support@pos-sahl.com
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
            <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium">هاتف (مثال)</p>
              <p className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                +20 123 456 7890
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden />
          <CardTitle className="text-sm font-medium">دروس فيديو</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3">نُحدّث مكتبة الفيديو قريبًا. يمكنك طلب موضوع محدد عبر الواتساب.</p>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("أرغب في فيديو توضيحي عن: ")}`} target="_blank" rel="noopener noreferrer">
              طلب موضوع فيديو — يُفتح في نافذة جديدة
            </a>
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/dashboard" className="underline-offset-4 hover:underline">
          العودة إلى لوحة التحكم
        </Link>
      </p>
    </div>
  )
}
