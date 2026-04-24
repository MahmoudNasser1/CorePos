import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  
  // Clear cookies from server side
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('supabase-auth-token') // For legacy if still there
  
  // Inform the backend (optional, but good for clearing session server-side)
  try {
    await fetch('http://localhost:4000/v1/auth/logout', { 
      method: 'POST',
      headers: {
        'Cookie': `access_token=${cookieStore.get('access_token')?.value ?? ''}`
      }
    })
  } catch (e) {
    console.error('Failed to notify backend of logout:', e)
  }

  return NextResponse.json({ success: true })
}
