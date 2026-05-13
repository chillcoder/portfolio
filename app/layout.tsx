import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./global.css";
import { LenisProvider } from "@/components/providers/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lucas-obrien.com"),
  title: {
    default: "Lucas O'Brien — Customer Success, AI implementation, SF",
    template: "%s · Lucas O'Brien",
  },
  description:
    "Lucas O'Brien — enterprise customer success and applied AI at Juniper Square; CS, GTM tooling, and travel.",
  openGraph: {
    type: "website",
    title: "Lucas O'Brien",
    description:
      "Enterprise CS and AI implementation—Juniper Square. Portfolio, integrations, and side interests.",
    url: "https://lucas-obrien.com",
    siteName: "Lucas O'Brien",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucas O'Brien",
    description:
      "Customer Success & AI implementation — Juniper Square, San Francisco.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var allowed = ['light', 'dark', 'terminal'];
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = allowed.indexOf(stored) >= 0 ? stored : (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
