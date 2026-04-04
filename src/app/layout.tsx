import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Import the providers

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "iSPORTS Cricket | UAE's Premium Cricket Store",
  description:
    "Shop professional cricket gear in Sharjah, Ajman, and across UAE.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="font-poppins antialiased bg-white" suppressHydrationWarning>
        <Providers>  {/* Wrap with SessionProvider */}
          {children}
        </Providers>
      </body>
    </html>
  );
}