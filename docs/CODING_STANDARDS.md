# 📐 CorePOS — Coding Standards
> **ملزم لكل الـ Agents** | أي انحراف = رفض في Gate Review

---

## 1. TypeScript

```typescript
// tsconfig.json — strict mode دائماً
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

// ❌ ممنوع
const x: any = something
function doThing(data: any) {}

// ✅ مطلوب
const x: DatabaseType = something
function doThing(data: Invoice) {}

// ❌ ممنوع — non-null assertion بدون سبب
const name = user!.name

// ✅ مطلوب — optional chaining
const name = user?.name ?? 'غير معروف'
```

---

## 2. تسمية الملفات والمجلدات

```
src/
├── app/                      ← Next.js routing (kebab-case)
│   ├── (dashboard)/
│   │   └── pos/page.tsx      ← kebab-case
├── components/
│   ├── shared/               ← مكونات مشتركة
│   │   └── DataTable.tsx     ← PascalCase للمكونات
│   └── pos/
│       └── POSCart.tsx       ← PascalCase
├── stores/
│   └── authStore.ts          ← camelCase للـ stores
├── lib/
│   ├── api/
│   │   ├── backend-client.ts ← shared fetch wrapper
│   │   └── user.ts           ← getBackendSession وغيرها
│   └── utils.ts
└── types/
    └── auth.types.ts
```

---

## 3. React Components

```typescript
// ✅ النمط الصحيح لكل component
interface Props {
  title: string
  amount: number
  onClose?: () => void
}

export function InvoiceCard({ title, amount, onClose }: Props) {
  return (
    <div className="...">
      {/* محتوى الـ component */}
    </div>
  )
}

// ❌ ممنوع — default export للمكونات
export default function InvoiceCard() {}

// ✅ مطلوب — named export
export function InvoiceCard() {}

// استثناء: صفحات Next.js تستخدم default export
export default function Page() {}
```

---

## 4. Backend API Access (Adapters)

```typescript
// ✅ Server/Action: استخدم backendFetch / adapters
import { inventoryApi } from '@/lib/api/inventory'

async function getProducts() {
  const res = await inventoryApi.getProducts()
  return res.items ?? []
}
```

---

## 4.1 API Contract Rules (Backend Migration / Adapters)

> لتجنب اللخبطة بين الفرونت والباك أثناء الهجرة: أي تعديل في endpoints أو adapters لازم يطابق الـ conventions الموثقة في `docs/api_contract_map.md`.

قواعد ملزمة:
- أي endpoint جديد/معدل لازم يتوثّق في `docs/api_contract_map.md` (mapping + request/response + errors)
- الالتزام بـ:
  - Base path/versioning (الهدف `/v1` مع backward compatibility مؤقتًا)
  - Response envelope `{ success: true; data }` و `{ success: false; error }`
  - Error codes القياسية
  - Pagination/filtering conventions
  - Tenant context policy (cookies/JWT أساسًا، و`x-company-id` للتطوير فقط)
- أي انحراف = **رفض في Gate Review**

---

## 5. Zustand Stores

```typescript
// ✅ النمط الموحد
import { create } from 'zustand'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  clearCart: () => set({ items: [] }),
}))

// ❌ ممنوع — لا localStorage في stores الـ POS
// يُسبب مشاكل SSR
```

---

## 6. معالجة الأخطاء

```typescript
// ✅ دائماً أظهر خطأ واضح بالعربي للمستخدم
try {
  const result = await submitInvoice(data)
} catch (error) {
  toast.error('حدث خطأ أثناء حفظ الفاتورة. حاول مرة أخرى.')
  console.error('[Invoice Submit Error]:', error)
}

// ✅ Server Actions — أرجع result object
export async function createInvoice(data: InvoiceForm) {
  try {
    // ...
    return { success: true, invoice_number: '2604-001' }
  } catch (error) {
    return { success: false, error: 'فشل إنشاء الفاتورة' }
  }
}
```

---

## 7. Forms

```typescript
// ✅ استخدم react-hook-form + zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
})

type FormData = z.infer<typeof schema>
```

---

## 8. CSS / Tailwind

```tsx
// ✅ استخدم cn() من @/lib/utils للـ conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-primary bg-primary/5',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />

// ❌ ممنوع — inline styles
<div style={{ color: 'red' }} />

// ❌ ممنوع — hardcoded colors
<div className="text-blue-500" />

// ✅ مطلوب — استخدم CSS variables
<div className="text-primary" />
```

---

## 9. الـ RTL والعربية

```tsx
// ✅ كل layout يجب أن يكون RTL
<html lang="ar" dir="rtl">

// ✅ استخدم logical properties في Tailwind
// بدلاً من: ml-4, pr-2, text-left
// استخدم: ms-4, pe-2, text-start

// ✅ نصوص الـ Placeholder بالعربي
<Input placeholder="ابحث عن صنف..." />

// ✅ رسائل Validation بالعربي
'مطلوب', 'الحد الأقصى 255 حرف', 'رقم غير صحيح'

// ✅ تنسيق العملة الموحد — من @/lib/utils
import { formatCurrency } from '@/lib/utils'
formatCurrency(1200.5) // → "1,200.50 ج.م"

// ✅ تنسيق التاريخ الموحد — من @/lib/utils
import { formatDate } from '@/lib/utils'
formatDate(new Date()) // → "18/04/2026"
```

---

## 10. Performance Rules

```typescript
// ✅ استخدم React.memo للـ components الثقيلة في POS
export const ProductCard = React.memo(function ProductCard(props) {
  // ...
})

// ✅ استخدم useCallback للـ handlers في lists
const handleClick = useCallback((id: string) => {
  addToCart(id)
}, [addToCart])

// ✅ استخدم useMemo للعمليات الحسابية
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.total_line, 0),
  [items]
)

// ❌ ممنوع في POS — لا server requests أثناء تفاعل المستخدم
// كل المنتجات تُحمَّل مسبقاً، البحث يكون محلياً
```

---

## 11. Commits Convention

```
feat(pos): إضافة البحث بالباركود في شاشة POS
fix(auth): تصحيح redirect بعد تسجيل الدخول
feat(db): إضافة trigger ترقيم الفواتير
style(dashboard): تحسين layout الـ Sidebar على Tablet
test(pos): اختبار إتمام فاتورة كاملة
```

---

## 12. ممنوع مطلقاً في CorePOS

| ❌ ممنوع | ✅ البديل |
|---------|---------|
| `console.log` في Production | `console.error` فقط للأخطاء |
| `any` type | تعريف Type صريح |
| Inline styles | Tailwind classes |
| `document.querySelector` | React refs |
| Direct DB access من الفرونت | كل data access عبر backend adapters |
| Hardcoded company_id | من `useAuthStore().profile.company_id` |
| أرقام عربية `١٢٣` | أرقام غربية `123` دائماً |

---

## 13. Testing Rules (Quality Gate)

قواعد ملزمة قبل دمج أي تغيير مؤثر:
- لازم تشغيل الاختبارات المحلية حسب المتاح:
  - `npm run test` / `npm run test:coverage` (عند توفر runner)
  - `npm run lint`
- أي تغيير يمس business logic / adapters / backend migration:
  - لازم يضيف أو يعدل tests تغطي السلوك الجديد
  - أي tests failing = **رفض في Gate Review**
