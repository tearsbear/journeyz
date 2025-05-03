import type { Metadata } from "next";
import { Montserrat, Inter, Delicious_Handrawn } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const deliciousHandrawn = Delicious_Handrawn({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-delicious",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Journeyz",
  description: "Created by Jiaan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/love.svg" type="image/svg+xml" />
        <title>Journeyz</title>
        <meta name="description" content="Created by Jiaan" />
      </head>
      <body
        className={`${montserrat.variable} ${deliciousHandrawn.variable} ${inter.variable} font-inter antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
