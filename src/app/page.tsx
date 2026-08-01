import Link from "next/link";
import { getCategories } from "@/lib/catalog";

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl tracking-[0.2em] uppercase">Line</h1>
        <p className="max-w-xl text-black/70">
          Bijoux et lunettes de soleil, dessinés pour être portés tous les jours.
        </p>
        <Link
          href="/boutique"
          className="inline-block border border-current px-6 py-3 text-sm uppercase tracking-widest"
        >
          Découvrir la boutique
        </Link>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/boutique/${category.slug}`}
            className="border border-black/10 bg-white p-8 transition-colors hover:border-black/40"
          >
            <h2 className="text-lg uppercase tracking-widest">{category.name}</h2>
            {category.description && (
              <p className="mt-2 text-sm text-black/60">{category.description}</p>
            )}
          </Link>
        ))}
      </section>
    </div>
  );
}
