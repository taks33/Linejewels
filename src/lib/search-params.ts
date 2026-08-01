/** Normalise `?couleur=or&couleur=noir` en liste de slugs. */
export function parseColorParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}
