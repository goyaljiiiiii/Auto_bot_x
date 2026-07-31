import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Sentinel 🛡️ | Hands-Free AI + IoT Safety Companion",
  description: "A calm, modern, consumer-grade safety companion using computer vision, hand gesture recognition, Google Gemini AI, and IoT hardware.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-[#2D2B30]">
        {children}
      </body>
    </html>
  );
}
