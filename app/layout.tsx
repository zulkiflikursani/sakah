import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#059669", // Warna Hex untuk bg-emerald-600 (Header Anda)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Konten menjangkau sampai bawah status bar iOS (notch) —
  // pasangan dari statusBarStyle: "black-translucent"
  viewportFit: "cover",
};
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sakah",
  description:
    "Aplikasi keuangan syariah untuk membantu mengelola keuangan pribadi dan bisnis sesuai prinsip syariah.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "sakah",
    // startUpImage: [],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >      <head />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#059669" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <body className="min-h-full flex flex-col">{children}</body>
    </html
>
  );
}
