import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogProducts, getCategories, getColors } from "@/lib/catalog";
import { parseColorParam } from "@/lib/search-params";

type Props = {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ couleur?: string | string[] }>;
};

// Rendu à la demande puis mis en cache 1 h : le build ne dépend pas de la base.
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const category = (await getCategories()).find((item) => item.slug === categorie);
  return {
    title: category?.name ?? "Boutique",
    description: category?.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ categorie }, { couleur }] = await Promise.all([params, searchParams]);
  const activeColors = parseColorParam(couleur);

  const [categories, colors] = await Promise.all([getCategories(), getColors()]);
  const category = categories.find((item) => item.slug === categorie);
  if (!category) notFound();

  const products = await getCatalogProducts({ category: category.slug, colors: activeColors });

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl uppercase tracking-[0.2em]">{category.name}</h1>
        {category.description && <p className="text-black/60">{category.description}</p>}
      </header>
      <CatalogFilters
        categories={categories}
        colors={colors}
        activeCategory={category.slug}
        activeColors={activeColors}
      />
      <ProductGrid products={products} />
    </div>
  );
}
