"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { 
  Building2, 
  Users, 
  CreditCard, 
  LayoutDashboard, 
  ShieldCheck, 
  Activity,
  Search,
  Plus
} from "lucide-react"

export function SuperAdminSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative hidden items-center md:flex w-72"
      >
        <Search
          className="pointer-events-none absolute start-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
        <div className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-secondary/40 py-2 pe-4 ps-10 text-sm text-muted-foreground transition-all hover:bg-secondary/60 hover:border-primary/30 shadow-sm">
          <span>ابحث عن شركة، مستخدم...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div dir="rtl">
          <CommandInput placeholder="اكتب للبحث عن أي شيء في المنصة..." />
          <CommandList>
            <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
            <CommandGroup heading="التنقل السريع">
              <CommandItem onSelect={() => runCommand(() => router.push("/super-admin"))}>
                <LayoutDashboard className="ml-2 h-4 w-4" />
                <span>الرئيسية</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/super-admin/companies"))}>
                <Building2 className="ml-2 h-4 w-4" />
                <span>إدارة الشركات</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/super-admin/users"))}>
                <Users className="ml-2 h-4 w-4" />
                <span>إدارة المستخدمين</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/super-admin/subscriptions"))}>
                <CreditCard className="ml-2 h-4 w-4" />
                <span>الاشتراكات</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="إجراءات سريعة">
              <CommandItem onSelect={() => runCommand(() => router.push("/register"))}>
                <Plus className="ml-2 h-4 w-4" />
                <span>إضافة شركة جديدة</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/super-admin/audit-logs"))}>
                <Activity className="ml-2 h-4 w-4" />
                <span>سجلات النشاط</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/super-admin/rbac"))}>
                <ShieldCheck className="ml-2 h-4 w-4" />
                <span>إدارة الصلاحيات</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  )
}
