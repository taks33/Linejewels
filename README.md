# LINÉ — bijoux

Boutique en ligne LINÉ : bagues, bracelets, colliers, boucles d'oreilles et lunettes
de soleil.

**Stack** : Next.js 15 (App Router) · PostgreSQL via Supabase · Stripe Checkout · Vercel

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev
```

## Base de données

Le schéma catalogue vit dans `supabase/migrations/`, les données de départ dans
`supabase/seed.sql`. Le modèle (et le pourquoi) est documenté dans
[`docs/schema.md`](docs/schema.md).

Avec la CLI Supabase liée au projet :

```bash
supabase db push                                     # applique les migrations
psql "$SUPABASE_DB_URL" -f supabase/seed.sql         # 38 produits, 38 variantes, 21 photos
```

En local (`supabase start`), `supabase db reset` rejoue migrations + seed d'un coup.
Le seed est idempotent : le rejouer ne duplique rien.

Ce que contient le catalogue au lancement :

- 4 catégories bijoux × 9 couleurs = **36 fiches**, plus **2 fiches lunettes** = 38 produits
- tout en **taille unique** : une variante achetable par fiche, soit 38 variantes
- **21 photos** : bagues 8/9, boucles d'oreilles 8/9, bracelets 5/9 — servies depuis
  `public/produits/`
- **tous les prix à 0 €** — placeholder à remplacer avant l'ouverture

## Direction artistique

Palette de beiges construite à partir du logo : le beige de référence `#CDBBA3` est
échantillonné directement sur le wordmark. Les jetons sont définis dans
`src/app/globals.css` et utilisables comme classes Tailwind (`bg-sand`, `text-clay`…).

| Jeton | Valeur | Usage |
| --- | --- | --- |
| `cream` | `#FBF8F3` | fond de page |
| `sand` | `#F4EDE3` | cartes, surfaces |
| `dune` | `#EAE0D2` | survols, aplats photo |
| `line` | `#DCD0BE` | filets et bordures |
| `brand` | `#CDBBA3` | beige du logo |
| `clay` | `#A8977E` | liens, focus |
| `ink` | `#2A2521` | texte |
| `muted` | `#746A5D` | texte secondaire |
| `night` | `#121110` | bandeaux et boutons pleins |

Typographie : Cormorant Garamond (titres, proche du wordmark) et Jost (interface).

Logo : `public/logo-line.png` (wordmark détouré sur fond transparent), `src/app/icon.png`
(favicon) et `src/app/opengraph-image.png` (partage social) sont dérivés du fichier fourni.

## Structure

```
src/
  app/
    page.tsx                     Accueil
    boutique/page.tsx            Grille générale + filtres catégorie / couleur
    boutique/[categorie]/        Pages dédiées par catégorie
    produit/[slug]/              Fiche produit (couleurs, tailles)
  components/                    Grille, filtres, bloc d'achat
  lib/catalog.ts                 Toutes les lectures catalogue
  lib/supabase/server.ts         Clients Supabase (anon + service_role)
  types/catalog.ts               Types du catalogue
supabase/
  migrations/0001_catalog.sql    Schéma
  seed.sql                       Catalogue de lancement
docs/schema.md                   Modèle de données
```

## Reste à faire

- [ ] Panier (état client + persistance)
- [ ] Tunnel de commande et Stripe Checkout (+ webhook de confirmation)
- [ ] Tables `orders` / `order_items` / clients, rattachées à `auth.users`
- [ ] Compte client : connexion Supabase Auth, historique de commandes
- [ ] Pages Contact, À propos, Mentions légales, CGV
- [ ] Photos des 17 produits restants, et bascule des photos vers Supabase Storage
- [ ] Synchronisation catalogue → Stripe (`stripe_product_id`, `stripe_price_id`)
