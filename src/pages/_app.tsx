import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BlogScrollRestoration } from "@/components/blog/BlogScrollRestoration";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SupabaseRealtimeProvider } from "@/components/providers/SupabaseRealtimeProvider";
import "@/pages/globals.css";
import "@/components/landing/landing-hero.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SupabaseRealtimeProvider>
        <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <BlogScrollRestoration />
          <Component {...pageProps} />
          <Analytics />
        </div>
      </SupabaseRealtimeProvider>
    </AuthProvider>
  );
}
