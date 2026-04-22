import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hylith",
    template: "%s • Hylith",
  },
  description:
    "We design and build full-stack systems where logic and interface work as one.",
  metadataBase: new URL("https://hylith.com"),

  openGraph: {
    title: "Hylith",
    description:
      "We design and build full-stack systems where logic and interface work as one.",
    url: "https://hylith.com",
    siteName: "Hylith",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Hylith",
    description:
      "We design and build full-stack systems where logic and interface work as one.",
    images: ["/og.png"],
  },

  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="bg-black text-white min-h-screen antialiased">
        {children}

        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="beforeInteractive"
        />

        <Script
          src="/scripts/liquidGL.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
