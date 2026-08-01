import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Line — Bijoux",
    template: "%s | Line",
  },
  description: "Bagues, bracelets, colliers, boucles d'oreilles et lunettes de soleil Line.",
};

const navigation = [
  { href: "/boutique", label: "Boutique" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <header className="border-b border-black/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-xl tracking-[0.3em] uppercase">
              Line
            </Link>
            <nav className="flex gap-6 text-sm">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-[var(--color-gold)]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>

        <footer className="border-t border-black/10">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-6 py-8 text-sm text-black/60">
            <span>© {new Date().getFullYear()} Line</span>
            <Link href="/mentions-legales" className="hover:text-[var(--color-gold)]">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-[var(--color-gold)]">
              CGV
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
