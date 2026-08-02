import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { CatalogProduct } from "@/types/catalog";

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="border border-line bg-sand px-6 py-12 text-center text-sm text-muted">
        Aucun produit ne correspond à ces filtres.
      </p>
    );
  }

  return (
    <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <Link href={`/produit/${product.slug}`} className="group block">
            <div className="aspect-square overflow-hidden border border-line bg-sand">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.image_alt ?? product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[0.65rem] uppercase tracking-[0.25em] text-muted/60"
                  style={
                    product.color_hex
                      ? { backgroundColor: `color-mix(in srgb, ${product.color_hex} 14%, #f4ede3)` }
                      : undefined
                  }
                >
                  Photo à venir
                </div>
              )}
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-sm uppercase tracking-[0.15em] transition-colors group-hover:text-clay">
                {product.name}
              </h3>
              <p className="text-sm text-muted">
                {formatPrice(product.price_cents, product.currency)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
