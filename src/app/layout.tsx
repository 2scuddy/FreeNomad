import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";
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
  title: "FreeNomad - Digital Nomad City Guide",
  description:
    "Discover the best cities for digital nomads with comprehensive data on cost of living, internet speed, safety, and more.",
  keywords:
    "digital nomad, remote work, city guide, cost of living, internet speed, travel",
  authors: [{ name: "FreeNomad Team" }],
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <Providers>
              <ErrorBoundary
                showDetails={process.env.NODE_ENV === "development"}
              >
                {children}
              </ErrorBoundary>
              <ServiceWorkerRegistration />
            </Providers>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
