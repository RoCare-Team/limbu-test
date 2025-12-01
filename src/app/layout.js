import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "../app/client-layout";
import AuthGuard from "@/components/AuthGuard";
import SessionProviderWrapper from "./providers/SessionProviderWrapper";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI-Powered GMB Auto Management System | Smart Business Growth",
  description: "Automate and optimize your Google My Business profile with our AI-powered dashboard. Manage reviews, posts, and insights from one easy-to-use platform.",
  other: {
    "google-site-verification": "U-FQQqXrb89Al4Gqx8KsuzMRa2kxeW8uxB4etX5-sqU",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Script */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1388988219494781');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* NoScript Fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1388988219494781&ev=PageView&noscript=1"
          />
        </noscript>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProviderWrapper>
          <ClientLayout>
            <AuthGuard>{children}</AuthGuard>
          </ClientLayout>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
