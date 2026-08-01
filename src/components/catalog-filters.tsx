import Link from "next/link";
import type { Category, Color } from "@/types/catalog";

type Props = {
  categories: Category[];
  colors: Color[];
  /** Slug de catégorie actif, ou undefined sur la grille générale. */
  activeCategory?: string;
  /** Slugs de couleurs actives (filtres cumulables). */
  activeColors: string[];
};

/**
 * Filtres catégorie / couleur. Purement basés sur l'URL : chaque filtre est un
 * lien, la grille est rendue côté serveur.
 */
export function CatalogFilters({ categories, colors, activeCategory, activeColors }: Props) {
  const basePath = activeCategory ? `/boutique/${activeCategory}` : "/boutique";

  const colorHref = (slug: string) => {
    const next = activeColors.includes(slug)
      ? activeColors.filter((value) => value !== slug)
      : [...activeColors, slug];
    const params = new URLSearchParams();
    for (const value of next) params.append("couleur", value);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-3 text-sm uppercase tracking-widest">
        <Link
          href="/boutique"
          className={`border px-4 py-2 ${activeCategory ? "border-black/15" : "border-black"}`}
        >
          Tout
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/boutique/${category.slug}`}
            className={`border px-4 py-2 ${
              activeCategory === category.slug ? "border-black" : "border-black/15"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-black/50">Couleur</span>
        {colors.map((color) => {
          const isActive = activeColors.includes(color.slug);
          return (
            <Link
              key={color.id}
              href={colorHref(color.slug)}
              aria-pressed={isActive}
              title={color.name}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                isActive ? "border-black" : "border-black/15"
              }`}
            >
              <span
                aria-hidden
                className="h-3 w-3 rounded-full border border-black/20"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </Link>
          );
        })}
        {activeColors.length > 0 && (
          <Link href={basePath} className="text-xs underline">
            Effacer
          </Link>
        )}
      </div>
    </div>
  );
}
