import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/components/providers/SocketProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Problem Solving Day - Leaderboard",
  description: "Real-time leaderboard for Problem Solving Day challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-right" richColors />
          </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
