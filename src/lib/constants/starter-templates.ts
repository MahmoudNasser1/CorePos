export const STARTER_TEMPLATES = {
  invoice_sale: `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
    <h1>فاتورة مبيعات ضريبية</h1>
    <p>رقم الفاتورة: {{invoice.no}}</p>
    <p>التاريخ: {{invoice.created_at}}</p>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
    <div>
      <h3>بيانات الشركة</h3>
      <p>اسم الشركة: {{company.name}}</p>
      <p>الرقم الضريبي: {{company.tax_number}}</p>
    </div>
    <div>
      <h3>بيانات العميل</h3>
      <p>اسم العميل: {{customer.name}}</p>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
      <tr style="background-color: #f8f9fa;">
        <th style="padding: 10px; border: 1px solid #ddd;">الصنف</th>
        <th style="padding: 10px; border: 1px solid #ddd;">الكمية</th>
        <th style="padding: 10px; border: 1px solid #ddd;">السعر</th>
        <th style="padding: 10px; border: 1px solid #ddd;">الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.items}}
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">{{item.product_name}}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">{{item.quantity}}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">{{item.unit_price}}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">{{item.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div style="text-align: left; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    <p><strong>الإجمالي قبل الضريبة:</strong> {{invoice.subtotal}}</p>
    <p><strong>الضريبة ({{company.vat_rate}}%):</strong> {{invoice.tax_total}}</p>
    <h3><strong>الإجمالي النهائي:</strong> {{invoice.total}}</h3>
  </div>
</div>
  `,
  pos_receipt: `
<div style="width: 100%; max-width: 300px; margin: 0 auto; font-family: 'Courier New', Courier, monospace; font-size: 14px;">
  <div style="text-align: center; margin-bottom: 15px;">
    <h2>{{company.name}}</h2>
    <p>الرقم الضريبي: {{company.tax_number}}</p>
    <p>---------------------------------</p>
    <h4>ايصال بيع</h4>
  </div>
  
  <p>رقم: {{receipt.no}}</p>
  <p>التاريخ: {{receipt.created_at}}</p>
  <p>الكاشير: {{receipt.cashier_name}}</p>
  <p>---------------------------------</p>

  <table style="width: 100%; text-align: right;">
    <tr>
      <th>الصنف</th>
      <th>ك</th>
      <th>مبلغ</th>
    </tr>
    {{#each receipt.items}}
    <tr>
      <td>{{item.product_name}}</td>
      <td>{{item.quantity}}</td>
      <td>{{item.total}}</td>
    </tr>
    {{/each}}
  </table>
  
  <p>---------------------------------</p>
  <div style="text-align: left;">
    <p>الإجمالي المطلوب: <strong>{{receipt.total}}</strong></p>
  </div>
  
  <div style="text-align: center; margin-top: 20px;">
    <p>شكراً لزيارتكم</p>
  </div>
</div>
  `,
  barcode_label: `
<div style="width: 50mm; height: 30mm; padding: 2mm; box-sizing: border-box; text-align: center; font-family: sans-serif; display: flex; flex-direction: column; justify-content: space-between;">
  <div style="font-weight: bold; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
    {{product.name}}
  </div>
  
  <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center;">
    <!-- سيتم استبدال {{product.barcode_img}} بصورة الباركود تلقائياً -->
    {{{product.barcode_img}}}
  </div>
  
  <div style="font-size: 14px; font-weight: bold;">
    {{product.price}}
  </div>
</div>
  `
}
