import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

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
    <html
      lang="mn"
      suppressHydrationWarning
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <head>
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
