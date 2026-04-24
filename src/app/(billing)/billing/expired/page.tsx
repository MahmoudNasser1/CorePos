'use client'

import { AlertOctagon, MessageSquare, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function BillingExpiredPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
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
            <AlertOctagon className="text-destructive" size={48} aria-hidden />
          </div>
          <CardTitle className="text-2xl font-bold">انتهى اشتراكك</CardTitle>
          <CardDescription>
            للمتابعة، راسِنا لتجديد الخطة أو حدّث اشتراكك. بياناتك محفوظة ولن تُفقد.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-4">
          <p className="text-sm text-balance text-muted-foreground">
            للمتابعة واستخدام لوحة التحكم والمبيعات، يرجى التحدث مع فريق الدعم لدينا لتفعيل الاشتراك مجدداً. بياناتك محفوظة ولن تضيع.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-secondary/10">
          <Button
            type="button"
            onClick={openWhatsApp}
            className="h-12 w-full gap-2 bg-green-600 text-lg hover:bg-green-700"
          >
            <MessageSquare className="h-5 w-5 shrink-0" aria-hidden />
            تفعيل الاشتراك عبر الواتساب
          </Button>
          <Button type="button" onClick={handleLogout} variant="outline" className="w-full gap-2">
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            تسجيل الخروج
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
