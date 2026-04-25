import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "شروط استخدام خدمة CorePOS — نسخة مبدئية للمراجعة القانونية.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">شروط الاستخدام</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        آخر تحديث: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })} — هذه
        نسخة مبدئية ويجب مراجعتها قانونيًا قبل الاعتماد الرسمي.
      </p>

      <div className="space-y-6 text-foreground/90">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. قبول الشروط</h2>
          <p className="text-sm leading-relaxed">
            باستخدامك لموقع CorePOS ولوحة التحكم، فإنك تقر بأنك اطلعت على هذه الشروط ووافقت عليها. إذا كنت
            تستخدم النيابة عن منشأة، فأنت تُقر بأن لديك صلاحية الالتزام باسمها.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. الخدمة</h2>
          <p className="text-sm leading-relaxed">
            نوفّر منصة لإدارة مبيعات ومخزون وتقارير وفق تطور المنتج. قد تتغيّر الميزات أو تُعلّق مؤقتًا لصيانة
            أو تطوير — سنحاول تقليل انقطاع الخدمة الظاهر للمستخدم.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. الحساب والبيانات</h2>
          <p className="text-sm leading-relaxed">
            تتحمّل مسؤولية دقة البيانات التي تُدخلها (مثل أسماء المنتجات، أسعار، عملاء) والحفاظ على سرية
            بيانات الدخول. يُنصح باستخدام كلمات مرور قوية وعدم مشاركة جلسة العمل.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. الاستخدام المسموح</h2>
          <p className="text-sm leading-relaxed">
            يُحظر استخدام الخدمة لأي نشاط يخالف القانون، أو يسيء للأنظمة، أو يحاول الوصول غير المصرّح به لبيانات
            المستخدمين الآخرين.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. تعديلات على الشروط</h2>
          <p className="text-sm leading-relaxed">
            قد نُحدّث هذه الصفحة. استمرارك باستخدام الخدمة بعد نشر تعديل يعني إقرارك بالنسخة المحدثة — يُرجى
            مراجعتها عند حدوث تغيير مهم.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/privacy">سياسة الخصوصية</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  )
}
