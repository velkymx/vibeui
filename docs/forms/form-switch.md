# VibeFormSwitch

Toggle switch component for boolean settings.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const enabled = ref(false)
</script>

<template>
  <VibeFormSwitch
    v-model="enabled"
    id="enabled"
    label="Enable notifications"
  />

  <p>Notifications are {{ enabled ? 'enabled' : 'disabled' }}</p>
</template>
```

## Common Use Cases

### Settings Panel

```vue
<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  darkMode: false,
  autoSave: true,
  notifications: true,
  soundEffects: false
})
</script>

<template>
  <h5>Application Settings</h5>

  <VibeFormSwitch
    v-model="settings.darkMode"
    id="darkMode"
    label="Dark Mode"
    help-text="Use dark theme throughout the application"
  />

  <VibeFormSwitch
    v-model="settings.autoSave"
    id="autoSave"
    label="Auto-save"
    help-text="Automatically save your work every 5 minutes"
  />

  <VibeFormSwitch
    v-model="settings.notifications"
    id="notifications"
    label="Push Notifications"
  />

  <VibeFormSwitch
    v-model="settings.soundEffects"
    id="soundEffects"
    label="Sound Effects"
    disabled
  />
</template>
```

### Feature Toggles

```vue
<script setup lang="ts">
import { ref } from 'vue'

const features = ref({
  betaFeatures: false,
  analytics: true,
  debugMode: false
})
</script>

<template>
  <h5>Feature Toggles</h5>

  <VibeFormSwitch
    v-model="features.betaFeatures"
    id="betaFeatures"
    label="Enable Beta Features"
    help-text="Try out new experimental features"
  />

  <VibeFormSwitch
    v-model="features.analytics"
    id="analytics"
    label="Analytics"
    help-text="Help us improve by sharing anonymous usage data"
  />

  <VibeFormSwitch
    v-model="features.debugMode"
    id="debugMode"
    label="Debug Mode"
    help-text="Show developer tools and debug information"
  />
</template>
```

## Validation

```vue
<script setup lang="ts">
import { ref } from 'vue'

const acceptTerms = ref(false)
const validationState = ref(null)
const validationMessage = ref('')

const validateTerms = () => {
  if (!acceptTerms.value) {
    validationState.value = 'invalid'
    validationMessage.value = 'You must accept the terms to continue'
  } else {
    validationState.value = 'valid'
    validationMessage.value = ''
  }
}
</script>

<template>
  <VibeFormSwitch
    v-model="acceptTerms"
    id="terms"
    label="I accept the terms and conditions"
    :validation-state="validationState"
    :validation-message="validationMessage"
    @validate="validateTerms"
    required
  />
</template>
```

## Disabled State

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isPremiumUser = ref(false)
const advancedFeature = ref(false)
</script>

<template>
  <VibeFormSwitch
    v-model="advancedFeature"
    id="advancedFeature"
    label="Advanced Analytics"
    :disabled="!isPremiumUser"
    help-text="Premium feature - upgrade to access"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | `false` | The switch state (v-model) |
| `id` | `String` | required | Unique identifier |
| `label` | `String` | `undefined` | Label text |
| `disabled` | `Boolean` | `false` | Disable the switch |
| `required` | `Boolean` | `false` | Mark as required |
| `validationState` | `'valid' \| 'invalid' \| null` | `null` | Validation state |
| `validationMessage` | `String` | `undefined` | Validation message |
| `validationRules` | `ValidationRule[] \| ValidatorFunction` | `undefined` | Validation rules |
| `validateOn` | `'change' \| 'blur'` | `'blur'` | When to validate |
| `helpText` | `String` | `undefined` | Help text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when value changes |
| `validate` | - | Emitted when validation should run |
| `change` | `Event` | Native change event |
| `blur` | `FocusEvent` | Native blur event |
| `focus` | `FocusEvent` | Native focus event |

## Complete Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const preferences = ref({
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  weeklyNewsletter: false,
  productUpdates: true,
  marketingEmails: false
})

const notificationCount = computed(() => {
  return Object.values(preferences.value).filter(v => v === true).length
})

const handleSave = () => {
  console.log('Preferences saved:', preferences.value)
  // Save to API
}
</script>

<template>
  <VibeCard>
    <VibeCardHeader>
      <h5>Notification Preferences</h5>
      <p class="text-muted">{{ notificationCount }} notification types enabled</p>
    </VibeCardHeader>

    <VibeCardBody>
      <h6>Instant Notifications</h6>
      <VibeFormSwitch
        v-model="preferences.emailNotifications"
        id="emailNotifications"
        label="Email Notifications"
        help-text="Receive instant email notifications for important updates"
      />

      <VibeFormSwitch
        v-model="preferences.pushNotifications"
        id="pushNotifications"
        label="Push Notifications"
        help-text="Get push notifications on your devices"
      />

      <VibeFormSwitch
        v-model="preferences.smsNotifications"
        id="smsNotifications"
        label="SMS Notifications"
        help-text="Receive text messages for critical alerts"
      />

      <hr class="my-4">

      <h6>Periodic Updates</h6>
      <VibeFormSwitch
        v-model="preferences.weeklyNewsletter"
        id="weeklyNewsletter"
        label="Weekly Newsletter"
        help-text="Get a weekly digest of activity"
      />

      <VibeFormSwitch
        v-model="preferences.productUpdates"
        id="productUpdates"
        label="Product Updates"
        help-text="Learn about new features and improvements"
      />

      <VibeFormSwitch
        v-model="preferences.marketingEmails"
        id="marketingEmails"
        label="Promotional Emails"
        help-text="Receive special offers and promotions"
      />
    </VibeCardBody>

    <VibeCardFooter>
      <VibeButton variant="primary" @click="handleSave">Save Preferences</VibeButton>
    </VibeCardFooter>
  </VibeCard>
</template>
```
