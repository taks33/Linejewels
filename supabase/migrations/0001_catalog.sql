-- =============================================================================
-- LINÉ — schéma catalogue produits
-- Catégories, couleurs, tailles, produits, variantes, images.
--
-- Modèle retenu :
--   * un PRODUIT = une catégorie × une couleur  (ex. « Bague or »)
--     -> 4 catégories bijoux × 9 couleurs = 36 fiches
--     -> + 2 fiches lunettes de soleil (sans couleur) = 38 produits
--   * une VARIANTE = la déclinaison achetable d'un produit (taille)
--     -> bagues : 9 tailles (52 → 60), soit 81 variantes
--     -> autres produits : 1 variante unique (size_id NULL)
--
-- Le sélecteur de couleur d'une fiche produit navigue entre les produits
-- frères de la même catégorie ; le sélecteur de taille choisit une variante.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Types
-- -----------------------------------------------------------------------------
do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception
  when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- updated_at automatique
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Catégories
-- -----------------------------------------------------------------------------
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  -- code court utilisé pour composer les SKU (ex. BAG, COL)
  code          text not null unique check (code ~ '^[A-Z]{2,4}$'),
  name          text not null,               -- « Bagues »   (libellé de rubrique)
  singular_name text not null,               -- « Bague »    (libellé d'une fiche)
  description   text,
  -- true : la catégorie est déclinée en couleurs (une fiche par couleur)
  has_colors    boolean not null default true,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists categories_position_idx on categories (position);

-- -----------------------------------------------------------------------------
-- Couleurs
-- -----------------------------------------------------------------------------
create table if not exists colors (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  code       text not null unique check (code ~ '^[A-Z]{2,4}$'),
  name       text not null,                  -- « Bleu foncé »
  -- couleur d'affichage de la pastille dans les filtres / le sélecteur
  hex        text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists colors_position_idx on colors (position);

-- -----------------------------------------------------------------------------
-- Tailles (bagues 52 → 60 aujourd'hui, extensible aux autres catégories)
-- -----------------------------------------------------------------------------
create table if not exists sizes (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,           -- « 52 »
  label      text not null,                  -- « 52 » (affichage)
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Quelles tailles sont proposées pour quelle catégorie.
-- Une catégorie sans ligne ici n'a pas de sélecteur de taille.
create table if not exists category_sizes (
  category_id uuid not null references categories (id) on delete cascade,
  size_id     uuid not null references sizes (id) on delete cascade,
  position    integer not null default 0,
  primary key (category_id, size_id)
);

create index if not exists category_sizes_size_idx on category_sizes (size_id);

-- -----------------------------------------------------------------------------
-- Produits (une fiche = catégorie × couleur)
-- -----------------------------------------------------------------------------
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,    -- « bague-or »
  name              text not null,           -- « Bague or »
  category_id       uuid not null references categories (id) on delete restrict,
  -- NULL pour les catégories sans déclinaison couleur (lunettes de soleil)
  color_id          uuid references colors (id) on delete restrict,
  description       text,
  -- Prix affiché de la fiche, en centimes. 0 € = placeholder au lancement.
  -- Une variante peut surcharger ce prix (product_variants.price_cents).
  price_cents       integer not null default 0 check (price_cents >= 0),
  currency          char(3) not null default 'EUR',
  status            product_status not null default 'active',
  is_featured       boolean not null default false,
  position          integer not null default 0,
  -- Référence Stripe (renseignée à la synchronisation catalogue → Stripe)
  stripe_product_id text unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Une seule fiche par couple catégorie / couleur.
create unique index if not exists products_category_color_key
  on products (category_id, color_id)
  where color_id is not null;

create index if not exists products_category_idx on products (category_id);
create index if not exists products_color_idx on products (color_id);
create index if not exists products_status_idx on products (status);

-- -----------------------------------------------------------------------------
-- Variantes (déclinaison achetable : taille pour les bagues, unique sinon)
-- -----------------------------------------------------------------------------
create table if not exists product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products (id) on delete cascade,
  -- NULL = variante unique (produit sans taille)
  size_id         uuid references sizes (id) on delete restrict,
  sku             text not null unique,      -- « LJ-BAG-OR-52 »
  -- NULL = hérite de products.price_cents
  price_cents     integer check (price_cents >= 0),
  stock           integer not null default 0 check (stock >= 0),
  is_active       boolean not null default true,
  position        integer not null default 0,
  stripe_price_id text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Une seule variante par couple produit / taille (NULL compris).
create unique index if not exists product_variants_product_size_key
  on product_variants (product_id, size_id) nulls not distinct;

create index if not exists product_variants_product_idx on product_variants (product_id);

-- -----------------------------------------------------------------------------
-- Images
-- -----------------------------------------------------------------------------
create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  -- chemin dans le bucket Supabase Storage, ou URL absolue
  url        text not null,
  alt        text,
  position   integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Une seule image principale par produit.
create unique index if not exists product_images_primary_key
  on product_images (product_id)
  where is_primary;

create index if not exists product_images_product_idx on product_images (product_id, position);

-- -----------------------------------------------------------------------------
-- Triggers updated_at
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'colors', 'sizes', 'products', 'product_variants', 'product_images'
  ] loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format(
      'create trigger set_updated_at before update on %I
         for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Vue de listing : tout ce qu'il faut pour une carte de la grille boutique
-- -----------------------------------------------------------------------------
create or replace view catalog_products as
select
  p.id,
  p.slug,
  p.name,
  p.description,
  p.price_cents,
  p.currency,
  p.status,
  p.is_featured,
  p.position,
  c.id       as category_id,
  c.slug     as category_slug,
  c.name     as category_name,
  col.id     as color_id,
  col.slug   as color_slug,
  col.name   as color_name,
  col.hex    as color_hex,
  img.url    as image_url,
  img.alt    as image_alt,
  coalesce(stock.total, 0) as total_stock
from products p
  join categories c on c.id = p.category_id
  left join colors col on col.id = p.color_id
  left join lateral (
    select pi.url, pi.alt
    from product_images pi
    where pi.product_id = p.id
    order by pi.is_primary desc, pi.position
    limit 1
  ) img on true
  left join lateral (
    select sum(v.stock) as total
    from product_variants v
    where v.product_id = p.id and v.is_active
  ) stock on true;

-- -----------------------------------------------------------------------------
-- RLS : catalogue en lecture publique, écriture réservée au service role
-- (le service role contourne RLS ; aucune policy d'écriture n'est créée)
-- -----------------------------------------------------------------------------
alter table categories       enable row level security;
alter table colors           enable row level security;
alter table sizes            enable row level security;
alter table category_sizes   enable row level security;
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table product_images   enable row level security;

drop policy if exists "categories readable by everyone" on categories;
create policy "categories readable by everyone"
  on categories for select using (true);

drop policy if exists "colors readable by everyone" on colors;
create policy "colors readable by everyone"
  on colors for select using (true);

drop policy if exists "sizes readable by everyone" on sizes;
create policy "sizes readable by everyone"
  on sizes for select using (true);

drop policy if exists "category_sizes readable by everyone" on category_sizes;
create policy "category_sizes readable by everyone"
  on category_sizes for select using (true);

-- Seuls les produits publiés sont exposés au public.
drop policy if exists "active products readable by everyone" on products;
create policy "active products readable by everyone"
  on products for select using (status = 'active');

drop policy if exists "variants of active products readable by everyone" on product_variants;
create policy "variants of active products readable by everyone"
  on product_variants for select using (
    exists (select 1 from products p where p.id = product_id and p.status = 'active')
  );

drop policy if exists "images of active products readable by everyone" on product_images;
create policy "images of active products readable by everyone"
  on product_images for select using (
    exists (select 1 from products p where p.id = product_id and p.status = 'active')
  );

-- La vue s'exécute avec les droits de l'appelant (RLS des tables sous-jacentes).
alter view catalog_products set (security_invoker = on);
