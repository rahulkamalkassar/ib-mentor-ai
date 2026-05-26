import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IB Mentor AI — Study Smarter",
  description: "Your AI-powered IB study companion. Ace your exams with personalized tutoring, practice tests, and grade tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ background: '#0d0f1a', color: '#f1f5f9' }}>
        {children}
      </body>
    </html>
  );
}
