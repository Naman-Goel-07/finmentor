import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinMentor AI",
  description: "Your intelligent expense and finance tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 overflow-hidden`}>
        <div className="flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 shrink-0">
               <h1 className="font-bold text-xl text-gray-800 md:hidden">FinMentor AI</h1>
               <div className="hidden md:block"></div>
               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ring-2 ring-gray-100 shrink-0">
                 US
               </div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
