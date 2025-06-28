import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from '../lib/registry';
import BottomNav from '@/components/BottomNav';
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elchef - Hitta och byt till marknadens bästa elavtal",
  description: "Jämför elpriser och byt till ett bättre elavtal enkelt och kostnadsfritt med Elchef. Vi hjälper dig hitta det bästa elavtalet för just dina behov.",
  keywords: "elavtal, elpriser, byta elavtal, jämför elpriser, elbolag, elhandelsbolag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <div id="app">
            {children}
            <BottomNav />
          </div>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}
