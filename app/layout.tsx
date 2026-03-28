import type { Metadata } from "next"
import { Inter, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Crowdline — Live market conviction, embedded",
  description:
    "Turn prediction market data into embeddable widgets. Drop one line of code. Your readers see what thousands are betting on, right next to the story.",
  keywords: ["prediction markets", "embed widget", "GoWagr", "Bayse Markets", "publisher tools"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body
        className="font-sans antialiased tracking-tight"
        style={{ "--font-heading": '"CalSans", system-ui, sans-serif' } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  )
}
