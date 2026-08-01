# Line — bijoux

Boutique en ligne Line : bagues, bracelets, colliers, boucles d'oreilles et lunettes
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
psql "$SUPABASE_DB_URL" -f supabase/seed.sql         # 38 produits, 110 variantes
```

En local (`supabase start`), `supabase db reset` rejoue migrations + seed d'un coup.
Le seed est idempotent : le rejouer ne duplique rien.

Ce que contient le catalogue au lancement :

- 4 catégories bijoux × 9 couleurs = **36 fiches**, plus **2 fiches lunettes** = 38 produits
- bagues déclinées en tailles 52 → 60, soit **110 variantes** achetables
- **tous les prix à 0 €** — placeholder à remplacer avant l'ouverture

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
- [ ] Photos produits (bucket Supabase Storage) et vrais prix
- [ ] Synchronisation catalogue → Stripe (`stripe_product_id`, `stripe_price_id`)
