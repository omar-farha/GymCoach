import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/hooks/use-language"
import { QueryProvider } from "@/lib/query-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GymCoach Pro - Online Fitness Training",
  description: "Create and share personalized workout plans with your clients",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <LanguageProvider>{children}</LanguageProvider>
            <Toaster />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
