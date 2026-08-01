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
    <div className="space-y-6">
      <p className="text-lg">{formatPrice(priceCents, product.currency)}</p>

      {hasSizes && (
        <fieldset className="space-y-2">
          <legend className="text-xs uppercase tracking-widest text-black/50">Taille</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                aria-pressed={variant.id === variantId}
                className={`border px-4 py-2 text-sm ${
                  variant.id === variantId ? "border-black" : "border-black/15"
                }`}
              >
                {variant.size?.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full border border-black bg-black px-6 py-3 text-sm uppercase tracking-widest text-white disabled:opacity-40"
        >
          Ajouter au panier
        </button>
        <p className="text-xs text-black/50">
          Panier et paiement Stripe : prochaine étape du chantier.
        </p>
      </div>

      {selectedVariant && (
        <p className="text-xs text-black/40">Réf. {selectedVariant.sku}</p>
      )}
    </div>
  );
}
