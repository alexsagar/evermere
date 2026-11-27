import { site as siteEnv } from "@/lib/site";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteSettings } from "@/content";
import "./globals.css";

const manrope = localFont({
  src: "../fonts/Manrope-Variable.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-manrope",
});

// Private demo: never indexable until the client approves launch.
// Default title and description come from site settings (pages override them).
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
  // Canonical and social URLs resolve against the validated NEXT_PUBLIC_SITE_URL
  // (local origin until a real domain is approved). See src/lib/site.ts.
  metadataBase: new URL(siteEnv.origin),
  title: site.defaultSeo?.title ?? site.name ?? undefined,
  description: site.defaultSeo?.description ?? site.description ?? undefined,
  robots: siteEnv.indexable ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
  twitter: { card: "summary_large_image" },
  icons: { icon: [{ url: site.favicon?.src ?? "/favicon.svg", sizes: "any" }] },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
