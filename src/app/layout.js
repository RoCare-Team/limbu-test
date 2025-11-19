import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "../app/client-layout";
import AuthGuard from "@/components/AuthGuard";
import SessionProviderWrapper from "./providers/SessionProviderWrapper";



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
  // ✅ Add Google site verification here
  other: {
    "google-site-verification": "U-FQQqXrb89Al4Gqx8KsuzMRa2kxeW8uxB4etX5-sqU",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
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

