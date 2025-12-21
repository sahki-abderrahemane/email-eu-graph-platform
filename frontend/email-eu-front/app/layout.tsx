import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GraphInsight - Email Network Analytics Platform",
  description: "Advanced graph analytics platform for organizational email network analysis, powered by machine learning and Node2Vec embeddings.",
  keywords: ["graph analytics", "network analysis", "machine learning", "email network", "node2vec", "community detection"],
  authors: [{ name: "GraphInsight Team" }],
  openGraph: {
    title: "GraphInsight - Email Network Analytics Platform",
    description: "Advanced graph analytics platform for organizational email network analysis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
