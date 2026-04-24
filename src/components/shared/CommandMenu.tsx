"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Package,
  Users,
  LayoutDashboard,
  ShoppingCart,
  History,
  ArrowLeftRight
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { getGlobalSearchResults, type SearchResult } from "@/lib/actions/global-search.actions"
import { useDebounce } from "@/hooks/use-debounce"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const debouncedQuery = useDebounce(query, 300)
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

  React.useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const data = await getGlobalSearchResults(debouncedQuery)
        setResults(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [debouncedQuery])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const products = results.filter((r) => r.type === "product")
  const customers = results.filter((r) => r.type === "customer")

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="ابحث عن منتج، عميل، أو أمر..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="rtl">
        <CommandEmpty>
          {loading ? "جاري البحث..." : "لم يتم العثور على نتائج."}
        </CommandEmpty>
        
        {products.length > 0 && (
          <CommandGroup heading="المنتجات">
            {products.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <Package className="ml-2 h-4 w-4" />
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.title}</span>
                  <span className="text-xs font-black text-primary">
                    {item.price?.toLocaleString()} ج.م
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {customers.length > 0 && (
          <CommandGroup heading="العملاء">
            {customers.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <User className="ml-2 h-4 w-4" />
                <span>{item.title}</span>
                {item.subtitle && (
                  <span className="mr-auto text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        
        <CommandGroup heading="تنقل سريع">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="ml-2 h-4 w-4" />
            <span>لوحة التحكم الرئيسية</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/pos"))}>
            <ShoppingCart className="ml-2 h-4 w-4" />
            <span>نقطة البيع (POS)</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/sales/invoices"))}>
            <History className="ml-2 h-4 w-4" />
            <span>سجل المبيعات</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inventory/products"))}>
            <Package className="ml-2 h-4 w-4" />
            <span>قائمة المنتجات</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
