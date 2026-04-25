import {
  BarChart3,
  Package,
  Receipt,
  ScanBarcode,
  Store,
  Users2,
} from "lucide-react"

const CAPABILITIES = [
  { icon: ScanBarcode, label: "بيع سريع مع باركود", hint: "شاشة POS خفيفة" },
  { icon: Package, label: "مخزون وتنبيهات", hint: "رصد عند حدود الطلب" },
  { icon: Receipt, label: "فواتير مبيعات ومشتريات", hint: "مسار واضح" },
  { icon: Users2, label: "عملاء وموردون", hint: "أرصدة وكشف حساب" },
  { icon: BarChart3, label: "تقارير وخزنة", hint: "ملخصات يومية" },
  { icon: Store, label: "فروع وضبط أساسي", hint: "جاهز للنمو" },
] as const

/**
 * لوحة قيمة لصفحة التسجيل — شبكة bento غير متماثلة (ليس 3×4) مع محتوى CorePOS.
 */
export function RegisterValuePanel() {
  return (
    <div className="flex flex-col gap-6 lg:min-h-[min(32rem,70vh)] lg:justify-center">
      <div className="space-y-3">
        <p className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          انطلاقة سريعة
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          نظامك للمبيعات
          <span className="text-primary"> — </span>
          <span className="text-foreground/90">من دون تعقيد</span>
        </h1>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
          اربط بياناتك في لوحة واحدة: بيع، مخزون، وتقارير بالعربية. نموذج إنشاء الحساب يطلب
          اسم المحل والمستخدم والبريد، ويمكنك إضافة هاتف التواصل والعنوان والدولة — ثم تكمّل
          العملة والضريبة من خطوة الإعداد.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CAPABILITIES.map(({ icon: Icon, label, hint }) => (
          <li
            key={label}
            className="group flex gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/25 hover:bg-card/80"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-[1.02]">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-medium leading-tight text-foreground">{label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
