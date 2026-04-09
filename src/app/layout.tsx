import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteSettingsProvider } from "@/components/providers/SiteSettingsProvider";
import { getSiteSettings } from "@/lib/site-settings";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

// ✅ FORCE DYNAMIC - Prevents static generation
export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle?.split("|")[0]?.trim() || "iSPORTS Cricket"}`,
    },
    description: settings.siteDescription,
    keywords: settings.siteKeywords,
    icons: {
      icon: `${settings.favicon || "/favicon.ico"}?v=${Date.now()}`,
      shortcut: `${settings.favicon || "/favicon.ico"}?v=${Date.now()}`,
      apple: `${settings.favicon || "/favicon.ico"}?v=${Date.now()}`,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const faviconUrl = `${settings.favicon || "/favicon.ico"}?v=${Date.now()}`;

  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href={faviconUrl} type="image/x-icon" />
        <link rel="shortcut icon" href={faviconUrl} type="image/x-icon" />
      </head>
      <body
        className="font-poppins antialiased bg-white"
        suppressHydrationWarning
      >
        <SiteSettingsProvider initialSettings={settings}>
          <Providers>{children}</Providers>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
