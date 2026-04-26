import { AuthPageShell } from "@/components/auth/AuthPageShell"

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthPageShell>{children}</AuthPageShell>
}
