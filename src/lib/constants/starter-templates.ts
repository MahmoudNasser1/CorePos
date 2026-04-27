export const STARTER_TEMPLATES = {
  invoice_sale: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 850px; margin: 0 auto; padding: 40px; direction: rtl; background: white; color: #333;">
  <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 4px solid #1a56db; padding-bottom: 20px; margin-bottom: 30px;">
    <div>
      <h1 style="margin: 0; color: #1a56db; font-size: 28px; font-weight: 800;">فاتورة مبيعات ضريبية</h1>
      <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">فاتورة قانونية معتمدة من مصلحة الضرائب</p>
    </div>
    <div style="text-align: left;">
       <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">{{company.name}}</h2>
       <p style="margin: 2px 0; font-size: 13px; color: #4b5563;">الرقم الضريبي: {{company.tax_number}}</p>
       <p style="margin: 2px 0; font-size: 13px; color: #4b5563;">الهاتف: {{company.phone}}</p>
    </div>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9fafb; padding: 20px; border-radius: 12px;">
    <div>
      <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">بيانات الفاتورة</p>
      <p style="margin: 4px 0;">الرقم: <strong>{{invoice.no}}</strong></p>
      <p style="margin: 4px 0;">التاريخ: <strong>{{invoice.date}}</strong></p>
      <p style="margin: 4px 0;">المسؤول: <strong>{{cashier}}</strong></p>
    </div>
    <div style="text-align: left;">
      <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">العميل</p>
      <p style="margin: 4px 0; font-size: 18px; color: #111827;"><strong>{{customer.name}}</strong></p>
      <p style="margin: 4px 0; color: #4b5563;">الهاتف: {{customer.phone}}</p>
    </div>
  </div>

  <div style="margin-bottom: 30px;">
    {{items}}
  </div>

  <div style="display: flex; justify-content: space-between; align-items: end;">
    <div style="text-align: center;">
      {{qr}}
      <p style="margin: 5px 0 0; font-size: 10px; color: #9ca3af;">امسح للتحقق من صحة الفاتورة</p>
    </div>
    <div style="width: 320px; background: #f3f4f6; padding: 20px; border-radius: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #6b7280;">المجموع الفرعي:</span>
        <span style="font-weight: bold;">{{invoice.subtotal}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #6b7280;">الضريبة:</span>
        <span style="font-weight: bold;">{{invoice.tax}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
        <span style="color: #6b7280;">إجمالي الخصومات:</span>
        <span style="font-weight: bold; color: #ef4444;">- {{invoice.discount}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-weight: 800; font-size: 18px; color: #111827;">الإجمالي النهائي:</span>
        <span style="font-weight: 900; font-size: 24px; color: #1a56db;">{{invoice.total}}</span>
      </div>
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #d1d5db; display: flex; justify-content: space-between; font-size: 12px;">
        <span style="color: #6b7280;">المدفوع: {{invoice.paid}}</span>
        <span style="color: #6b7280;">المتبقي: {{invoice.remaining}}</span>
      </div>
    </div>
  </div>
  
  <div style="margin-top: 60px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin-bottom: 10px;">{{notes}}</p>
    <p>شكراً لتعاملكم مع {{company.name}} | تم الإصدار بواسطة نظام Pos-Sahl</p>
  </div>
</div>
  `,
  invoice_purchase: `
<div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; direction: rtl; border: 1px solid #eee;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
    <h1 style="color: #4b5563; margin: 0;">فاتورة مشتريات</h1>
    <div style="text-align: center; background: #4b5563; color: white; padding: 10px 20px; border-radius: 4px;">
      OFFICIAL PURCHASE
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
    <div>
      <h4 style="margin: 0 0 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">بيانات الشركة</h4>
      <p style="margin: 5px 0;"><strong>{{company.name}}</strong></p>
      <p style="margin: 5px 0;">ت: {{company.phone}}</p>
      <p style="margin: 5px 0;">ر.ض: {{company.tax_number}}</p>
    </div>
    <div>
      <h4 style="margin: 0 0 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">المورد</h4>
      <p style="margin: 5px 0;"><strong>{{supplier.name}}</strong></p>
      <p style="margin: 5px 0;">رقم الفاتورة: {{invoice.no}}</p>
      <p style="margin: 5px 0;">التاريخ: {{invoice.date}}</p>
    </div>
  </div>

  <div style="margin-bottom: 40px;">
    {{items}}
  </div>

  <div style="margin-right: auto; width: 250px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span>الإجمالي:</span>
      <span style="font-weight: bold; font-size: 20px;">{{invoice.total}}</span>
    </div>
  </div>
</div>
  `,
  pos_receipt: `
<div style="width: 80mm; margin: 0 auto; padding: 0 5mm; font-family: 'Courier New', Courier, monospace; font-size: 12px; direction: rtl; background: white;">
  <div style="text-align: center; margin-bottom: 10px;">
    <h3 style="margin: 0 0 5px; font-size: 16px;">{{company.name}}</h3>
    <p style="margin: 2px 0;">سجل ضريبي: {{company.tax_number}}</p>
    <p style="margin: 2px 0;">هاتف: {{company.phone}}</p>
    <p style="margin: 5px 0;">********************************</p>
    <h4 style="margin: 5px 0;">إيصال مبيعات نقدي</h4>
    <p style="margin: 5px 0;">********************************</p>
  </div>
  
  <div style="margin-bottom: 10px;">
    <div style="display: flex; justify-content: space-between;">
      <span>رقم: {{invoice.no}}</span>
      <span>التاريخ: {{invoice.date}}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>الكاشير: {{cashier}}</span>
      <span>العميل: {{customer.name}}</span>
    </div>
  </div>

  <div style="margin-bottom: 10px;">
    <div style="border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; display: flex; font-weight: bold;">
      <span style="flex: 2;">الصنف</span>
      <span style="flex: 1; text-align: center;">الكمية</span>
      <span style="flex: 1; text-align: left;">السعر</span>
    </div>
    {{items}}
  </div>
  
  <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
    <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
      <span>الإجمالي النهائي:</span>
      <span>{{invoice.total}}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 4px;">
       <span>المدفوع: {{invoice.paid}}</span>
       <span>المتبقي: {{invoice.remaining}}</span>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 15px;">
    <div style="display: inline-block;">{{qr}}</div>
    <p style="margin-top: 10px; font-size: 10px;">شكراً لزيارتكم</p>
    <p style="font-size: 8px;">POS-SAHL SYSTEM</p>
  </div>
</div>
  `,
  barcode_label: `
<div style="width: 100%; height: 100%; padding: 1mm; box-sizing: border-box; text-align: center; font-family: 'Arial Narrow', sans-serif; display: flex; flex-direction: column; justify-content: space-between; direction: rtl; background: white;">
  <div style="font-weight: 800; font-size: 10px; line-height: 1.1; overflow: hidden; height: 2.2em;">
    {{name}}
  </div>
  
  <div style="display: flex; flex-direction: column; align-items: center; margin: 1px 0;">
    <div style="transform: scale(0.8);">{{code}}</div>
    <div style="font-size: 7px; font-weight: bold; margin-top: -2px;">{{barcode}}</div>
  </div>
  
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 0.5px solid #000; padding-top: 1px; margin-top: 1px;">
    <span style="font-size: 7px; font-weight: bold;">{{category}}</span>
    <span style="font-size: 12px; font-weight: 900;">{{price}}</span>
  </div>
</div>
  `,
  quotation: `
<div style="font-family: inherit; max-width: 800px; margin: 0 auto; padding: 40px; direction: rtl; color: #1f2937;">
  <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 30px; margin-bottom: 40px;">
    <div>
      <h1 style="margin: 0; color: #111827; font-size: 32px;">عرض سعر</h1>
      <p style="color: #6b7280; margin-top: 5px;">رقم العرض: {{quote.no}}</p>
    </div>
    <div style="text-align: left;">
      <h2 style="margin: 0;">{{company.name}}</h2>
      <p style="color: #6b7280;">تاريخ العرض: {{quote.date}}</p>
    </div>
  </div>

  <div style="margin-bottom: 40px;">
    <p style="margin-bottom: 10px; font-weight: bold; color: #374151;">إلى السيد/السادة:</p>
    <p style="font-size: 18px; margin: 0;">{{customer.name}}</p>
    <p style="color: #6b7280; margin-top: 5px;">يسرنا أن نقدم لكم عرضنا المالي التالي وفقاً للأصناف المطلوبة:</p>
  </div>

  <div style="margin-bottom: 40px;">
    {{items}}
  </div>

  <div style="display: flex; justify-content: space-between; background: #f9fafb; padding: 30px; border-radius: 8px;">
    <div>
      <p>صلاحية العرض حتى: <strong>{{quote.valid_until}}</strong></p>
      <p>شروط الدفع: سداد نقدي عند الاستلام</p>
    </div>
    <div style="text-align: left;">
       <p style="font-size: 14px; color: #6b7280;">الإجمالي التقديري:</p>
       <p style="font-size: 28px; font-weight: bold; color: #111827; margin: 0;">{{quote.total}}</p>
    </div>
  </div>

  <div style="margin-top: 80px; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>نأمل أن ينال عرضنا قبولكم، ونتطلع للتعاون معكم دائماً.</p>
    <p style="margin-top: 30px;">توقيع واعتماد المؤسسة</p>
    <div style="width: 150px; height: 1px; background: #e5e7eb; margin: 10px auto;"></div>
  </div>
</div>
  `,
  invoice_return: `
<div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; direction: rtl; background: #fffaf0; border: 1px solid #ffd8a8;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px dashed #ff922b; padding-bottom: 15px;">
    <h1 style="color: #e67e22; margin: 0;">إشعار مرتجع مبيعات</h1>
    <h3 style="margin: 5px 0;">{{company.name}}</h3>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
    <div>
      <p>رقم المرتجع: <strong>{{invoice.no}}</strong></p>
      <p>التاريخ: <strong>{{invoice.date}}</strong></p>
    </div>
    <div>
       <p>العميل: <strong>{{customer.name}}</strong></p>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <h4 style="margin: 0 0 10px; color: #d9480f;">الأصناف المرتجعة:</h4>
    {{items}}
  </div>

  <div style="text-align: left; padding: 15px; background: white; border: 1px solid #ffe8cc;">
    <p>إجمالي القيمة المستردة: <strong style="font-size: 20px; color: #e67e22;">{{invoice.total}}</strong></p>
    <p style="font-size: 12px; color: #868e96;">ملاحظات: {notes}</p>
  </div>
</div>
  `
};
