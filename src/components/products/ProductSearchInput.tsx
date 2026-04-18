"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
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
}

export function ProductSearchInput({
  products,
  onSelect,
  saleMode = true
}: ProductSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start pr-10 h-11 border-dashed border-2 hover:border-primary/50 transition-colors">
            إبحث بالاسم أو الباركود لإضافة أصناف للفاتورة...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command dir="rtl">
            <CommandInput placeholder="اكتب اسم الصنف أو الباركود..." className="h-11" />
            <CommandList>
              <CommandEmpty>لم يتم العثور على المنتج.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem key={product.id} onSelect={() => onSelect(product)} className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.barcode || "---"}</p>
                    </div>
                    <div className="text-left font-bold text-primary">
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
