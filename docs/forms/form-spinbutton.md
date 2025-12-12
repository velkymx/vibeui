# VibeFormSpinbutton

Number input with increment/decrement buttons for easy value adjustment.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const quantity = ref(1)
</script>

<template>
  <VibeFormSpinbutton
    v-model="quantity"
    id="quantity"
    label="Quantity"
  />
</template>
```

## Min and Max

```vue
<template>
  <VibeFormSpinbutton
    v-model="age"
    id="age"
    label="Age"
    :min="0"
    :max="120"
  />
</template>
```

## Step

Control the increment/decrement amount:

```vue
<template>
  <!-- Step by 1 (default) -->
  <VibeFormSpinbutton
    v-model="quantity"
    id="quantity"
    label="Quantity"
    :step="1"
  />

  <!-- Step by 5 -->
  <VibeFormSpinbutton
    v-model="price"
    id="price"
    label="Price"
    :step="5"
    :min="0"
  />

  <!-- Step by 0.1 for decimals -->
  <VibeFormSpinbutton
    v-model="rating"
    id="rating"
    label="Rating"
    :step="0.1"
    :min="0"
    :max="5"
  />
</template>
```

## Wrap Around

Enable wrapping from max to min and vice versa:

```vue
<template>
  <VibeFormSpinbutton
    v-model="hour"
    id="hour"
    label="Hour (24h)"
    :min="0"
    :max="23"
    wrap
  />
</template>
```

## Sizes

```vue
<template>
  <!-- Small -->
  <VibeFormSpinbutton
    v-model="quantity"
    id="quantity-sm"
    label="Small"
    size="sm"
  />

  <!-- Default -->
  <VibeFormSpinbutton
    v-model="quantity"
    id="quantity-default"
    label="Default"
  />

  <!-- Large -->
  <VibeFormSpinbutton
    v-model="quantity"
    id="quantity-lg"
    label="Large"
    size="lg"
  />
</template>
```

## Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const age = ref(0)
const validationState = ref(null)
const validationMessage = ref('')

const validateAge = async () => {
  const rules = [
    validators.required('Age is required'),
    validators.min(18, 'You must be at least 18 years old'),
    validators.max(100, 'Please enter a valid age')
  ]

  for (const rule of rules) {
    const result = await rule.validator(age.value)
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
  <VibeFormSpinbutton
    v-model="age"
    id="age"
    label="Age"
    :min="0"
    :max="120"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateAge"
    required
  />
</template>
```

## States

```vue
<script setup lang="ts">
import { ref } from 'vue'

const disabled = ref(0)
const readonly = ref(100)
</script>

<template>
  <!-- Disabled -->
  <VibeFormSpinbutton
    v-model="disabled"
    id="disabled"
    label="Disabled"
    disabled
  />

  <!-- Readonly -->
  <VibeFormSpinbutton
    v-model="readonly"
    id="readonly"
    label="Readonly"
    readonly
  />
</template>
```

## Events

Listen to increment and decrement events:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const handleIncrement = (newValue) => {
  console.log('Incremented to:', newValue)
}

const handleDecrement = (newValue) => {
  console.log('Decremented to:', newValue)
}
</script>

<template>
  <VibeFormSpinbutton
    v-model="count"
    id="count"
    label="Counter"
    @increment="handleIncrement"
    @decrement="handleDecrement"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Number` | `0` | The number value (v-model) |
| `id` | `String` | required | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `min` | `Number` | `undefined` | Minimum value |
| `max` | `Number` | `undefined` | Maximum value |
| `step` | `Number` | `1` | Increment/decrement step |
| `disabled` | `Boolean` | `false` | Disable the input |
| `readonly` | `Boolean` | `false` | Make readonly |
| `required` | `Boolean` | `false` | Mark as required |
| `size` | `'sm' \| 'lg'` | `undefined` | Input size |
| `wrap` | `Boolean` | `false` | Wrap around from max to min |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'input' \| 'blur' \| 'change'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number` | Emitted when value changes |
| `increment` | `Number` | Emitted when incremented |
| `decrement` | `Number` | Emitted when decremented |
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

const cart = ref([
  { id: 1, name: 'Product A', quantity: 1, price: 29.99 },
  { id: 2, name: 'Product B', quantity: 2, price: 19.99 }
])

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const validateQuantity = (quantity) => {
  if (quantity < 1) return 'Quantity must be at least 1'
  if (quantity > 99) return 'Maximum quantity is 99'
  return true
}
</script>

<template>
  <div v-for="item in cart" :key="item.id" class="mb-3">
    <h5>{{ item.name }}</h5>
    <VibeFormSpinbutton
      v-model="item.quantity"
      :id="`quantity-${item.id}`"
      label="Quantity"
      :min="1"
      :max="99"
      :validation-rules="[validateQuantity]"
    />
    <p>Subtotal: ${{ (item.quantity * item.price).toFixed(2) }}</p>
  </div>

  <h4>Total: ${{ total.toFixed(2) }}</h4>
</template>
```
