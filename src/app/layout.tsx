import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI Freelance · Supabase Auth Demo",
  description: "A sample troubleshooting project demonstrating a verified Supabase authentication baseline.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <a className="skip" href="#main">Skip to content</a>
    <header><Link href="/" className="brand">AI FREELANCE <span>/ AUTH DEMO</span></Link></header>
    <main id="main">{children}</main>
    <footer>Next.js + Supabase · Demonstration project, not client work.</footer>
  </body></html>;
}
