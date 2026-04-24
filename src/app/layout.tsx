import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4001'),
  title: {
    default: "CorePOS — نظام إدارة مبيعات متكامل",
    template: "%s | CorePOS"
  },
  description: "أفضل نظام نقطة بيع (POS) وإدارة مخزون في الوطن العربي. إدارة المبيعات، المشتريات، والتقارير المالية بدقة واحترافية.",
  keywords: ["POS", "نقطة بيع", "إدارة مخزون", "نظام محاسبي", "سحابي", "تجارة تجزئة", "مصر", "السعودية"],
  authors: [{ name: "CorePOS Team" }],
  creator: "CorePOS",
  publisher: "CorePOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://corepos.io",
    title: "CorePOS — نظام إدارة مبيعات متكامل",
    description: "أفضل نظام نقطة بيع (POS) وإدارة مخزون في الوطن العربي.",
    siteName: "CorePOS",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CorePOS Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CorePOS — نظام إدارة مبيعات متكامل",
    description: "أفضل نظام نقطة بيع (POS) وإدارة مخزون في الوطن العربي.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`} suppressHydrationWarning>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster dir="rtl" position="top-center" closeButton richColors />
      </body>
    </html>
  );
}
