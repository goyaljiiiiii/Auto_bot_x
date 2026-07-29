import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniSight Care AI • Assistive Vision & IoT Smart Guardian",
  description: "Next-generation assistive smart home & health guardian combining browser computer vision, WebSerial IoT hardware tracking, and AI medical profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#05070e] text-slate-100">
        {children}
      </body>
    </html>
  );
}
