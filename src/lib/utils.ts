import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getActiveCompanyCurrency } from "@/lib/active-company-currency"
import { currencyDisplaySuffix } from "@/lib/company-regional"

/**
 * دمج كلاسات Tailwind مع التعامل مع التعارضات
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateEAN13() {
  // Use '200' prefix for internal items
  const code = "200" + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
  
  // Calculate checksum
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const checksum = (10 - (sum % 10)) % 10
  
  return code + checksum
}

/**
 * تنسيق المبالغ بعملة الشركة النشطة (من الجلسة عبر SessionSync)، أو `currencyCode` عند تمريره.
 * يستخدم الأرقام الغربية 1234 دائماً كما في D13
 */
export function formatCurrency(amount: any, currencyCode?: string) {
  const num = Number(amount ?? 0)
  const code = (currencyCode ?? getActiveCompanyCurrency()).toUpperCase()
  const suffix = currencyDisplaySuffix(code)
  return (
    new Intl.NumberFormat("ar-EG", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      numberingSystem: "latn",
    }).format(isNaN(num) ? 0 : num) +
    " " +
    suffix
  )
}

/**
 * تنسيق التواريخ بالشكل المعتمد (dd/MM/yyyy)
 * يستخدم الأرقام الغربية 1234 دائماً كما في D13
 */
export function formatDate(date: Date | string | number) {
  const d = new Date(date)
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    numberingSystem: "latn", // تأكيد استخدام الأرقام الغربية
  }).format(d)
}

/**
 * تنسيق الأرقام البسيطة مع التأكد من استخدام نظام numberingSystem: 'latn'
 */
export function formatNumber(num: number) {
  return new Intl.NumberFormat("ar-EG", {
    numberingSystem: "latn",
  }).format(num)
}
