"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ProductItem {
  id: string
  name: string
  barcode?: string | null
  price1?: number
  cost_price?: number
}

interface ProductSearchInputProps {
  products: ProductItem[]
  onSelect: (product: ProductItem) => void
  saleMode?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProductSearchInput({
  products,
  onSelect,
  saleMode = true,
  open: controlledOpen,
  onOpenChange,
}: ProductSearchInputProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [search, setSearch] = useState("")

  const isControlled = controlledOpen !== undefined
  const popoverOpen = isControlled ? controlledOpen : uncontrolledOpen
  const setPopoverOpen = isControlled ? onOpenChange! : setUncontrolledOpen

  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const filtered = useMemo(() => {
    if (!deferredSearch) return products
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase()
      const bc = p.barcode != null ? String(p.barcode).toLowerCase() : ""
      return name.includes(deferredSearch) || bc.includes(deferredSearch)
    })
  }, [products, deferredSearch])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Popover
        open={popoverOpen}
        onOpenChange={(o) => {
          setPopoverOpen(o)
          if (!o) setSearch("")
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-start border-2 border-dashed pe-10 transition-colors hover:border-primary/50"
          >
            إبحث بالاسم أو الباركود لإضافة أصناف للفاتورة…
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" dir="rtl">
          <Command shouldFilter={false} dir="rtl">
            <CommandInput
              placeholder="اكتب اسم الصنف أو الباركود…"
              className="h-11"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>لم يتم العثور على منتج مطابق.</CommandEmpty>
              <CommandGroup>
                {filtered.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => {
                      onSelect(product)
                      setPopoverOpen(false)
                      setSearch("")
                    }}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.barcode || "—"}</p>
                    </div>
                    <div className="text-start font-bold text-primary tabular-nums">
                      {saleMode ? (product.price1 || 0) : (product.cost_price || 0)} ج.م
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
