import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, LifeBuoy, Mail, MessageCircle, Phone, Video } from "lucide-react"

export default function HelpPage() {
  const helpCards = [
    {
      title: "دليل الاستخدام",
      description: "تعلم كيفية استخدام كافة ميزات المنصة من خلال شروحات مفصلة.",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "دروس الفيديو",
      description: "شاهد فيديوهات قصيرة تشرح العمليات الأساسية في النظام.",
      icon: Video,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      title: "الأسئلة الشائعة",
      description: "إجابات سريعة على أكثر الاستفسارات تكراراً من قبل المستخدمين.",
      icon: MessageCircle,
      color: "text-green-600",
      bg: "bg-green-100"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">مركز المساعدة</h1>
        <p className="text-muted-foreground">نحن هنا لمساعدتك في الحصول على أقصى استفادة من نظام Pos-Sahl.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {helpCards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تواصل معنا</CardTitle>
          <CardDescription>إذا لم تجد ما تبحث عنه، يمكنك التواصل مع فريق الدعم الفني مباشرة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">البريد الإلكتروني</p>
              <p className="text-sm text-muted-foreground">support@pos-sahl.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">رقم الهاتف</p>
              <p className="text-sm text-muted-foreground">+20 123 456 789</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <LifeBuoy className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">الدردشة المباشرة</p>
              <p className="text-sm text-muted-foreground">متاحة من 9 ص حتى 9 م</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
