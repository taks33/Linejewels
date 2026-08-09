import Link from "next/link";
import { getCategories } from "@/lib/catalog";

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-24">
      <section className="border border-line bg-sand px-8 py-20 text-center sm:px-16">
        <p className="text-xs uppercase tracking-[0.3em] text-clay">Maison de bijoux</p>
        <h1 className="mt-6 text-4xl leading-tight sm:text-5xl">
          Des pièces simples,
          <br />
          portées tous les jours.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted">
          Bagues, bracelets, colliers, boucles d&apos;oreilles et lunettes de soleil —
          quatre familles, neuf teintes.
        </p>
        <Link
          href="/boutique"
          className="mt-10 inline-block bg-night px-10 py-4 text-xs uppercase tracking-[0.25em] text-cream transition-colors hover:bg-ink"
        >
          Découvrir la boutique
        </Link>
      </section>

      <section className="space-y-8">
        <h2 className="text-xs uppercase tracking-[0.3em] text-muted">Les collections</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/boutique/${category.slug}`}
              className="group border border-line bg-sand/50 p-10 transition-colors hover:border-clay hover:bg-sand"
            >
              <h3 className="text-2xl">{category.name}</h3>
              {category.description && (
                <p className="mt-3 text-sm text-muted">{category.description}</p>
              )}
              <span className="mt-6 inline-block text-xs uppercase tracking-[0.25em] text-clay">
                Voir →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
