"use client"

import { useState, useEffect } from "react"
import { usePOSStore } from "@/stores/posStore"
import { getCustomers } from "@/lib/actions/pos.actions"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { UserPlus, Check, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function CustomerSelect() {
  const { customer, setCustomer } = usePOSStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const data = await getCustomers(search)
        setCustomers(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchCustomers()
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary text-xs h-8 gap-2 hover:bg-primary/5"
        >
          {customer ? "تغيير العميل" : "إضافة عميل"}
          <UserPlus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="end">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="بحث بالاسم أو الهاتف..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && customers.length === 0 && (
              <CommandEmpty>لم يتم العثور على عملاء.</CommandEmpty>
            )}
            <CommandGroup>
              {customers.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    setCustomer(c)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.phone || "بدون هاتف"}</span>
                  </div>
                  {customer?.id === c.id && <Check className="h-4 w-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="p-2 border-t mt-1">
            <Button variant="outline" className="w-full text-xs h-8 gap-2 border-dashed">
              <UserPlus className="h-3 w-3" />
              عميل جديد
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
