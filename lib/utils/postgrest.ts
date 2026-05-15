/**
 * Sanitise une chaîne de recherche avant interpolation dans un filtre PostgREST .or().
 * Supprime les caractères de syntaxe PostgREST qui permettraient d'injecter
 * des clauses supplémentaires ou de manipuler la logique de requête.
 */
export function sanitizePostgrestSearchTerm(input: string, maxLength = 100): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[,(){}'"\\]/g, "");
}
