/** Types du catalogue — miroir de supabase/migrations/0001_catalog.sql. */

export type ProductStatus = "draft" | "active" | "archived";

export type Category = {
  id: string;
  slug: string;
  code: string;
  name: string;
  singular_name: string;
  description: string | null;
  has_colors: boolean;
  position: number;
};

export type Color = {
  id: string;
  slug: string;
  code: string;
  name: string;
  hex: string;
  position: number;
};

export type Size = {
  id: string;
  slug: string;
  label: string;
  position: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
  is_primary: boolean;
};

export type ProductVariant = {
  id: string;
  size_id: string | null;
  sku: string;
  /** null = hérite du prix de la fiche produit */
  price_cents: number | null;
  stock: number;
  is_active: boolean;
  position: number;
  stripe_price_id: string | null;
};

/** Ligne de la vue `catalog_products` : une carte de la grille boutique. */
export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  status: ProductStatus;
  is_featured: boolean;
  position: number;
  category_id: string;
  category_slug: string;
  category_name: string;
  color_id: string | null;
  color_slug: string | null;
  color_name: string | null;
  color_hex: string | null;
  image_url: string | null;
  image_alt: string | null;
  total_stock: number;
};

/** Fiche produit complète : produit + variantes + images + fiches sœurs. */
export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  status: ProductStatus;
  category: Category;
  color: Color | null;
  images: ProductImage[];
  /** Variantes achetables, triées ; taille présente uniquement pour les bagues. */
  variants: (ProductVariant & { size: Size | null })[];
  /** Autres couleurs de la même catégorie, pour le sélecteur de couleur. */
  siblings: { slug: string; color: Color }[];
};

export type CatalogFilters = {
  category?: string;
  colors?: string[];
};
