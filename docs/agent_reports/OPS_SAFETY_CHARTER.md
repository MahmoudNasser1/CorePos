# Ops Safety Charter — CorePOS (Impersonation / Data repair / Admin actions)

> هذا الملف يحدد قواعد الأمان للأفعال الحساسة (Ops) ويُستخدم كمرجع إلزامي للـ Backend + Frontend.

---

## 1) مبادئ عامة
- لا يوجد “صلاحيات خطرة” بدون **سبب (reason)** + **تدقيق (audit)**.
- لا تنفيذ inline لعمليات ثقيلة/إصلاحات بيانات — تُنفذ كـ **Jobs** قابلة للتتبع.
- لا UI مضلل: أي action حساس لازم يظهر للمستخدم “ماذا حدث الآن” بشكل واضح.

---

## 2) Mandatory gates لأي Ops action
أي endpoint/زر Ops يجب أن يحقق:
- **Confirmation dialog** RTL + نص واضح للنتيجة
- **Loading state** + منع double submit
- **Audit log** (actor + target + company + requestId + ip + payload summary)
- **Rate limit** (على الأقل per actor، وأحيانًا per company)

---

## 3) Impersonation (High-risk)
### 3.1 Requirements
- **reason إلزامي**
- **TTL قصير** (مؤقت)
- **Banner دائم** في الواجهة: “أنت تعمل الآن كـ …”
- **زر إنهاء الانتحال** ظاهر دائمًا
- **Audit logs**: start + end + TTL expiry

### 3.2 Guardrails
- منع تنفيذ أفعال platform-admin الخطرة أثناء الانتحال إلا إذا كان ذلك مقصودًا ومُوثقًا.
- توثيق واضح في السجلات: `impersonatorUserId` و`impersonatedUserId`.

---

## 4) Data repair / recompute (High-risk)
### 4.1 Jobs only
- أي recompute يتم عبر Job:
  - إنشاء job record + status/progress
  - منع تشغيل نفس job type لنفس الشركة بالتوازي
  - إمكانية cancel (اختياري)

### 4.2 Requirements
- **reason إلزامي**
- **Audit logs**: start + end + النتائج

---

## 5) Export / Compliance (Sensitive)
- تصدير سجلات التدقيق/الصلاحيات:
  - يجب احترام الفلاتر والحدود
  - يجب تسجيل export event في audit logs

