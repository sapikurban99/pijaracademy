import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LMS Pijar Teknologi Academy",
  description: "Cyber-Noir, Glassmorphism, and Premium Learning Portal by Pijar Teknologi Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden overflow-y-auto bg-[#050508] text-gray-200 selection:bg-purple-500/30 selection:text-white">
        <AuthProvider>
          <div className="aurora-1 pointer-events-none"></div>
          <div className="aurora-2 pointer-events-none"></div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
