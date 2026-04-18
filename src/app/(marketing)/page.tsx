import { CheckCircle2, ShoppingCart, BarChart3, Package, Users, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-primary/10 text-primary animate-pulse">
            جديد: دعم أجهزة الباركود الحديثة 🚀
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            بيع أسرع، اعرف أكثر مع <span className="text-primary">CorePOS</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            النظام المتكامل لإدارة المبيعات والمخزون، صُمم خصيصاً ليجعل إدارة عملك أسهل وأكثر دقة. ابدأ الآن وانضم لأكثر من 500 محل يستخدمون CorePOS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-lg shadow-primary/20" asChild>
              <Link href="/register">ابدأ تجربتك المجانية (14 يوم)</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold" asChild>
              <Link href="#features">شاهد المميزات</Link>
            </Button>
          </div>
          
          {/* Dashboard Preview Placeholder */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full opacity-50 overflow-hidden" />
            <div className="rounded-2xl border bg-card shadow-2xl p-4 md:p-8 aspect-video flex flex-col gap-4 overflow-hidden relative">
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
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent flex items-end justify-center pb-12">
                 <p className="text-primary font-bold text-lg">نظام جميل من كل زاوية</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">كل ما تحتاجه لإدارة محلك</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">صممنا كل ميزة بدقة لتساعدك على تقليل الفواقد وزيادة أرباحك.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div key={i} className="p-8 rounded-2xl border border-border/50 bg-background hover:border-primary/50 transition-all hover:shadow-xl group">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-primary rounded-[2rem] p-12 md:p-20 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black">هل أنت جاهز لتغيير موازين متجرك؟</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                انضم اليوم واستمتع بنظام CorePOS مجاناً لمدة 14 يوم. لا حاجة لبيانات بطاقة ائتمان.
              </p>
              <div className="pt-4">
                <Button size="lg" variant="secondary" className="h-16 px-12 text-xl font-black" asChild>
                  <Link href="/register">ابدأ الآن مجاناً</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
