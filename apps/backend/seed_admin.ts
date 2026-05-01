import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './src/common/db/schema';
const { users, profiles } = schema;
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "postgres://pos:pos@localhost:5433/pos";
const ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'mahmoudeldrwal@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Eeldrwal*980412*';
const ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Mahmoud Nasser';

async function seedPlatformAdmin() {
  if (!DATABASE_URL) {
    console.error('❌ خطأ: لم يتم العثور على DATABASE_URL');
    process.exit(1);
  }

  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    const db = drizzle(client, { schema });

    console.log(`🚀 جاري إعداد حساب السوبر أدمن: ${ADMIN_EMAIL}...`);

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // 1. البحث عن المستخدم الحالي
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, ADMIN_EMAIL)
    });

    let userId: string;

    if (existingUser) {
      console.log('ℹ️ المستخدم موجود مسبقاً، جاري تحديث الصلاحيات وكلمة السر...');
      userId = existingUser.id;
      
      await db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, userId));
    } else {
      console.log('✨ مستخدم جديد، جاري الإنشاء...');
      userId = uuidv4();
      await db.insert(users).values({
        id: userId,
        email: ADMIN_EMAIL,
        passwordHash: passwordHash,
      });
    }

    // 2. تحديث أو إنشاء البروفايل
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId)
    });

    if (existingProfile) {
      await db.update(profiles)
        .set({ 
          fullName: ADMIN_NAME,
          role: 'platform_admin',
          isActive: true 
        })
        .where(eq(profiles.id, userId));
    } else {
      await db.insert(profiles).values({
        id: userId,
        fullName: ADMIN_NAME,
        role: 'platform_admin',
        isActive: true,
      });
    }

    console.log('✅ تم إعداد حساب السوبر أدمن بنجاح!');
  } catch (err) {
    console.error('❌ حدث خطأ أثناء الإعداد:', err.message);
  } finally {
    await client.end();
  }
}

seedPlatformAdmin();
