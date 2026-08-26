import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "МАХ — Шинэ чанартай мах, гэрт хүргэлттэй",
  description:
    "Үхэр, адуу, хонь, ямаа, тахианы махыг малчны хотоос гэрт тань хүргэнэ. Онлайн захиалга, хялбар төлбөр.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
