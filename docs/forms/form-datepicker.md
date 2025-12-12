# VibeFormDatepicker

Date and time input component with native browser picker support and manual text entry.

## Date Format Support

The datepicker uses HTML5 native input types which:
- ✅ Support manual text entry in addition to the calendar picker
- ✅ Accept the standard `YYYY-MM-DD` format internally (ISO 8601)
- ✅ Display dates according to the user's browser locale (automatically handles MM/DD/YYYY for US users, DD/MM/YYYY for UK users, etc.)
- ✅ Validate date format automatically

**Note**: The v-model always uses `YYYY-MM-DD` format regardless of display format.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const birthdate = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="birthdate"
    id="birthdate"
    label="Birth Date"
  />
</template>
```

## Date Types

### Date Picker

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="date"
    id="date"
    type="date"
    label="Select Date"
  />

  <p>Selected date: {{ date }}</p>
  <!-- Displays as: 2024-01-15 -->
</template>
```

### Time Picker

```vue
<script setup lang="ts">
import { ref } from 'vue'

const time = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="time"
    id="time"
    type="time"
    label="Select Time"
  />

  <p>Selected time: {{ time }}</p>
  <!-- Displays as: 14:30 (24-hour format) -->
</template>
```

### DateTime Picker

```vue
<script setup lang="ts">
import { ref } from 'vue'

const datetime = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="datetime"
    id="datetime"
    type="datetime-local"
    label="Select Date and Time"
  />

  <p>Selected: {{ datetime }}</p>
  <!-- Displays as: 2024-01-15T14:30 -->
</template>
```

### Month Picker

```vue
<script setup lang="ts">
import { ref } from 'vue'

const month = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="month"
    id="month"
    type="month"
    label="Select Month"
  />

  <p>Selected: {{ month }}</p>
  <!-- Displays as: 2024-01 -->
</template>
```

### Week Picker

```vue
<script setup lang="ts">
import { ref } from 'vue'

const week = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="week"
    id="week"
    type="week"
    label="Select Week"
  />

  <p>Selected: {{ week }}</p>
  <!-- Displays as: 2024-W03 -->
</template>
```

## Min and Max Dates

Restrict the date range:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const birthdate = ref('')

// Minimum date: 100 years ago
const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 100)
  return date.toISOString().split('T')[0]
})

// Maximum date: today
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})
</script>

<template>
  <VibeFormDatepicker
    v-model="birthdate"
    id="birthdate"
    label="Birth Date"
    :min="minDate"
    :max="maxDate"
    help-text="Enter a date between 100 years ago and today"
  />
</template>
```

## Manual Text Entry

Users can type dates directly. The format depends on their browser locale:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const appointmentDate = ref('')
</script>

<template>
  <VibeFormDatepicker
    v-model="appointmentDate"
    id="appointment"
    label="Appointment Date"
    help-text="You can type the date or use the calendar picker"
  />

  <!-- User in US can type: 01/15/2024 -->
  <!-- User in UK can type: 15/01/2024 -->
  <!-- Both result in modelValue: "2024-01-15" -->
</template>
```

## Sizes

```vue
<template>
  <!-- Small -->
  <VibeFormDatepicker
    v-model="date"
    id="date-sm"
    label="Small"
    size="sm"
  />

  <!-- Default -->
  <VibeFormDatepicker
    v-model="date"
    id="date-default"
    label="Default"
  />

  <!-- Large -->
  <VibeFormDatepicker
    v-model="date"
    id="date-lg"
    label="Large"
    size="lg"
  />
</template>
```

## Validation

### Basic Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const eventDate = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const validateDate = async () => {
  const rules = [
    validators.required('Please select a date')
  ]

  for (const rule of rules) {
    const result = await rule.validator(eventDate.value)
    if (result !== true) {
      validationState.value = 'invalid'
      validationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  validationState.value = 'valid'
  validationMessage.value = ''
}
</script>

<template>
  <VibeFormDatepicker
    v-model="eventDate"
    id="eventDate"
    label="Event Date"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateDate"
    required
  />
</template>
```

### Future Date Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const appointmentDate = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const futureDateValidator = {
  validator: (value) => {
    if (!value) return true
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today || 'Please select a future date'
  },
  message: 'Please select a future date'
}

const validateAppointment = async () => {
  const rules = [
    validators.required('Please select an appointment date'),
    futureDateValidator
  ]

  for (const rule of rules) {
    const result = await rule.validator(appointmentDate.value)
    if (result !== true) {
      validationState.value = 'invalid'
      validationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  validationState.value = 'valid'
  validationMessage.value = ''
}
</script>

<template>
  <VibeFormDatepicker
    v-model="appointmentDate"
    id="appointment"
    label="Appointment Date"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateAppointment"
    :min="new Date().toISOString().split('T')[0]"
    required
  />
</template>
```

## Date Range Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const startDate = ref('')
const endDate = ref('')

const minEndDate = computed(() => startDate.value || undefined)
</script>

<template>
  <VibeFormDatepicker
    v-model="startDate"
    id="startDate"
    label="Start Date"
    required
  />

  <VibeFormDatepicker
    v-model="endDate"
    id="endDate"
    label="End Date"
    :min="minEndDate"
    :disabled="!startDate"
    help-text="Select a start date first"
    required
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `String` | `''` | The date/time value in ISO format (YYYY-MM-DD) |
| `id` | `String` | required | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `type` | `'date' \| 'time' \| 'datetime-local' \| 'month' \| 'week'` | `'date'` | Input type |
| `min` | `String` | `undefined` | Minimum date/time (YYYY-MM-DD format) |
| `max` | `String` | `undefined` | Maximum date/time (YYYY-MM-DD format) |
| `disabled` | `Boolean` | `false` | Disable the input |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `size` | `'sm' \| 'lg'` | `undefined` | Input size |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `input` | `Event` | Native input event |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Date Format Helper

If you need to format dates for display, here's a helper function:

```typescript
// utils/dateFormatter.ts
export function formatDate(isoDate: string, locale: string = 'en-US'): string {
  if (!isoDate) return ''

  const date = new Date(isoDate)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

// Usage
const formattedDate = formatDate('2024-01-15', 'en-US') // "01/15/2024"
const formattedDateUK = formatDate('2024-01-15', 'en-GB') // "15/01/2024"
```

## Complete Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFormValidation, validators } from '@velkymx/vibeui'

const checkInDate = useFormValidation('')
const checkOutDate = useFormValidation('')

const today = new Date().toISOString().split('T')[0]

const minCheckOut = computed(() => checkInDate.value || today)

const validateCheckIn = () => {
  checkInDate.validate([
    validators.required('Please select a check-in date'),
    {
      validator: (value) => {
        const selected = new Date(value)
        const todayDate = new Date(today)
        return selected >= todayDate || 'Check-in must be today or later'
      },
      message: 'Check-in must be today or later'
    }
  ])
}

const validateCheckOut = () => {
  checkOutDate.validate([
    validators.required('Please select a check-out date'),
    {
      validator: (value) => {
        if (!checkInDate.value) return true
        const checkIn = new Date(checkInDate.value)
        const checkOut = new Date(value)
        return checkOut > checkIn || 'Check-out must be after check-in'
      },
      message: 'Check-out must be after check-in'
    }
  ])
}

const handleSubmit = async () => {
  await validateCheckIn()
  await validateCheckOut()

  if (checkInDate.isValid && checkOutDate.isValid) {
    console.log('Booking from', checkInDate.value, 'to', checkOutDate.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormDatepicker
      v-model="checkInDate.value"
      id="checkIn"
      label="Check-in Date"
      :min="today"
      :validation-state="checkInDate.validationState"
      :validation-message="checkInDate.validationMessage"
      @validate="validateCheckIn"
      required
    />

    <VibeFormDatepicker
      v-model="checkOutDate.value"
      id="checkOut"
      label="Check-out Date"
      :min="minCheckOut"
      :disabled="!checkInDate.value"
      :validation-state="checkOutDate.validationState"
      :validation-message="checkOutDate.validationMessage"
      @validate="validateCheckOut"
      help-text="Select check-in date first"
      required
    />

    <VibeButton type="submit" variant="primary">Book Now</VibeButton>
  </form>
</template>
```
