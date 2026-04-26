export const DOCUMENT_TYPES = [
  { value: 'invoice_sale', label: 'فاتورة مبيعات' },
  { value: 'invoice_return', label: 'فاتورة مرتجع' },
  { value: 'barcode_label', label: 'ملصق باركود' },
] as const

export const PAPER_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
  { value: '80mm', label: 'Roll 80mm' },
  { value: '58mm', label: 'Roll 58mm' },
  { value: '50x30mm', label: 'Label 50x30mm' },
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]['value']
export type PaperSize = typeof PAPER_SIZES[number]['value']
