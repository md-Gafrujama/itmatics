import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import AlliAiScript from "@/components/AlliAiScript";
import ClientEffects from "@/components/ClientEffects";
import RouteLoaderHost from "@/components/RouteLoaderHost";
import SubscribeModal, { Toast } from "@/components/SubscribeModal";
import JsonLd from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const SITE_URL = getSiteUrl();

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ITmatics News - Intelligence for enterprise technology leaders",
    template: "%s | ITmatics News",
  },
  description:
    "Independent reporting, analysis, and opinion for CIOs, CISOs, and enterprise IT leaders. AI, cloud, security, data, and the strategy behind technology decisions.",
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
  icons: {
    icon: [
      { url: "/favicon.ico?v=itmatics2", sizes: "any" },
      { url: "/favicon-16x16.png?v=itmatics2", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png?v=itmatics2", type: "image/png", sizes: "32x32" },
      { url: "/icon?v=itmatics2", type: "image/png", sizes: "32x32" },
      { url: "/brand/mark.svg?v=itmatics2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=itmatics2",
    apple: [
      {
        url: "/apple-touch-icon.png?v=itmatics2",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "ITmatics News",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-paper text-ink"
        suppressHydrationWarning
      >
        <AlliAiScript />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ITmatics News",
            url: SITE_URL,
            logo: `${SITE_URL}/brand/mark.svg`,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ITmatics News",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
        {children}
        <RouteLoaderHost />
        <ClientEffects />
        <SubscribeModal />
        <Toast />
      </body>
    </html>
  );
}
