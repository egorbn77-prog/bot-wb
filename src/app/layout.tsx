import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WB Bot - Ответы на отзывы Wildberries",
  description: "Автоматические ответы на отзывы в личном кабинете Wildberries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex min-h-screen">
          {/* Боковая панель */}
          <Sidebar />
          
          {/* Основной контент */}
          <main className="flex-1 lg:ml-0 p-4 lg:p-6 pt-16 lg:pt-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}