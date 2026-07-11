import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = GeistSans

export const metadata: Metadata = {
  title: "Dylan Butz - Software Engineering Portfolio",
  description:
    "Software engineering portfolio featuring AI systems, full-stack applications, and developer tools built by Dylan Butz.",
  keywords: "Dylan Butz, software engineer, AI developer, full stack developer, portfolio",
  authors: [{ name: "Dylan Butz" }],
  openGraph: {
    title: "Dylan Butz - Software Engineering Portfolio",
    description:
      "Software engineering portfolio featuring AI systems, full-stack applications, and developer tools built by Dylan Butz.",
    type: "website",
  },
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={geistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
