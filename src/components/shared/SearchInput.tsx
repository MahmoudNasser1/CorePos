"use client"

import { Input } from "@/components/ui/input"
import { Search, Barcode } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onBarcodeScan?: (barcode: string) => void
  showBarcodeIcon?: boolean
}

export function SearchInput({
  className,
  onBarcodeScan,
  showBarcodeIcon = true,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pr-10 pl-10 h-10 rounded-lg focus-visible:ring-primary"
        {...props}
      />
      {showBarcodeIcon && (
        <div className="absolute left-3 p-1 rounded-md hover:bg-secondary cursor-pointer transition-colors">
          <Barcode className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
