import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({ 
  subsets: ["latin"], 
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
  preload: false
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
  preload: false
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false
});

export const metadata: Metadata = {
  title: "DevCure | Autonomous AI Bug Repair",
  description: "Stop debugging. Start shipping. The premium autonomous AI bug-repair platform.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

import AuthWrapper from "@/components/AuthWrapper";

import { ToastContainer } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-white selection:bg-acid selection:text-void" suppressHydrationWarning>
        <AuthWrapper>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          <ToastContainer />
        </AuthWrapper>
      </body>
    </html>
  );
}
