import type { Metadata } from "next";
import Image from "next/image";
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

  const placeholderStyle = product.color
    ? { backgroundColor: `color-mix(in srgb, ${product.color.hex} 14%, #f4ede3)` }
    : undefined;

  return (
    <article className="grid gap-16 lg:grid-cols-2">
      <div className="space-y-4">
        {product.images.length > 0 ? (
          product.images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden border border-line bg-sand"
            >
              <Image
                src={image.url}
                alt={image.alt ?? product.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <div
            className="flex aspect-square items-center justify-center border border-line bg-sand text-[0.65rem] uppercase tracking-[0.25em] text-muted/60"
            style={placeholderStyle}
          >
            Photo à venir
          </div>
        )}
      </div>

      <div className="space-y-10 lg:pt-6">
        <header className="space-y-3">
          <Link
            href={`/boutique/${product.category.slug}`}
            className="text-[0.65rem] uppercase tracking-[0.25em] text-clay"
          >
            {product.category.name}
          </Link>
          <h1 className="text-3xl">{product.name}</h1>
        </header>

        {product.siblings.length > 1 && (
          <div className="space-y-3">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">
              Couleur{product.color ? ` — ${product.color.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-3">
              {product.siblings.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={`/produit/${sibling.slug}`}
                  title={sibling.color.name}
                  aria-current={sibling.slug === product.slug ? "true" : undefined}
                  className={`h-9 w-9 rounded-full border transition-transform hover:scale-110 ${
                    sibling.slug === product.slug
                      ? "border-ink ring-1 ring-ink ring-offset-2 ring-offset-cream"
                      : "border-line"
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

        {product.description && (
          <p className="border-t border-line pt-8 text-muted">{product.description}</p>
        )}
      </div>
    </article>
  );
}
