import { SettingsNav } from "@/components/settings/SettingsNav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-10 pt-2 sm:px-6 lg:px-0">
      <SettingsNav />
      {children}
    </div>
  )
}
