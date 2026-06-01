# VibeInputGroup

Wraps a control with prepended/appended text, buttons, or other elements using Bootstrap's input-group.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'lg'` | `undefined` | Input-group size. |
| `prepend` | `string` | `undefined` | Convenience text rendered before the control as `.input-group-text`. |
| `append` | `string` | `undefined` | Convenience text rendered after the control as `.input-group-text`. |
| `tag` | `Tag` | `'div'` | Root element tag. |

## Events

None.

## Slots

| Slot | Description |
|------|-------------|
| default | The control to wrap (typically a `VibeFormInput` with `no-wrapper`). |
| `prepend` | Custom prepended content (overrides the `prepend` prop). |
| `append` | Custom appended content (overrides the `append` prop). |

## Usage

### Text prepend / append

```vue
<script setup lang="ts">
import { ref } from 'vue'
const price = ref('')
</script>

<template>
  <VibeInputGroup prepend="$" append=".00">
    <VibeFormInput v-model="price" type="number" no-wrapper />
  </VibeInputGroup>
</template>
```

### Custom slots with a button

```vue
<script setup lang="ts">
import { ref } from 'vue'
const term = ref('')
</script>

<template>
  <VibeInputGroup>
    <VibeFormInput v-model="term" placeholder="Search" no-wrapper />
    <template #append>
      <VibeButton variant="primary">Go</VibeButton>
    </template>
  </VibeInputGroup>
</template>
```

## Important Notes

- **Use `no-wrapper` on the input:** pass `no-wrapper` to `VibeFormInput` so it renders just the `<input>` and Bootstrap can style it as part of the group.
- **Slots override props:** providing the `prepend`/`append` slots replaces the corresponding text props.

## Bootstrap CSS Classes

- `.input-group`
- `.input-group-{sm|lg}`
- `.input-group-text`
