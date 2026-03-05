/**
 * Format and validate a BBL (Borough-Block-Lot) identifier.
 */
export function formatBBL(bbl: string): string {
  const trimmed = bbl.trim()
  if (!trimmed) throw new Error('BBL cannot be empty')
  return trimmed
}
