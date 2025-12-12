# VibeFormSelect

Select dropdown component with single and multiple selection support, plus built-in validation.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const country = ref('')
const countries = [
  { value: 'us', text: 'United States' },
  { value: 'ca', text: 'Canada' },
  { value: 'mx', text: 'Mexico' },
  { value: 'uk', text: 'United Kingdom' }
]
</script>

<template>
  <VibeFormSelect
    v-model="country"
    id="country"
    label="Country"
    :options="countries"
  />
</template>
```

## With Placeholder

```vue
<template>
  <VibeFormSelect
    v-model="country"
    id="country"
    label="Country"
    :options="countries"
    placeholder="Select a country"
  />
</template>
```

## Using Slots

For custom option content, you can use the default slot:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const priority = ref('')
</script>

<template>
  <VibeFormSelect
    v-model="priority"
    id="priority"
    label="Priority"
  >
    <option value="">Select priority</option>
    <option value="low">🟢 Low Priority</option>
    <option value="medium">🟡 Medium Priority</option>
    <option value="high">🔴 High Priority</option>
  </VibeFormSelect>
</template>
```

## Multiple Selection

```vue
<script setup lang="ts">
import { ref } from 'vue'

const skills = ref([])
const skillOptions = [
  { value: 'vue', text: 'Vue.js' },
  { value: 'react', text: 'React' },
  { value: 'angular', text: 'Angular' },
  { value: 'typescript', text: 'TypeScript' },
  { value: 'javascript', text: 'JavaScript' }
]
</script>

<template>
  <VibeFormSelect
    v-model="skills"
    id="skills"
    label="Skills"
    :options="skillOptions"
    multiple
    :html-size="5"
  />

  <p>Selected: {{ skills.join(', ') }}</p>
</template>
```

## Sizes

```vue
<template>
  <!-- Small -->
  <VibeFormSelect
    v-model="country"
    id="country-sm"
    label="Small Select"
    :options="countries"
    size="sm"
  />

  <!-- Default -->
  <VibeFormSelect
    v-model="country"
    id="country-default"
    label="Default Select"
    :options="countries"
  />

  <!-- Large -->
  <VibeFormSelect
    v-model="country"
    id="country-lg"
    label="Large Select"
    :options="countries"
    size="lg"
  />
</template>
```

## Disabled Options

```vue
<script setup lang="ts">
import { ref } from 'vue'

const plan = ref('')
const plans = [
  { value: 'free', text: 'Free Plan' },
  { value: 'basic', text: 'Basic Plan' },
  { value: 'premium', text: 'Premium Plan' },
  { value: 'enterprise', text: 'Enterprise Plan', disabled: true }
]
</script>

<template>
  <VibeFormSelect
    v-model="plan"
    id="plan"
    label="Subscription Plan"
    :options="plans"
  />
</template>
```

## Validation

### Basic Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const country = ref('')
const countryValidationState = ref(null)
const countryValidationMessage = ref('')

const countries = [
  { value: 'us', text: 'United States' },
  { value: 'ca', text: 'Canada' },
  { value: 'mx', text: 'Mexico' }
]

const validateCountry = async () => {
  const result = await validators.required('Please select a country').validator(country.value)

  if (result !== true) {
    countryValidationState.value = 'invalid'
    countryValidationMessage.value = typeof result === 'string' ? result : 'Required'
  } else {
    countryValidationState.value = 'valid'
    countryValidationMessage.value = ''
  }
}
</script>

<template>
  <VibeFormSelect
    v-model="country"
    id="country"
    label="Country"
    :options="countries"
    :validation-state="countryValidationState"
    :validation-message="countryValidationMessage"
    @validate="validateCountry"
    placeholder="Select a country"
    required
  />
</template>
```

### Multiple Selection Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const skills = ref([])
const skillsValidationState = ref(null)
const skillsValidationMessage = ref('')

const skillOptions = [
  { value: 'vue', text: 'Vue.js' },
  { value: 'react', text: 'React' },
  { value: 'angular', text: 'Angular' }
]

const minSkillsValidator = {
  validator: (value) => {
    return (Array.isArray(value) && value.length >= 2) || 'Please select at least 2 skills'
  },
  message: 'Please select at least 2 skills'
}

const validateSkills = async () => {
  const rules = [
    validators.required('Please select at least one skill'),
    minSkillsValidator
  ]

  for (const rule of rules) {
    const result = await rule.validator(skills.value)
    if (result !== true) {
      skillsValidationState.value = 'invalid'
      skillsValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  skillsValidationState.value = 'valid'
  skillsValidationMessage.value = ''
}
</script>

<template>
  <VibeFormSelect
    v-model="skills"
    id="skills"
    label="Skills"
    :options="skillOptions"
    :validation-state="skillsValidationState"
    :validation-message="skillsValidationMessage"
    @validate="validateSkills"
    multiple
    :html-size="4"
    help-text="Select at least 2 skills"
    required
  />
</template>
```

## States

```vue
<script setup lang="ts">
import { ref } from 'vue'

const disabled = ref('')
const countries = [
  { value: 'us', text: 'United States' },
  { value: 'ca', text: 'Canada' }
]
</script>

<template>
  <!-- Disabled -->
  <VibeFormSelect
    v-model="disabled"
    id="disabled"
    label="Disabled Select"
    :options="countries"
    disabled
  />

  <!-- Required -->
  <VibeFormSelect
    v-model="country"
    id="country"
    label="Country"
    :options="countries"
    required
  />
</template>
```

## Help Text

```vue
<template>
  <VibeFormSelect
    v-model="country"
    id="country"
    label="Country"
    :options="countries"
    help-text="Select your country of residence for shipping purposes."
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String \| Number \| Array` | `''` | The select value (v-model) |
| `id` | `String` | required | Unique identifier for the select |
| `label` | `String` | `undefined` | Label text |
| `options` | `FormSelectOption[]` | `[]` | Array of options `{ value, text, disabled? }` |
| `placeholder` | `String` | `undefined` | Placeholder option (disabled by default) |
| `disabled` | `Boolean` | `false` | Disable the select |
| `required` | `Boolean` | `false` | Mark as required (adds asterisk to label) |
| `multiple` | `Boolean` | `false` | Enable multiple selection |
| `size` | `'sm' \| 'lg'` | `undefined` | Select size |
| `htmlSize` | `Number` | `undefined` | Number of visible options (for multiple select) |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation feedback message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When to trigger validation |
| `helpText` | `String` | `undefined` | Help text displayed below select |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Number \| Array` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Types

```typescript
interface FormSelectOption {
  value: string | number
  text: string
  disabled?: boolean
}
```

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const form = ref({
  country: '',
  state: '',
  skills: []
})

const validation = ref({
  country: { state: null, message: '' },
  state: { state: null, message: '' },
  skills: { state: null, message: '' }
})

const countries = [
  { value: 'us', text: 'United States' },
  { value: 'ca', text: 'Canada' },
  { value: 'mx', text: 'Mexico' }
]

const states = ref([])

const skillOptions = [
  { value: 'vue', text: 'Vue.js' },
  { value: 'react', text: 'React' },
  { value: 'angular', text: 'Angular' },
  { value: 'svelte', text: 'Svelte' }
]

// Update states when country changes
const updateStates = () => {
  if (form.value.country === 'us') {
    states.value = [
      { value: 'ca', text: 'California' },
      { value: 'ny', text: 'New York' },
      { value: 'tx', text: 'Texas' }
    ]
  } else if (form.value.country === 'ca') {
    states.value = [
      { value: 'on', text: 'Ontario' },
      { value: 'qc', text: 'Quebec' },
      { value: 'bc', text: 'British Columbia' }
    ]
  } else {
    states.value = []
  }
  form.value.state = ''
}

const validateCountry = async () => {
  const result = await validators.required('Country is required').validator(form.value.country)
  validation.value.country.state = result === true ? 'valid' : 'invalid'
  validation.value.country.message = result === true ? '' : result
}

const validateSkills = async () => {
  const isRequired = await validators.required().validator(form.value.skills)
  const hasMinimum = form.value.skills.length >= 2 || 'Select at least 2 skills'

  const result = isRequired === true ? hasMinimum : isRequired
  validation.value.skills.state = result === true ? 'valid' : 'invalid'
  validation.value.skills.message = result === true ? '' : result
}

const handleSubmit = async () => {
  await validateCountry()
  await validateSkills()

  const isValid = validation.value.country.state === 'valid' &&
                  validation.value.skills.state === 'valid'

  if (isValid) {
    console.log('Form submitted:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormSelect
      v-model="form.country"
      id="country"
      label="Country"
      :options="countries"
      :validation-state="validation.country.state"
      :validation-message="validation.country.message"
      @validate="validateCountry"
      @change="updateStates"
      placeholder="Select a country"
      required
    />

    <VibeFormSelect
      v-if="states.length > 0"
      v-model="form.state"
      id="state"
      label="State/Province"
      :options="states"
      placeholder="Select a state"
    />

    <VibeFormSelect
      v-model="form.skills"
      id="skills"
      label="Skills"
      :options="skillOptions"
      :validation-state="validation.skills.state"
      :validation-message="validation.skills.message"
      @validate="validateSkills"
      multiple
      :html-size="4"
      help-text="Hold Ctrl/Cmd to select multiple"
      required
    />

    <VibeButton type="submit" variant="primary">Submit</VibeButton>
  </form>
</template>
```
