# v-vibe-tooltip

Inline tooltip directive. Equivalent to `<VibeTooltip>` but applied directly to the element, without a wrapper. Useful when adding tooltips to existing markup or many small elements (icons, button labels) where wrapping each is noisy.

Registered globally by `app.use(VibeUI)`.

## Usage

```vue
<template>
  <!-- String binding: tooltip title -->
  <button v-vibe-tooltip="'Save changes'">
    <VibeIcon name="save" />
  </button>

  <!-- Options object -->
  <span v-vibe-tooltip="{ title: 'New tab', placement: 'end' }">
    <VibeIcon name="external-link" />
  </span>
</template>
```

## Binding values

| Type | Behavior |
|------|----------|
| `string` | Sets the tooltip `title` |
| `{ title, placement, trigger }` | Full options |
| `undefined` | Renders nothing useful, but does not throw |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | — | Tooltip body. Aliases: `text`, `content` (whichever is set first wins) |
| `placement` | `TooltipPlacement` | `'top'` | Bootstrap placement |
| `trigger` | `string` | `'hover focus'` | Auto-swaps to `'click'` on touch devices |

> Tooltip content is always rendered as plain text (`html: false`). HTML in `title` is escaped; there is no `html` option on this directive.

## Typed under global registration

When registered via `app.use(VibeUI)`, `v-vibe-tooltip` is type-checked in templates: binding values autocomplete (`string` or `{ title, placement, trigger }`) and misspelled directive names are flagged by `vue-tsc`/Volar with no extra setup, the same as globally registered components.

## Direct import

For component-local registration without the plugin:

```ts
import { vTooltip } from '@velkymx/vibeui'

export default {
  directives: { 'vibe-tooltip': vTooltip }
}
```

## When to use the component instead

`<VibeTooltip>` is better when:
- You want the tooltip body to come from a slot (rich content rather than a string).
- The triggering element is itself a slot of another component and you can't access it to bind a directive.
- You need imperative show/hide via the component's escape-hatch instance (`_unsafe_bsInstance`).
