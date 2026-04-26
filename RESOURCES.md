# 🌐 معلومات النظام والتهيئة (Pos-Sahl)

هذا الملف يحتوي على كافة البيانات الأساسية والسرية المستخدمة في إعداد النظام والباك إند الجديد.

## 🗄️ قاعدة البيانات (Local PostgreSQL)
يتم تشغيل قاعدة البيانات عبر Docker.
- **رابط الاتصال (DATABASE_URL)**: `postgres://pos:pos@localhost:5433/pos`
- **المستخدم**: `pos`
- **كلمة المرور**: `pos`
- **قاعدة البيانات**: `pos`
- **المنفذ الخارجي**: `5433`

## 🔑 بيانات الدخول للنظام (Admin Credentials)
حساب الإدارة الرئيسي الذي تم إنشاؤه:
- **البريد الإلكتروني**: `admin@pos-sahl.com`
- **كلمة المرور**: `password123`

## ☁️ خدمات التخزين (MinIO)
- **رابط الواجهة (Console)**: [http://localhost:9003](http://localhost:9003)
- **المستخدم (Access Key)**: `minioadmin`
- **كلمة المرور (Secret Key)**: `minioadmin`

## ⚙️ متغيرات البيئة (Backend .env)
- **PORT**: `4000`
- **JWT_SECRET**: `dev-secret-key-123`
- **NODE_ENV**: `development`

## 🚀 روابط التشغيل
- **الواجهة الأمامية (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **الباك إند (Backend API)**: [http://localhost:4000](http://localhost:4000)
- **وثائق الـ API (Swagger)**: [http://localhost:4000/docs](http://localhost:4000/docs)
