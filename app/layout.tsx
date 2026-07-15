import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "BioVolt AI",
      template: "%s | BioVolt AI",
    },
    description:
      "An evidence-led microbial fuel-cell research platform and digital twin.",
    applicationName: "BioVolt AI",
    authors: [{ name: "Yatharth Sharma" }],
    keywords: [
      "microbial fuel cell",
      "MFC",
      "digital twin",
      "bioelectricity",
      "wastewater treatment",
    ],
    openGraph: {
      type: "website",
      title: "BioVolt AI",
      description: "From microbial metabolism to measurable electricity.",
      url: origin,
      images: [{ url: socialImage, width: 1733, height: 909, alt: "BioVolt AI double-chamber microbial fuel cell" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BioVolt AI",
      description: "From microbial metabolism to measurable electricity.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
