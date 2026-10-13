# VibeTabs / VibeTab

Self-contained tab container with content switching. Distinct from `VibeNav` (which is a pure `.nav` rendering primitive) — `VibeTabs` manages active state and renders tab panes.

## VibeTabs Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `undefined` | Active tab `name` (v-model). Auto-defaults to first non-disabled tab. |
| `variant` | `'tabs' \| 'pills' \| 'underline'` | `'tabs'` | Bootstrap nav style |
| `fill` | `Boolean` | `false` | Apply `.nav-fill` |
| `justified` | `Boolean` | `false` | Apply `.nav-justified` |
| `vertical` | `Boolean` | `false` | Render nav vertically alongside content |
| `lazy` | `Boolean` | `false` | Defer rendering of inactive tabs until first activation |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when active tab changes |
| `change` | `String` | Same payload, alias for non-v-model usage |

### Keyboard navigation

Follows the APG tabs pattern with automatic activation: only the active tab is a Tab stop (roving `tabindex`), `ArrowLeft`/`ArrowRight` (or `Up`/`Down` when `vertical`) move activation plus focus, `Home`/`End` jump, disabled tabs are skipped. Click and keyboard share the same activation path.

### Tab wiring

Tabs own `aria-controls` and panes own `aria-labelledby` plus a tab-appropriate `tabindex` (only the active pane is tabbable), derived from strip-unique ids so two strips can share tab names without colliding.

## VibeTab Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `String` | required | Stable identifier matching `modelValue` |
| `label` | `String` | required | Tab nav button text |
| `disabled` | `Boolean` | `false` | Skip activation; appears greyed out |

The default slot is the tab body.

## Examples

```vue
<script setup>
import { ref } from 'vue'
const active = ref('details')
</script>

<template>
  <VibeTabs v-model="active" variant="pills">
    <VibeTab name="details" label="Details">
      <p>Issue body, status, assignee...</p>
    </VibeTab>
    <VibeTab name="activity" label="Activity">
      <ActivityTimeline />
    </VibeTab>
    <VibeTab name="links" label="Linked Issues" disabled>
      <p>Link feature coming soon.</p>
    </VibeTab>
  </VibeTabs>
</template>
```

### Lazy mounting for heavy panes

```vue
<VibeTabs v-model="active" lazy>
  <VibeTab name="metrics" label="Metrics">
    <ExpensiveChart />
  </VibeTab>
</VibeTabs>
```

`<ExpensiveChart>` is not mounted until the user clicks the Metrics tab. Once activated, it stays mounted across switches so internal state isn't lost.
