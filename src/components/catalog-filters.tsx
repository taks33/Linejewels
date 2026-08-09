import Link from "next/link";
import type { Category, Color } from "@/types/catalog";

type Props = {
  categories: Category[];
  colors: Color[];
  /** Slug de catégorie actif, ou undefined sur la grille générale. */
  activeCategory?: string;
  /** Slugs de couleurs actives (filtres cumulables). */
  activeColors: string[];
  /** false sur une catégorie sans déclinaison couleur : le filtre n'aurait rien à filtrer. */
  showColors?: boolean;
};

/**
 * Filtres catégorie / couleur. Purement basés sur l'URL : chaque filtre est un
 * lien, la grille est rendue côté serveur.
 */
export function CatalogFilters({
  categories,
  colors,
  activeCategory,
  activeColors,
  showColors = true,
}: Props) {
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
    <div className="space-y-6 border-y border-line py-6">
      <nav className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
        <Link
          href="/boutique"
          className={`border px-5 py-2.5 transition-colors ${
            activeCategory
              ? "border-line text-muted hover:border-clay hover:text-ink"
              : "border-ink bg-ink text-cream"
          }`}
        >
          Tout
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/boutique/${category.slug}`}
            className={`border px-5 py-2.5 transition-colors ${
              activeCategory === category.slug
                ? "border-ink bg-ink text-cream"
                : "border-line text-muted hover:border-clay hover:text-ink"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {showColors && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[0.65rem] uppercase tracking-[0.25em] text-muted">
            Couleur
          </span>
          {colors.map((color) => {
            const isActive = activeColors.includes(color.slug);
            return (
              <Link
                key={color.id}
                href={colorHref(color.slug)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "border-clay bg-dune text-ink"
                    : "border-line text-muted hover:border-clay hover:text-ink"
                }`}
              >
                <span
                  aria-hidden
                  className="h-3 w-3 rounded-full border border-ink/15"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </Link>
            );
          })}
          {activeColors.length > 0 && (
            <Link href={basePath} className="ml-2 text-xs text-clay underline underline-offset-4">
              Effacer
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
