import { Caveat, Kalam, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChalkDust from "@/components/ChalkDust";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const kalam = Kalam({
  variable: "--font-kalam",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "KalviAI – AI Classroom Copilot",
  description: "Multilingual AI-powered classroom copilot for Indian school teachers (Classes 1–12)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${kalam.variable}`}>
      <body className="relative">
        {/* Hidden SVG Chalk-Roughness Displacement Filter */}
        <svg style={{ display: 'none', position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <filter id="chalk-roughness" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" seed="2" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* Global Chalk Dust Particles */}
        <ChalkDust />

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
