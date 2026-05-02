// Tag values that come from the Ghost import flow (and historical
// status markers) but should never render as a category chip.
// `bea1fdf` cleaned them out of every committed post; this guard
// stays so a future vault-sync or one-off re-import can't silently
// reintroduce them.
const NOISE_TAGS = new Set(['empty-coffee', 'published', 'draft', 'idea']);

export function displayableTags(tags: readonly string[] | undefined): string[] {
  if (!tags) return [];
  return tags.filter(t => !NOISE_TAGS.has(t));
}
