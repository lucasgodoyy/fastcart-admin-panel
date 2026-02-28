import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/shared/providers";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { isEnglish } from "@/lib/admin-language";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: isEnglish ? "FastCart - Admin Panel" : "FastCart - Painel Administrativo",
  description: isEnglish
    ? "FastCart e-commerce admin panel"
    : "Painel administrativo de e-commerce da FastCart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={isEnglish ? "en" : "pt-BR"} className="light" data-theme="light" translate="yes">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
