import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { BlockradarProvider } from "@/components/blockradar/BlockradarProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEDApay - Stablecoin Wallet",
  description: "A modern fiat-to-crypto wallet focused on stablecoins on the Base blockchain",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  applicationName: "NEDApay",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEDApay",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "NEDApay",
    title: "NEDApay - Stablecoin Wallet",
    description: "A modern fiat-to-crypto wallet focused on stablecoins on the Base blockchain",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1F44",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#0A1F44" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <PrivyProvider>
          <BlockradarProvider>
            {children}
          </BlockradarProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
