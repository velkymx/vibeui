// CSS length values: auto, zero, or a number followed by a known unit.
const SAFE_LENGTH = /^(auto|0|[\d.]+(%|px|rem|em|vh|vw|dvh|dvw|svh|svw|ch|ex|vmin|vmax))$/

// CSS color values: hex, rgb/rgba, hsl/hsla, var(--*), or bare CSS keyword.
// The bare keyword branch is intentionally loose (consumers pick from a design system)
// but it blocks the most dangerous forms: javascript:, expression(), url().
const SAFE_COLOR = /^(#[0-9a-fA-F]{3,8}|rgba?\(\s*[\d.,\s]+\)|hsla?\(\s*[\d.,\s%]+\)|var\(--[\w-]+(?:\s*,\s*[^)]+)?\)|[a-zA-Z]+)$/

// Properties allowed in consumer-supplied thStyle / tdStyle column style objects.
// This prevents CSS injection (CSS exfiltration, UI spoofing) via API-sourced column config.
export const SAFE_COLUMN_STYLE_PROPS = new Set([
  'width', 'minWidth', 'maxWidth',
  'textAlign', 'verticalAlign',
  'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
  'whiteSpace', 'overflow', 'textOverflow',
  'fontWeight', 'fontSize',
  'color', 'backgroundColor',
  'cursor',
  'border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom'
])

/**
 * Validate a CSS length/size prop (width, height, fontSize, etc.).
 * Returns the value unchanged if safe, undefined otherwise.
 */
export function safeLength(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  return SAFE_LENGTH.test(value.trim()) ? value : undefined
}

/**
 * Validate a CSS color prop.
 * Returns the value unchanged if it matches a known-safe color form, undefined otherwise.
 */
export function safeColor(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  return SAFE_COLOR.test(value.trim()) ? value : undefined
}

/**
 * Filter a consumer-supplied CSS style object to an allowlist of known-safe property names.
 * Use for thStyle / tdStyle column config in VibeDataTable.
 */
export function safeCssObject(
  obj: Record<string, string> | undefined
): Record<string, string> {
  if (!obj) return {}
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => SAFE_COLUMN_STYLE_PROPS.has(key))
  )
}
