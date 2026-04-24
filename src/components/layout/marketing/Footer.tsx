import Link from "next/link"
import { ShoppingBag, Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black tracking-tighter">CorePOS</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              الحل المتكامل لإدارة المبيعات والمخزون في الوطن العربي. بنيت بكل حب لمساعدة التجار على النجاح.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-6">المنتج</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">المميزات</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">الأسعار</Link></li>
              <li><Link href="#pos" className="hover:text-primary">نقطة البيع</Link></li>
              <li><Link href="#inventory" className="hover:text-primary">إدارة المخزون</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">الشركة</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">من نحن</Link></li>
              <li><Link href="#" className="hover:text-primary">المدونة</Link></li>
              <li><Link href="#" className="hover:text-primary">شركاء النجاح</Link></li>
              <li><Link href="#" className="hover:text-primary">فرص العمل</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">الدعم</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary">تسجيل الدخول للوحة</Link></li>
              <li><Link href="#" className="hover:text-primary">سياسة الخصوصية</Link></li>
              <li><Link href="#" className="hover:text-primary">شروط الاستخدام</Link></li>
              <li><Link href="#" className="hover:text-primary">تواصل معنا</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CorePOS. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
