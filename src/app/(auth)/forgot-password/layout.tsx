import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "نسيت كلمة المرور",
  description: "طلب رابط لإعادة تعيين كلمة مرور حسابك في CorePOS.",
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
