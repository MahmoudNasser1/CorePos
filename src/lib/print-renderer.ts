/**
 * Utility to render printing templates with real data
 */

interface RenderOptions {
  invoice: any;
  company: any;
  qrCodeUrl?: string;
  type: 'sale' | 'purchase' | 'return' | 'pos' | 'quote' | 'barcode';
}

export function renderTemplate({ invoice, company, qrCodeUrl, type }: RenderOptions, templateHtml: string): string {
  if (!templateHtml) return "";

  let rendered = templateHtml;

  // 1. Map basic fields
  const mappings: Record<string, string> = {
    '{{invoice.no}}': invoice.invoice_number || invoice.id || '---',
    '{{invoice.date}}': invoice.date || new Date().toLocaleDateString('ar-EG'),
    '{{invoice.total}}': Number(invoice.total || 0).toLocaleString() + ' ' + (company.currency || ''),
    '{{invoice.subtotal}}': Number(invoice.subtotal || 0).toLocaleString(),
    '{{invoice.tax}}': Number(invoice.tax_amount || 0).toLocaleString(),
    '{{invoice.discount}}': Number(invoice.discount_amount || 0).toLocaleString(),
    '{{invoice.paid}}': Number(invoice.paid || 0).toLocaleString(),
    '{{invoice.remaining}}': Number(invoice.remaining || 0).toLocaleString(),
    '{{invoice.status}}': invoice.status === 'paid' ? 'مدفوعة' : 'آجلة',
    '{{customer.name}}': invoice.customers?.name || 'عميل نقدي',
    '{{customer.phone}}': invoice.customers?.phone || '---',
    '{{supplier.name}}': invoice.suppliers?.name || 'مورد عام',
    '{{company.name}}': company.name || '---',
    '{{company.phone}}': company.phone || '---',
    '{{company.tax_number}}': company.taxNumber || company.tax_number || '---',
    '{{cashier}}': invoice.profiles?.full_name || '---',
    '{{notes}}': invoice.notes || '',
    '{{qr}}': qrCodeUrl ? `<img src="${qrCodeUrl}" style="width: 100px; height: 100px;" />` : '',
    // Aliases for other document types
    '{{quote.no}}': invoice.invoice_number || invoice.id || '---',
    '{{quote.date}}': invoice.date || new Date().toLocaleDateString('ar-EG'),
    '{{quote.total}}': Number(invoice.total || 0).toLocaleString() + ' ' + (company.currency || ''),
    '{{quote.valid_until}}': invoice.valid_until || '---',
  };

  // 2. Generate items table HTML if {{items}} is present
  if (rendered.includes('{{items}}')) {
    const itemsHtml = generateItemsTable(invoice.invoice_items || [], company.currency);
    mappings['{{items}}'] = itemsHtml;
  }

  // 3. Replace all tokens
  for (const [key, value] of Object.entries(mappings)) {
    // Escape special chars for regex except {{ and }}
    rendered = rendered.split(key).join(value);
  }

  return rendered;
}

function generateItemsTable(items: any[], currency: string = ''): string {
  if (!items || items.length === 0) return '<p style="text-align:center">لا توجد أصناف</p>';

  let html = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
      <thead>
        <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
          <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">#</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">الصنف</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">الكمية</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">السعر</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach((item, index) => {
    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">
          <div style="font-weight: bold;">${item.products?.name || 'صنف غير معروف'}</div>
          ${item.notes ? `<div style="font-size: 10px; color: #666;">${item.notes}</div>` : ''}
        </td>
        <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.qty}</td>
        <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${Number(item.unit_price).toLocaleString()}</td>
        <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${Number(item.total_line).toLocaleString()}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
}
