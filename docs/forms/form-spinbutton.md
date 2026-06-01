# VibeFormSpinbutton

Numeric input flanked by increment and decrement buttons, with clamping, stepping, and built-in validation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | `0` | The numeric value (v-model). |
| `id` | `string` | auto-generated | Element id. Auto-generated, or inherited from a parent `VibeFormGroup`. |
| `label` | `string` | `undefined` | Standalone label text. |
| `disabled` | `boolean` | `false` | Disable the control. |
| `readonly` | `boolean` | `false` | Make the input read-only (buttons are also disabled). |
| `required` | `boolean` | `false` | Mark as required. |
| `min` | `number` | `undefined` | Minimum value (clamped on change/blur). |
| `max` | `number` | `undefined` | Maximum value (clamped on change/blur). |
| `step` | `number` | `1` | Increment/decrement step. Must be greater than 0. |
| `wrap` | `boolean` | `false` | Wrap from max back to min (and vice versa) at the bounds. |
| `vertical` | `boolean` | `false` | Stack the buttons vertically. |
| `size` | `'sm' \| 'lg'` | `undefined` | Control size. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Visual validation state. |
| `validationMessage` | `string` | `undefined` | Feedback message for the current state. |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Rules carried for use with a validation composable. |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When the `validate` event fires from typing. |
| `helpText` | `string` | `undefined` | Help text below the control. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number` | Emitted whenever the value changes. |
| `increment` | `number` | Emitted with the new value after the increment button is pressed. |
| `decrement` | `number` | Emitted with the new value after the decrement button is pressed. |
| `input` | `Event` | Native input event (typing). |
| `change` | `Event` | Native change event. |
| `blur` | `FocusEvent` | Emitted on blur. |
| `focus` | `FocusEvent` | Emitted on focus. |
| `validate` | — | Emitted on each button press and on the `validateOn` typing trigger. |

## Slots

None.

## Usage

### Recommended: inside a VibeFormGroup

```vue
<script setup lang="ts">
import { ref } from 'vue'
const quantity = ref(1)
</script>

<template>
  <VibeFormGroup label="Quantity">
    <VibeFormSpinbutton v-model="quantity" :min="1" :max="10" />
  </VibeFormGroup>
</template>
```

### Stepping and wrapping

```vue
<script setup lang="ts">
import { ref } from 'vue'
const rating = ref(0)
const onIncrement = (value: number) => console.log('new value', value)
</script>

<template>
  <VibeFormSpinbutton
    v-model="rating"
    :min="0"
    :max="5"
    :step="0.5"
    wrap
    @increment="onIncrement"
  />
</template>
```

## Important Notes

- **`step` must be greater than 0.** Decimal steps are snapped to the step's precision (e.g. `step="0.5"` keeps one decimal place).
- **Clamping:** typed values are clamped to `min`/`max` on `change` and `blur`; an empty field is treated as `0`.
- **`increment` / `decrement` payload:** both events carry the resulting numeric value, so you do not need to read `modelValue` separately.
- **Number model only:** when using a validation composable, bind to `.value` (a dev-mode warning fires if an object is passed).

## Bootstrap CSS Classes

- `.input-group`, `.input-group-{sm|lg}`
- `.form-control`, `.form-control-{sm|lg}`
- `.btn`, `.btn-outline-secondary`
- `.is-valid`, `.is-invalid`
