import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف تتعامل CorePOS مع بياناتك — نسخة مبدئية للمراجعة القانونية.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">سياسة الخصوصية</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        آخر تحديث: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })} — هذه
        نسخة مبدئية ويجب مراجعتها قانونيًا قبل الاعتماد الرسمي.
      </p>

      <div className="space-y-6 text-foreground/90">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. البيانات التي نتعامل معها</h2>
          <p className="text-sm leading-relaxed">
            عند إنشاء حساب أو استخدام النظام، قد تُعالج بيانات مثل: بريد إلكتروني، اسم، وأنشطة تشغيلية
            (مبيعات، مخزون) بحسب ميزات المنتج. الهدف تشغيل الخدمة وتحسينها، وليس بيع بياناتك.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. الاستضافة والأمن</h2>
          <p className="text-sm leading-relaxed">
            نطبق ممارسات أمنية مناسبة لطبيعة الخدمة. لا يُضمن «أمن مطلق» لأي نظام متصل بالإنترنت؛ يرجى
            الالتزام بإدارة صلاحيات المستخدمين داخل منشأتك.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. مشاركة البيانات</h2>
          <p className="text-sm leading-relaxed">
            لا تُباع بياناتك لأطراف للتسويق. قد تُستعان بمزوّدي بنية (استضافة، بريد، مراقبة أعطال) بما
            يقتضيه تشغيل المنتج، ووفق الاتفاقيات الملزمة.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. الاحتفاظ والحذف</h2>
          <p className="text-sm leading-relaxed">
            تُحفظ البيانات للمدة اللازمة للخدمة والالتزامات النظامية. يمكنك طلب حذف/تنحية حسب إمكانيات
            المنتج وسياسة الفريق — يُرجى التواصل عبر قنوات الدعم المعتمدة لديك.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. تعديلات السياسة</h2>
          <p className="text-sm leading-relaxed">قد تُحدَّث هذه الصفحة. راجع قسم «آخر تحديث» عند تغيير مهم.</p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/terms">شروط الاستخدام</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  )
}
