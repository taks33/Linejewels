import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductGrid } from "@/components/product-grid";
import { getCatalogProducts, getCategories, getColors } from "@/lib/catalog";
import { parseColorParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Boutique" };

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ couleur?: string | string[] }>;
}) {
  const { couleur } = await searchParams;
  const activeColors = parseColorParam(couleur);

  const [categories, colors, products] = await Promise.all([
    getCategories(),
    getColors(),
    getCatalogProducts({ colors: activeColors }),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl">Boutique</h1>
        <p className="text-sm text-muted">
          {products.length} pièce{products.length > 1 ? "s" : ""}
        </p>
      </header>
      <CatalogFilters categories={categories} colors={colors} activeColors={activeColors} />
      <ProductGrid products={products} />
    </div>
  );
}
