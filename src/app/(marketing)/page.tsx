import { CheckCircle2, ShoppingCart, BarChart3, Package, Users, ShieldCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-24 md:py-32">
        <div className="container relative z-10 mx-auto px-4 text-center md:px-8">
          <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            تجربة مجانية 14 يوماً — دون بطاقة بنكية
          </div>
          <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            بيع أسرع، وراقب مخزونك مع <span className="text-primary">CorePOS</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            مبيعات، مخزون، وتقارير في لوحة واحدة بالعربية — مناسب للمحلات والفروع الصغيرة والمتوسطة.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-md shadow-primary/15" asChild>
              <Link href="/register">إنشاء حساب</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-6 text-base font-medium text-muted-foreground" asChild>
              <Link href="#features">المميزات</Link>
            </Button>
          </div>
          
          {/* Dashboard Preview Placeholder */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full opacity-50 overflow-hidden" />
            <div className="relative flex aspect-video flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-4 shadow-xl md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="col-span-2 bg-secondary/30 rounded-lg p-6 flex flex-col gap-4">
                  <div className="h-8 w-1/3 bg-primary/20 rounded" />
                  <div className="h-full border-2 border-dashed border-primary/10 rounded-lg" />
                </div>
                <div className="bg-secondary/20 rounded-lg p-6 flex flex-col gap-4">
                  <div className="h-6 w-2/3 bg-muted rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/50 rounded" />
                    <div className="h-4 bg-muted/50 rounded" />
                    <div className="h-4 bg-muted/50 rounded w-1/2" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-card via-transparent to-transparent pb-10">
                <span className="rounded-full bg-muted/90 px-3 py-1 text-xs font-medium text-muted-foreground">
                  معاينة واجهة — تجريبي
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">كل ما تحتاجه لإدارة محلك</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">ميزات عملية بدون تعقيد — من نقطة البيع حتى التقارير.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {[
              { 
                title: "نقطة بيع سريعة", 
                desc: "واجهة POS ذكية تدعم الباركود واللمس، تنهي العملية في ثوانٍ.",
                icon: ShoppingCart,
                color: "text-primary bg-primary/5"
              },
              { 
                title: "إدارة مخزون احترافية", 
                desc: "تنبيهات تلقائية لنقص الأصناف وتتبع دقيق لكل حركة صنف.",
                icon: Package,
                color: "text-accent bg-accent/5"
              },
              { 
                title: "تقارير مالية دقيقة", 
                desc: "اعرف مبيعاتك وأرباحك وميزانيتك لحظة بلحظة وبضغطة زر.",
                icon: BarChart3,
                color: "text-blue-500 bg-blue-50"
              },
              { 
                title: "إدارة العملاء والديون", 
                desc: "تتبع حسابات العملاء والديون والمدفوعات الآجلة بسهولة.",
                icon: Users,
                color: "text-purple-500 bg-purple-50"
              },
              { 
                title: "أمان كامل للبيانات", 
                desc: "نسخ احتياطي تلقائي وتشفير للبيانات لضمان سرية معلوماتك.",
                icon: ShieldCheck,
                color: "text-green-600 bg-green-50"
              },
              { 
                title: "سهولة الاستخدام", 
                desc: "لا يحتاج خبرة تقنية، واجهة سهلة بالكامل باللغة العربية.",
                icon: CheckCircle2,
                color: "text-orange-500 bg-orange-50"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group flex h-full flex-col rounded-2xl border border-border/50 bg-background p-8 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div
                  className={cn(
                    "mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                    feature.color
                  )}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y bg-muted/20 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">الأسعار</h2>
            <p className="text-sm text-muted-foreground">ابدأ مجاناً ثم رقِّ عندما يكبر نشاطك.</p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="flex h-full flex-col border bg-background shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">التجريبية</CardTitle>
                <CardDescription>فرع ومخزن ومستخدم أساسي</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <p className="text-2xl font-bold text-foreground">مجاناً</p>
                <ul className="space-y-2 pt-2">
                  {["تجربة 14 يوماً", "فاتورة ومخزون أساسي", "دعم عبر الواتساب"].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/register">ابدأ الآن</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex h-full flex-col border-2 border-primary bg-background shadow-md md:scale-[1.02]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">الأساسية</CardTitle>
                <CardDescription>للمحلات النامية</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <p className="text-2xl font-bold text-foreground">200 ج.م / شهر</p>
                <ul className="space-y-2 pt-2">
                  {["عدة فروع ومخازن", "تقارير أوسع", "مستخدمين أكثر"].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/billing/upgrade">تفاصيل الترقية</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex h-full flex-col border bg-background shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">المؤسسات</CardTitle>
                <CardDescription>فروع ومنتجات ومستخدمين بلا حدود تقريباً</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <p className="text-2xl font-bold text-foreground">حسب الاتفاق</p>
                <ul className="space-y-2 pt-2">
                  {["دعم مخصص", "تكاملات", "تدريب الفريق"].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/billing/upgrade">تواصل للعرض</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* POS */}
      <section id="pos" className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border bg-background p-8 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">نقطة بيع (POS) مصممة للسرعة</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              واجهة لمس + باركود، ضريبة قابلة للتعديل، وطباعة فواتير — كل ده في تجربة عربية بسيطة تقلّل وقت العملية.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/register">ابدأ التجربة</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="#features">شوف كل المميزات</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section id="inventory" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border bg-background p-8 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">مخزون واضح… وتنبيهات قبل ما تخلص</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              إدارة أصناف، وحدات، فئات، وحدّ أدنى للمخزون، مع تقارير تساعدك تعرف إيه بيتحرك وإيه واقف.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/register">ابدأ الآن</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="#pricing">شوف الأسعار</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 md:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-primary p-12 text-center text-primary-foreground md:p-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl font-semibold md:text-4xl">جاهز لتنظيم مبيعاتك؟</h2>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-primary-foreground/85">
                أنشئ حساباً في دقائق. فترة تجريبية 14 يوماً دون التزام بالدفع الإلكتروني.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
                <Button size="lg" variant="secondary" className="h-12 px-10 text-base font-semibold" asChild>
                  <Link href="/register">إنشاء حساب</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 border-primary-foreground/40 bg-transparent px-10 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link href="/login">لدي حساب</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
