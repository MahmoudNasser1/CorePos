/**
 * عملة الشركة النشطة للعرض في الواجهة (يضبطها SessionSync من /auth/session).
 * على الخادم يبقى الافتراضي EGP حتى يُمرَّر currency صراحةً لـ formatCurrency.
 */
const DEFAULT = "EGP"

let activeCurrencyCode = DEFAULT

export function getActiveCompanyCurrency(): string {
  return activeCurrencyCode || DEFAULT
}

export function setActiveCompanyCurrency(code: string | null | undefined) {
  const t = (code ?? "").trim().toUpperCase()
  if (!t) {
    activeCurrencyCode = DEFAULT
    return
  }
  activeCurrencyCode = t.slice(0, 8)
}

export function resetActiveCompanyCurrency() {
  activeCurrencyCode = DEFAULT
}
