import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
export const metadata = {
  title: "Монгол Мах — Шинэ мах онлайнаар захиалах",
  description:
    "Үхэр, адуу, хонь, ямаа, тахианы шинэ мах килограммаар онлайнаар захиалаад Улаанбаатар хотод гэртээ хүлээн авна.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Exact same Google Fonts request as mongol-mah.lovable.app */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
        {/* Avoid FOUC for theme - same logic as ThemeProvider */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("theme");const p=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";const v=t||p;document.documentElement.setAttribute("data-theme",v)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
