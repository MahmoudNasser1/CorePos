'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">حدث خطأ غير متوقع</h2>
        <p className="text-muted-foreground max-w-[420px]">
          نعتذر عن الإزعاج. واجهنا مشكلة في تحميل هذه الصفحة. قد يكون الخادم مشغولاً أو هناك مشكلة في الاتصال.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="default" 
          onClick={() => reset()}
          className="gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          إعادة المحاولة
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/dashboard'}
        >
          العودة للرئيسية
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-muted rounded-lg text-xs text-left max-w-full overflow-auto border border-border">
          {error.message}
        </pre>
      )}
    </div>
  )
}
