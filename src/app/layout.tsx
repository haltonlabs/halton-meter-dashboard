import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Halton Meter",
  description: "LLM API cost attribution and governance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      // Suppress hydration warning: the inline THEME_INIT_SCRIPT below
      // mutates data-theme before React hydrates, so the server-rendered
      // value (always "dark") and client value can differ for one tick.
      suppressHydrationWarning
    >
      <head>
        {/*
          Pre-hydration theme init. Runs synchronously before any paint,
          so users never see a flash of the wrong theme on first load or
          on a hard refresh. The script reads the same localStorage key
          ("halton-theme") that ThemeProvider uses, so the two stay
          in sync. See src/lib/theme.tsx for the source.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
