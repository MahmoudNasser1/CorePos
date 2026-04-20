import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// This client is for server-side ONLY use to bypass RLS for administrative/onboarding tasks.
// NEVER expose the SERVICE_ROLE_KEY to the browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Supabase Admin Client: Missing environment variables!', {
    url: !!supabaseUrl,
    key: !!serviceKey
  })
} else {
  console.log('✅ Supabase Admin Client: Initialized (Url: ' + supabaseUrl.substring(0, 15) + '..., Key: ' + serviceKey.substring(0, 5) + '...)')
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl!,
  serviceKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
