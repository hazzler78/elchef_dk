import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from '../lib/registry';
import BottomNav from '@/components/BottomNav';
import { Analytics } from "@vercel/analytics/next";
import CampaignBanner from '@/components/CampaignBanner';
import GrokChat from '@/components/GrokChat';

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
      <head>
        <script type="application/ld+json" suppressHydrationWarning>{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Elchef",
            "url": "https://elchef.se",
            "logo": "https://elchef.se/logo.png",
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+46-73-686-23-66",
              "contactType": "customer service",
              "areaServed": "SE",
              "availableLanguage": ["Swedish", "English"]
            }],
            "sameAs": [
              "https://www.facebook.com/elchef.se",
              "https://www.instagram.com/elchef.se/"
            ]
          }
        `}</script>
      </head>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <CampaignBanner />
          <div id="app">
            {children}
            <BottomNav />
          </div>
        </StyledComponentsRegistry>
        <GrokChat />
        <Analytics />
      </body>
    </html>
  );
}
