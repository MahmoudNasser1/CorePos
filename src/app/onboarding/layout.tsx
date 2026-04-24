import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="w-full max-w-md space-y-2 rounded-xl border bg-card p-8 shadow-sm">
        <OnboardingProgress />
        {children}
      </div>
    </div>
  )
}
