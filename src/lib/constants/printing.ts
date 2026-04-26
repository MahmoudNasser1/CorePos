import { FileText, Receipt, Tags, FileCheck, ShoppingCart, FileInput } from 'lucide-react'

export const DOCUMENT_TYPES = [
  { value: 'invoice_sale', label: 'فاتورة مبيعات', icon: 'FileText', description: 'فواتير البيع للعملاء' },
  { value: 'invoice_purchase', label: 'فاتورة مشتريات', icon: 'FileInput', description: 'فواتير الشراء من الموردين' },
  { value: 'invoice_return', label: 'فاتورة مرتجع', icon: 'FileCheck', description: 'فواتير المرتجعات' },
  { value: 'pos_receipt', label: 'إيصال نقطة البيع', icon: 'Receipt', description: 'إيصالات الطابعة الحرارية' },
  { value: 'quotation', label: 'عرض سعر', icon: 'ShoppingCart', description: 'عروض الأسعار' },
  { value: 'barcode_label', label: 'ملصق باركود', icon: 'Tags', description: 'ملصقات المنتجات' },
] as const

export const PAPER_SIZES = [
  { value: 'A4', label: 'A4 (210×297mm)', group: 'standard' },
  { value: 'A5', label: 'A5 (148×210mm)', group: 'standard' },
  { value: '80mm', label: 'رول حراري 80mm', group: 'thermal' },
  { value: '58mm', label: 'رول حراري 58mm', group: 'thermal' },
  { value: '50x30mm', label: 'ملصق 50×30mm', group: 'label' },
  { value: '40x20mm', label: 'ملصق 40×20mm', group: 'label' },
] as const

export type DocumentType = typeof DOCUMENT_TYPES[number]['value']
export type PaperSize = typeof PAPER_SIZES[number]['value']

/** Default margins per paper size group */
export const DEFAULT_MARGINS: Record<string, { top: string; right: string; bottom: string; left: string }> = {
  A4: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
  A5: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
  '80mm': { top: '0mm', right: '2mm', bottom: '0mm', left: '2mm' },
  '58mm': { top: '0mm', right: '1mm', bottom: '0mm', left: '1mm' },
  '50x30mm': { top: '1mm', right: '1mm', bottom: '1mm', left: '1mm' },
  '40x20mm': { top: '0.5mm', right: '0.5mm', bottom: '0.5mm', left: '0.5mm' },
}

/** Template variables available per document type */
export const TEMPLATE_VARIABLES: Record<string, { key: string; label: string; example: string }[]> = {
  invoice_sale: [
    { key: '{{invoice.no}}', label: 'رقم الفاتورة', example: 'INV-2026-001' },
    { key: '{{invoice.date}}', label: 'التاريخ', example: '2026-04-27' },
    { key: '{{invoice.total}}', label: 'الإجمالي', example: '1,500.00' },
    { key: '{{invoice.subtotal}}', label: 'المجموع الفرعي', example: '1,400.00' },
    { key: '{{invoice.tax}}', label: 'الضريبة', example: '100.00' },
    { key: '{{invoice.discount}}', label: 'الخصم', example: '50.00' },
    { key: '{{invoice.paid}}', label: 'المدفوع', example: '1,500.00' },
    { key: '{{invoice.remaining}}', label: 'المتبقي', example: '0.00' },
    { key: '{{invoice.status}}', label: 'حالة الدفع', example: 'مدفوعة' },
    { key: '{{customer.name}}', label: 'اسم العميل', example: 'أحمد محمد' },
    { key: '{{customer.phone}}', label: 'هاتف العميل', example: '01012345678' },
    { key: '{{company.name}}', label: 'اسم الشركة', example: 'شركة النور' },
    { key: '{{company.phone}}', label: 'هاتف الشركة', example: '0221234567' },
    { key: '{{company.tax_number}}', label: 'الرقم الضريبي', example: '123-456-789' },
    { key: '{{items}}', label: 'جدول الأصناف (HTML)', example: '<table>...</table>' },
    { key: '{{cashier}}', label: 'اسم الكاشير', example: 'محمد علي' },
    { key: '{{notes}}', label: 'ملاحظات', example: 'شكراً لزيارتكم' },
  ],
  invoice_purchase: [
    { key: '{{invoice.no}}', label: 'رقم الفاتورة', example: 'PUR-2026-001' },
    { key: '{{supplier.name}}', label: 'اسم المورد', example: 'شركة التوريدات' },
    { key: '{{invoice.total}}', label: 'الإجمالي', example: '5,000.00' },
    { key: '{{items}}', label: 'جدول الأصناف', example: '<table>...</table>' },
  ],
  invoice_return: [
    { key: '{{invoice.no}}', label: 'رقم المرتجع', example: 'RET-2026-001' },
    { key: '{{invoice.total}}', label: 'إجمالي المرتجع', example: '300.00' },
    { key: '{{customer.name}}', label: 'اسم العميل', example: 'أحمد محمد' },
    { key: '{{items}}', label: 'الأصناف المرتجعة', example: '<table>...</table>' },
  ],
  pos_receipt: [
    { key: '{{invoice.no}}', label: 'رقم الإيصال', example: '#1234' },
    { key: '{{invoice.date}}', label: 'التاريخ والوقت', example: '2026/04/27 02:30' },
    { key: '{{invoice.total}}', label: 'الإجمالي', example: '150.00' },
    { key: '{{customer.name}}', label: 'العميل', example: 'عميل نقدي' },
    { key: '{{cashier}}', label: 'الكاشير', example: 'محمد' },
    { key: '{{company.name}}', label: 'اسم المحل', example: 'ميني ماركت' },
    { key: '{{items}}', label: 'الأصناف', example: '<table>...</table>' },
    { key: '{{qr}}', label: 'رمز QR', example: '<img src="..." />' },
  ],
  quotation: [
    { key: '{{quote.no}}', label: 'رقم العرض', example: 'Q-2026-001' },
    { key: '{{quote.date}}', label: 'التاريخ', example: '2026-04-27' },
    { key: '{{quote.valid_until}}', label: 'صالح حتى', example: '2026-05-27' },
    { key: '{{customer.name}}', label: 'العميل', example: 'أحمد محمد' },
    { key: '{{items}}', label: 'الأصناف والأسعار', example: '<table>...</table>' },
    { key: '{{quote.total}}', label: 'الإجمالي', example: '2,000.00' },
  ],
  barcode_label: [
    { key: '{{name}}', label: 'اسم المنتج', example: 'أرز بسمتي 1كجم' },
    { key: '{{price}}', label: 'السعر', example: '45.00 ج.م' },
    { key: '{{barcode}}', label: 'رقم الباركود', example: '6221234567890' },
    { key: '{{sku}}', label: 'رمز الصنف', example: 'RICE-001' },
    { key: '{{category}}', label: 'التصنيف', example: 'أغذية' },
    { key: '{{unit}}', label: 'الوحدة', example: 'كيلو' },
    { key: '{{qr}}', label: 'رمز QR', example: '<img src="..." />' },
    { key: '{{barcode_svg}}', label: 'باركود SVG', example: '<svg>...</svg>' },
    { key: '{{code}}', label: 'الرمز (QR أو باركود)', example: '...' },
  ],
}
