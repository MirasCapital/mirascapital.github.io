import type { Metadata } from "next"
import { Geist_Mono, Instrument_Sans, Instrument_Serif, Josefin_Sans } from "next/font/google"
import { SmoothScroll } from "@/components/SmoothScroll"
import "./globals.css"

// Brand wordmark font ("MIRAS CAPITAL").
const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
})

// Editorial display serif for headlines (single 400 weight by design).
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
})

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mirascapital.com"),
  title: "Miras Capital | Independent Advisory and Investment",
  description:
    "Miras Capital is an independent advisory and investment firm specialising in mergers & acquisitions, capital raisings, industry roll-ups and strategic advisory services.",
  keywords: [
    "Miras Capital",
    "mergers and acquisitions",
    "capital raising",
    "strategic advisory",
    "independent advisory",
    "Australia",
  ],
  authors: [{ name: "Miras Capital" }],
  creator: "Miras Capital",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://www.mirascapital.com",
    title: "Miras Capital",
    description:
      "Independent advisory and investment firm. M&A, capital raisings, industry roll-ups and strategic advice.",
    siteName: "Miras Capital",
    images: [{ url: "/miras-cover-art.png", width: 1627, height: 670, alt: "Miras Capital cover artwork" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miras Capital",
    description: "Independent advice and aligned investment for Australian businesses.",
    images: ["/miras-cover-art.png"],
  },
}

export const viewport = {
  themeColor: "#001323",
  colorScheme: "dark" as const,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${josefin.variable} ${instrumentSerif.variable} ${instrumentSans.variable} ${geistMono.variable}`}
    >
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
