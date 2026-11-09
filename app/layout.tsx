import type { Metadata } from "next";
import "./globals.css";
import "./site-themes.css";
import "katex/dist/katex.min.css";
import ThemeRoot from "./components/theme-root";
import { SITE_THEME_BOOT_SCRIPT } from "./lib/site-theme-boot";

export const metadata: Metadata = {
  title: "Rayyan Huda's Portfolio",
  description: "minimalist portfolio inspired by editorial layouts",
  icons: {
    // Tab bar follows the OS / browser color scheme, not your site’s data-theme.
    // White mark for dark UI; black mark for light UI.
    icon: [
      { url: "/white-rh.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/black-rh.png", type: "image/png", media: "(prefers-color-scheme: light)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* set the visitor's theme before first paint (see app/lib/site-theme.ts) */}
        <script dangerouslySetInnerHTML={{ __html: SITE_THEME_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Spline+Sans+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full">
        {children}
        <ThemeRoot />
      </body>
    </html>
  );
}
