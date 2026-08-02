-- =============================================================================
-- LINÉ — jeu de données catalogue au lancement
--
--   4 catégories bijoux × 9 couleurs   = 36 fiches
--   + 2 styles de lunettes de soleil   =  2 fiches
--                                        --------
--                                        38 produits
--
--   Tous les produits sont en taille unique : 1 variante par fiche,
--   soit 38 variantes. (Les bagues aussi : pas de tailles 52 → 60.)
--
-- Tous les prix sont à 0 € (placeholder, à mettre à jour avant ouverture).
-- Script idempotent : peut être rejoué sans dupliquer de données.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Catégories
-- -----------------------------------------------------------------------------
insert into categories (slug, code, name, singular_name, description, has_colors, position) values
  ('bagues',             'BAG', 'Bagues',              'Bague',              'Bagues LINÉ, à porter seules ou empilées.',        true,  1),
  ('bracelets',          'BRA', 'Bracelets',           'Bracelet',           'Bracelets LINÉ, fins et portables au quotidien.',  true,  2),
  ('colliers',           'COL', 'Colliers',            'Collier',            'Colliers LINÉ, chaînes et pendentifs.',            true,  3),
  ('boucles-d-oreilles', 'BOU', 'Boucles d''oreilles', 'Boucles d''oreilles','Boucles d''oreilles LINÉ, discrètes ou statement.', true,  4),
  ('lunettes-de-soleil', 'LUN', 'Lunettes de soleil',  'Lunettes de soleil', 'Deux montures solaires signées LINÉ.',             false, 5)
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
-- `hex` = pastille affichée dans les filtres et le sélecteur de couleur.
-- Les neuf teintes sont échantillonnées sur les photos des bagues.
-- Deux écarts assumés :
--   * blanc : sur la photo, la nacre est si réchauffée par l'éclairage
--     (#EAD9CB) qu'une pastille fidèle se confondrait avec le fond du site ;
--     on garde un blanc cassé lisible.
--   * marron : la pierre photographiée est un rouge sombre (cornaline), pas
--     un brun. La pastille suit la photo ; c'est le libellé « Marron » qui
--     reste à trancher.
--   * bleu foncé : la bague (#03164B) est bien plus sombre que les boucles
--     (#082D7B). La pastille se cale entre les deux — au plus sombre elle ne
--     se distinguerait plus du noir.
insert into colors (slug, code, name, hex, position) values
  ('or',          'OR', 'Or',          '#F0C070', 1),
  ('argent',      'AR', 'Argent',      '#D1CEC9', 2),
  ('bleu-fonce',  'BF', 'Bleu foncé',  '#0A2260', 3),
  ('bleu-clair',  'BC', 'Bleu clair',  '#A0B0B0', 4),
  ('marron',      'MA', 'Marron',      '#4F0201', 5),
  ('rose',        'RO', 'Rose',        '#E8A8A8', 6),
  ('jaune',       'JA', 'Jaune',       '#F8C152', 7),
  ('blanc',       'BL', 'Blanc',       '#F4F1EC', 8),
  ('noir',        'NO', 'Noir',        '#0D0B09', 9)
on conflict (slug) do update set
  code     = excluded.code,
  name     = excluded.name,
  hex      = excluded.hex,
  position = excluded.position;

-- -----------------------------------------------------------------------------
-- Tailles
-- -----------------------------------------------------------------------------
-- Aucune : tout le catalogue est en taille unique, bagues comprises.
-- Les tables `sizes` et `category_sizes` restent disponibles — le jour où une
-- catégorie sera déclinée en tailles, il suffira d'y ajouter des lignes et de
-- créer une variante par taille : le sélecteur apparaît alors tout seul.

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
  c.singular_name || ' LINÉ, finition ' || lower(col.name) || '. Description à compléter.',
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
    ('lunettes-de-soleil-style-1', 'Lunettes de soleil — Style 1', 'Monture solaire LINÉ, style 1. Description à compléter.', 1),
    ('lunettes-de-soleil-style-2', 'Lunettes de soleil — Style 2', 'Monture solaire LINÉ, style 2. Description à compléter.', 2)
  ) as v (slug, name, description, pos) on true
where c.slug = 'lunettes-de-soleil'
on conflict (slug) do update set
  name        = excluded.name,
  category_id = excluded.category_id,
  description = excluded.description,
  position    = excluded.position;

-- -----------------------------------------------------------------------------
-- Variantes : une seule par fiche (taille unique) = 38
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

-- -----------------------------------------------------------------------------
-- Photos produits
-- -----------------------------------------------------------------------------
-- Fichiers servis depuis /public. Le jour où les photos passeront sur Supabase
-- Storage, seule cette URL change (la colonne accepte aussi une URL absolue).
insert into product_images (product_id, url, alt, position, is_primary)
select p.id, v.url, v.alt, 0, true
from products p
  join (values
    ('bague-or',         '/produits/bague-or.webp',         'Bague trèfle LINÉ, finition or'),
    ('bague-blanc',      '/produits/bague-blanc.webp',      'Bague trèfle LINÉ, nacre blanche'),
    ('bague-rose',       '/produits/bague-rose.webp',       'Bague trèfle LINÉ, nacre rose'),
    ('bague-bleu-clair', '/produits/bague-bleu-clair.webp', 'Bague trèfle LINÉ, nacre bleu clair'),
    ('bague-bleu-fonce', '/produits/bague-bleu-fonce.webp', 'Bague trèfle LINÉ, laque bleu foncé'),
    ('bague-jaune',      '/produits/bague-jaune.webp',      'Bague trèfle LINÉ, pierre jaune ambre'),
    ('bague-noir',       '/produits/bague-noir.webp',       'Bague trèfle LINÉ, onyx noir'),
    ('bague-marron',     '/produits/bague-marron.webp',     'Bague trèfle LINÉ, pierre rouge sombre'),
    ('boucles-d-oreilles-or',
     '/produits/boucles-d-oreilles-or.webp',
     'Boucles d''oreilles trèfle LINÉ, finition or'),
    ('boucles-d-oreilles-blanc',
     '/produits/boucles-d-oreilles-blanc.webp',
     'Boucles d''oreilles trèfle LINÉ, nacre blanche'),
    ('boucles-d-oreilles-rose',
     '/produits/boucles-d-oreilles-rose.webp',
     'Boucles d''oreilles trèfle LINÉ, nacre rose'),
    ('boucles-d-oreilles-jaune',
     '/produits/boucles-d-oreilles-jaune.webp',
     'Boucles d''oreilles trèfle LINÉ, pierre jaune'),
    ('boucles-d-oreilles-bleu-clair',
     '/produits/boucles-d-oreilles-bleu-clair.webp',
     'Boucles d''oreilles trèfle LINÉ, pierre bleu clair'),
    ('boucles-d-oreilles-bleu-fonce',
     '/produits/boucles-d-oreilles-bleu-fonce.webp',
     'Boucles d''oreilles trèfle LINÉ, pierre bleu foncé'),
    ('boucles-d-oreilles-marron',
     '/produits/boucles-d-oreilles-marron.webp',
     'Boucles d''oreilles trèfle LINÉ, pierre rouge sombre'),
    ('boucles-d-oreilles-noir',
     '/produits/boucles-d-oreilles-noir.webp',
     'Boucles d''oreilles trèfle LINÉ, onyx noir'),
    ('bracelet-or',
     '/produits/bracelet-or.webp',
     'Bracelet LINÉ à cinq trèfles, finition or'),
    ('bracelet-blanc',
     '/produits/bracelet-blanc.webp',
     'Bracelet LINÉ à cinq trèfles, nacre blanche'),
    ('bracelet-rose',
     '/produits/bracelet-rose.webp',
     'Bracelet LINÉ à cinq trèfles, nacre rose'),
    ('bracelet-jaune',
     '/produits/bracelet-jaune.webp',
     'Bracelet LINÉ à cinq trèfles, pierre jaune'),
    ('bracelet-bleu-clair',
     '/produits/bracelet-bleu-clair.webp',
     'Bracelet LINÉ à cinq trèfles, pierre bleu clair'),
    ('bracelet-bleu-fonce',
     '/produits/bracelet-bleu-fonce.webp',
     'Bracelet LINÉ à cinq trèfles, pierre bleu foncé'),
    ('bracelet-marron',
     '/produits/bracelet-marron.webp',
     'Bracelet LINÉ à cinq trèfles, pierre rouge sombre'),
    ('bracelet-noir',
     '/produits/bracelet-noir.webp',
     'Bracelet LINÉ à cinq trèfles, onyx noir'),
    ('bague-argent',
     '/produits/bague-argent.webp',
     'Bague trèfle LINÉ, finition argent'),
    ('boucles-d-oreilles-argent',
     '/produits/boucles-d-oreilles-argent.webp',
     'Boucles d''oreilles trèfle LINÉ, finition argent'),
    ('bracelet-argent',
     '/produits/bracelet-argent.webp',
     'Bracelet LINÉ à cinq trèfles, finition argent'),
    ('collier-or',
     '/produits/collier-or.webp',
     'Collier LINÉ à cinq trèfles, finition or'),
    ('collier-argent',
     '/produits/collier-argent.webp',
     'Collier LINÉ à cinq trèfles, finition argent'),
    ('collier-blanc',
     '/produits/collier-blanc.webp',
     'Collier LINÉ à cinq trèfles, nacre blanche'),
    ('collier-rose',
     '/produits/collier-rose.webp',
     'Collier LINÉ à cinq trèfles, nacre rose'),
    ('collier-jaune',
     '/produits/collier-jaune.webp',
     'Collier LINÉ à cinq trèfles, pierre jaune')
  ) as v (slug, url, alt) on v.slug = p.slug
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.url = v.url
);
