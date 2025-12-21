# VibeUI

A modern Vue 3 UI component library built with Bootstrap 5, designed to simplify your development and enhance your application's aesthetic.

## Features

* **Vue 3 Composition API**: Built from the ground up using modern, reactive Vue.js practices.
* **Bootstrap 5 Integration**: Directly utilizes Bootstrap 5 CSS for consistency, without additional styling overhead.
* **Dual-Mode Components**: Use shorthand props for quick setup or composable slots for full control.
* **Lightweight & Modular**: Import only what you need, keeping your bundle small.
* **TypeScript Support**: Fully typed components for a great developer experience.
* **Accessibility First**: Components crafted with accessibility and usability in mind.

## Installation

Install via npm:

```bash
npm install @velkymx/vibeui
```

Make sure you also install Bootstrap:

```bash
npm install bootstrap
```

## Quick Setup

In your Vue app's entry file (`main.ts` or `main.js`):

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import VibeUI from '@velkymx/vibeui';
import 'bootstrap/dist/css/bootstrap.min.css';

createApp(App).use(VibeUI).mount('#app');
```

## Basic Usage

Here's a quick example of the `VibeAlert` component:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const showAlert = ref(true);
</script>

<template>
  <VibeAlert variant="success" dismissable v-model="showAlert">
    Welcome to VibeUI!
  </VibeAlert>
</template>
```

## Dual-Mode Components

Many VibeUI components support two usage modes:

### Shorthand Mode (Array-Based Props)

Perfect for quickly building UIs with data arrays:

```vue
<template>
  <VibeBreadcrumb :items="breadcrumbItems" />
  <VibeNav tabs :items="navItems" />
  <VibeDropdown id="menu" text="Menu" :items="dropdownItems" />
</template>

<script setup>
const breadcrumbItems = [
  { text: 'Home', href: '/' },
  { text: 'Products', href: '/products' },
  { text: 'Details', active: true }
]

const navItems = [
  { text: 'Home', href: '#', active: true },
  { text: 'Features', href: '#' },
  { text: 'Pricing', href: '#' }
]

const dropdownItems = [
  { text: 'Action', href: '#' },
  { text: 'Another action', href: '#' },
  { divider: true },
  { text: 'Separated link', href: '#' }
]
</script>
```

### Composable Mode (Slot-Based)

For maximum flexibility and custom content:

```vue
<template>
  <VibeBreadcrumb>
    <VibeBreadcrumbItem href="/">Home</VibeBreadcrumbItem>
    <VibeBreadcrumbItem href="/products">Products</VibeBreadcrumbItem>
    <VibeBreadcrumbItem active>Details</VibeBreadcrumbItem>
  </VibeBreadcrumb>

  <VibeNav tabs>
    <VibeNavItem active href="#">Home</VibeNavItem>
    <VibeNavItem href="#">Features</VibeNavItem>
    <VibeNavItem href="#">Pricing</VibeNavItem>
  </VibeNav>

  <VibeDropdown id="menu" text="Menu">
    <VibeDropdownItem href="#">Action</VibeDropdownItem>
    <VibeDropdownItem href="#">Another action</VibeDropdownItem>
    <VibeDropdownItem divider />
    <VibeDropdownItem href="#">Separated link</VibeDropdownItem>
  </VibeDropdown>
</template>
```

Components with dual-mode support include: `VibeBreadcrumb`, `VibeNav`, `VibeNavbarNav`, `VibePagination`, `VibeListGroup`, `VibeAccordion`, `VibeDropdown`, and `VibeCarousel`.

## Tabs

VibeUI provides complete tab functionality following Bootstrap 5.3 patterns:

```vue
<template>
  <!-- Tab Navigation -->
  <VibeNav tabs>
    <VibeNavItem tab active target="#home-tab">Home</VibeNavItem>
    <VibeNavItem tab target="#profile-tab">Profile</VibeNavItem>
    <VibeNavItem tab target="#contact-tab">Contact</VibeNavItem>
  </VibeNav>

  <!-- Tab Content -->
  <VibeTabContent>
    <VibeTabPane id="home-tab" active>
      <h3>Home Content</h3>
      <p>This is the home tab content.</p>
    </VibeTabPane>
    <VibeTabPane id="profile-tab">
      <h3>Profile Content</h3>
      <p>This is the profile tab content.</p>
    </VibeTabPane>
    <VibeTabPane id="contact-tab">
      <h3>Contact Content</h3>
      <p>This is the contact tab content.</p>
    </VibeTabPane>
  </VibeTabContent>
</template>
```

**Key Features:**
- Automatic Bootstrap tab behavior with proper `data-bs-toggle` and `data-bs-target` attributes
- Accessible with proper ARIA attributes
- Fade transitions enabled by default
- Works seamlessly with Bootstrap's JavaScript

## Form Components with Validation

VibeUI provides comprehensive form components with built-in validation support for both front-end and API-based validation:

### Basic Form Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const email = ref('')
const emailValidationState = ref(null)
const emailValidationMessage = ref('')

const validateEmail = async () => {
  const emailRules = [validators.required(), validators.email()]

  for (const rule of emailRules) {
    const result = await rule.validator(email.value)
    if (result !== true) {
      emailValidationState.value = 'invalid'
      emailValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  emailValidationState.value = 'valid'
  emailValidationMessage.value = ''
}
</script>

<template>
  <VibeFormInput
    v-model="email"
    id="email"
    type="email"
    label="Email Address"
    placeholder="Enter your email"
    :validation-state="emailValidationState"
    :validation-message="emailValidationMessage"
    @validate="validateEmail"
    required
  />
</template>
```

### Advanced Form with Composable

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFormValidation, validators } from '@velkymx/vibeui'

const form = {
  username: useFormValidation(''),
  password: useFormValidation(''),
  age: useFormValidation(0),
  country: useFormValidation(''),
  agreeToTerms: useFormValidation(false)
}

const handleSubmit = async () => {
  const usernameValid = await form.username.validate([
    validators.required(),
    validators.minLength(3)
  ])

  const passwordValid = await form.password.validate([
    validators.required(),
    validators.minLength(8)
  ])

  const ageValid = await form.age.validate([
    validators.required(),
    validators.min(18)
  ])

  if (usernameValid.valid && passwordValid.valid && ageValid.valid) {
    console.log('Form is valid!')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <VibeFormInput
      v-model="form.username.value"
      id="username"
      label="Username"
      :validation-state="form.username.validationState"
      :validation-message="form.username.validationMessage"
      @validate="() => form.username.validate([validators.required(), validators.minLength(3)])"
      required
    />

    <VibeFormInput
      v-model="form.password.value"
      id="password"
      type="password"
      label="Password"
      :validation-state="form.password.validationState"
      :validation-message="form.password.validationMessage"
      @validate="() => form.password.validate([validators.required(), validators.minLength(8)])"
      required
    />

    <VibeFormSpinbutton
      v-model="form.age.value"
      id="age"
      label="Age"
      :min="0"
      :max="120"
      :validation-state="form.age.validationState"
      :validation-message="form.age.validationMessage"
      @validate="() => form.age.validate([validators.required(), validators.min(18)])"
      required
    />

    <VibeFormCheckbox
      v-model="form.agreeToTerms.value"
      id="terms"
      label="I agree to the terms and conditions"
      required
    />

    <VibeButton type="submit" variant="primary">Submit</VibeButton>
  </form>
</template>
```

### API Validation Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { validators } from '@velkymx/vibeui'

const username = ref('')
const usernameValidationState = ref(null)
const usernameValidationMessage = ref('')

// Custom async validator for checking username availability
const checkUsernameAvailability = validators.async(async (value) => {
  if (!value) return true

  try {
    const response = await fetch(`/api/check-username?username=${value}`)
    const data = await response.json()

    if (data.available) {
      return true
    } else {
      return 'Username is already taken'
    }
  } catch (error) {
    return 'Error checking username availability'
  }
})

const validateUsername = async () => {
  const rules = [
    validators.required(),
    validators.minLength(3),
    checkUsernameAvailability
  ]

  usernameValidationState.value = null

  for (const rule of rules) {
    const result = await rule.validator(username.value)
    if (result !== true) {
      usernameValidationState.value = 'invalid'
      usernameValidationMessage.value = typeof result === 'string' ? result : rule.message
      return
    }
  }

  usernameValidationState.value = 'valid'
  usernameValidationMessage.value = 'Username is available!'
}
</script>

<template>
  <VibeFormInput
    v-model="username"
    id="username"
    label="Username"
    :validation-state="usernameValidationState"
    :validation-message="usernameValidationMessage"
    @validate="validateUsername"
    validate-on="blur"
    required
  />
</template>
```

### Available Validators

VibeUI provides built-in validators:

- `validators.required(message?)` - Field is required
- `validators.email(message?)` - Valid email format
- `validators.minLength(min, message?)` - Minimum string length
- `validators.maxLength(max, message?)` - Maximum string length
- `validators.min(min, message?)` - Minimum numeric value
- `validators.max(max, message?)` - Maximum numeric value
- `validators.pattern(regex, message?)` - Custom regex pattern
- `validators.url(message?)` - Valid URL format
- `validators.async(asyncFn)` - Custom async validator

## Components

VibeUI includes all major Bootstrap 5.3 components:

### Layout Components
* **VibeContainer** - Responsive container with fluid and breakpoint variants
* **VibeRow** - Row wrapper for columns with gutter control and row-cols support
* **VibeCol** - Responsive grid columns with offset and order support

### Core Components
* **VibeAlert** - Alert messages with variants and dismissible option
* **VibeBadge** - Badges and labels with pill option
* **VibeButton** - Buttons with variants, sizes, and outline style
* **VibeButtonGroup** - Button groups with sizing and vertical layout
* **VibeCloseButton** - Close button with white variant
* **VibeSpinner** - Loading spinners (border and grow types)
* **VibePlaceholder** - Placeholder loading states with animations

### Card Components
* **VibeCard** - Card container with variant styling
* **VibeCardHeader** - Card header section
* **VibeCardBody** - Card body section
* **VibeCardFooter** - Card footer section
* **VibeCardImg** - Card images (top, bottom, or overlay)
* **VibeCardTitle** - Card title heading
* **VibeCardText** - Card text paragraph

### Navigation Components
* **VibeBreadcrumb** - Breadcrumb navigation container
* **VibeBreadcrumbItem** - Individual breadcrumb items
* **VibeNav** - Navigation tabs and pills
* **VibeNavItem** - Navigation items with active state and tab support
* **VibeNavbar** - Responsive navbar with variants
* **VibeNavbarBrand** - Navbar branding section
* **VibeNavbarToggle** - Navbar mobile toggle button
* **VibeNavbarNav** - Navbar navigation links container
* **VibePagination** - Pagination container
* **VibePaginationItem** - Individual pagination items
* **VibeTabContent** - Container for tab panes
* **VibeTabPane** - Individual tab panel content

### List Components
* **VibeListGroup** - List group container with flush and horizontal options
* **VibeListGroupItem** - List items with variants and active state

### Progress Components
* **VibeProgress** - Progress bar container
* **VibeProgressBar** - Progress bar with variants, striped, and animated styles

### Interactive Components
* **VibeAccordion** - Accordion container with flush option
* **VibeAccordionItem** - Collapsible accordion items
* **VibeCollapse** - Collapse component for showing/hiding content
* **VibeDropdown** - Dropdown menus with variants and directions
* **VibeDropdownItem** - Dropdown menu items, dividers, and headers
* **VibeModal** - Modal dialogs with sizes and positions
* **VibeOffcanvas** - Offcanvas sidebars with placement options
* **VibeToast** - Toast notifications with autohide
* **VibeCarousel** - Image carousels with controls and indicators
* **VibeCarouselSlide** - Individual carousel slides

### Advanced Components
* **VibeTooltip** - Tooltips with placement options (requires Bootstrap JS)
* **VibePopover** - Popovers with title and content (requires Bootstrap JS)
* **VibeScrollspy** - Scrollspy for navigation highlighting

### Data Components
* **VibeDataTable** - Powerful data table with search, sorting, and pagination

### Form Components
* **VibeFormInput** - Text, email, password, number inputs with validation
* **VibeFormSelect** - Select dropdowns with single/multiple selection
* **VibeFormTextarea** - Multi-line text input with character count
* **VibeFormSpinbutton** - Number input with increment/decrement buttons
* **VibeFormDatepicker** - Date, time, and datetime input controls
* **VibeFormCheckbox** - Checkboxes with support for arrays
* **VibeFormRadio** - Radio button groups
* **VibeFormSwitch** - Toggle switches
* **VibeFormGroup** - Form group container with floating labels
* **VibeFormWysiwyg** - WYSIWYG editor with QuillJS (requires quill package)

All form components support:
- Front-end validation with built-in validators
- Async validation for API calls
- Bootstrap 5 styling and validation states
- Accessibility features
- Custom validation messages

## Contributing

Pull requests and contributions are very welcome! Please fork the repo, create a branch for your feature, and submit a PR.

## License

[MIT License](LICENSE) 

## TechnoSorcery.com

Built with ✨ by [TechnoSorcery.com](https://technosorcery.com)
