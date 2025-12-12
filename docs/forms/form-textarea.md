# VibeFormTextarea

Multi-line text input component with character count and validation support.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const description = ref('')
</script>

<template>
  <VibeFormTextarea
    v-model="description"
    id="description"
    label="Description"
    placeholder="Enter description..."
  />
</template>
```

## Rows

Control the height of the textarea:

```vue
<template>
  <!-- 3 rows (default) -->
  <VibeFormTextarea
    v-model="description"
    id="description-3"
    label="Small Textarea"
    :rows="3"
  />

  <!-- 5 rows -->
  <VibeFormTextarea
    v-model="description"
    id="description-5"
    label="Medium Textarea"
    :rows="5"
  />

  <!-- 10 rows -->
  <VibeFormTextarea
    v-model="description"
    id="description-10"
    label="Large Textarea"
    :rows="10"
  />
</template>
```

## Character Count

Display a character counter below the textarea:

```vue
<template>
  <VibeFormTextarea
    v-model="description"
    id="description"
    label="Description"
    show-char-count
  />
</template>
```

## Max Length

Limit the number of characters with visual feedback:

```vue
<template>
  <VibeFormTextarea
    v-model="bio"
    id="bio"
    label="Bio"
    :maxlength="500"
    show-char-count
    help-text="Maximum 500 characters"
  />
</template>
```

## Sizes

```vue
<template>
  <!-- Small -->
  <VibeFormTextarea
    v-model="description"
    id="description-sm"
    label="Small Textarea"
    size="sm"
  />

  <!-- Default -->
  <VibeFormTextarea
    v-model="description"
    id="description-default"
    label="Default Textarea"
  />

  <!-- Large -->
  <VibeFormTextarea
    v-model="description"
    id="description-lg"
    label="Large Textarea"
    size="lg"
  />
</template>
```

## Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const description = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const validateDescription = async () => {
  const rules = [
    validators.required('Description is required'),
    validators.minLength(10, 'Description must be at least 10 characters'),
    validators.maxLength(500, 'Description must not exceed 500 characters')
  ]

  for (const rule of rules) {
    const result = await rule.validator(description.value)
    if (result !== true) {
      validationState.value = 'invalid'
      validationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  validationState.value = 'valid'
  validationMessage.value = 'Looks good!'
}
</script>

<template>
  <VibeFormTextarea
    v-model="description"
    id="description"
    label="Description"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateDescription"
    :maxlength="500"
    show-char-count
    required
  />
</template>
```

## States

```vue
<script setup lang="ts">
import { ref } from 'vue'

const disabled = ref('')
const readonly = ref('This is readonly text')
</script>

<template>
  <!-- Disabled -->
  <VibeFormTextarea
    v-model="disabled"
    id="disabled"
    label="Disabled Textarea"
    disabled
  />

  <!-- Readonly -->
  <VibeFormTextarea
    v-model="readonly"
    id="readonly"
    label="Readonly Textarea"
    readonly
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | The textarea value (v-model) |
| `id` | `String` | required | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `placeholder` | `String` | `undefined` | Placeholder text |
| `rows` | `Number` | `3` | Number of visible text rows |
| `maxlength` | `Number` | `undefined` | Maximum character length |
| `disabled` | `Boolean` | `false` | Disable the textarea |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `size` | `'sm' \| 'lg'` | `undefined` | Textarea size |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |
| `showCharCount` | `Boolean` | `false` | Show character counter |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `input` | `Event` | Native input event |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation, validators } from '@velkymx/vibeui'

const comment = useFormValidation('')

const validateComment = () => {
  comment.validate([
    validators.required('Please enter a comment'),
    validators.minLength(10, 'Comment must be at least 10 characters'),
    validators.maxLength(1000, 'Comment must not exceed 1000 characters')
  ])
}

const handleSubmit = async () => {
  await validateComment()

  if (comment.isValid) {
    console.log('Submitting comment:', comment.value)
    // Submit to API
    comment.reset()
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormTextarea
      v-model="comment.value"
      id="comment"
      label="Your Comment"
      placeholder="Share your thoughts..."
      :rows="5"
      :maxlength="1000"
      :validation-state="comment.validationState"
      :validation-message="comment.validationMessage"
      @validate="validateComment"
      show-char-count
      required
    />

    <VibeButton type="submit" variant="primary">Post Comment</VibeButton>
  </form>
</template>
```
