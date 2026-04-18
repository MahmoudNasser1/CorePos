"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-background/80 backdrop-blur-md py-3 border-border shadow-sm" 
          : "bg-transparent py-5 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">CorePOS</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-bold hover:text-primary transition-colors">المميزات</Link>
          <Link href="#pricing" className="text-sm font-bold hover:text-primary transition-colors">الأسعار</Link>
          <Link href="#contact" className="text-sm font-bold hover:text-primary transition-colors">اتصل بنا</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hidden sm:flex font-bold">
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild className="font-bold px-6 shadow-lg shadow-primary/20">
            <Link href="/register">ابدأ مجاناً</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
