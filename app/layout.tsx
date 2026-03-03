import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/shared/providers";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/shared/providers/theme-provider";
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
    <html lang={isEnglish ? "en" : "pt-BR"} suppressHydrationWarning translate="yes">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          themes={["light", "warm"]}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
