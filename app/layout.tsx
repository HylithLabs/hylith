import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ogImageMetadata, ogImageUrl, siteConfig } from "./site-config";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils"; 

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSans = localFont({
  src: "../public/fonts/dm-sans.woff2",
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | Hylith",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  alternates: {
    canonical: "/",
  },
  category: "technology",
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [ogImageMetadata],
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.ogDescription,
    images: [ogImageUrl()],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* Responsive viewport: ensures proper mobile rendering with device-width */
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, dmSans.variable)}>
      <body className="min-h-screen bg-[#EEEEE8] antialiased"> 
          {children} 
         

        {/* <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="beforeInteractive"
        /> */}

        {/* <Script src="/scripts/liquidGL.js" strategy="afterInteractive" /> */}
      </body>
    </html>
  );
}
