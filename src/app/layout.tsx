import type { Metadata } from "next";
import { B612_Mono } from "next/font/google";
import "./globals.css";

const b612Mono = B612_Mono({
  variable: "--font-b612-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Pomodoro Timer",
  description:
    "A customizable Pomodoro Timer with hyperfocus mode, heatmap statistics, and cloud sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${b612Mono.variable} antialiased bg-[#1A1B24]`}
        style={{ fontFamily: 'var(--font-b612-mono), monospace' }}
      >
        {children}
      </body>
    </html>
  );
}
