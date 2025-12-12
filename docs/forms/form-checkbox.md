# VibeFormCheckbox

Checkbox input component with support for single checkboxes and checkbox groups.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const agreed = ref(false)
</script>

<template>
  <VibeFormCheckbox
    v-model="agreed"
    id="terms"
    label="I agree to the terms and conditions"
  />
</template>
```

## Checkbox Group (Array)

```vue
<script setup lang="ts">
import { ref } from 'vue'

const selectedSkills = ref([])
</script>

<template>
  <div>
    <label class="form-label">Select your skills</label>

    <VibeFormCheckbox
      v-model="selectedSkills"
      id="skill-vue"
      label="Vue.js"
      value="vue"
    />

    <VibeFormCheckbox
      v-model="selectedSkills"
      id="skill-react"
      label="React"
      value="react"
    />

    <VibeFormCheckbox
      v-model="selectedSkills"
      id="skill-angular"
      label="Angular"
      value="angular"
    />

    <p>Selected: {{ selectedSkills.join(', ') }}</p>
  </div>
</template>
```

## Inline Layout

```vue
<template>
  <VibeFormCheckbox
    v-model="selectedSkills"
    id="skill-vue"
    label="Vue.js"
    value="vue"
    inline
  />

  <VibeFormCheckbox
    v-model="selectedSkills"
    id="skill-react"
    label="React"
    value="react"
    inline
  />

  <VibeFormCheckbox
    v-model="selectedSkills"
    id="skill-angular"
    label="Angular"
    value="angular"
    inline
  />
</template>
```

## Indeterminate State

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, checked: false },
  { id: 2, checked: false },
  { id: 3, checked: false }
])

const allChecked = computed({
  get: () => items.value.every(item => item.checked),
  set: (value) => {
    items.value.forEach(item => item.checked = value)
  }
})

const indeterminate = computed(() => {
  const checked = items.value.filter(item => item.checked)
  return checked.length > 0 && checked.length < items.value.length
})
</script>

<template>
  <VibeFormCheckbox
    v-model="allChecked"
    id="selectAll"
    label="Select All"
    :indeterminate="indeterminate"
  />

  <div class="ms-4">
    <VibeFormCheckbox
      v-for="item in items"
      :key="item.id"
      v-model="item.checked"
      :id="`item-${item.id}`"
      :label="`Item ${item.id}`"
    />
  </div>
</template>
```

## Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const agreeToTerms = ref(false)
const validationState = ref(null)
const validationMessage = ref('')

const validateTerms = async () => {
  const result = await validators.required().validator(agreeToTerms.value)

  if (result !== true || agreeToTerms.value !== true) {
    validationState.value = 'invalid'
    validationMessage.value = 'You must agree to the terms and conditions'
  } else {
    validationState.value = 'valid'
    validationMessage.value = ''
  }
}
</script>

<template>
  <VibeFormCheckbox
    v-model="agreeToTerms"
    id="terms"
    label="I agree to the terms and conditions"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateTerms"
    required
  />
</template>
```

## Group Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'

const selectedSkills = ref([])
const validationState = ref(null)
const validationMessage = ref('')

const validateSkills = async () => {
  if (selectedSkills.value.length === 0) {
    validationState.value = 'invalid'
    validationMessage.value = 'Please select at least one skill'
  } else if (selectedSkills.value.length < 2) {
    validationState.value = 'invalid'
    validationMessage.value = 'Please select at least 2 skills'
  } else {
    validationState.value = 'valid'
    validationMessage.value = 'Great selection!'
  }
}
</script>

<template>
  <div>
    <label class="form-label">
      Select your skills <span class="text-danger">*</span>
    </label>

    <VibeFormCheckbox
      v-model="selectedSkills"
      id="skill-vue"
      label="Vue.js"
      value="vue"
      :validation-state="validationState"
      @validate="validateSkills"
    />

    <VibeFormCheckbox
      v-model="selectedSkills"
      id="skill-react"
      label="React"
      value="react"
      @change="validateSkills"
    />

    <VibeFormCheckbox
      v-model="selectedSkills"
      id="skill-angular"
      label="Angular"
      value="angular"
      @change="validateSkills"
    />

    <div v-if="validationMessage" :class="validationState === 'valid' ? 'valid-feedback' : 'invalid-feedback'" style="display: block;">
      {{ validationMessage }}
    </div>
  </div>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean \| Array` | `false` | The checkbox value (v-model) |
| `id` | `String` | required | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `value` | `String \| Number \| Boolean` | `true` | Value when used in array (group) |
| `disabled` | `Boolean` | `false` | Disable the checkbox |
| `required` | `Boolean` | `false` | Mark as required |
| `inline` | `Boolean` | `false` | Display inline |
| `indeterminate` | `Boolean` | `false` | Show indeterminate state |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean \| Array` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'

const preferences = ref({
  newsletter: false,
  notifications: [],
  agreeToTerms: false
})

const validationState = ref({
  terms: null
})

const notificationOptions = [
  { value: 'email', label: 'Email notifications' },
  { value: 'sms', label: 'SMS notifications' },
  { value: 'push', label: 'Push notifications' }
]

const validateTerms = () => {
  if (!preferences.value.agreeToTerms) {
    validationState.value.terms = 'invalid'
    return false
  }
  validationState.value.terms = 'valid'
  return true
}

const handleSubmit = () => {
  if (validateTerms()) {
    console.log('Preferences saved:', preferences.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <h5>Communication Preferences</h5>

    <VibeFormCheckbox
      v-model="preferences.newsletter"
      id="newsletter"
      label="Subscribe to newsletter"
      help-text="Receive our weekly newsletter with updates and tips"
    />

    <div class="mt-3">
      <label class="form-label">Notification Preferences</label>
      <VibeFormCheckbox
        v-for="option in notificationOptions"
        :key="option.value"
        v-model="preferences.notifications"
        :id="`notif-${option.value}`"
        :label="option.label"
        :value="option.value"
      />
    </div>

    <div class="mt-3">
      <VibeFormCheckbox
        v-model="preferences.agreeToTerms"
        id="terms"
        label="I agree to the terms and conditions"
        :validation-state="validationState.terms"
        :validation-message="validationState.terms === 'invalid' ? 'You must agree to continue' : ''"
        @validate="validateTerms"
        required
      />
    </div>

    <VibeButton type="submit" variant="primary" class="mt-3">Save Preferences</VibeButton>
  </form>
</template>
```
