import { createServerClient } from "@/lib/supabase/server";
import type {
  CatalogFilters,
  CatalogProduct,
  Category,
  Color,
  ProductDetail,
  Size,
} from "@/types/catalog";

/** Toutes les catégories, dans l'ordre d'affichage. */
export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, code, name, singular_name, description, has_colors, position")
    .order("position");

  if (error) throw error;
  return data ?? [];
}

/** Toutes les couleurs, pour les filtres et les sélecteurs. */
export async function getColors(): Promise<Color[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("colors")
    .select("id, slug, code, name, hex, position")
    .order("position");

  if (error) throw error;
  return data ?? [];
}

/**
 * Grille boutique. `category` filtre sur une rubrique,
 * `colors` sur une ou plusieurs couleurs (filtres cumulables).
 */
export async function getCatalogProducts(
  filters: CatalogFilters = {},
): Promise<CatalogProduct[]> {
  const supabase = createServerClient();
  let query = supabase.from("catalog_products").select("*").eq("status", "active");

  if (filters.category) query = query.eq("category_slug", filters.category);
  if (filters.colors?.length) query = query.in("color_slug", filters.colors);

  const { data, error } = await query.order("position");
  if (error) throw error;
  return (data ?? []) as CatalogProduct[];
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  status: ProductDetail["status"];
  category: Category;
  color: Color | null;
  product_images: ProductDetail["images"];
  product_variants: (Omit<ProductDetail["variants"][number], "size"> & { size: Size | null })[];
};

/** Fiche produit complète, ou null si le slug n'existe pas / n'est pas publié. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, description, price_cents, currency, status,
       category:categories (id, slug, code, name, singular_name, description, has_colors, position),
       color:colors (id, slug, code, name, hex, position),
       product_images (id, url, alt, position, is_primary),
       product_variants (id, size_id, sku, price_cents, stock, is_active, position, stripe_price_id,
                         size:sizes (id, slug, label, position))`,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle<ProductRow>();

  if (error) throw error;
  if (!data) return null;

  // Fiches sœurs = mêmes catégorie, autres couleurs (sélecteur de couleur).
  const { data: siblingRows, error: siblingError } = await supabase
    .from("products")
    .select("slug, position, color:colors (id, slug, code, name, hex, position)")
    .eq("category_id", data.category.id)
    .eq("status", "active")
    .not("color_id", "is", null)
    .order("position")
    .returns<{ slug: string; position: number; color: Color }[]>();

  if (siblingError) throw siblingError;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    price_cents: data.price_cents,
    currency: data.currency,
    status: data.status,
    category: data.category,
    color: data.color,
    images: [...(data.product_images ?? [])].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
    ),
    variants: (data.product_variants ?? [])
      .filter((variant) => variant.is_active)
      .sort((a, b) => a.position - b.position),
    siblings: (siblingRows ?? []).map(({ slug, color }) => ({ slug, color })),
  };
}

/** Slugs de tous les produits publiés — pour `generateStaticParams`. */
export async function getProductSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active");

  if (error) throw error;
  return (data ?? []).map((row) => row.slug);
}
