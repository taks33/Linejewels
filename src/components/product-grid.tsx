import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { CatalogProduct } from "@/types/catalog";

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) {
    return <p className="text-black/60">Aucun produit ne correspond à ces filtres.</p>;
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <Link href={`/produit/${product.slug}`} className="group block">
            <div className="aspect-square overflow-hidden bg-white">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.image_alt ?? product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-black/30"
                  style={product.color_hex ? { backgroundColor: `${product.color_hex}20` } : undefined}
                >
                  Photo à venir
                </div>
              )}
            </div>
            <div className="mt-3 space-y-1">
              <h3 className="text-sm uppercase tracking-widest">{product.name}</h3>
              <p className="text-sm text-black/60">
                {formatPrice(product.price_cents, product.currency)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
