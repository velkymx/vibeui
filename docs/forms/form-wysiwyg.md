# VibeFormWysiwyg

WYSIWYG (What You See Is What You Get) editor component powered by QuillJS.

## Installation

First, install Quill as a dependency:

```bash
npm install quill
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
</script>

<template>
  <VibeFormWysiwyg
    v-model="content"
    id="editor"
    label="Content"
    placeholder="Write something amazing..."
  />

  <div v-html="content"></div>
</template>
```

## Themes

Quill supports two themes: `snow` (default) and `bubble`:

```vue
<template>
  <!-- Snow theme (default) - toolbar at top -->
  <VibeFormWysiwyg
    v-model="content"
    id="editor-snow"
    label="Snow Theme"
    theme="snow"
  />

  <!-- Bubble theme - inline toolbar -->
  <VibeFormWysiwyg
    v-model="content"
    id="editor-bubble"
    label="Bubble Theme"
    theme="bubble"
  />
</template>
```

## Custom Toolbar

```vue
<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')

// Minimal toolbar
const minimalToolbar = [
  ['bold', 'italic', 'underline'],
  ['link']
]

// Full toolbar
const fullToolbar = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video'],
  ['clean']
]
</script>

<template>
  <!-- Minimal -->
  <VibeFormWysiwyg
    v-model="content"
    id="editor-minimal"
    label="Minimal Editor"
    :toolbar="minimalToolbar"
  />

  <!-- Full -->
  <VibeFormWysiwyg
    v-model="content"
    id="editor-full"
    label="Full Editor"
    :toolbar="fullToolbar"
  />

  <!-- No toolbar -->
  <VibeFormWysiwyg
    v-model="content"
    id="editor-no-toolbar"
    label="No Toolbar"
    :toolbar="false"
  />
</template>
```

## Height

```vue
<template>
  <VibeFormWysiwyg
    v-model="content"
    id="editor"
    label="Content"
    height="400px"
  />
</template>
```

## Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const content = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const minContentValidator = {
  validator: (value) => {
    // Remove HTML tags and check length
    const text = value.replace(/<[^>]*>/g, '').trim()
    return text.length >= 10 || 'Content must be at least 10 characters'
  },
  message: 'Content must be at least 10 characters'
}

const validateContent = async () => {
  const rules = [
    validators.required('Content is required'),
    minContentValidator
  ]

  for (const rule of rules) {
    const result = await rule.validator(content.value)
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
  <VibeFormWysiwyg
    v-model="content"
    id="content"
    label="Article Content"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateContent"
    required
  />
</template>
```

## States

```vue
<template>
  <!-- Disabled -->
  <VibeFormWysiwyg
    v-model="content"
    id="disabled"
    label="Disabled Editor"
    disabled
  />

  <!-- Readonly -->
  <VibeFormWysiwyg
    v-model="content"
    id="readonly"
    label="Readonly Editor"
    readonly
  />
</template>
```

## Events

```vue
<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
const quill = ref(null)

const handleReady = (quillInstance) => {
  quill.value = quillInstance
  console.log('Quill ready:', quillInstance)

  // You can now use the Quill API
  // quillInstance.format('bold', true)
  // quillInstance.insertText(0, 'Hello ')
}

const handleChange = () => {
  console.log('Content changed:', content.value)
}
</script>

<template>
  <VibeFormWysiwyg
    v-model="content"
    id="editor"
    label="Content"
    @ready="handleReady"
    @change="handleChange"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | The HTML content (v-model) |
| `id` | `String` | required | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `placeholder` | `String` | `'Write something...'` | Placeholder text |
| `disabled` | `Boolean` | `false` | Disable the editor |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `theme` | `'snow' \| 'bubble'` | `'snow'` | Quill theme |
| `toolbar` | `Array \| String \| Boolean` | default toolbar | Toolbar configuration |
| `height` | `String` | `'200px'` | Minimum height |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when content changes |
| `ready` | `Quill` | Emitted when Quill is initialized |
| `validate` | - | Emitted when validation should run |
| `change` | - | Emitted when content changes |
| `blur` | - | Emitted when editor loses focus |
| `focus` | - | Emitted when editor gains focus |

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation, validators } from '@velkymx/vibeui'

const title = useFormValidation('')
const content = useFormValidation('')
const quillInstance = ref(null)

const customToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ color: [] }, { background: [] }],
  ['link', 'image'],
  ['clean']
]

const minContentValidator = {
  validator: (value) => {
    const text = value.replace(/<[^>]*>/g, '').trim()
    return text.length >= 50 || 'Article must be at least 50 characters'
  },
  message: 'Article must be at least 50 characters'
}

const validateTitle = () => {
  title.validate([
    validators.required('Title is required'),
    validators.minLength(5, 'Title must be at least 5 characters'),
    validators.maxLength(100, 'Title must not exceed 100 characters')
  ])
}

const validateContent = () => {
  content.validate([
    validators.required('Content is required'),
    minContentValidator
  ])
}

const handleReady = (quill) => {
  quillInstance.value = quill
}

const handleSubmit = async () => {
  await validateTitle()
  await validateContent()

  if (title.isValid && content.isValid) {
    console.log('Publishing article:', {
      title: title.value,
      content: content.value
    })
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormInput
      v-model="title.value"
      id="title"
      label="Article Title"
      :validation-state="title.validationState"
      :validation-message="title.validationMessage"
      @validate="validateTitle"
      required
    />

    <VibeFormWysiwyg
      v-model="content.value"
      id="content"
      label="Article Content"
      :toolbar="customToolbar"
      :validation-state="content.validationState"
      :validation-message="content.validationMessage"
      @validate="validateContent"
      @ready="handleReady"
      height="400px"
      help-text="Write your article using the editor above"
      required
    />

    <div class="d-flex gap-2">
      <VibeButton type="submit" variant="primary">Publish Article</VibeButton>
      <VibeButton type="button" variant="secondary" @click="content.reset(); title.reset()">Clear</VibeButton>
    </div>
  </form>
</template>
```

## Advanced: Using Quill API

```vue
<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
const quill = ref(null)

const handleReady = (quillInstance) => {
  quill.value = quillInstance
}

const insertText = () => {
  if (quill.value) {
    quill.value.insertText(0, 'Hello World! ')
  }
}

const formatBold = () => {
  if (quill.value) {
    const range = quill.value.getSelection()
    if (range) {
      quill.value.formatText(range.index, range.length, 'bold', true)
    }
  }
}

const getWordCount = () => {
  if (quill.value) {
    const text = quill.value.getText()
    const words = text.trim().split(/\s+/).length
    alert(`Word count: ${words}`)
  }
}
</script>

<template>
  <VibeFormWysiwyg
    v-model="content"
    id="editor"
    label="Content"
    @ready="handleReady"
  />

  <div class="mt-2">
    <VibeButton size="sm" @click="insertText">Insert Text</VibeButton>
    <VibeButton size="sm" @click="formatBold">Make Bold</VibeButton>
    <VibeButton size="sm" @click="getWordCount">Word Count</VibeButton>
  </div>
</template>
```

## Note

If Quill is not installed, the component will display a warning message. Users can still use the library without Quill, they just won't be able to use the WYSIWYG editor component.
