import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
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
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body style={{ background: '#0d0f1a', color: '#f1f5f9' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
