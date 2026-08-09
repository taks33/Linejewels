"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductDetail } from "@/types/catalog";

type Props = {
  images: ProductDetail["images"];
  productName: string;
  /** Teinte de repli quand le produit n'a pas encore de photo. */
  placeholderColor?: string | null;
};

/**
 * Galerie de la fiche produit : une photo de couverture, et les autres angles
 * accessibles au doigt (défilement horizontal), aux flèches ou aux vignettes.
 *
 * Le défilement natif fait le travail — scroll-snap donne le glissement au
 * doigt sur mobile sans dépendance, et les flèches ne servent qu'au pointeur.
 */
export function ProductGallery({ images, productName, placeholderColor }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }, []);

  // L'index suit le défilement, quelle que soit son origine (doigt, flèches,
  // barre de défilement), plutôt que d'être piloté par les seuls boutons.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-square items-center justify-center border border-line bg-sand text-[0.65rem] uppercase tracking-[0.25em] text-muted/60"
        style={
          placeholderColor
            ? { backgroundColor: `color-mix(in srgb, ${placeholderColor} 14%, #f4ede3)` }
            : undefined
        }
      >
        Photo à venir
      </div>
    );
  }

  const hasMany = images.length > 1;

  return (
    <div className="space-y-3">
      <div className="group relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carrousel"
          aria-label={`Photos — ${productName}`}
        >
          {images.map((image, position) => (
            <div
              key={image.id}
              className="relative aspect-square w-full flex-none snap-center border border-line bg-sand"
              aria-roledescription="diapositive"
              aria-label={`${position + 1} sur ${images.length}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? productName}
                fill
                priority={position === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {hasMany && (
          <>
            <GalleryArrow
              direction="prev"
              disabled={index === 0}
              onClick={() => scrollTo(index - 1)}
            />
            <GalleryArrow
              direction="next"
              disabled={index === images.length - 1}
              onClick={() => scrollTo(index + 1)}
            />
            <p className="pointer-events-none absolute bottom-3 right-3 bg-cream/85 px-2 py-1 text-[0.65rem] tracking-widest text-muted">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {hasMany && (
        <ul className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, position) => (
            <li key={image.id} className="flex-none">
              <button
                type="button"
                onClick={() => scrollTo(position)}
                aria-label={`Voir la photo ${position + 1}`}
                aria-current={position === index}
                className={`relative h-20 w-20 overflow-hidden border transition-colors ${
                  position === index ? "border-ink" : "border-line hover:border-clay"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className={`object-cover transition-opacity ${
                    position === index ? "opacity-100" : "opacity-70"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Photo précédente" : "Photo suivante"}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-cream/90 text-ink transition-opacity hover:bg-cream disabled:pointer-events-none disabled:opacity-0 sm:flex ${
        isPrev ? "left-3" : "right-3"
      }`}
    >
      <span aria-hidden>{isPrev ? "←" : "→"}</span>
    </button>
  );
}
