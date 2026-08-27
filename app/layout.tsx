import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TabTitleManager from "./utils/TabTitleManager";
import ToastContainer from "./utils/Toast";
import CookieBanner from "./utils/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pixorva | Hire Your Next AI Employee",
    template: "%s | Pixorva"
  },
  description: "Get an AI Team who runs your inbox, socials, SEO, lead generation, calls, and support. Hire specialized, autonomous digital employees to scale your business 24/7.",
  keywords: [
    "Pixorva",
    "Pixorva AI",
    "AI Employees",
    "AI Agents",
    "Autonomous digital employees",
    "Hire AI staff",
    "AI workforce marketplace",
    "Autonomous AI agents",
    "Digital worker automation",
    "Pixorva Marketplace",
    "AI Marketing Specialists",
    "AI Software Developers",
    "AI Support Representatives"
  ],
  metadataBase: new URL("https://pixorva.com"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pixorva.com",
    siteName: "Pixorva",
    title: "Pixorva | Hire Your Next AI Employee",
    description: "Get an AI Team who runs your inbox, socials, SEO, lead generation, calls, and support. Scale your business 24/7 with zero drama.",
    images: [
      {
        url: "/GIF/Lawson.png", // Use Lawson keyframe as an initial share preview image
        width: 1200,
        height: 630,
        alt: "Pixorva - Scale with Autonomous AI Employees"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixorva | Hire Your Next AI Employee",
    description: "Scale your business 24/7 with specialized AI agents and autonomous digital employees.",
    images: ["/GIF/Lawson.png"]
  }
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
        <TabTitleManager />
        <ToastContainer />
        <CookieBanner />
        {children}
      </body>
    </html>
  );
}
