# VibeFormSelect

Single or multiple selection dropdown driven by an `options` array, with built-in validation and accessibility.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `FormSelectOptionValue \| FormSelectOptionValue[]` | `''` | Selected value(s). An array when `multiple` is set. `FormSelectOptionValue` is `string \| number \| boolean \| null \| undefined`. |
| `options` | `FormSelectOption[]` | `[]` | Options to render: `{ value, text, disabled? }`. |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Standalone label text. |
| `multiple` | `boolean` | `false` | Allow multiple selection (model becomes an array). |
| `selectSize` | `number` | `undefined` | Number of visible rows (native `size`). |
| `htmlSize` | `number` | `undefined` | Number of visible rows (native `size`); takes precedence over `selectSize`. |
| `placeholder` | `string` | `undefined` | Disabled placeholder option (single-select only). |
| `disabled` | `boolean` | `false` | Disable the select. |
| `required` | `boolean` | `false` | Mark as required. |
| `size` | `'sm' \| 'lg'` | `undefined` | Control size (`.form-select-sm/lg`). |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'change' \| 'blur'` | `'change'` | When the `validate` event fires. |
| `helpText` | `string` | `undefined` | Help text below the select. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `FormSelectOptionValue \| FormSelectOptionValue[]` | Emitted on selection. Array when `multiple`. |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted when the `validateOn` trigger occurs. |

## Slots

| Slot | Description |
|------|-------------|
| default | Override the auto-rendered `<option>` list (provide your own `<option>` / `<optgroup>` elements). |

## Usage

### Recommended: inside a VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { FormSelectOption } from '@velkymx/vibeui'

const country = ref('')
const options: FormSelectOption[] = [
  { value: 'us', text: 'United States' },
  { value: 'ca', text: 'Canada' },
  { value: 'mx', text: 'Mexico' }
]
</script>

<template>
  <VibeFormGroup label="Country">
    <VibeFormSelect v-model="country" :options="options" placeholder="Choose…" />
  </VibeFormGroup>
</template>
```

### Multiple selection

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { FormSelectOption } from '@velkymx/vibeui'

const tags = ref<string[]>([])
const options: FormSelectOption[] = [
  { value: 'vue', text: 'Vue' },
  { value: 'ts', text: 'TypeScript' },
  { value: 'bs', text: 'Bootstrap' }
]
</script>

<template>
  <VibeFormGroup label="Tags">
    <VibeFormSelect v-model="tags" :options="options" multiple :select-size="5" />
  </VibeFormGroup>
</template>
```

## Important Notes

- **Non-string values preserved:** option values keep their original type (`number`, `boolean`, etc.). The component encodes options by index internally, so `v-model` round-trips the exact value — you do not have to stringify.
- **Placeholder:** only applies to single-select; it renders a disabled empty-value option.
- **Group linking:** wrapped in a `VibeFormGroup`, the select consumes the group id so the label and feedback link automatically.

## Bootstrap CSS Classes

- `.form-select`
- `.form-select-{sm|lg}`
- `.is-valid`, `.is-invalid`
