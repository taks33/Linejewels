# Schéma catalogue

Source : [`supabase/migrations/0001_catalog.sql`](../supabase/migrations/0001_catalog.sql)
Données de départ : [`supabase/seed.sql`](../supabase/seed.sql)

## Le modèle en une phrase

Un **produit** est un couple *catégorie × couleur* (une fiche = « Bague or »), une
**variante** est la déclinaison achetable de cette fiche (la taille, pour les bagues).

```mermaid
erDiagram
    categories ||--o{ products : "contient"
    colors     ||--o{ products : "décline"
    categories ||--o{ category_sizes : "propose"
    sizes      ||--o{ category_sizes : ""
    products   ||--o{ product_variants : "se décline en"
    sizes      ||--o{ product_variants : "dimensionne"
    products   ||--o{ product_images : "illustre"
```

## Pourquoi ce découpage

Le brief demande 36 fiches bijoux **et** un sélecteur de couleur sur la fiche produit.
Deux lectures étaient possibles :

| Option | Fiches | Conséquence |
| --- | --- | --- |
| Produit = catégorie, couleur = variante | 4 | Contredit les « 36 fiches » ; grille boutique à 4 cartes |
| **Produit = catégorie × couleur** (retenu) | **36** | Grille et filtres se lisent directement sur `products` ; le sélecteur de couleur navigue entre fiches sœurs |

Retenu : la seconde. Chaque couleur a sa propre URL (`/produit/bague-or`), ses propres
photos et son propre référencement — ce qu'on veut pour du bijou, où la couleur est
l'argument visuel principal. Le sélecteur de couleur de la fiche est un jeu de liens
vers les produits de la même catégorie (`ProductDetail.siblings`).

## Tables

| Table | Rôle | Lignes au lancement |
| --- | --- | --- |
| `categories` | Rubriques (4 bijoux + lunettes). `has_colors` dit si la catégorie est déclinée en couleurs. | 5 |
| `colors` | Les 9 couleurs, avec `hex` pour les pastilles de filtre. | 9 |
| `sizes` | Tailles génériques (52 → 60). | 9 |
| `category_sizes` | Quelles tailles pour quelle catégorie. Aujourd'hui : bagues seulement. | 9 |
| `products` | Une fiche. `category_id` + `color_id` (NULL pour les lunettes). | 38 |
| `product_variants` | Ce qu'on met au panier. `size_id` NULL = variante unique. | 110 |
| `product_images` | Photos, `is_primary` pour la vignette de la grille. | 0 |

Décompte des variantes : bagues 9 couleurs × 9 tailles = 81, plus 29 produits à
variante unique (27 bijoux + 2 lunettes) = 110.

## Points à connaître

- **Prix en centimes** (`price_cents`), tous à `0` pour l'instant. Le prix vit sur la
  fiche ; `product_variants.price_cents` peut le surcharger (une taille plus chère) et
  vaut `NULL` par défaut = « hérite de la fiche ».
- **SKU** composés depuis les codes courts : `LJ-<catégorie>-<couleur>[-<taille>]`,
  ex. `LJ-BAG-OR-52`, `LJ-COL-NO`, `LJ-LUN-01`.
- **Unicité** : index partiel sur `(category_id, color_id)` — impossible d'avoir deux
  fiches « Collier noir ». Index `nulls not distinct` sur `(product_id, size_id)` —
  une seule variante par taille, et une seule variante sans taille.
- **RLS** activée partout. Le public ne lit que les produits `status = 'active'` ;
  les écritures passent par la clé `service_role` (back-office, scripts).
- **Vue `catalog_products`** : produit + catégorie + couleur + image principale +
  stock total, en `security_invoker` (la RLS des tables reste appliquée). C'est ce que
  lit la grille boutique, en une requête.
- **Stripe** : `products.stripe_product_id` et `product_variants.stripe_price_id` sont
  prêts mais vides. Ils seront remplis par le script de synchronisation catalogue →
  Stripe, quand les vrais prix seront saisis.

## Faire évoluer le schéma

Ajouter une couleur : une ligne dans `colors`, puis une fiche par catégorie
(`products`) et sa variante. Ajouter des tailles à une autre catégorie : des lignes
dans `sizes` (si besoin) et dans `category_sizes` — le sélecteur de taille de la fiche
apparaît automatiquement dès qu'une variante porte une taille.
