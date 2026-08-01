-- =============================================================================
-- Line — jeu de données catalogue au lancement
--
--   4 catégories bijoux × 9 couleurs   = 36 fiches
--   + 2 styles de lunettes de soleil   =  2 fiches
--                                        --------
--                                        38 produits
--
--   Bagues : 9 tailles (52 → 60) → 81 variantes
--   Autres : 1 variante unique   → 29 variantes
--                                  ------------
--                                  110 variantes
--
-- Tous les prix sont à 0 € (placeholder, à mettre à jour avant ouverture).
-- Script idempotent : peut être rejoué sans dupliquer de données.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Catégories
-- -----------------------------------------------------------------------------
insert into categories (slug, code, name, singular_name, description, has_colors, position) values
  ('bagues',             'BAG', 'Bagues',              'Bague',              'Bagues Line, à porter seules ou empilées.',        true,  1),
  ('bracelets',          'BRA', 'Bracelets',           'Bracelet',           'Bracelets Line, fins et portables au quotidien.',  true,  2),
  ('colliers',           'COL', 'Colliers',            'Collier',            'Colliers Line, chaînes et pendentifs.',            true,  3),
  ('boucles-d-oreilles', 'BOU', 'Boucles d''oreilles', 'Boucles d''oreilles','Boucles d''oreilles Line, discrètes ou statement.', true,  4),
  ('lunettes-de-soleil', 'LUN', 'Lunettes de soleil',  'Lunettes de soleil', 'Deux montures solaires signées Line.',             false, 5)
on conflict (slug) do update set
  code          = excluded.code,
  name          = excluded.name,
  singular_name = excluded.singular_name,
  description   = excluded.description,
  has_colors    = excluded.has_colors,
  position      = excluded.position;

-- -----------------------------------------------------------------------------
-- Couleurs
-- -----------------------------------------------------------------------------
insert into colors (slug, code, name, hex, position) values
  ('or',          'OR', 'Or',          '#C9A227', 1),
  ('argent',      'AR', 'Argent',      '#C0C0C0', 2),
  ('bleu-fonce',  'BF', 'Bleu foncé',  '#1B3A6B', 3),
  ('bleu-clair',  'BC', 'Bleu clair',  '#7FB3D5', 4),
  ('marron',      'MA', 'Marron',      '#6B4226', 5),
  ('rose',        'RO', 'Rose',        '#E8A0B4', 6),
  ('jaune',       'JA', 'Jaune',       '#F2C744', 7),
  ('blanc',       'BL', 'Blanc',       '#F5F5F0', 8),
  ('noir',        'NO', 'Noir',        '#1A1A1A', 9)
on conflict (slug) do update set
  code     = excluded.code,
  name     = excluded.name,
  hex      = excluded.hex,
  position = excluded.position;

-- -----------------------------------------------------------------------------
-- Tailles de bagues : 52 → 60
-- -----------------------------------------------------------------------------
insert into sizes (slug, label, position)
select g::text, g::text, g - 51
from generate_series(52, 60) as g
on conflict (slug) do update set
  label    = excluded.label,
  position = excluded.position;

-- Rattachement : seules les bagues ont un sélecteur de taille.
insert into category_sizes (category_id, size_id, position)
select c.id, s.id, s.position
from categories c
  join sizes s on true
where c.slug = 'bagues'
on conflict (category_id, size_id) do update set position = excluded.position;

-- -----------------------------------------------------------------------------
-- Produits bijoux : une fiche par couple catégorie × couleur (36)
-- -----------------------------------------------------------------------------
with slug_base (category_slug, base) as (
  values
    ('bagues',             'bague'),
    ('bracelets',          'bracelet'),
    ('colliers',           'collier'),
    ('boucles-d-oreilles', 'boucles-d-oreilles')
)
insert into products (slug, name, category_id, color_id, description, price_cents, status, position)
select
  b.base || '-' || col.slug,
  c.singular_name || ' ' || lower(col.name),
  c.id,
  col.id,
  c.singular_name || ' Line, finition ' || lower(col.name) || '. Description à compléter.',
  0,
  'active',
  c.position * 100 + col.position
from categories c
  join slug_base b on b.category_slug = c.slug
  join colors col on true
where c.has_colors
on conflict (slug) do update set
  name        = excluded.name,
  category_id = excluded.category_id,
  color_id    = excluded.color_id,
  description = excluded.description,
  position    = excluded.position;

-- -----------------------------------------------------------------------------
-- Produits lunettes de soleil : 2 styles, sans déclinaison couleur
-- -----------------------------------------------------------------------------
insert into products (slug, name, category_id, color_id, description, price_cents, status, position)
select v.slug, v.name, c.id, null, v.description, 0, 'active', c.position * 100 + v.pos
from categories c
  join (values
    ('lunettes-de-soleil-style-1', 'Lunettes de soleil — Style 1', 'Monture solaire Line, style 1. Description à compléter.', 1),
    ('lunettes-de-soleil-style-2', 'Lunettes de soleil — Style 2', 'Monture solaire Line, style 2. Description à compléter.', 2)
  ) as v (slug, name, description, pos) on true
where c.slug = 'lunettes-de-soleil'
on conflict (slug) do update set
  name        = excluded.name,
  category_id = excluded.category_id,
  description = excluded.description,
  position    = excluded.position;

-- -----------------------------------------------------------------------------
-- Variantes avec taille (bagues) : 9 couleurs × 9 tailles = 81
-- -----------------------------------------------------------------------------
insert into product_variants (product_id, size_id, sku, stock, position)
select
  p.id,
  s.id,
  'LJ-' || c.code || '-' || col.code || '-' || s.slug,
  0,
  cs.position
from products p
  join categories c      on c.id = p.category_id
  join category_sizes cs on cs.category_id = c.id
  join sizes s           on s.id = cs.size_id
  join colors col        on col.id = p.color_id
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Variantes uniques (tout produit dont la catégorie n'a pas de tailles) : 29
-- -----------------------------------------------------------------------------
insert into product_variants (product_id, size_id, sku, stock, position)
select
  p.id,
  null,
  'LJ-' || c.code || '-' || coalesce(col.code, lpad((p.position % 100)::text, 2, '0')),
  0,
  0
from products p
  join categories c on c.id = p.category_id
  left join colors col on col.id = p.color_id
where not exists (select 1 from category_sizes cs where cs.category_id = c.id)
on conflict do nothing;
