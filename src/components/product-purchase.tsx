"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { ProductDetail } from "@/types/catalog";

/**
 * Sélecteur de taille + ajout au panier.
 * TODO(panier) : brancher `selectedVariant` sur le panier puis Stripe Checkout.
 */
export function ProductPurchase({ product }: { product: ProductDetail }) {
  const hasSizes = product.variants.some((variant) => variant.size !== null);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");

  const selectedVariant = product.variants.find((variant) => variant.id === variantId);
  const priceCents = selectedVariant?.price_cents ?? product.price_cents;

  return (
    <div className="space-y-8">
      <p className="text-2xl font-light">{formatPrice(priceCents, product.currency)}</p>

      {hasSizes && (
        <fieldset className="space-y-3">
          <legend className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">Taille</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                aria-pressed={variant.id === variantId}
                className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
                  variant.id === variantId
                    ? "border-ink bg-ink text-cream"
                    : "border-line text-muted hover:border-clay hover:text-ink"
                }`}
              >
                {variant.size?.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="w-full bg-night px-6 py-4 text-xs uppercase tracking-[0.25em] text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:bg-dune disabled:text-muted"
        >
          Ajouter au panier
        </button>
        <p className="text-xs text-muted">
          Panier et paiement Stripe : prochaine étape du chantier.
        </p>
      </div>

      {selectedVariant && (
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted/70">
          Réf. {selectedVariant.sku}
        </p>
      )}
    </div>
  );
}
