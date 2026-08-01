import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/product-purchase";
import { getProductBySlug } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

// Rendu à la demande puis mis en cache 1 h : le build ne dépend pas de la base.
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Produit",
    description: product?.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <article className="grid gap-12 lg:grid-cols-2">
      <div className="space-y-4">
        {product.images.length > 0 ? (
          product.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={image.url}
              alt={image.alt ?? product.name}
              className="w-full bg-white object-cover"
            />
          ))
        ) : (
          <div
            className="flex aspect-square items-center justify-center bg-white text-xs uppercase tracking-widest text-black/30"
            style={product.color ? { backgroundColor: `${product.color.hex}20` } : undefined}
          >
            Photo à venir
          </div>
        )}
      </div>

      <div className="space-y-8">
        <header className="space-y-2">
          <Link
            href={`/boutique/${product.category.slug}`}
            className="text-xs uppercase tracking-widest text-black/50"
          >
            {product.category.name}
          </Link>
          <h1 className="text-2xl uppercase tracking-[0.2em]">{product.name}</h1>
        </header>

        {product.siblings.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-black/50">
              Couleur{product.color ? ` — ${product.color.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.siblings.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={`/produit/${sibling.slug}`}
                  title={sibling.color.name}
                  aria-current={sibling.slug === product.slug ? "true" : undefined}
                  className={`h-8 w-8 rounded-full border-2 ${
                    sibling.slug === product.slug ? "border-black" : "border-black/15"
                  }`}
                  style={{ backgroundColor: sibling.color.hex }}
                >
                  <span className="sr-only">{sibling.color.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <ProductPurchase product={product} />

        {product.description && <p className="text-black/70">{product.description}</p>}
      </div>
    </article>
  );
}
