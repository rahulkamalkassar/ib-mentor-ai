import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IB Mentor AI — Study Smarter",
  description: "Your AI-powered IB study companion. Ace your exams with personalised tutoring, practice tests, and grade tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ background: '#f6f9fc', color: '#0d253d', fontWeight: 300 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
