import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo-line.png";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LINÉ — Bijoux",
    template: "%s | LINÉ",
  },
  description:
    "Bagues, bracelets, colliers, boucles d'oreilles et lunettes de soleil LINÉ.",
};

const navigation = [
  { href: "/boutique", label: "Boutique" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream antialiased">
        <header className="border-b border-line bg-sand/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-6">
            <Link href="/" aria-label="LINÉ — accueil">
              <Image
                src={logo}
                alt="LINÉ"
                priority
                className="h-7 w-auto"
                sizes="180px"
              />
            </Link>
            <nav className="flex gap-8 text-xs uppercase tracking-[0.2em] text-muted">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="transition-colors hover:text-clay">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">{children}</main>

        <footer className="mt-16 bg-night text-cream">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-lg tracking-wordmark text-brand">LINÉ</span>
            <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.2em] text-cream/60">
              <Link href="/mentions-legales" className="transition-colors hover:text-brand">
                Mentions légales
              </Link>
              <Link href="/cgv" className="transition-colors hover:text-brand">
                CGV
              </Link>
              <Link href="/contact" className="transition-colors hover:text-brand">
                Contact
              </Link>
            </div>
            <span className="text-xs text-cream/40">© {new Date().getFullYear()} LINÉ</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
