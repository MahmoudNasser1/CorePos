import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "دخول آمن إلى لوحة CorePOS — مبيعات، مخزون، وتقارير.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
