# VibeFormGroup

Wrapper that owns a form control's label, help text, validation feedback, and id. It is the recommended way to make any VibeUI form control accessible.

## How it works

`VibeFormGroup` generates a single id and provides it (plus its label/help/validation flags) to descendant controls. The **first** child control consumes the group id and renders against it; the group renders the `<label>` (linked via `for`), `help-text`, and validation feedback so the child does not duplicate them. This auto-wires `for`/`id` and `aria-describedby` with no manual ids.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text rendered for the first child control. |
| `labelFor` | `string` | `undefined` | Explicit id to use instead of the auto-generated one. |
| `required` | `boolean` | `false` | Append a `*` to the label. |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Render valid/invalid feedback. |
| `validationMessage` | `string` | `undefined` | Feedback message text. |
| `helpText` | `string` | `undefined` | Help text rendered below the control. |
| `floating` | `boolean` | `false` | Use Bootstrap floating-label layout (`.form-floating`). |
| `row` | `boolean` | `false` | Use a horizontal (grid row) layout. |
| `labelCols` | `number \| string` | `undefined` | Label column width (`col-sm-{n}`) in row layout. |
| `labelAlign` | `'start' \| 'center' \| 'end'` | `undefined` | Label text alignment in row layout. |

## Events

None.

## Slots

| Slot | Description |
|------|-------------|
| default | The form control(s) to wrap. |

## Usage

### Basic

```vue
<script setup lang="ts">
import { ref } from 'vue'
const email = ref('')
</script>

<template>
  <VibeFormGroup label="Email" help-text="We'll never share it.">
    <VibeFormInput v-model="email" type="email" />
  </VibeFormGroup>
</template>
```

### With validation

```vue
<script setup lang="ts">
import { useFormValidation, validators } from '@velkymx/vibeui'

const name = useFormValidation('')
const validateName = () => name.validate([validators.required()])
</script>

<template>
  <VibeFormGroup
    label="Name"
    required
    :validation-state="name.validationState"
    :validation-message="name.validationMessage"
  >
    <VibeFormInput v-model="name.value" @validate="validateName" />
  </VibeFormGroup>
</template>
```

### Horizontal (row) layout

```vue
<script setup lang="ts">
import { ref } from 'vue'
const username = ref('')
</script>

<template>
  <VibeFormGroup label="Username" row :label-cols="3" label-align="end">
    <VibeFormInput v-model="username" />
  </VibeFormGroup>
</template>
```

### Floating label

```vue
<script setup lang="ts">
import { ref } from 'vue'
const city = ref('')
</script>

<template>
  <VibeFormGroup label="City" floating>
    <VibeFormInput v-model="city" placeholder="City" />
  </VibeFormGroup>
</template>
```

## Important Notes

- **Single-consumer rule:** only the first child control consumes the group id. With multiple controls (e.g. a checkbox or radio group), subsequent controls generate their own ids — the group's label still describes the set.
- **Don't double up:** when the group provides `label`, `helpText`, or validation, omit those same props on the child control; the child suppresses its own copies to avoid duplicates.
- **Floating labels** require the label to render after the control, which the group handles automatically; pair it with a `placeholder` on the input.

## Bootstrap CSS Classes

- `.mb-3`, `.row`
- `.form-floating`
- `.form-label`, `.col-form-label`, `.col-sm-{n}`, `.text-{start|center|end}`
- `.form-text`
- `.valid-feedback`, `.invalid-feedback`
