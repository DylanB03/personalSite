import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = GeistSans

export const metadata: Metadata = {
  title: "Dylan Butz - Software Engineering Portfolio",
  description:
    "Full Stack Software Engineer specializing in modern web technologies, cloud architecture, and scalable solutions.",
  keywords: "software engineer, full stack developer, react, node.js, aws, portfolio",
  authors: [{ name: "Dylan Butz" }],
  openGraph: {
    title: "Dylan Butz - Software Engineering Portfolio",
    description: "Full Stack Software Engineer specializing in modern web technologies",
    type: "website",
  },
    generator: 'dylanb'
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
