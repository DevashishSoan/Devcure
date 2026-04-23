import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  preload: false
});

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
  preload: false
});

const geistMono = Geist_Mono({ 
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
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-[#F1F5F9] selection:bg-[#0891B2] selection:text-white" suppressHydrationWarning>
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
