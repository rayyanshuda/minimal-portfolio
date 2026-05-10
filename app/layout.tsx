import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimal Portfolio",
  description: "Minimalist portfolio inspired by editorial layouts",
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
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
