# VibeFormRadio

Radio button component for mutually exclusive selections.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const selectedPlan = ref('')
</script>

<template>
  <div>
    <label class="form-label">Select a plan</label>

    <VibeFormRadio
      v-model="selectedPlan"
      id="plan-free"
      name="plan"
      label="Free Plan"
      value="free"
    />

    <VibeFormRadio
      v-model="selectedPlan"
      id="plan-basic"
      name="plan"
      label="Basic Plan - $9/month"
      value="basic"
    />

    <VibeFormRadio
      v-model="selectedPlan"
      id="plan-premium"
      name="plan"
      label="Premium Plan - $29/month"
      value="premium"
    />

    <p>Selected: {{ selectedPlan }}</p>
  </div>
</template>
```

**Note**: All radio buttons in a group must have the same `name` attribute.

## Inline Layout

```vue
<template>
  <VibeFormRadio
    v-model="size"
    id="size-sm"
    name="size"
    label="Small"
    value="sm"
    inline
  />

  <VibeFormRadio
    v-model="size"
    id="size-md"
    name="size"
    label="Medium"
    value="md"
    inline
  />

  <VibeFormRadio
    v-model="size"
    id="size-lg"
    name="size"
    label="Large"
    value="lg"
    inline
  />
</template>
```

## Disabled

```vue
<template>
  <VibeFormRadio
    v-model="payment"
    id="payment-credit"
    name="payment"
    label="Credit Card"
    value="credit"
  />

  <VibeFormRadio
    v-model="payment"
    id="payment-paypal"
    name="payment"
    label="PayPal"
    value="paypal"
  />

  <VibeFormRadio
    v-model="payment"
    id="payment-bitcoin"
    name="payment"
    label="Bitcoin (Coming Soon)"
    value="bitcoin"
    disabled
  />
</template>
```

## Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const gender = ref('')
const validationState = ref(null)
const validationMessage = ref('')

const validateGender = async () => {
  const result = await validators.required('Please select an option').validator(gender.value)

  if (result !== true) {
    validationState.value = 'invalid'
    validationMessage.value = typeof result === 'string' ? result : 'Please select an option'
  } else {
    validationState.value = 'valid'
    validationMessage.value = ''
  }
}
</script>

<template>
  <div>
    <label class="form-label">
      Gender <span class="text-danger">*</span>
    </label>

    <VibeFormRadio
      v-model="gender"
      id="gender-male"
      name="gender"
      label="Male"
      value="male"
      :validation-state="validationState"
      @validate="validateGender"
    />

    <VibeFormRadio
      v-model="gender"
      id="gender-female"
      name="gender"
      label="Female"
      value="female"
      @change="validateGender"
    />

    <VibeFormRadio
      v-model="gender"
      id="gender-other"
      name="gender"
      label="Other"
      value="other"
      @change="validateGender"
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
| `modelValue` | `String \| Number \| Boolean` | `undefined` | The selected value (v-model) |
| `id` | `String` | required | Unique identifier |
| `name` | `String` | required | Name attribute (must be same for group) |
| `label` | `String` | `undefined` | Label text |
| `value` | `String \| Number \| Boolean` | required | Value of this radio button |
| `disabled` | `Boolean` | `false` | Disable the radio button |
| `required` | `Boolean` | `false` | Mark as required |
| `inline` | `Boolean` | `false` | Display inline |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `String \| Number \| Boolean` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Complete Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const form = ref({
  subscription: '',
  paymentMethod: ''
})

const validation = ref({
  subscription: { state: null, message: '' },
  paymentMethod: { state: null, message: '' }
})

const subscriptionPlans = [
  { value: 'free', label: 'Free - $0/month', description: 'Basic features' },
  { value: 'starter', label: 'Starter - $9/month', description: 'For individuals' },
  { value: 'pro', label: 'Pro - $29/month', description: 'For professionals' },
  { value: 'enterprise', label: 'Enterprise - Custom', description: 'For teams' }
]

const paymentMethods = [
  { value: 'credit', label: 'Credit Card', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️' },
  { value: 'bank', label: 'Bank Transfer', icon: '🏦' }
]

const validateSubscription = () => {
  const result = validators.required('Please select a subscription plan').validator(form.value.subscription)

  validation.value.subscription.state = result === true ? 'valid' : 'invalid'
  validation.value.subscription.message = result === true ? '' : result
}

const validatePayment = () => {
  if (form.value.subscription !== 'free') {
    const result = validators.required('Please select a payment method').validator(form.value.paymentMethod)
    validation.value.paymentMethod.state = result === true ? 'valid' : 'invalid'
    validation.value.paymentMethod.message = result === true ? '' : result
  } else {
    validation.value.paymentMethod.state = null
    validation.value.paymentMethod.message = ''
  }
}

const handleSubmit = () => {
  validateSubscription()
  validatePayment()

  const isValid = validation.value.subscription.state === 'valid' &&
                  (form.value.subscription === 'free' || validation.value.paymentMethod.state === 'valid')

  if (isValid) {
    console.log('Form submitted:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="mb-4">
      <label class="form-label">
        Select Subscription Plan <span class="text-danger">*</span>
      </label>

      <VibeFormRadio
        v-for="plan in subscriptionPlans"
        :key="plan.value"
        v-model="form.subscription"
        :id="`plan-${plan.value}`"
        name="subscription"
        :label="plan.label"
        :value="plan.value"
        :validation-state="validation.subscription.state"
        :help-text="plan.description"
        @validate="validateSubscription"
        @change="() => { validateSubscription(); validatePayment() }"
      />

      <div v-if="validation.subscription.message" class="invalid-feedback" style="display: block;">
        {{ validation.subscription.message }}
      </div>
    </div>

    <div v-if="form.subscription && form.subscription !== 'free'" class="mb-4">
      <label class="form-label">
        Select Payment Method <span class="text-danger">*</span>
      </label>

      <VibeFormRadio
        v-for="method in paymentMethods"
        :key="method.value"
        v-model="form.paymentMethod"
        :id="`payment-${method.value}`"
        name="paymentMethod"
        :label="`${method.icon} ${method.label}`"
        :value="method.value"
        :validation-state="validation.paymentMethod.state"
        @validate="validatePayment"
        @change="validatePayment"
      />

      <div v-if="validation.paymentMethod.message" class="invalid-feedback" style="display: block;">
        {{ validation.paymentMethod.message }}
      </div>
    </div>

    <VibeButton type="submit" variant="primary">Continue</VibeButton>
  </form>
</template>
```
