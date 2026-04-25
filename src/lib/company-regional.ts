/** خيارات الأونبوردنج وإعدادات الشركة: بلد، توقيت مقترح، عملة افتراضية للاقتراح فقط */

export type RegionalCountry = {
  code: string
  label: string
  defaultTimezone: string
  suggestedCurrency: string
}

export const REGIONAL_COUNTRIES: RegionalCountry[] = [
  { code: "EG", label: "مصر", defaultTimezone: "Africa/Cairo", suggestedCurrency: "EGP" },
  { code: "SA", label: "السعودية", defaultTimezone: "Asia/Riyadh", suggestedCurrency: "SAR" },
  { code: "AE", label: "الإمارات", defaultTimezone: "Asia/Dubai", suggestedCurrency: "AED" },
  { code: "KW", label: "الكويت", defaultTimezone: "Asia/Kuwait", suggestedCurrency: "KWD" },
  { code: "QA", label: "قطر", defaultTimezone: "Asia/Qatar", suggestedCurrency: "QAR" },
  { code: "BH", label: "البحرين", defaultTimezone: "Asia/Bahrain", suggestedCurrency: "BHD" },
  { code: "OM", label: "عُمان", defaultTimezone: "Asia/Muscat", suggestedCurrency: "OMR" },
  { code: "JO", label: "الأردن", defaultTimezone: "Asia/Amman", suggestedCurrency: "JOD" },
  { code: "LB", label: "لبنان", defaultTimezone: "Asia/Beirut", suggestedCurrency: "LBP" },
  { code: "IQ", label: "العراق", defaultTimezone: "Asia/Baghdad", suggestedCurrency: "IQD" },
]

export const TIMEZONE_CHOICES: { id: string; label: string }[] = [
  { id: "Africa/Cairo", label: "القاهرة (GMT+2/+3)" },
  { id: "Asia/Riyadh", label: "الرياض (GMT+3)" },
  { id: "Asia/Dubai", label: "دبي (GMT+4)" },
  { id: "Asia/Kuwait", label: "الكويت (GMT+3)" },
  { id: "Asia/Qatar", label: "الدوحة (GMT+3)" },
  { id: "Asia/Bahrain", label: "المنامة (GMT+3)" },
  { id: "Asia/Muscat", label: "مسقط (GMT+4)" },
  { id: "Asia/Amman", label: "عمّان (GMT+2/+3)" },
  { id: "Asia/Beirut", label: "بيروت (GMT+2/+3)" },
  { id: "Asia/Baghdad", label: "بغداد (GMT+3)" },
]

export const CURRENCY_CHOICES: { code: string; label: string }[] = [
  { code: "EGP", label: "جنيه مصري (EGP)" },
  { code: "SAR", label: "ريال سعودي (SAR)" },
  { code: "AED", label: "درهم إماراتي (AED)" },
  { code: "KWD", label: "دينار كويتي (KWD)" },
  { code: "QAR", label: "ريال قطري (QAR)" },
  { code: "BHD", label: "دينار بحريني (BHD)" },
  { code: "OMR", label: "ريال عُماني (OMR)" },
  { code: "JOD", label: "دينار أردني (JOD)" },
]

export function getRegionalDefaults(countryCode: string) {
  const c = REGIONAL_COUNTRIES.find((x) => x.code === countryCode)
  return c ?? REGIONAL_COUNTRIES[0]
}
