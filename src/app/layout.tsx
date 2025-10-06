import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import StyledComponentsRegistry from '../lib/registry';
import BottomNav from '@/components/BottomNav';
import CampaignBanner from '@/components/CampaignBanner';
import GrokChat from '@/components/GrokChat';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elchef – gör det enkelt att välja rätt elavtal",
  description: "Elchef.se hjälper dig att snabbt, gratis och utan krångel hitta och byta till det elavtal som passar dig bäst. Vi visar bara elavtal som är värda att överväga och sköter hela bytet åt dig.",
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
        <Script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="adbd0838-8684-44d4-951e-f4eddcb600cc" data-blockingmode="auto" strategy="beforeInteractive" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
        {/* Open Graph metadata */}
        <meta property="og:title" content="Elchef – gör det enkelt att välja rätt elavtal" />
        <meta property="og:description" content="Elchef.se hjälper dig att snabbt, gratis och utan krångel hitta och byta till det elavtal som passar dig bäst. Vi visar bara elavtal som är värda att överväga och sköter hela bytet åt dig." />
        <meta property="og:image" content="https://elchef.se/og-image.png" />
        <meta property="og:url" content="https://elchef.se" />
        <meta property="og:type" content="website" />
        {/* Twitter Card metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elchef – gör det enkelt att välja rätt elavtal" />
        <meta name="twitter:description" content="Elchef.se hjälper dig att snabbt, gratis och utan krångel hitta och byta till det elavtal som passar dig bäst. Vi visar bara elavtal som är värda att överväga och sköter hela bytet åt dig." />
        <meta name="twitter:image" content="https://elchef.se/og-image.png" />
        <meta name="facebook-domain-verification" content="in9xjxefhkl6pbe4g33zjwrsnkliin" />
        <meta name="tiktok-developers-site-verification" content="i7h859t0QF0G6Dua8q4h9qJUXwuPQoof" />
        
        {/* Facebook Meta Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '780636244595001');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}}
            src="https://www.facebook.com/tr?id=780636244595001&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* TikTok Pixel Code */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
            var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
            ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

              ttq.load('D3HL2E3C77UEJKF0D9C0');
              
              // Check Cookiebot consent and fire page event
              function fireTikTokPage() {
                console.log('🔥 TikTok Pixel: fireTikTokPage called');
                if (typeof window.cookiebot !== 'undefined') {
                  console.log('🍪 Cookiebot found, consent.marketing:', window.cookiebot.consent.marketing);
                  // If Cookiebot is present, check consent
                  if (window.cookiebot.consent.marketing) {
                    console.log('✅ TikTok Pixel: Firing page event (consent given)');
                    ttq.page();
                  } else {
                    console.log('⏸️ TikTok Pixel: Holding consent (waiting for user)');
                    ttq.holdConsent();
                  }
                } else {
                  console.log('🚀 TikTok Pixel: No Cookiebot, firing immediately');
                  ttq.page();
                }
              }
              
              // Fire immediately or when consent is given
              fireTikTokPage();
              
              // Listen for consent changes
              document.addEventListener('CookiebotOnConsentReady', function() {
                console.log('🍪 Cookiebot consent ready, marketing:', window.cookiebot.consent.marketing);
                if (window.cookiebot.consent.marketing) {
                  console.log('✅ TikTok Pixel: Granting consent and firing page');
                  ttq.grantConsent();
                  ttq.page();
                }
              });
              
            }(window, document, 'ttq');
          `}
        </Script>
        {/* End TikTok Pixel Code */}
      </head>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          {/* Tracks and stores affiliate code from query params in a cookie */}
          <Script id="affiliate-tracker" strategy="afterInteractive">
            {`
              (function(){
                try {
                  var params = new URLSearchParams(window.location.search);
                  var ref = params.get('ref') || params.get('utm_source');
                  var campaign = params.get('code') || params.get('kampanj') || params.get('utm_campaign');
                  if (ref) {
                    var expires = new Date();
                    expires.setDate(expires.getDate() + 30);
                    document.cookie = 'elchef_affiliate=' + encodeURIComponent(ref) + '; path=/; expires=' + expires.toUTCString() + '; SameSite=Lax';
                  }
                  if (campaign) {
                    var expires2 = new Date();
                    expires2.setDate(expires2.getDate() + 30);
                    document.cookie = 'elchef_campaign=' + encodeURIComponent(campaign) + '; path=/; expires=' + expires2.toUTCString() + '; SameSite=Lax';
                  }
                } catch (e) { /* noop */ }
              })();
            `}
          </Script>
          <CampaignBanner />
          <div id="app">
            {children}
            <BottomNav />
            <Footer />
          </div>
        </StyledComponentsRegistry>
        <GrokChat />
      </body>
    </html>
  );
}
