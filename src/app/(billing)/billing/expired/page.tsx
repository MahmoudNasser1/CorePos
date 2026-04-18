'use client'

import { AlertOctagon, MessageSquare, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BillingExpiredPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const openWhatsApp = () => {
    const WHATSAPP_NUMBER = '201113511940'
    const CONTACT_TEXT = 'أهلاً، اشتراكي في CorePOS انتهى وأرغب في تجديده'
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_TEXT)}`, '_blank')
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full border-destructive/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-destructive" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
            <AlertOctagon className="text-destructive" size={48} />
          </div>
          <CardTitle className="text-2xl font-bold">عذراً، انتهى اشتراكك</CardTitle>
          <CardDescription>
            لقد انتهت الفترة التجريبية أو الاشتراك الحالي لشركتك.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-4">
          <p className="text-sm text-balance text-muted-foreground">
            للمتابعة واستخدام لوحة التحكم والمبيعات، يرجى التحدث مع فريق الدعم لدينا لتفعيل الاشتراك مجدداً. بياناتك محفوظة ولن تضيع.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-secondary/10">
          <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg gap-2">
            <MessageSquare size={20} />
            تفعيل الاشتراك عبر الواتساب
          </Button>
          <Button onClick={handleLogout} variant="outline" className="w-full gap-2">
            <LogOut size={16} />
            تسجيل الخروج
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
