import { supabaseAdmin } from './src/lib/supabase/admin'

async function test() {
  console.log('Testing Supabase Admin Client...')
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Service Key Length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
  
  const { data, error } = await supabaseAdmin.from('profiles').select('count', { count: 'exact', head: true })
  
  if (error) {
    console.error('Test Failed:', error)
  } else {
    console.log('Test Success! Profile count retrieved.')
  }
}

test()
