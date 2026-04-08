import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FounderOS — Test Your Startup Idea Before You Build It",
  description: "Validate your startup idea in seconds. FounderOS helps founders identify risks, improve clarity, and decide before building.",
  openGraph: {
    title: "FounderOS — Test Your Startup Before You Build",
    description: "Don't waste months building the wrong startup. Analyze your idea in 60 seconds.",
    url: "https://founderos.pro",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FounderOS — Test Your Startup Idea",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FounderOS — Test Your Startup Before You Build",
    description: "Analyze your startup idea in seconds and avoid building the wrong thing.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://founderos.pro",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}

        {/* ✅ GLOBAL FOOTER */}
        <footer className="border-t border-gray-800 mt-auto px-6 py-10 text-center space-y-3">
          <p className="text-base font-bold text-white">FounderOS</p>
          <p className="text-sm text-gray-400">Test your startup before you build it.</p>
          <p className="text-sm">
            <a href="mailto:hello@founderos.pro" className="text-gray-500 hover:text-violet-400 transition">hello@founderos.pro</a>
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <span className="text-xs text-gray-600">🔒 Private by design</span>
            <span className="text-xs text-gray-600">⚡ Real-time analysis</span>
            <span className="text-xs text-gray-600">🚫 No training usage</span>
          </div>
          <p className="text-xs text-gray-700">Only legal, ethical ideas are evaluated.</p>
        </footer>

      </body>
    </html>
  );
}